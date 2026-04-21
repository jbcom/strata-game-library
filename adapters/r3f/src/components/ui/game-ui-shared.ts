import type { CSSProperties } from 'react';
import type { ControlHint } from '../../hooks/useInput';

const KEY_LABELS: Record<string, string> = {
  ' ': 'Space',
  arrowdown: 'Arrow Down',
  arrowleft: 'Arrow Left',
  arrowright: 'Arrow Right',
  arrowup: 'Arrow Up',
  backspace: 'Backspace',
  control: 'Ctrl',
  enter: 'Enter',
  escape: 'Esc',
  shift: 'Shift',
  tab: 'Tab',
};

export const BASE_PANEL_STYLE: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.76))',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 16,
  boxShadow: '0 18px 48px rgba(2, 6, 23, 0.35)',
  color: '#e2e8f0',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

export function formatActionLabel(action: string): string {
  const spaced = action
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatProfileLabel(profileId: string): string {
  return formatActionLabel(profileId);
}

export function formatKeyboardToken(token: string): string {
  const normalized = token.toLowerCase();
  return KEY_LABELS[normalized] ?? token.toUpperCase();
}

export function formatGamepadToken(token: string | number): string {
  if (typeof token === 'number') {
    return `Pad ${token}`;
  }

  const normalized = token
    .replace(/[\s_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return `Pad ${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

export function formatBindingLabel(
  hint: Pick<ControlHint, 'keyboard' | 'gamepad' | 'tilt'>
): string {
  const segments = [
    ...(hint.keyboard?.map((token) => formatKeyboardToken(token)) ?? []),
    ...(hint.gamepad !== undefined ? [formatGamepadToken(hint.gamepad)] : []),
    ...(hint.tilt ? ['Tilt'] : []),
  ];

  return segments.join(' / ') || 'Unbound';
}
