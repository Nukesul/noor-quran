import type { Edition, EditionPair } from '../../types/quran';
import {
  ARABIC_QURANENC,
  DEFAULT_EDITIONS,
  ENGLISH_ROWWAD,
  KYRGYZ_HAKIMOV,
  RUSSIAN_KULIEV,
} from './editions';

/**
 * The Quran translations a reader can choose between.
 *
 * Selecting a translation selects an **edition pair**, because the Arabic text
 * a source serves is tied to that source: AlQuran.cloud pairs Tanzil's Uthmani
 * with Kuliev, QuranEnc pairs its own Arabic with its own translations. The two
 * editions stay separate fields — nothing is merged — so a future Arabic-script
 * picker can vary them independently.
 *
 * This is a Quran *content* setting and is entirely independent of the
 * interface language in `locales/`. Reading in Russian with an English
 * interface, or the reverse, is a valid combination.
 */
export interface TranslationOption {
  /** Stable identifier, persisted. The translation edition's own id. */
  id: string;
  /** The translation edition, for attribution and display. */
  edition: Edition;
  /** What to ask QuranService for. */
  editions: EditionPair;
}

export const TRANSLATION_OPTIONS: readonly TranslationOption[] = [
  {
    id: RUSSIAN_KULIEV.id,
    edition: RUSSIAN_KULIEV,
    // The existing default pair — Tanzil Uthmani + Kuliev, via AlQuran.cloud.
    // This is the only pair the bundled Al-Fatihah holds, so it is also the
    // only one that opens without a network round trip.
    editions: DEFAULT_EDITIONS,
  },
  {
    id: ENGLISH_ROWWAD.id,
    edition: ENGLISH_ROWWAD,
    editions: { arabic: ARABIC_QURANENC, translation: ENGLISH_ROWWAD },
  },
  {
    id: KYRGYZ_HAKIMOV.id,
    edition: KYRGYZ_HAKIMOV,
    editions: { arabic: ARABIC_QURANENC, translation: KYRGYZ_HAKIMOV },
  },
];

/** Russian Kuliev — what the app has always shown. */
export const DEFAULT_TRANSLATION_ID = RUSSIAN_KULIEV.id;

export function isTranslationId(value: unknown): boolean {
  return (
    typeof value === 'string' && TRANSLATION_OPTIONS.some((option) => option.id === value)
  );
}

/**
 * The option for an id, falling back to Russian Kuliev.
 *
 * Total by construction: a stale or unknown id can never leave the Reader
 * without editions to request.
 */
export function translationOption(id: string): TranslationOption {
  return (
    TRANSLATION_OPTIONS.find((option) => option.id === id) ??
    TRANSLATION_OPTIONS.find((option) => option.id === DEFAULT_TRANSLATION_ID)!
  );
}
