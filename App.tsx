import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './features/home/HomeScreen';
import { ReaderScreen } from './features/reader/ReaderScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { SurahListScreen } from './features/surahList/SurahListScreen';
import { QuranTranslationProvider } from './hooks/QuranTranslationProvider';
import { ReaderSettingsProvider } from './hooks/ReaderSettingsProvider';
import { useReadingProgress } from './hooks/useReadingProgress';
import { LanguageProvider } from './locales';

/**
 * Navigation.
 *
 * Three screens held in state. No router: the project has no navigation
 * dependency, and adding one for three screens would cost more than it
 * explains. If deep links or a fourth screen arrive, this is the seam to
 * replace with expo-router — every screen already takes plain props.
 *
 * The Reader records where it was opened from so that going back returns there
 * rather than always landing on the list.
 */
type ReaderOrigin = 'home' | 'surahList';

type Screen =
  | { name: 'home' }
  | { name: 'surahList' }
  | { name: 'settings' }
  | {
      name: 'reader';
      surahNumber: number;
      from: ReaderOrigin;
      /** Where to open. 1 unless a saved position is being restored. */
      initialAyahNumber: number;
    };

/** Opening a surah fresh always starts at its first ayah. */
const FIRST_AYAH = 1;

/**
 * Builds the screen a Reader origin refers to.
 *
 * `{ name: someOrigin }` cannot be assigned to the union directly — a
 * discriminant has to be a literal, so the two cases are spelled out.
 */
function screenForOrigin(origin: ReaderOrigin): Screen {
  return origin === 'home' ? { name: 'home' } : { name: 'surahList' };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  // Where storage lives. This component knows a position exists and how to
  // change it, and nothing about how it is stored.
  const { position, isReady, updatePosition } = useReadingProgress();

  /** Resuming keeps the saved ayah; opening from the list starts at the top. */
  const continueReading = useCallback(() => {
    setScreen({
      name: 'reader',
      surahNumber: position.surahNumber,
      from: 'home',
      initialAyahNumber: position.ayahNumber,
    });
  }, [position]);

  const openSurahFromList = useCallback(
    (surahNumber: number) => {
      updatePosition({ surahNumber, ayahNumber: FIRST_AYAH });
      setScreen({
        name: 'reader',
        surahNumber,
        from: 'surahList',
        initialAyahNumber: FIRST_AYAH,
      });
    },
    [updatePosition],
  );

  const handleAyahChange = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      updatePosition({ surahNumber, ayahNumber });
    },
    [updatePosition],
  );

  const openSurahList = useCallback(() => {
    setScreen({ name: 'surahList' });
  }, []);

  const openHome = useCallback(() => {
    setScreen({ name: 'home' });
  }, []);

  const openSettings = useCallback(() => {
    setScreen({ name: 'settings' });
  }, []);

  // Android's hardware back button, one level at a time: Reader returns to
  // wherever it was opened from, the list returns Home, and Home falls through
  // to the system so back still closes the app from the top of the stack.
  const goBack = useCallback(() => {
    if (screen.name === 'reader') {
      setScreen(screenForOrigin(screen.from));
      return true;
    }

    if (screen.name === 'surahList' || screen.name === 'settings') {
      openHome();
      return true;
    }

    return false;
  }, [screen, openHome]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack]);

  /**
   * The app is portrait, and says so here rather than in the manifest.
   *
   * A manifest-level `orientation: "portrait"` cannot be relaxed for one screen,
   * and it silently beat the Reader's 180° request — the setting persisted and
   * the control lit up while the screen stayed resolutely upright. Declaring the
   * default in code keeps every screen portrait exactly as before, while leaving
   * the Reader free to ask for the other way up.
   */
  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {/*
        Both gates read their own AsyncStorage key and neither blocks the other:
        LanguageProvider holds back until the saved language is known, and
        `isReady` until the saved reading position is. Each is set in a
        `finally`, so a storage failure still opens the app on its default.
      */}
      <LanguageProvider>
        <QuranTranslationProvider>
          <ReaderSettingsProvider>
          {isReady && (
            <>
          {screen.name === 'home' && (
            <HomeScreen
              position={position}
              onContinueReading={continueReading}
              onOpenSurahList={openSurahList}
              onOpenSettings={openSettings}
            />
          )}

          {screen.name === 'surahList' && (
            <SurahListScreen onSelectSurah={openSurahFromList} onBack={openHome} />
          )}

          {screen.name === 'settings' && <SettingsScreen onBack={openHome} />}

          {screen.name === 'reader' && (
            <ReaderScreen
              // Remount on surah change so scroll position and verse selection
              // do not carry over from the previous surah.
              key={screen.surahNumber}
              surahNumber={screen.surahNumber}
              initialAyahNumber={screen.initialAyahNumber}
              onAyahChange={(ayahNumber) => handleAyahChange(screen.surahNumber, ayahNumber)}
              onBack={() => setScreen(screenForOrigin(screen.from))}
            />
          )}
            </>
          )}
          </ReaderSettingsProvider>
        </QuranTranslationProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
