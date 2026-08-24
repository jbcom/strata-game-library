import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VirtualJoystick } from '../VirtualJoystick';

/**
 * jsdom has no PointerEvent, and the joystick listens on `window` with real
 * pointer semantics (pointerId, pointerType, cancelable). This shim carries
 * exactly those fields through a plain Event.
 */
interface PointerInit {
  pointerId?: number;
  pointerType?: string;
  clientX?: number;
  clientY?: number;
  target?: Element;
}

function firePointer(type: string, init: PointerInit = {}) {
  const {
    pointerId = 1,
    pointerType = 'touch',
    clientX = 0,
    clientY = 0,
    target = window,
  } = init as PointerInit & { target?: Element | Window };

  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });

  act(() => {
    (target as Element | Window).dispatchEvent(event);
  });
  return event;
}

/**
 * jsdom reports every element as a 0x0 box at the origin, which would fail the
 * joystick's geometry hit-test. Give the whole document a viewport-sized rect.
 */
function stubViewportRects(width = 1024, height = 768) {
  const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect);
  return spy;
}

describe('VirtualJoystick', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('existing API (must keep working)', () => {
    it('renders the control area', () => {
      const { container } = render(<VirtualJoystick />);
      expect(container.firstChild).not.toBeNull();
    });

    it('honors size, color and opacity on the base', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick size={200} color="red" opacity={0.25} />);
      const base = getByTestId('virtual-joystick-base');
      expect(base.style.width).toBe('200px');
      expect(base.style.height).toBe('200px');
      expect(base.style.border).toContain('red');
      // Inactive, so the idle opacity applies.
      expect(base.style.opacity).toBe('0.25');
      expect(base.style.display).toBe('none');
    });

    it('still accepts the deprecated style prop as the container style', () => {
      const { getByTestId } = render(<VirtualJoystick style={{ zIndex: 5 }} />);
      expect(getByTestId('virtual-joystick-area').style.zIndex).toBe('5');
    });

    it('prefers containerStyle over the deprecated style prop', () => {
      const { getByTestId } = render(
        <VirtualJoystick style={{ zIndex: 5 }} containerStyle={{ zIndex: 7 }} />
      );
      expect(getByTestId('virtual-joystick-area').style.zIndex).toBe('7');
    });

    it('applies className and baseStyle overrides', () => {
      const { container, getByTestId } = render(
        <VirtualJoystick className="pad" baseStyle={{ borderRadius: '4px' }} />
      );
      expect(container.querySelector('.pad')).not.toBeNull();
      expect(getByTestId('virtual-joystick-base').style.borderRadius).toBe('4px');
    });

    it('fires onStart, onMove and onEnd across a drag', () => {
      stubViewportRects();
      const onStart = vi.fn();
      const onMove = vi.fn();
      const onEnd = vi.fn();
      render(<VirtualJoystick size={100} onStart={onStart} onMove={onMove} onEnd={onEnd} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      expect(onStart).toHaveBeenCalledTimes(1);

      firePointer('pointermove', { clientX: 350, clientY: 300 });
      // 50px of a 50px radius is full deflection to the right.
      expect(onMove).toHaveBeenLastCalledWith(expect.closeTo(1, 5), expect.closeTo(0, 5));

      firePointer('pointerup', { clientX: 350, clientY: 300 });
      expect(onEnd).toHaveBeenCalledTimes(1);
      expect(onMove).toHaveBeenLastCalledWith(0, 0);
    });

    it('normalizes to -1..1 regardless of how far past the radius the pointer goes', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 9000, clientY: 300 });

      const [x, y] = onMove.mock.lastCall as [number, number];
      expect(Math.hypot(x, y)).toBeCloseTo(1, 5);
    });
  });

  describe('floating touch-anywhere origin', () => {
    it('spawns the base wherever the pointer first lands, not at a fixed home', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick size={100} />);
      const base = getByTestId('virtual-joystick-base');

      expect(base.style.display).toBe('none');

      firePointer('pointerdown', { clientX: 640, clientY: 480 });

      expect(base.style.display).toBe('block');
      // Centered on the touch: origin minus half the size.
      expect(base.style.left).toBe('590px');
      expect(base.style.top).toBe('430px');
    });

    it('re-homes to a different origin on the next touch', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick size={100} />);
      const base = getByTestId('virtual-joystick-base');

      firePointer('pointerdown', { clientX: 200, clientY: 200 });
      expect(base.style.left).toBe('150px');
      firePointer('pointerup', { clientX: 200, clientY: 200 });

      firePointer('pointerdown', { clientX: 800, clientY: 600 });
      expect(base.style.left).toBe('750px');
      expect(base.style.top).toBe('550px');
    });

    it('hides the base again on release', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick />);
      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      expect(getByTestId('virtual-joystick-base').style.display).toBe('block');
      firePointer('pointerup', { clientX: 300, clientY: 300 });
      expect(getByTestId('virtual-joystick-base').style.display).toBe('none');
    });

    it('ignores a pointer-down on an interactive control so buttons still work', () => {
      stubViewportRects();
      const onStart = vi.fn();
      const { getByTestId } = render(
        <>
          <button type="button" data-testid="fire">
            Fire
          </button>
          <VirtualJoystick onStart={onStart} />
        </>
      );

      firePointer('pointerdown', { clientX: 300, clientY: 300, target: getByTestId('fire') });
      expect(onStart).not.toHaveBeenCalled();
      expect(getByTestId('virtual-joystick-base').style.display).toBe('none');
    });

    it('ignores a pointer-down outside a scoped host region', () => {
      const onStart = vi.fn();
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 400,
        bottom: 400,
        width: 400,
        height: 400,
        toJSON: () => ({}),
      } as DOMRect);

      render(
        <div data-testid="viewport">
          <VirtualJoystick hostSelector="[data-testid='viewport']" onStart={onStart} />
        </div>
      );

      // Outside the 400x400 host.
      firePointer('pointerdown', { clientX: 900, clientY: 900 });
      expect(onStart).not.toHaveBeenCalled();

      // Inside it.
      firePointer('pointerdown', { clientX: 100, clientY: 100 });
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('deadzone', () => {
    it('suppresses movement inside the deadzone band', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} deadZone={0.3} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      // 10px of a 50px radius = 0.2 throw, inside the 0.3 deadzone.
      firePointer('pointermove', { clientX: 310, clientY: 300 });

      expect(onMove).toHaveBeenLastCalledWith(0, 0);
    });

    it('ramps from zero at the deadzone edge rather than jumping', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} deadZone={0.3} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      // 16px of 50px = 0.32 throw, just past the 0.3 deadzone.
      firePointer('pointermove', { clientX: 316, clientY: 300 });

      const [x] = onMove.mock.lastCall as [number, number];
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(0.1);
    });

    it('still reaches full deflection at maximum travel with a deadzone set', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} deadZone={0.3} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 350, clientY: 300 });

      expect(onMove).toHaveBeenLastCalledWith(expect.closeTo(1, 5), expect.closeTo(0, 5));
    });

    it('defaults to no deadzone so existing consumers are unaffected', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 305, clientY: 300 });

      const [x] = onMove.mock.lastCall as [number, number];
      expect(x).toBeCloseTo(0.1, 5);
    });

    it('keeps the knob under the finger even while the vector is deadzoned', () => {
      stubViewportRects();
      const onMove = vi.fn();
      const { getByTestId } = render(<VirtualJoystick size={100} deadZone={0.5} onMove={onMove} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 310, clientY: 300 });

      expect(onMove).toHaveBeenLastCalledWith(0, 0);
      // Knob offset is size/4 (25) plus the raw 10px follow.
      expect(getByTestId('virtual-joystick-knob').style.left).toBe('35px');
    });
  });

  describe('multi-touch pointer-id tracking', () => {
    it('ignores a second pointer while one is already driving the stick', () => {
      stubViewportRects();
      const onStart = vi.fn();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} onStart={onStart} onMove={onMove} />);

      firePointer('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 });
      expect(onStart).toHaveBeenCalledTimes(1);

      firePointer('pointerdown', { pointerId: 2, clientX: 700, clientY: 700 });
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('ignores moves from a pointer that is not the active one', () => {
      stubViewportRects();
      const onMove = vi.fn();
      render(<VirtualJoystick size={100} onMove={onMove} />);

      firePointer('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 });
      firePointer('pointermove', { pointerId: 1, clientX: 350, clientY: 300 });
      const afterFirst = onMove.mock.calls.length;

      firePointer('pointermove', { pointerId: 2, clientX: 300, clientY: 350 });
      expect(onMove.mock.calls.length).toBe(afterFirst);
      expect(onMove).toHaveBeenLastCalledWith(expect.closeTo(1, 5), expect.closeTo(0, 5));
    });

    it('does not release the stick when a different pointer lifts', () => {
      stubViewportRects();
      const onEnd = vi.fn();
      const { getByTestId } = render(<VirtualJoystick onEnd={onEnd} />);

      firePointer('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 });
      firePointer('pointerup', { pointerId: 2, clientX: 700, clientY: 700 });

      expect(onEnd).not.toHaveBeenCalled();
      expect(getByTestId('virtual-joystick-base').style.display).toBe('block');

      firePointer('pointerup', { pointerId: 1, clientX: 300, clientY: 300 });
      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('releases on pointercancel from the active pointer', () => {
      stubViewportRects();
      const onEnd = vi.fn();
      const onMove = vi.fn();
      render(<VirtualJoystick onEnd={onEnd} onMove={onMove} />);

      firePointer('pointerdown', { pointerId: 3, clientX: 300, clientY: 300 });
      firePointer('pointercancel', { pointerId: 3, clientX: 300, clientY: 300 });

      expect(onEnd).toHaveBeenCalledTimes(1);
      expect(onMove).toHaveBeenLastCalledWith(0, 0);
    });

    it('accepts a new pointer after the previous one released', () => {
      stubViewportRects();
      const onStart = vi.fn();
      render(<VirtualJoystick onStart={onStart} />);

      firePointer('pointerdown', { pointerId: 1, clientX: 300, clientY: 300 });
      firePointer('pointerup', { pointerId: 1, clientX: 300, clientY: 300 });
      firePointer('pointerdown', { pointerId: 2, clientX: 500, clientY: 500 });

      expect(onStart).toHaveBeenCalledTimes(2);
    });
  });

  describe('accent and theming', () => {
    it('themes the knob with the accent color', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick color="white" accent="#38bdf8" />);
      const knob = getByTestId('virtual-joystick-knob');

      // jsdom normalizes hex colors to rgb() when serializing style values.
      expect(knob.style.backgroundImage).toContain('rgb(56, 189, 248)');
      expect(knob.style.boxShadow).toContain('rgba(56, 189, 248, 0.56)');
      // The base ring keeps the plain `color`, so accent themes without restyling it.
      expect(getByTestId('virtual-joystick-base').style.border).toContain('white');
    });

    it('falls back to color when no accent is given', () => {
      stubViewportRects();
      const { getByTestId } = render(<VirtualJoystick color="#ff0044" />);
      expect(getByTestId('virtual-joystick-knob').style.backgroundImage).toContain(
        'rgb(255, 0, 68)'
      );
    });

    it('keeps a named accent color valid in the glow instead of dropping the shadow', () => {
      stubViewportRects();
      // A raw alpha suffix would produce `white8f`, an invalid color that makes
      // the browser discard the entire box-shadow.
      const { getByTestId } = render(<VirtualJoystick accent="white" />);
      const shadow = getByTestId('virtual-joystick-knob').style.boxShadow;
      expect(shadow).toContain('white');
      expect(shadow).not.toContain('white8f');
    });

    it('lets baseStyle override the accent glow', () => {
      stubViewportRects();
      const { getByTestId } = render(
        <VirtualJoystick accent="#38bdf8" baseStyle={{ boxShadow: 'none' }} />
      );
      expect(getByTestId('virtual-joystick-base').style.boxShadow).toBe('none');
    });

    it('uses the label for the accessible name and the base title', () => {
      const { getByTestId } = render(<VirtualJoystick label="Movement joystick" />);
      expect(getByTestId('virtual-joystick-area').getAttribute('aria-label')).toBe(
        'Movement joystick'
      );
      expect(getByTestId('virtual-joystick-base').getAttribute('title')).toBe('Movement joystick');
    });
  });

  describe('disabled and mouse gating', () => {
    it('ignores input and emits a neutral vector when disabled', () => {
      stubViewportRects();
      const onMove = vi.fn();
      const onStart = vi.fn();
      render(<VirtualJoystick disabled onMove={onMove} onStart={onStart} />);

      expect(onMove).toHaveBeenCalledWith(0, 0);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      expect(onStart).not.toHaveBeenCalled();
    });

    it('resets to neutral when disabled mid-drag rather than latching a direction', () => {
      stubViewportRects();
      const onMove = vi.fn();
      const { rerender, getByTestId } = render(
        <VirtualJoystick size={100} onMove={onMove} disabled={false} />
      );

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 350, clientY: 300 });
      expect(onMove).toHaveBeenLastCalledWith(expect.closeTo(1, 5), expect.closeTo(0, 5));

      act(() => {
        rerender(<VirtualJoystick size={100} onMove={onMove} disabled={true} />);
      });

      expect(onMove).toHaveBeenLastCalledWith(0, 0);
      expect(getByTestId('virtual-joystick-base').style.display).toBe('none');
    });

    it('accepts mouse pointers by default', () => {
      stubViewportRects();
      const onStart = vi.fn();
      render(<VirtualJoystick onStart={onStart} />);

      firePointer('pointerdown', { pointerType: 'mouse', clientX: 300, clientY: 300 });
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('rejects mouse pointers when allowMouse is false but still accepts touch', () => {
      stubViewportRects();
      const onStart = vi.fn();
      render(<VirtualJoystick allowMouse={false} onStart={onStart} />);

      firePointer('pointerdown', { pointerType: 'mouse', clientX: 300, clientY: 300 });
      expect(onStart).not.toHaveBeenCalled();

      firePointer('pointerdown', { pointerType: 'touch', clientX: 300, clientY: 300 });
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('onChange vector payload', () => {
    it('reports magnitude and angle alongside the axes', () => {
      stubViewportRects();
      const onChange = vi.fn();
      render(<VirtualJoystick size={100} onChange={onChange} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointermove', { clientX: 300, clientY: 325 });

      const vector = onChange.mock.lastCall?.[0];
      expect(vector.magnitude).toBeCloseTo(0.5, 5);
      expect(vector.angle).toBeCloseTo(Math.PI / 2, 5);
    });

    it('emits a zero vector on release', () => {
      stubViewportRects();
      const onChange = vi.fn();
      render(<VirtualJoystick onChange={onChange} />);

      firePointer('pointerdown', { clientX: 300, clientY: 300 });
      firePointer('pointerup', { clientX: 300, clientY: 300 });

      expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 0, magnitude: 0, angle: 0 });
    });
  });

  it('removes its window listeners on unmount', () => {
    stubViewportRects();
    const onStart = vi.fn();
    const { unmount } = render(<VirtualJoystick onStart={onStart} />);

    unmount();
    firePointer('pointerdown', { clientX: 300, clientY: 300 });

    expect(onStart).not.toHaveBeenCalled();
  });
});
