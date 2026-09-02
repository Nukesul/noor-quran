import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_TRANSLATION_ID, isTranslationId } from './translations';

/**
 * Persisted Quran translation choice.
 *
 * A third, separate key. Reading position, interface language and Quran
 * translation are three independent settings, and none of them should be able
 * to disturb the others:
 *
 *   noorquran.readingPosition.v1   where the reader was
 *   noor-quran:language            interface language
 *   noor-quran:translation         Quran translation   ← this one
 */
const STORAGE_KEY = 'noor-quran:translation';

/**
 * Reads the saved translation id.
 *
 * Never rejects. Storage being unavailable, empty, or holding an id the app no
 * longer offers all resolve to Russian Kuliev — a translation preference is
 * never a reason to stop the Quran from loading.
 */
export async function loadTranslationId(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return isTranslationId(raw) ? (raw as string) : DEFAULT_TRANSLATION_ID;
  } catch {
    return DEFAULT_TRANSLATION_ID;
  }
}

/** Saves the choice, ignoring ids the app does not offer. Never rejects. */
export async function saveTranslationId(id: string): Promise<void> {
  if (!isTranslationId(id)) return;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Intentionally ignored.
  }
}

export { STORAGE_KEY as TRANSLATION_STORAGE_KEY };
