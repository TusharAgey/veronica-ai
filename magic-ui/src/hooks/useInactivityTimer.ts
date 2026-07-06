import { useEffect, useRef, useCallback, useState } from "react";

export interface InactivityTimerOptions {
  /** Time in ms after which the password display is hidden (cosmetic). Default 30s. */
  cosmeticTimeout?: number;
  /** Time in ms after which the session password is cleared (hard lock). Default 5min. */
  hardTimeout?: number;
}

export interface InactivityTimerResult {
  /** True when the cosmetic timeout has elapsed — password display should be masked. */
  isCosmeticallyHidden: boolean;
  /** True when the hard timeout has elapsed or tab lost focus — session should be cleared. */
  isHardLocked: boolean;
  /** Manually reset the inactivity timer. */
  resetActivity: () => void;
}

/**
 * Tracks user inactivity and provides two-tier timeout callbacks.
 *
 * - `cosmeticTimeout`: Hides the displayed password but keeps the session alive.
 * - `hardTimeout`: Clears the session password entirely (full lock).
 * - Tab visibility loss immediately triggers a hard lock.
 */
export function useInactivityTimer(
  options: InactivityTimerOptions = {},
): InactivityTimerResult {
  const { cosmeticTimeout = 30_000, hardTimeout = 300_000 } = options;

  const [isCosmeticallyHidden, setIsCosmeticallyHidden] = useState(false);
  const [isHardLocked, setIsHardLocked] = useState(false);

  const cosmeticRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (cosmeticRef.current) {
      clearTimeout(cosmeticRef.current);
      cosmeticRef.current = null;
    }
    if (hardRef.current) {
      clearTimeout(hardRef.current);
      hardRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    setIsCosmeticallyHidden(false);
    setIsHardLocked(false);

    cosmeticRef.current = setTimeout(() => {
      setIsCosmeticallyHidden(true);
    }, cosmeticTimeout);

    hardRef.current = setTimeout(() => {
      setIsHardLocked(true);
      setIsCosmeticallyHidden(true);
    }, hardTimeout);
  }, [cosmeticTimeout, hardTimeout, clearTimers]);

  const resetActivity = useCallback(() => {
    startTimers();
  }, [startTimers]);

  // Throttled activity handler — resets timers on user interaction
  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      if (now - throttleRef.current < 500) return;
      throttleRef.current = now;
      resetActivity();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => document.addEventListener(event, handleActivity));

    // Tab visibility change — immediate hard lock
    const handleVisibility = () => {
      if (document.hidden) {
        setIsHardLocked(true);
        setIsCosmeticallyHidden(true);
        clearTimers();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Start the initial timers
    startTimers();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity),
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimers();
    };
  }, [resetActivity, clearTimers, startTimers]);

  return { isCosmeticallyHidden, isHardLocked, resetActivity };
}
