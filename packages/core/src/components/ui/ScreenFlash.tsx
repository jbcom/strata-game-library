import { useEffect, useState } from 'react';

export interface ScreenFlashProps {
  /** Whether the flash is currently active. */
  active?: boolean;
  /** Duration of the flash in milliseconds. Default: 150. */
  duration?: number;
  /** Color of the flash. Default: 'rgba(255, 0, 0, 0.3)'. */
  color?: string;
  /** Called when the flash completes. */
  onComplete?: () => void;
}

/**
 * A generalized screen flash effect for damage or other notifications.
 *
 * @category UI
 */
export function ScreenFlash({
  active = false,
  duration = 150,
  color = 'rgba(255, 0, 0, 0.3)',
  onComplete,
}: ScreenFlashProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const transitionDuration = duration / 2;

  useEffect(() => {
    if (active) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: color,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: isFlashing ? 1 : 0,
        transition: `opacity ${transitionDuration}ms ease-out`,
        visibility: isFlashing ? 'visible' : 'hidden',
      }}
    />
  );
}
