import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DialogBox } from '../components/ui';

describe('DialogBox UX', () => {
    // No fake timers to avoid waitFor issues

    const lines = [{ text: 'Hello', speaker: 'Bot' }];

    it('should be accessible via keyboard and screen readers', () => {
        render(<DialogBox lines={lines} visible={true} />);

        // 1. Check for accessible role
        const dialog = screen.getByRole('region', { name: /Dialogue/i });
        expect(dialog).toBeDefined();

        // 2. Check focusability
        expect(dialog.getAttribute('tabindex')).toBe('0');

        // 3. Check for screen reader text (hidden but live)
        const hiddenText = document.querySelector('[aria-live="polite"]');
        expect(hiddenText).not.toBeNull();
        expect(hiddenText?.textContent).toContain('Bot: Hello');
    });

    it('should advance on Enter key', async () => {
        const { container } = render(<DialogBox lines={lines} typewriterSpeed={10} />);

        const dialog = screen.getByRole('region', { name: /Dialogue/i });
        dialog.focus();

        // Initial state: text is typing
        // Press Enter to skip
        fireEvent.keyDown(dialog, { key: 'Enter', code: 'Enter', charCode: 13 });

        // Use waitFor to handle potential async state updates
        await waitFor(() => {
            // We check the element that has aria-hidden="true" (the visual text)
            const typewriterDiv = container.querySelector('div[aria-hidden="true"]');
            expect(typewriterDiv).not.toBeNull();
            expect(typewriterDiv?.textContent).toContain('Hello');
            expect(typewriterDiv?.textContent).not.toContain('|');
        });
    });
});
