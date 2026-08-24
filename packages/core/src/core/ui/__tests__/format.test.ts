import { describe, expect, it } from 'vitest';
import { clampProgress, formatNumber, formatProgressText, getTextDirection } from '../format';

describe('formatProgressText', () => {
  it('rounds percentages to the nearest integer', () => {
    expect(formatProgressText(50, 100, 'percentage')).toBe('50%');
    expect(formatProgressText(1, 3, 'percentage')).toBe('33%');
    expect(formatProgressText(2, 3, 'percentage')).toBe('67%');
  });

  it('returns "0%" instead of NaN when maxValue is zero', () => {
    expect(formatProgressText(0, 0, 'percentage')).toBe('0%');
    expect(formatProgressText(10, 0, 'percentage')).toBe('0%');
  });

  it('does not clamp percentages above 100 or below 0', () => {
    expect(formatProgressText(150, 100, 'percentage')).toBe('150%');
    expect(formatProgressText(-25, 100, 'percentage')).toBe('-25%');
  });

  it('rounds both sides of a fraction', () => {
    expect(formatProgressText(10, 20, 'fraction')).toBe('10/20');
    expect(formatProgressText(7.4, 20.6, 'fraction')).toBe('7/21');
  });

  it('divides by zero into Infinity only when asked for a percentage of a nonzero max', () => {
    expect(formatProgressText(5, 0, 'fraction')).toBe('5/0');
  });

  it('rounds a bare value', () => {
    expect(formatProgressText(9.5, 100, 'value')).toBe('10');
    // Math.round(-0.4) is -0, but template-literal stringification yields "0".
    expect(formatProgressText(-0.4, 100, 'value')).toBe('0');
  });

  it('returns an empty string for the "none" format', () => {
    expect(formatProgressText(50, 100, 'none')).toBe('');
  });

  it('propagates NaN rather than masking it, except in the guarded percentage path', () => {
    expect(formatProgressText(Number.NaN, 100, 'percentage')).toBe('NaN%');
    expect(formatProgressText(Number.NaN, 100, 'value')).toBe('NaN');
  });
});

describe('clampProgress', () => {
  it('passes through values inside the range', () => {
    expect(clampProgress(50, 100)).toBe(50);
  });

  it('clamps to the maximum', () => {
    expect(clampProgress(150, 100)).toBe(100);
  });

  it('clamps negatives up to zero', () => {
    expect(clampProgress(-10, 100)).toBe(0);
  });

  it('returns the exact boundary values unchanged', () => {
    expect(clampProgress(0, 100)).toBe(0);
    expect(clampProgress(100, 100)).toBe(100);
  });

  it('collapses to zero when the maximum is zero', () => {
    expect(clampProgress(50, 0)).toBe(0);
    expect(clampProgress(-50, 0)).toBe(0);
  });

  it('yields zero for a negative maximum, since the lower bound wins', () => {
    expect(clampProgress(5, -10)).toBe(0);
  });

  it('returns NaN when the value is NaN', () => {
    expect(clampProgress(Number.NaN, 100)).toBeNaN();
  });

  it('handles infinite input against a finite maximum', () => {
    expect(clampProgress(Number.POSITIVE_INFINITY, 100)).toBe(100);
    expect(clampProgress(Number.NEGATIVE_INFINITY, 100)).toBe(0);
  });
});

describe('getTextDirection', () => {
  it('reports ltr for Latin text', () => {
    expect(getTextDirection('Hello world')).toBe('ltr');
  });

  it('reports rtl for Hebrew', () => {
    expect(getTextDirection('שלום')).toBe('rtl');
  });

  it('reports rtl for Arabic', () => {
    expect(getTextDirection('مرحبا')).toBe('rtl');
  });

  it('reports rtl for Arabic presentation forms', () => {
    expect(getTextDirection('ﹰﻼ')).toBe('rtl');
  });

  it('reports rtl when a single RTL character is mixed into Latin text', () => {
    expect(getTextDirection('hello שלום world')).toBe('rtl');
  });

  it('reports ltr for an empty string', () => {
    expect(getTextDirection('')).toBe('ltr');
  });

  it('reports ltr for digits, punctuation and emoji', () => {
    expect(getTextDirection('12345 !?.,')).toBe('ltr');
    expect(getTextDirection('🎮🕹️')).toBe('ltr');
  });

  it('reports ltr for CJK, which is not right-to-left', () => {
    expect(getTextDirection('日本語')).toBe('ltr');
  });
});

describe('formatNumber', () => {
  it('renders values below 1000 as rounded integers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(12.6)).toBe('13');
  });

  it('switches to K at exactly 1000', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(999.4)).toBe('999');
  });

  it('renders thousands with one decimal place', () => {
    expect(formatNumber(1234)).toBe('1.2K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('switches to M at exactly 1000000', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(5000000)).toBe('5.0M');
  });

  it('renders millions with one decimal place', () => {
    expect(formatNumber(1250000)).toBe('1.3M');
  });

  it('does not abbreviate negative numbers, which fall through to rounding', () => {
    expect(formatNumber(-5000)).toBe('-5000');
    expect(formatNumber(-1)).toBe('-1');
  });

  it('rounds negative halves toward positive infinity, per Math.round', () => {
    expect(formatNumber(-0.5)).toBe('0');
  });

  it('handles NaN and Infinity without throwing', () => {
    expect(formatNumber(Number.NaN)).toBe('NaN');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('InfinityM');
  });
});
