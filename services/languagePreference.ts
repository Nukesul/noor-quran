import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_LANGUAGES, DEFAULT_LANGUAGE, type AppLanguage } from '../locales/types';

/**
 * Persisted interface language.
 *
 * Deliberately a separate key from reading progress
 * (`noorquran.readingPosition.v1`): changing the interface language must never
 * be able to disturb where someone was reading, and vice versa.
 */
const STORAGE_KEY = 'noor-quran:language';

function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && (APP_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Reads the saved language.
 *
 * Never rejects. Storage being unavailable, empty, or holding something that is
 * not one of the three supported languages all resolve to Russian — none of
 * them is a reason to stop the app from opening.
 */
export async function loadLanguage(): Promise<AppLanguage> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return isAppLanguage(raw) ? raw : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Saves the language, ignoring anything unsupported.
 *
 * Never rejects: failing to remember a language preference is a far smaller
 * problem than an unhandled rejection while someone is reading.
 */
export async function saveLanguage(language: AppLanguage): Promise<void> {
  if (!isAppLanguage(language)) return;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Intentionally ignored.
  }
}

export { isAppLanguage, STORAGE_KEY as LANGUAGE_STORAGE_KEY };
