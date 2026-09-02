import { useEffect, useState } from 'react';

import { DEFAULT_EDITIONS, quranService } from '../services/quran';
import type { EditionPair, Surah } from '../types/quran';

export interface UseSurahResult {
  surah: Surah | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Loads a surah for the Reader.
 *
 * Initialised from whatever is already in memory, so a bundled surah is present
 * on the first frame and `isLoading` is never true for it — the Reader is the
 * home screen and must not open on a spinner.
 *
 * `editions` is the seam for future translation switching: the service and
 * every source already take an edition pair, but until now nothing above the
 * service could express a choice. Callers that do not care get
 * `DEFAULT_EDITIONS` — Uthmani Arabic and Kuliev — which is what the Reader
 * still passes today.
 */
export function useSurah(
  surahNumber: number,
  editions: EditionPair = DEFAULT_EDITIONS,
): UseSurahResult {
  // Identity, not object reference: a caller that builds `{ arabic, translation }`
  // inline would otherwise produce a new object every render and re-run the
  // effect forever.
  const arabicId = editions.arabic.id;
  const translationId = editions.translation.id;

  const [surah, setSurah] = useState<Surah | null>(() =>
    quranService.getSurahSync(surahNumber, editions),
  );
  const [isLoading, setIsLoading] = useState(
    () => quranService.getSurahSync(surahNumber, editions) === null,
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const available = quranService.getSurahSync(surahNumber, editions);
    if (available) {
      setSurah(available);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    quranService
      .getSurah(surahNumber, { editions, signal: controller.signal })
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setSurah(loaded);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setIsLoading(false);
      });

    return () => controller.abort();
    // `editions` is intentionally tracked by edition id rather than by
    // reference; see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber, arabicId, translationId]);

  return { surah, isLoading, error };
}
