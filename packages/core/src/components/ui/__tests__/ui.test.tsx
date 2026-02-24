import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KillStreakNotification, ScreenFlash, VirtualJoystick } from '../index';

describe('UI Components', () => {
  describe('ScreenFlash', () => {
    it('should render when active', () => {
      const { container } = render(<ScreenFlash active={true} />);
      expect(container.firstChild).not.toBeNull();
    });

    it('should be hidden when inactive', () => {
      const { container } = render(<ScreenFlash active={false} />);
      const flash = container.firstChild as HTMLElement;
      expect(flash).not.toBeNull();
      expect(flash.style.visibility).toBe('hidden');
      expect(flash.style.opacity).toBe('0');
    });

    it('should call onComplete after duration', () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      render(<ScreenFlash active={true} duration={100} onComplete={onComplete} />);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(onComplete).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('KillStreakNotification', () => {
    it('should render for streak >= 2', () => {
      render(<KillStreakNotification streak={2} />);
      expect(screen.getByText('DOUBLE KILL')).toBeDefined();
      expect(screen.getByText('2 KILLS')).toBeDefined();
    });

    it('should not render for streak < 2', () => {
      const { container } = render(<KillStreakNotification streak={1} />);
      expect(container.firstChild).toBeNull();
    });

    it('should show correct name for higher streaks', () => {
      render(<KillStreakNotification streak={7} />);
      expect(screen.getByText('MONSTER KILL')).toBeDefined();
    });

    it('should fall back to max defined name for streaks beyond max', () => {
      render(<KillStreakNotification streak={10} />);
      // Streak 10 is beyond max defined (7), should fall back to highest: MONSTER KILL
      expect(screen.getByText('MONSTER KILL')).toBeDefined();
      expect(screen.getByText('10 KILLS')).toBeDefined();
    });

    it('should use max key correctly for custom non-sequential streak names', () => {
      const customStreaks = {
        3: 'THREE',
        5: 'FIVE',
        10: 'TEN',
      };
      render(<KillStreakNotification streak={15} streakNames={customStreaks} />);
      // Streak 15 is beyond max defined (10), should fall back to highest: TEN
      expect(screen.getByText('TEN')).toBeDefined();
      expect(screen.getByText('15 KILLS')).toBeDefined();
    });
  });

  describe('VirtualJoystick', () => {
    it('should render the control area', () => {
      const { container } = render(<VirtualJoystick />);
      // The first div is the fixed container
      expect(container.firstChild).not.toBeNull();
    });
  });
});
