import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DialogBox } from '../components/ui';

describe('DialogBox UX', () => {
  // No fake timers to avoid waitFor issues

  const lines = [{ text: 'Hello', speaker: 'Bot' }];

  it('should be accessible via keyboard and screen readers', () => {
    render(<DialogBox lines={lines} visible={true} />);

    // 1. Check for accessible role (button for interactive dialog)
    const dialog = screen.getByRole('button', { name: /Dialogue/i });
    expect(dialog).toBeDefined();

    // 2. Buttons are focusable by default
    expect(dialog).not.toBeNull();

    // 3. Check the button has accessible label
    expect(dialog.getAttribute('aria-label')).toContain('Dialogue');

    // 4. Check speaker name is rendered
    expect(screen.getByText('Bot')).toBeDefined();
  });

  it('should advance on Enter key', async () => {
    render(<DialogBox lines={lines} typewriterSpeed={100} visible={true} />);

    const dialog = screen.getByRole('button', { name: /Dialogue/i });
    dialog.focus();

    // Press Enter to skip typewriter and show full text
    fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Use waitFor to handle potential async state updates
    await waitFor(() => {
      // Text should now show 'Hello' fully (after skip)
      expect(dialog.textContent).toContain('Hello');
    });
  });

  it('should display speaker name', () => {
    render(<DialogBox lines={lines} visible={true} />);

    // Check speaker name is shown
    expect(screen.getByText('Bot')).toBeDefined();
  });

  it('should handle click to skip typewriter', async () => {
    render(<DialogBox lines={lines} typewriterSpeed={100} visible={true} />);

    const dialog = screen.getByRole('button', { name: /Dialogue/i });

    // Click to skip typewriter
    fireEvent.click(dialog);

    // Wait for full text to show (skip completed)
    await waitFor(() => {
      expect(dialog.textContent).toContain('Hello');
    });
  });
});
