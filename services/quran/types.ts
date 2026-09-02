import type { EditionPair, Surah, SurahSummary } from '../../types/quran';

export interface SurahRequest {
  surahNumber: number;
  editions: EditionPair;
  /** Lets the caller cancel in-flight work — the Reader aborts on unmount. */
  signal?: AbortSignal;
}

/**
 * One place Quran data can come from: the bundled asset, a future offline
 * cache, or a remote API.
 *
 * Returning `null` from a getter means "I do not have this" — an ordinary miss,
 * not a failure, which is what lets the service try sources in order without
 * treating the normal case as an exception. Genuine failures throw
 * `QuranDataError`.
 */
export interface QuranDataSource {
  readonly id: string;

  /** Metadata for all 114 surahs. */
  getSurahIndex(): Promise<readonly SurahSummary[]>;

  getSurah(request: SurahRequest): Promise<Surah | null>;

  /**
   * Optional fast path: return the surah only if it is already in memory and
   * needs no I/O.
   *
   * This is what lets the Reader render bundled content on its very first frame
   * with no loading state. A future cache source implements this too.
   */
  getSurahSync?(request: SurahRequest): Surah | null;
}

export type QuranDataErrorReason =
  | 'network'
  | 'timeout'
  | 'not-found'
  | 'malformed'
  /**
   * The source is throttling us. Distinct from `network` because it is the one
   * failure that is expected to succeed on retry — AlQuran.cloud applies a soft
   * per-second, per-IP limit, confirmed by hitting it during testing.
   */
  | 'rate-limited';

export class QuranDataError extends Error {
  readonly reason: QuranDataErrorReason;
  readonly sourceId: string;

  constructor(reason: QuranDataErrorReason, sourceId: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'QuranDataError';
    this.reason = reason;
    this.sourceId = sourceId;
  }
}
