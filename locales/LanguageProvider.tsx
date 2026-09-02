import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadLanguage, saveLanguage } from '../services/languagePreference';
import type { RevelationPlace, SurahSummary } from '../types/quran';
import { en } from './en/common';
import { ky } from './ky/common';
import { ru } from './ru/common';
import { surahName as resolveSurahName } from './surahName';
import {
  DEFAULT_LANGUAGE,
  REVELATION_KEY,
  type AppLanguage,
  type LanguagePack,
  type TranslationKey,
} from './types';

const PACKS: Record<AppLanguage, LanguagePack> = { ru, ky, en };

export type TranslationParams = Record<string, string | number>;

export interface Translation {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  /** Looks up a string and fills its `{placeholders}`. Keys are typed. */
  t: (key: TranslationKey, params?: TranslationParams) => string;
  versesLabel: (count: number) => string;
  revelationLabel: (place: RevelationPlace) => string;
  /** Surah display name for the current language. */
  surahName: (surah: Pick<SurahSummary, 'number' | 'transliteration'>) => string;
}

const LanguageContext = createContext<Translation | null>(null);

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  // Leaves an unknown placeholder visible rather than blanking it — a stray
  // "{surah}" on screen is a bug report; an empty gap is a mystery.
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadLanguage()
      .then((stored) => {
        if (isMounted) setLanguageState(stored);
      })
      // Whatever happened, the app has to become usable. loadLanguage already
      // swallows its own errors; this is belt and braces.
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    // State first so the interface switches immediately, then persist.
    // saveLanguage never rejects.
    setLanguageState(next);
    void saveLanguage(next);
  }, []);

  const value = useMemo<Translation>(() => {
    const pack = PACKS[language];

    return {
      language,
      setLanguage,
      t: (key, params) => interpolate(pack.strings[key], params),
      versesLabel: pack.versesLabel,
      revelationLabel: (place) => pack.strings[REVELATION_KEY[place]],
      surahName: (surah) => resolveSurahName(language, surah),
    };
  }, [language, setLanguage]);

  // Held back for the moment it takes to read storage, so the interface never
  // paints in Russian and then flicks to the saved language.
  if (!isReady) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): Translation {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error('useTranslation must be used inside a LanguageProvider');
  }

  return value;
}
