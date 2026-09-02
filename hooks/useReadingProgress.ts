import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_READING_POSITION,
  loadReadingPosition,
  saveReadingPosition,
  type ReadingPosition,
} from '../services/quran/readingProgress';

export interface UseReadingProgressResult {
  position: ReadingPosition;
  /** False only for the first moments after launch, while storage is read. */
  isReady: boolean;
  updatePosition: (position: ReadingPosition) => void;
}

/**
 * The reading position, hydrated from storage and written back on change.
 *
 * Keeps storage out of the navigation layer: App.tsx reads `position` and calls
 * `updatePosition`, and never learns that AsyncStorage exists.
 */
export function useReadingProgress(): UseReadingProgressResult {
  const [position, setPosition] = useState<ReadingPosition>(DEFAULT_READING_POSITION);
  const [isReady, setIsReady] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    loadReadingPosition()
      .then((stored) => {
        if (isMounted.current) setPosition(stored);
      })
      // `finally` rather than a `then` branch: whatever happened, the app has
      // to become usable. loadReadingPosition already swallows its own errors,
      // so this is belt and braces.
      .finally(() => {
        if (isMounted.current) setIsReady(true);
      });

    return () => {
      isMounted.current = false;
    };
  }, []);

  const updatePosition = useCallback((next: ReadingPosition) => {
    // Update state first so the UI never waits on a disk write, then persist.
    // saveReadingPosition never rejects and validates before writing.
    setPosition(next);
    void saveReadingPosition(next);
  }, []);

  return { position, isReady, updatePosition };
}
