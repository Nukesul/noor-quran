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
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  saveReaderSettings,
  type ReaderSettings,
} from '../services/reader/readerSettings';
import { clampSizeStep, type ReadingMode } from '../theme';

export interface ReaderSettingsValue extends ReaderSettings {
  setMode: (mode: ReadingMode) => void;
  /** Steps the Arabic size by ±1, clamped. */
  stepArabic: (delta: number) => void;
  stepTranslation: (delta: number) => void;
  /**
   * Steps both together, for pinch.
   *
   * Refuses to move if either end is already at its limit, so the two sizes
   * keep their relative difference instead of quietly converging.
   */
  stepBoth: (delta: number) => void;
  /** Turns the reading page 180° and back. */
  toggleFlipped: () => void;
}

const ReaderSettingsContext = createContext<ReaderSettingsValue | null>(null);

/**
 * Reading layout and text size.
 *
 * Kept out of the components that render verses: these values change rarely,
 * and every change legitimately re-renders every visible verse because the text
 * has to reflow. Transient UI state — whether the controls panel is open — is
 * deliberately *not* here, so opening the panel does not touch the list.
 */
export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadReaderSettings()
      .then((stored) => {
        if (isMounted) setSettings(stored);
      })
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const update = useCallback((next: ReaderSettings) => {
    setSettings(next);
    void saveReaderSettings(next);
  }, []);

  const value = useMemo<ReaderSettingsValue>(
    () => ({
      ...settings,

      setMode: (mode) => {
        if (mode === settings.mode) return;
        update({ ...settings, mode });
      },

      stepArabic: (delta) => {
        const arabicStep = clampSizeStep(settings.arabicStep + delta);
        if (arabicStep === settings.arabicStep) return;
        update({ ...settings, arabicStep });
      },

      stepTranslation: (delta) => {
        const translationStep = clampSizeStep(settings.translationStep + delta);
        if (translationStep === settings.translationStep) return;
        update({ ...settings, translationStep });
      },

      stepBoth: (delta) => {
        const arabicStep = clampSizeStep(settings.arabicStep + delta);
        const translationStep = clampSizeStep(settings.translationStep + delta);

        const arabicMoved = arabicStep !== settings.arabicStep;
        const translationMoved = translationStep !== settings.translationStep;
        if (!arabicMoved || !translationMoved) return;

        update({ ...settings, arabicStep, translationStep });
      },

      toggleFlipped: () => update({ ...settings, isFlipped: !settings.isFlipped }),
    }),
    [settings, update],
  );

  // Held back while storage is read, so the Reader never paints at the default
  // size and then reflows to the saved one.
  if (!isReady) return null;

  return (
    <ReaderSettingsContext.Provider value={value}>{children}</ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings(): ReaderSettingsValue {
  const value = useContext(ReaderSettingsContext);

  if (!value) {
    throw new Error('useReaderSettings must be used inside a ReaderSettingsProvider');
  }

  return value;
}
