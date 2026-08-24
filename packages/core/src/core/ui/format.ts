/**
 * Text and numeric formatting for UI display.
 *
 * Pure string/number transforms with no renderer dependency: progress readouts,
 * abbreviated large numbers, value clamping, and right-to-left script
 * detection for automatic UI orientation.
 *
 * @packageDocumentation
 * @module core/ui/format
 * @category UI & Interaction
 */

/**
 * Formats progress values into human-readable strings.
 *
 * @category UI & Interaction
 * @param value - Current value.
 * @param maxValue - Maximum value.
 * @param format - Output format choice.
 * @returns Formatted string (e.g., "50%", "10/20").
 */
export function formatProgressText(
  value: number,
  maxValue: number,
  format: 'percentage' | 'fraction' | 'value' | 'none'
): string {
  switch (format) {
    case 'percentage':
      // Guard against division by zero when maxValue is zero
      return maxValue === 0 ? '0%' : `${Math.round((value / maxValue) * 100)}%`;
    case 'fraction':
      return `${Math.round(value)}/${Math.round(maxValue)}`;
    case 'value':
      return `${Math.round(value)}`;
    default:
      return '';
  }
}

/**
 * Clamps a progress value between 0 and its maximum.
 *
 * @category UI & Interaction
 * @param value - Input value.
 * @param maxValue - Ceiling value.
 * @returns Clamped progress value.
 */
export function clampProgress(value: number, maxValue: number): number {
  return Math.max(0, Math.min(value, maxValue));
}

/**
 * Detects if a string primarily contains right-to-left characters.
 *
 * Useful for automatic UI orientation in multilingual games.
 *
 * @category UI & Interaction
 * @param text - The string to analyze.
 * @returns 'rtl' or 'ltr'.
 */
export function getTextDirection(text: string): 'ltr' | 'rtl' {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text) ? 'rtl' : 'ltr';
}

/**
 * Formats a number with commas and human-readable suffixes (K, M).
 *
 * @category UI & Interaction
 * @param value - The number to format.
 * @returns Formatted string (e.g., "1.2K", "5.0M").
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
}
