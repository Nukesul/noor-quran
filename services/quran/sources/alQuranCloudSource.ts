import { SURAH_INDEX } from '../../../constants/surahIndex';
import type { Surah, SurahSummary, Verse } from '../../../types/quran';
import { ARABIC_UTHMANI, RUSSIAN_KULIEV } from '../editions';
import { QuranDataError, type QuranDataSource, type SurahRequest } from '../types';
import { fetchJson } from './fetchJson';

/**
 * AlQuran.cloud adapter.
 *
 * Chosen after verifying the alternatives. Endpoints, licensing and data
 * accuracy checks are recorded in docs/07_Data.md.
 *
 * Uses the built-in `fetch` — no HTTP client dependency is warranted for two
 * endpoints.
 */

const BASE_URL = 'https://api.alquran.cloud/v1';
const REQUEST_TIMEOUT_MS = 15_000;

const SOURCE_ID = 'alquran.cloud';

/**
 * Edition ids this API serves. AlQuran.cloud identifiers live in their own
 * namespace, so an id from another provider is a miss, not a failure.
 */
const SERVED_EDITION_IDS = new Set([ARABIC_UTHMANI.id, RUSSIAN_KULIEV.id]);

/** Shape of the parts of the response we actually read. */
interface ApiAyah {
  text: string;
  numberInSurah: number;
}

interface ApiEditionBlock {
  ayahs: ApiAyah[];
  edition: { identifier: string };
}

/**
 * Strips a leading byte-order mark.
 *
 * The API returns a real U+FEFF at the start of 1:1 in `quran-uthmani` —
 * verified, not theoretical. It is an encoding artifact, not part of the
 * revealed text, and would otherwise sit in the string as an invisible
 * character. This is the ONLY transformation applied to Quran text: Tanzil's
 * terms permit verbatim copies only, so nothing else may be normalised,
 * re-spaced, or stripped.
 */
function stripByteOrderMark(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * The Bismillah as this edition writes it — 38 characters.
 *
 * Compared only in NFC-normalised form, never raw. The API returns some
 * combining marks in non-canonical order (shadda before fatha, U+0651 U+064E),
 * while an editor writing the same glyphs will usually produce canonical order
 * (U+064E U+0651). The two are identical text and render identically, but a raw
 * `startsWith` between them fails — which it did, silently leaving the Bismillah
 * inside ayah 1.
 *
 * Normalising is safe for length here: Arabic diacritics have no precomposed
 * forms, so NFC only reorders marks and never changes character count. The
 * guard in `separateBismillah` enforces that assumption anyway.
 */
const BISMILLAH_UTHMANI_NFC = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'.normalize('NFC');

/** بِسْمِ · ٱللَّهِ · ٱلرَّحْمَٰنِ · ٱلرَّحِيمِ */
const BISMILLAH_WORD_COUNT = 4;

/**
 * Separates the Bismillah from the first ayah.
 *
 * This edition prepends the Bismillah to ayah 1 of every surah that opens with
 * one — verified for surahs 2, 112 and 114, and correctly absent for 1 and 9.
 * So the raw ayah 1 of Al-Ikhlas arrives as
 * "بِسْمِ ٱللَّهِ ... ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ" rather than "قُلْ هُوَ ٱللَّهُ أَحَدٌ".
 *
 * Left alone this would be wrong twice over: the Bismillah would render both in
 * the header and inside ayah 1, and the Arabic would carry text its paired
 * translation does not (ru.kuliev returns ayah 1 without the Bismillah).
 * quran.com's independent `text_uthmani` confirms the correct boundary.
 *
 * No text is discarded — the Bismillah is still displayed, by the header. This
 * only restores the ayah boundary of the standard mushaf, which keeps us within
 * Tanzil's verbatim-copy terms.
 *
 * Deliberately conservative: if the prefix is not present exactly as expected,
 * the text is returned untouched. Rendering a Bismillah twice is a visible,
 * recoverable flaw; silently truncating an ayah is not.
 */
function separateBismillah(text: string, expectsBismillahHeader: boolean): string {
  if (!expectsBismillahHeader) return text;

  // Locate the space that ends the Bismillah's fourth and final word, measured
  // on the ORIGINAL string. Comparing whole normalised strings and slicing by a
  // normalised index would be wrong: NFC composes hamza forms, so in surahs
  // like An-Naba (78) and Al-Kawthar (108) — "يَتَسَآءَلُونَ", "إِنَّآ" — the
  // normalised copy is shorter than the original and the indices no longer line
  // up. Finding the boundary first keeps every index in the original's own
  // coordinates.
  let spacesSeen = 0;
  let boundary = -1;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== ' ') continue;

    spacesSeen += 1;
    if (spacesSeen === BISMILLAH_WORD_COUNT) {
      boundary = index;
      break;
    }
  }

  if (boundary === -1) return text;

  // Normalise only for the equality test, never for what we return.
  if (text.slice(0, boundary).normalize('NFC') !== BISMILLAH_UTHMANI_NFC) return text;

  return text.slice(boundary + 1);
}

function isEditionBlock(value: unknown): value is ApiEditionBlock {
  if (typeof value !== 'object' || value === null) return false;
  const block = value as Partial<ApiEditionBlock>;
  return (
    Array.isArray(block.ayahs) &&
    block.ayahs.every(
      (ayah) => typeof ayah?.text === 'string' && typeof ayah?.numberInSurah === 'number',
    ) &&
    typeof block.edition?.identifier === 'string'
  );
}

export const alQuranCloudSource: QuranDataSource = {
  id: SOURCE_ID,

  /**
   * The full index is bundled and already cross-verified against this API, so
   * there is nothing to gain from a network round trip for metadata.
   */
  async getSurahIndex(): Promise<readonly SurahSummary[]> {
    return SURAH_INDEX;
  },

  async getSurah(request: SurahRequest): Promise<Surah | null> {
    const { surahNumber, editions, signal } = request;

    // Decline editions this API does not carry, so the service can go on to a
    // source that does. Without this the chain would send another provider's
    // edition id to AlQuran.cloud and turn an ordinary miss into an error.
    if (!SERVED_EDITION_IDS.has(editions.arabic.id) ||
        !SERVED_EDITION_IDS.has(editions.translation.id)) {
      return null;
    }

    const summary = SURAH_INDEX.find((entry) => entry.number === surahNumber);
    if (!summary) return null;

    // One request returns both editions already aligned by ayah, which avoids
    // pairing two independently-fetched lists.
    const url =
      `${BASE_URL}/surah/${surahNumber}/editions/` +
      `${encodeURIComponent(editions.arabic.id)},${encodeURIComponent(editions.translation.id)}`;

    const payload = await fetchJson(url, SOURCE_ID, REQUEST_TIMEOUT_MS, signal);

    const blocks = (payload as { data?: unknown })?.data;
    if (!Array.isArray(blocks) || !blocks.every(isEditionBlock)) {
      throw new QuranDataError('malformed', SOURCE_ID, `Unexpected response shape for surah ${surahNumber}`);
    }

    const arabicBlock = blocks.find((block) => block.edition.identifier === editions.arabic.id);
    const translationBlock = blocks.find(
      (block) => block.edition.identifier === editions.translation.id,
    );

    if (!arabicBlock || !translationBlock) {
      throw new QuranDataError(
        'malformed',
        SOURCE_ID,
        `Response is missing a requested edition for surah ${surahNumber}`,
      );
    }

    // The bundled index is the authority on ayah counts. If the response
    // disagrees, something is wrong with the data and we must not render a
    // partial surah as though it were complete.
    if (
      arabicBlock.ayahs.length !== summary.versesCount ||
      translationBlock.ayahs.length !== summary.versesCount
    ) {
      throw new QuranDataError(
        'malformed',
        SOURCE_ID,
        `Surah ${surahNumber} returned ${arabicBlock.ayahs.length} Arabic and ` +
          `${translationBlock.ayahs.length} translated ayahs, expected ${summary.versesCount}`,
      );
    }

    const translationByAyah = new Map(
      translationBlock.ayahs.map((ayah) => [ayah.numberInSurah, ayah.text]),
    );

    const verses: Verse[] = arabicBlock.ayahs.map((ayah) => {
      const translation = translationByAyah.get(ayah.numberInSurah);
      if (translation === undefined) {
        throw new QuranDataError(
          'malformed',
          SOURCE_ID,
          `No translation for ayah ${surahNumber}:${ayah.numberInSurah}`,
        );
      }

      const arabic = stripByteOrderMark(ayah.text);

      return {
        id: `${surahNumber}:${ayah.numberInSurah}`,
        surahNumber,
        numberInSurah: ayah.numberInSurah,
        arabic:
          ayah.numberInSurah === 1
            ? separateBismillah(arabic, summary.showsBismillahHeader)
            : arabic,
        translation: stripByteOrderMark(translation),
      };
    });

    return { ...summary, verses };
  },
};
