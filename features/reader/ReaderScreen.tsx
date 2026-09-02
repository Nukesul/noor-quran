import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type ListRenderItem,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../../components/BackButton';
import { useQuranTranslation } from '../../hooks/QuranTranslationProvider';
import { useReaderSettings } from '../../hooks/ReaderSettingsProvider';
import { useSurah } from '../../hooks/useSurah';
import { useTranslation } from '../../locales';
import {
  BOOK_CHUNK_SIZE,
  colors,
  pressedOpacity,
  screenPadding,
  spacing,
  touchTarget,
  typography,
} from '../../theme';
import type { Verse } from '../../types/quran';
import { Bismillah } from './components/Bismillah';
import { BookChunk } from './components/BookChunk';
import { ReadingControls } from './components/ReadingControls';
import { SurahHeader } from './components/SurahHeader';
import { VerseItem } from './components/VerseItem';

interface ReaderScreenProps {
  surahNumber: number;
  onBack: () => void;
  /** Ayah to open at. 1 means the top of the surah — the usual case. */
  initialAyahNumber?: number;
  /** Fired when the reader moves to a different ayah, for saving progress. */
  onAyahChange?: (ayahNumber: number) => void;
}

/** How far two fingers must travel before the text steps a size. */
const PINCH_IN_RATIO = 0.8;
const PINCH_OUT_RATIO = 1.25;

function touchDistance(event: GestureResponderEvent): number {
  const [a, b] = event.nativeEvent.touches;
  if (!a || !b) return 0;

  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

export function ReaderScreen({
  surahNumber,
  onBack,
  initialAyahNumber = 1,
  onAyahChange,
}: ReaderScreenProps) {
  const { t } = useTranslation();

  const { width: windowWidth } = useWindowDimensions();

  // The selected translation arrives as an edition pair. The Reader knows no
  // translation ids and makes no choices — it forwards what was chosen.
  const { editions } = useQuranTranslation();

  const { mode, arabicStep, translationStep, isFlipped, stepBoth } = useReaderSettings();

  /**
   * Turn the page over.
   *
   * Done by asking Android to render the activity upside down, not by rotating
   * the view tree. A `transform: rotate('180deg')` would leave the safe-area
   * insets, the status bar and the scroll direction all belonging to the old
   * orientation — the notch inset would pad the visual bottom, and dragging down
   * would scroll up. Letting the OS own the rotation means every one of those
   * comes out right for free, and the layout below needs no flip-awareness at
   * all.
   */
  useEffect(() => {
    void ScreenOrientation.lockAsync(
      isFlipped
        ? ScreenOrientation.OrientationLock.PORTRAIT_DOWN
        : // Unpinned rather than PORTRAIT_UP: the Reader is the one screen where
          // turning the phone sideways is a reading choice, so the sensor is
          // allowed to drive it. Everything outside the Reader stays portrait.
          ScreenOrientation.OrientationLock.ALL,
    );
  }, [isFlipped]);

  // Separate from the effect above so that toggling does not first swing the
  // screen back upright on cleanup and then over again. Leaving the Reader
  // always restores upright: the flip is a reading posture, not an app setting.
  useEffect(
    () => () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    },
    [],
  );

  // The Reader asks for a surah by number and gets back normalised data — it
  // has no idea whether that came from the bundle, a cache, or the network.
  const { surah, isLoading, error } = useSurah(surahNumber, editions);

  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  /** One list, two shapes: an ayah per row in Verse mode, a chunk in Book mode. */
  type ReaderRow = Verse | Verse[];

  const listRef = useRef<FlatList<ReaderRow>>(null);
  const hasRestoredPosition = useRef(false);

  /**
   * The ayah currently at the top of the viewport — the reading anchor.
   *
   * Stored as an **ayah number**, not a list index, because the two modes have
   * different lists: Verse mode has one row per ayah, Book mode one row per
   * chunk of eight. An index means nothing across that switch; an ayah number
   * means the same thing in both.
   *
   * A ref, not state: this updates on every scroll frame, and putting it in
   * state would re-render the Reader continuously while someone is reading.
   */
  const anchorAyahRef = useRef(1);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 10 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0]?.item as Verse | Verse[] | undefined;
    if (!first) return;

    const verse = Array.isArray(first) ? first[0] : first;
    if (verse) anchorAyahRef.current = verse.numberInSurah;
  }).current;

  // Tapping the selected verse again clears it — selection is a transient
  // reading state, so it should never need a separate "close" control.
  const handleSelect = useCallback(
    (verseId: string) => {
      const isDeselecting = selectedVerseId === verseId;
      setSelectedVerseId(isDeselecting ? null : verseId);

      // Only a selection moves the reading position. Clearing the toolbar means
      // the reader is done with that ayah, not that they left it.
      if (isDeselecting) return;

      const verse = surah?.verses.find((candidate) => candidate.id === verseId);
      if (verse) onAyahChange?.(verse.numberInSurah);
    },
    [selectedVerseId, surah, onAyahChange],
  );

  const scrollToIndex = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
  }, []);

  /** The row holding a given ayah, in whichever list the current mode renders. */
  const indexForAyah = useCallback(
    (ayahNumber: number) =>
      mode === 'book'
        ? Math.floor((ayahNumber - 1) / BOOK_CHUNK_SIZE)
        : ayahNumber - 1,
    [mode],
  );

  /** How many rows the list holds in the current mode. */
  const rowCount = useMemo(() => {
    if (!surah) return 0;
    return mode === 'book'
      ? Math.ceil(surah.verses.length / BOOK_CHUNK_SIZE)
      : surah.verses.length;
  }, [surah, mode]);

  /**
   * Scroll to the saved ayah once the surah is loaded.
   *
   * Skipped entirely when opening at ayah 1, which keeps the common path — and
   * Al-Fatihah in particular — exactly as it was: no scrolling, no measurement,
   * no behaviour change.
   */
  useEffect(() => {
    if (hasRestoredPosition.current) return;
    if (!surah || initialAyahNumber <= 1) return;

    // Claim the one restore now, before deciding whether it needs to scroll.
    // `indexForAyah` changes with the mode, so leaving this unset would let a
    // later mode switch re-run the effect and drag the reader back to wherever
    // they opened the surah.
    hasRestoredPosition.current = true;

    // Through `indexForAyah`, not `initialAyahNumber - 1`: an ayah number is a
    // row index only in Verse mode. Resuming Al-Baqarah at ayah 4 in Book mode
    // used to scroll to *chunk* 4 and land on ayah 25, and a position deep in a
    // surah asked for a row the chunked list does not have at all.
    const index = indexForAyah(initialAyahNumber);
    if (index <= 0 || index >= rowCount) return;

    const scrollToTarget = () => scrollToIndex(index);
    scrollToTarget();

    // Verse heights are only known once a row has rendered, so rows above the
    // target keep being measured after the first jump and push it out of
    // place. Two follow-up passes settle it. Found on device: Al-Kahf 18:60
    // landed mid-screen with a single pass, while Al-Baqarah 2:255 happened to
    // land correctly — the difference was timing, not distance.
    const corrections = [setTimeout(scrollToTarget, 250), setTimeout(scrollToTarget, 600)];

    return () => corrections.forEach(clearTimeout);
  }, [surah, initialAyahNumber, scrollToIndex, indexForAyah, rowCount]);

  /**
   * Hold the reading anchor across a typography change.
   *
   * Changing mode or size reflows every row, so the pixel offset the reader was
   * at no longer points at the same ayah — dropping the translation in Book
   * mode shrinks the content so far that the old offset lands a hundred ayahs
   * further on.
   *
   * The anchor is captured **during render**, not in the effect below. By the
   * time an effect runs the new layout has already been committed and
   * `onViewableItemsChanged` has fired for it, overwriting the ref with wherever
   * the stale offset happened to land — measured on device, that was ayah 167
   * when the reader was on 97. Render happens before commit, so the ref still
   * holds the ayah they were actually reading.
   */
  // Width belongs in the key alongside the typography: rotating to landscape
  // reflows every row exactly the way a size change does, so it has to travel
  // the same remount-and-restore path or the reader lands wherever the old
  // pixel offset happens to point. Reusing the key is what keeps rotation from
  // needing a reading-position system of its own.
  const settingsKey = `${mode}|${arabicStep}|${translationStep}|${Math.round(windowWidth)}`;
  const previousSettingsKey = useRef(settingsKey);
  const restoreAyahRef = useRef<number | null>(null);

  if (previousSettingsKey.current !== settingsKey) {
    previousSettingsKey.current = settingsKey;
    restoreAyahRef.current = anchorAyahRef.current;
  }

  useEffect(() => {
    const ayahNumber = restoreAyahRef.current;
    restoreAyahRef.current = null;

    if (ayahNumber === null) return;

    const index = indexForAyah(ayahNumber);
    if (index <= 0) return;

    const restore = () => scrollToIndex(index);
    restore();

    // The list is remounted on a typography change (see `key` below), so this
    // runs against a fresh frame cache and converges the same way the verified
    // initial-position restore does — first jump approximate, follow-ups settle
    // it as rows are measured.
    const corrections = [setTimeout(restore, 120), setTimeout(restore, 400), setTimeout(restore, 800)];
    return () => corrections.forEach(clearTimeout);
  }, [settingsKey, scrollToIndex, indexForAyah]);

  /**
   * Pinch to resize.
   *
   * Kept in a ref so the responder below never has to be rebuilt when settings
   * change — rebuilding it mid-gesture would drop the pinch.
   */
  const stepBothRef = useRef(stepBoth);
  stepBothRef.current = stepBoth;

  const pinchStartRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Never claim a single finger: that is scrolling, and it belongs to the
        // list. Only two fingers are a pinch.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (event) => event.nativeEvent.touches.length === 2,

        onPanResponderGrant: (event) => {
          pinchStartRef.current = touchDistance(event);
        },

        onPanResponderMove: (event) => {
          if (event.nativeEvent.touches.length !== 2) return;

          const start = pinchStartRef.current;
          if (start <= 0) return;

          const ratio = touchDistance(event) / start;

          // Discrete steps, not a continuous scale. The text genuinely reflows
          // at each step, so resizing on every frame would mean re-laying out
          // the visible verses 60 times a second. Stepping also means the
          // result is always one of the designed sizes.
          if (ratio >= PINCH_OUT_RATIO) {
            stepBothRef.current(1);
            pinchStartRef.current = touchDistance(event);
          } else if (ratio <= PINCH_IN_RATIO) {
            stepBothRef.current(-1);
            pinchStartRef.current = touchDistance(event);
          }
        },

        onPanResponderRelease: () => {
          pinchStartRef.current = 0;
        },
        onPanResponderTerminate: () => {
          pinchStartRef.current = 0;
        },
      }),
    [],
  );

  /**
   * Book mode reads a list of ayah *groups*; Verse mode reads ayahs.
   *
   * Grouping here rather than inside the renderer keeps the work out of the
   * render path and memoised against the surah, so scrolling never re-chunks.
   */
  const bookChunks = useMemo(() => {
    if (!surah || mode !== 'book') return [];

    const chunks: Verse[][] = [];
    for (let index = 0; index < surah.verses.length; index += BOOK_CHUNK_SIZE) {
      chunks.push(surah.verses.slice(index, index + BOOK_CHUNK_SIZE));
    }
    return chunks;
  }, [surah, mode]);

  const renderVerse: ListRenderItem<Verse> = useCallback(
    ({ item }) => (
      <VerseItem
        verse={item}
        isSelected={item.id === selectedVerseId}
        onSelect={handleSelect}
        arabicStep={arabicStep}
        translationStep={translationStep}
      />
    ),
    [selectedVerseId, handleSelect, arabicStep, translationStep],
  );

  const renderChunk: ListRenderItem<Verse[]> = useCallback(
    ({ item }) => (
      <BookChunk
        verses={item}
        selectedVerseId={selectedVerseId}
        onSelect={handleSelect}
        arabicStep={arabicStep}
        translationStep={translationStep}
      />
    ),
    [selectedVerseId, handleSelect, arabicStep, translationStep],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* The only persistent chrome in the Reader. */}
      <View style={styles.topBar}>
        <BackButton onPress={onBack} accessibilityLabel={t('reader.backToList')} />

        <View style={styles.topBarSpacer} />

        <Pressable
          onPress={() => setIsControlsOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isControlsOpen }}
          accessibilityLabel={t('reader.readingControls')}
          style={({ pressed }) => [styles.controlsButton, pressed && styles.pressed]}
        >
          <Text style={styles.controlsGlyph}>Aa</Text>
        </Pressable>
      </View>

      {surah ? (
        <View style={styles.surface} {...panResponder.panHandlers}>
          <FlatList
            ref={listRef}
            /*
              Remount when the typography changes.
              `scrollToIndex` derives its offset from FlatList's cached row
              frames, and after a global reflow those frames still hold the old
              heights for every row that is not currently mounted. Measured on
              device: switching to Book mode from ayah 81 landed on 152, and
              repeated correction passes did not converge because the stale
              frames kept producing the same wrong offset. Remounting clears the
              cache so the restore below measures from scratch — the same
              conditions the verified initial-position restore runs under.
            */
            key={settingsKey}
            data={(mode === 'book' ? bookChunks : surah.verses) as readonly ReaderRow[]}
            renderItem={
              (mode === 'book' ? renderChunk : renderVerse) as ListRenderItem<ReaderRow>
            }
            keyExtractor={(item) => (Array.isArray(item) ? item[0].id : item.id)}
            // Verses have wildly different heights, so FlatList cannot know where
            // a distant ayah is until it has rendered its way there. When the
            // first jump falls short it reports back here; rendering more and
            // retrying converges without needing getItemLayout, which would mean
            // fixing row heights and changing the design.
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              listRef.current?.scrollToOffset({
                offset: index * averageItemLength,
                animated: false,
              });
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
              }, 100);
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            // FlatList bails out of re-rendering memoized rows unless told what
            // else changed. Typography belongs here for the same reason
            // selection does: it changes how every row draws.
            extraData={`${selectedVerseId}|${mode}|${arabicStep}|${translationStep}`}
            ListHeaderComponent={
              <View>
                <SurahHeader surah={surah} />
                {surah.showsBismillahHeader && <Bismillah />}
              </View>
            }
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.centered}>
          {isLoading && <ActivityIndicator color={colors.textSecondary} />}

          {error && !isLoading && (
            <Text style={styles.errorText}>{t('reader.loadFailed')}</Text>
          )}
        </View>
      )}

      {isControlsOpen && <ReadingControls onClose={() => setIsControlsOpen(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarSpacer: {
    flex: 1,
  },
  controlsButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    // Mirrors the back control's optical pull-back on the other margin.
    marginRight: screenPadding - spacing.md,
  },
  pressed: {
    opacity: pressedOpacity,
  },
  controlsGlyph: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  surface: {
    flex: 1,
  },
  content: {
    // Generous tail space so the last verse can settle above the thumb rather
    // than ending flush against the screen edge.
    paddingBottom: spacing.xxl * 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
    // Sit a little above true centre; dead-centre reads as lower than centre.
    paddingBottom: spacing.xxl * 2,
  },
  errorText: {
    ...typography.translation,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
