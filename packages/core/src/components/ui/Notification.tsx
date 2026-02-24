import type React from 'react';
import { useEffect, useState } from 'react';
import { getNotificationColor, getNotificationIcon } from '../../core/ui';
import type { NotificationProps } from './types';

/**
 * Transient Status Notification.
 *
 * Provides a non-intrusive way to display status updates, warnings, errors,
 * or achievements. Features automatic timing, progress bars, and icon presets.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <Notification
 *   title="Achievement Unlocked!"
 *   message="You have explored the entire marsh."
 *   type="success"
 *   duration={5000}
 * />
 * ```
 */
export const Notification: React.FC<NotificationProps> = ({
  message,
  title,
  type = 'info',
  duration = 5000,
  dismissible = true,
  progress = true,
  onDismiss,
  className,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progressValue, setProgressValue] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgressValue(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setIsVisible(false);
        onDismiss?.();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  const accentColor = getNotificationColor(type);
  const icon = getNotificationIcon(type);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    minWidth: 280,
    maxWidth: 400,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      style={containerStyle}
      className={className}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span style={{ fontSize: 20, color: accentColor }} aria-hidden="true">
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#ffffff' }}>{title}</div>
        )}
        <div style={{ color: '#d1d5db', fontSize: 14 }}>{message}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          aria-label="Close notification"
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: 0,
            fontSize: 18,
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
      {progress && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${progressValue}%`,
            height: 3,
            backgroundColor: accentColor,
            transition: 'width 50ms linear',
          }}
        />
      )}
    </div>
  );
};
