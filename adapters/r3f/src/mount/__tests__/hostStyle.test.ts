import { describe, expect, it } from 'vitest';
import {
  STRATA_CANVAS_HOST_CLASS,
  STRATA_CANVAS_HOST_CSS,
  strataCanvasHostStyle,
} from '../hostStyle.js';

describe('strata-canvas-host contract', () => {
  it('inline style object carries the full parent-fill contract', () => {
    expect(strataCanvasHostStyle).toEqual({
      position: 'relative',
      flex: 1,
      display: 'flex',
      width: '100%',
      height: '100%',
      minHeight: 0,
    });
  });

  it('keeps min-height:0 — the flex-shrink footgun the contract exists to fix', () => {
    expect(strataCanvasHostStyle.minHeight).toBe(0);
  });

  it('is entirely parent-derived: no vh/vw/window units anywhere', () => {
    const values = Object.values(strataCanvasHostStyle).map(String).join(' ');
    expect(values).not.toMatch(/\d(vh|vw|dvh|svh)\b/);
  });

  it('CSS text block matches the inline object on every declared property', () => {
    const hostRule = STRATA_CANVAS_HOST_CSS.match(
      new RegExp(`\\.${STRATA_CANVAS_HOST_CLASS}\\s*\\{([^}]*)\\}`)
    )?.[1];
    expect(hostRule).toBeDefined();
    expect(hostRule).toContain('min-height: 0');
    expect(hostRule).toContain('flex: 1');
    expect(hostRule).toContain('display: flex');
    expect(hostRule).toContain('position: relative');
    expect(hostRule).toContain('width: 100%');
    expect(hostRule).toContain('height: 100%');
  });

  it('CSS text block styles the child canvas as a full-bleed display:block element', () => {
    const canvasRule = STRATA_CANVAS_HOST_CSS.match(
      new RegExp(`\\.${STRATA_CANVAS_HOST_CLASS} canvas\\s*\\{([^}]*)\\}`)
    )?.[1];
    expect(canvasRule).toBeDefined();
    expect(canvasRule).toContain('display: block');
    expect(canvasRule).toContain('width: 100%');
    expect(canvasRule).toContain('height: 100%');
  });

  it('class-name constant matches the selector used in the CSS block', () => {
    expect(STRATA_CANVAS_HOST_CLASS).toBe('strata-canvas-host');
    expect(STRATA_CANVAS_HOST_CSS).toContain('.strata-canvas-host {');
  });
});
