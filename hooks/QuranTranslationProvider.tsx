import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  DEFAULT_TRANSLATION_ID,
  loadTranslationId,
  saveTranslationId,
  translationOption,
  TRANSLATION_OPTIONS,
  type TranslationOption,
} from '../services/quran';
import type { EditionPair } from '../types/quran';

export interface QuranTranslationValue {
  /** Currently selected translation. */
  selected: TranslationOption;
  /** Everything a reader can choose between. */
  options: readonly TranslationOption[];
  /** What to hand to `useSurah`. */
  editions: EditionPair;
  selectTranslation: (id: string) => void;
}

const QuranTranslationContext = createContext<QuranTranslationValue | null>(null);

/**
 * Holds the selected Quran translation.
 *
 * Deliberately separate from `LanguageProvider`: interface language and Quran
 * translation are independent settings with independent storage, and changing
 * one must never move the other.
 */
export function QuranTranslationProvider({ children }: { children: ReactNode }) {
  const [translationId, setTranslationId] = useState(DEFAULT_TRANSLATION_ID);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadTranslationId()
      .then((stored) => {
        if (isMounted) setTranslationId(stored);
      })
      // Whatever happened, the app has to become usable. loadTranslationId
      // already swallows its own errors; this is belt and braces.
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectTranslation = useCallback((id: string) => {
    // State first so the choice shows immediately, then persist.
    // saveTranslationId never rejects and ignores ids we do not offer.
    setTranslationId(id);
    void saveTranslationId(id);
  }, []);

  const value = useMemo<QuranTranslationValue>(() => {
    const selected = translationOption(translationId);

    return {
      selected,
      options: TRANSLATION_OPTIONS,
      editions: selected.editions,
      selectTranslation,
    };
  }, [translationId, selectTranslation]);

  // Held back while storage is read, so the Reader never requests Kuliev and
  // then swaps to the saved translation a frame later.
  if (!isReady) return null;

  return (
    <QuranTranslationContext.Provider value={value}>{children}</QuranTranslationContext.Provider>
  );
}

export function useQuranTranslation(): QuranTranslationValue {
  const value = useContext(QuranTranslationContext);

  if (!value) {
    throw new Error('useQuranTranslation must be used inside a QuranTranslationProvider');
  }

  return value;
}
