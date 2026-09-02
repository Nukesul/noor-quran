import type { Edition, EditionPair } from '../../types/quran';

/**
 * Available editions.
 *
 * Adding a translation later means adding a constant here and offering it in
 * settings — no change to the Reader, the service, or the data sources.
 *
 * The `id`s are AlQuran.cloud edition identifiers. A future data source with a
 * different identifier scheme maps these in its own adapter rather than
 * changing this registry.
 *
 * Each edition carries its own licensing terms. They are not the same for the
 * Arabic and the translation even though both arrive from the same API — see
 * docs/07_Data.md for the primary sources.
 */

/** Tanzil's Uthmani script — the default Arabic text. */
export const ARABIC_UTHMANI: Edition = {
  id: 'quran-uthmani',
  kind: 'arabic',
  language: 'ar',
  name: 'Uthmani',
  // Tanzil publishes no version identifier through AlQuran.cloud.
  distribution: 'redistributable',
  attribution: 'Текст Корана: Tanzil Project (tanzil.net)',
  // Tanzil's terms require a *link*, not merely a mention, so that readers can
  // find text corrections.
  sourceUrl: 'https://tanzil.net',
};

/**
 * Elmir Kuliev — the most widely used Russian translation.
 *
 * NOT APPROVED FOR PRODUCTION DISTRIBUTION. Tanzil distributes its translations
 * for non-commercial purposes only; commercial use needs permission from the
 * translator or publisher, which Tanzil cannot grant. Kept because it is
 * verified and the Reader depends on it, and because the app is not monetised.
 * Replacing it is a separate, approved-in-advance task.
 */
export const RUSSIAN_KULIEV: Edition = {
  id: 'ru.kuliev',
  kind: 'translation',
  language: 'ru',
  name: 'Кулиев',
  distribution: 'non-commercial-only',
  attribution: 'Перевод: Эльмир Кулиев · Распространяется Tanzil Project (tanzil.net)',
  sourceUrl: 'https://tanzil.net/trans/',
};

/**
 * The Arabic that arrives alongside every QuranEnc response.
 *
 * A genuinely different edition from Tanzil's, not a stylistic variant: it
 * writes sukun as U+06E1 where Tanzil uses U+0652. Given its own identity so
 * that a source can never quietly hand back one edition when the other was
 * requested. The id is ours — QuranEnc does not name its Arabic separately.
 */
export const ARABIC_QURANENC: Edition = {
  id: 'quranenc-arabic',
  kind: 'arabic',
  language: 'ar',
  name: 'QuranEnc Arabic',
  distribution: 'permission-required',
  attribution: 'Текст Корана: QuranEnc.com',
  sourceUrl: 'https://quranenc.com',
};

/**
 * Rowwad Translation Center's Russian translation, served by QuranEnc.
 *
 * QuranEnc's terms do permit re-publication, which would make this
 * `redistributable` — but two of their seven conditions cannot be met yet:
 * condition 3 requires the version number to be shown when republishing, and
 * condition 6 requires staying current with the latest version. **QuranEnc
 * publishes no version for this translation** — it is absent from their
 * `/translations/list` catalogue entirely, though the endpoint serves data.
 *
 * It is therefore marked `permission-required` rather than `redistributable`:
 * not because redistribution is forbidden, but because we cannot yet satisfy
 * the conditions attached to it. Revisit once QuranEnc confirms the
 * translation's catalogue status and version. Do not invent a version.
 */
export const RUSSIAN_ROWWAD: Edition = {
  id: 'russian_rwwad',
  kind: 'translation',
  language: 'ru',
  name: 'Руввад',
  // Deliberately undefined — see above.
  distribution: 'permission-required',
  attribution: 'Перевод: Rowwad Translation Center · Источник: QuranEnc.com',
  sourceUrl: 'https://quranenc.com',
};

/**
 * Rowwad Translation Center's English translation, served by QuranEnc.
 *
 * Unlike the Russian Rowwad translation above, this one **is** in QuranEnc's
 * public catalogue, so its version is discoverable and condition 3 (state the
 * version when republishing) can be met. Verified from
 * `GET /api/v1/translations/list`:
 *   key "english_rwwad", title "English Translation - Rowwad Translation
 *   Center", version 1.0.19.
 */
export const ENGLISH_ROWWAD: Edition = {
  id: 'english_rwwad',
  kind: 'translation',
  language: 'en',
  name: 'Rowwad Translation Center',
  version: '1.0.19',
  distribution: 'redistributable',
  attribution: 'Translation: Rowwad Translation Center · Source: QuranEnc.com',
  sourceUrl: 'https://quranenc.com',
};

/**
 * Shamsuddin Hakimov's Kyrgyz translation, served by QuranEnc.
 *
 * Also catalogued, so also versioned. Verified from
 * `GET /api/v1/translations/list`:
 *   key "kyrgyz_hakimov", title "Kyrgyz Translation - Shamsuddin Hakimov",
 *   version 1.0.2.
 */
export const KYRGYZ_HAKIMOV: Edition = {
  id: 'kyrgyz_hakimov',
  kind: 'translation',
  language: 'ky',
  name: 'Shamsuddin Hakimov',
  version: '1.0.2',
  distribution: 'redistributable',
  attribution: 'Котормо: Шамсуддин Хакимов · Булак: QuranEnc.com',
  sourceUrl: 'https://quranenc.com',
};

/** The pair QuranEnc serves. Both editions arrive in the same response. */
export const QURANENC_EDITIONS: EditionPair = {
  arabic: ARABIC_QURANENC,
  translation: RUSSIAN_ROWWAD,
};

export const DEFAULT_EDITIONS: EditionPair = {
  arabic: ARABIC_UTHMANI,
  translation: RUSSIAN_KULIEV,
};

/**
 * Every edition the app can currently request.
 *
 * AlQuran.cloud also serves ru.osmanov, ru.abuadel, ru.porokhova,
 * ru.krachkovsky, ru.sablukov and ru.kuliev-alsaadi, all verified present.
 * They are intentionally not listed yet — a translation picker is a later task,
 * and every one of them carries the same non-commercial restriction.
 */
export const AVAILABLE_EDITIONS: readonly Edition[] = [
  ARABIC_UTHMANI,
  RUSSIAN_KULIEV,
  ARABIC_QURANENC,
  RUSSIAN_ROWWAD,
  ENGLISH_ROWWAD,
  KYRGYZ_HAKIMOV,
];

/**
 * Translation editions QuranEnc serves, keyed by the id used as its API key.
 *
 * The source reads this rather than hardcoding one translation, so adding a
 * QuranEnc translation is a change here and nowhere else.
 */
export const QURANENC_TRANSLATIONS: readonly Edition[] = [
  RUSSIAN_ROWWAD,
  ENGLISH_ROWWAD,
  KYRGYZ_HAKIMOV,
];

/**
 * Whether this edition's text may be shipped in a production release.
 *
 * Written as an exhaustive switch rather than a single equality check on
 * purpose: adding a new `EditionDistribution` value then fails to compile until
 * someone decides what it means. A default branch would quietly answer for it,
 * and the safe-looking answer is not always the correct one — a public-domain
 * status, say, would be redistributable.
 *
 * Reflects only the terms recorded in docs/07_Data.md. It is not legal advice
 * and does not account for jurisdiction.
 */
export function isProductionRedistributable(edition: Edition): boolean {
  switch (edition.distribution) {
    case 'redistributable':
      return true;
    case 'non-commercial-only':
      return false;
    case 'permission-required':
      return false;
  }
}
