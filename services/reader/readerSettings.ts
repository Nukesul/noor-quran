import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clampSizeStep,
  DEFAULT_READING_MODE,
  DEFAULT_SIZE_STEP,
  READING_MODES,
  type ReadingMode,
} from '../../theme/reading';

/**
 * How the reader likes to read: layout and text size.
 *
 * A fourth, separate key. Reading *position* is what someone was reading and
 * must never be disturbed by how they like it presented:
 *
 *   noorquran.readingPosition.v1   where they were
 *   noor-quran:language            interface language
 *   noor-quran:translation         which translation
 *   noor-quran:reader-settings:v1  how it looks   ← this one
 *
 * Versioned in the key because this shape is the most likely of the four to
 * gain fields later.
 */
const STORAGE_KEY = 'noor-quran:reader-settings:v1';

export interface ReaderSettings {
  mode: ReadingMode;
  /** Index into ARABIC_SIZES. */
  arabicStep: number;
  /** Index into TRANSLATION_SIZES. */
  translationStep: number;
  /**
   * Read with the phone turned the other way up.
   *
   * A reading preference like the others, so it belongs in this key rather than
   * in a system setting — someone who props the phone against something to read
   * hands-free wants it to still be that way tomorrow.
   */
  isFlipped: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  mode: DEFAULT_READING_MODE,
  arabicStep: DEFAULT_SIZE_STEP,
  translationStep: DEFAULT_SIZE_STEP,
  isFlipped: false,
};

function isReadingMode(value: unknown): value is ReadingMode {
  return typeof value === 'string' && (READING_MODES as readonly string[]).includes(value);
}

/**
 * Narrows stored JSON to usable settings, field by field.
 *
 * A partly-valid record keeps the fields that make sense rather than being
 * thrown away whole — losing someone's font size because a later version added
 * a mode they no longer have would be needlessly rude.
 */
function parseSettings(raw: string): ReaderSettings {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_READER_SETTINGS;
  }

  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_READER_SETTINGS;

  const value = parsed as Partial<ReaderSettings>;

  return {
    mode: isReadingMode(value.mode) ? value.mode : DEFAULT_READER_SETTINGS.mode,
    arabicStep: clampSizeStep(value.arabicStep ?? DEFAULT_SIZE_STEP),
    translationStep: clampSizeStep(value.translationStep ?? DEFAULT_SIZE_STEP),
    // Anything that is not literally `true` reads as not flipped, so a record
    // written before this field existed opens the right way up.
    isFlipped: value.isFlipped === true,
  };
}

/** Never rejects; any failure reads as "use the defaults". */
export async function loadReaderSettings(): Promise<ReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === null ? DEFAULT_READER_SETTINGS : parseSettings(raw);
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

/** Never rejects, and normalises before writing. */
export async function saveReaderSettings(settings: ReaderSettings): Promise<void> {
  const safe: ReaderSettings = {
    mode: isReadingMode(settings.mode) ? settings.mode : DEFAULT_READER_SETTINGS.mode,
    arabicStep: clampSizeStep(settings.arabicStep),
    translationStep: clampSizeStep(settings.translationStep),
    isFlipped: settings.isFlipped === true,
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Intentionally ignored.
  }
}

export { STORAGE_KEY as READER_SETTINGS_STORAGE_KEY, parseSettings };
