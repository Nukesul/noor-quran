import AsyncStorage from '@react-native-async-storage/async-storage';

import { SURAH_INDEX } from '../../constants/surahIndex';

/** Where the reader last was. */
export interface ReadingPosition {
  surahNumber: number;
  ayahNumber: number;
}

const STORAGE_KEY = 'noorquran.readingPosition.v1';

/** Al-Fatihah, ayah 1 — bundled, so this is always openable. */
export const DEFAULT_READING_POSITION: ReadingPosition = {
  surahNumber: 1,
  ayahNumber: 1,
};

/**
 * Narrows unknown parsed JSON to a position that actually exists in the Quran.
 *
 * Validates against SURAH_INDEX rather than a hardcoded range, so the ayah bound
 * is the real ayah count of that specific surah — 2:286 is valid, 2:287 is not,
 * and 114:7 is not either.
 *
 * Anything that fails returns null and the caller falls back to the default.
 * Stored data is not trusted: it can be stale from an older build, corrupted, or
 * written by a version that had different ideas about the schema.
 */
function parseStoredPosition(raw: string): ReadingPosition | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const { surahNumber, ayahNumber } = parsed as Partial<ReadingPosition>;

  if (!Number.isInteger(surahNumber) || !Number.isInteger(ayahNumber)) return null;
  if (surahNumber! < 1 || surahNumber! > SURAH_INDEX.length) return null;

  const summary = SURAH_INDEX[surahNumber! - 1];
  if (!summary) return null;
  if (ayahNumber! < 1 || ayahNumber! > summary.versesCount) return null;

  return { surahNumber: surahNumber!, ayahNumber: ayahNumber! };
}

/**
 * Reads the saved position.
 *
 * Never rejects. Storage being unavailable, corrupt, or holding nonsense are all
 * the same outcome to the caller — the default — because none of them is a
 * reason to stop the app from opening.
 */
export async function loadReadingPosition(): Promise<ReadingPosition> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_READING_POSITION;

    return parseStoredPosition(raw) ?? DEFAULT_READING_POSITION;
  } catch {
    return DEFAULT_READING_POSITION;
  }
}

/**
 * Saves the position, ignoring anything invalid.
 *
 * Never rejects either: losing a reading position is a far smaller failure than
 * an unhandled rejection while someone is reading.
 */
export async function saveReadingPosition(position: ReadingPosition): Promise<void> {
  // Round-trip through the same validation used on read, so a bad value can
  // never reach storage in the first place.
  const valid = parseStoredPosition(JSON.stringify(position));
  if (!valid) return;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {
    // Intentionally ignored.
  }
}

/** Exported for tests and for callers that need to validate before storing. */
export { parseStoredPosition };
