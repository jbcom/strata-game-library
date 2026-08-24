import { type JoystickVector, normalizeJoystick } from '@strata-game-library/core';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export type { JoystickVector };

export interface VirtualJoystickProps {
  /**
   * Called when the joystick moves. Values are normalized between -1 and 1,
   * and are deadzone-adjusted when {@link VirtualJoystickProps.deadZone} is set.
   */
  onMove?: (x: number, y: number) => void;
  /**
   * Called on every joystick update with the full vector — normalized axes plus
   * `magnitude` and `angle`. Fires alongside `onMove`; use it when direction and
   * throw need to be read independently (e.g. run/walk thresholds).
   */
  onChange?: (vector: JoystickVector) => void;
  /** Called when the joystick starts being used. */
  onStart?: () => void;
  /** Called when the joystick is released. */
  onEnd?: () => void;
  /** Size of the joystick base in pixels. Default: 100. */
  size?: number;
  /** Color of the joystick base and knob. Default: 'white'. */
  color?: string;
  /**
   * Accent color used for the knob gradient and glow. Defaults to
   * {@link VirtualJoystickProps.color}, so the plain `color` API is unchanged.
   * Set it explicitly to theme the stick without restyling the base ring.
   */
  accent?: string;
  /** Opacity of the joystick when not in use. Default: 0.5. */
  opacity?: number;
  /**
   * Fraction of the travel radius (0..1) treated as no input. Movement inside
   * the band reports zero; beyond it, magnitude is rescaled to still span a
   * full 0..1 so the stick ramps up rather than snapping. Default: 0 (off).
   */
  deadZone?: number;
  /**
   * When true the joystick ignores all input, resets to neutral, and emits a
   * zero vector once so consumers do not latch a stale direction. Default: false.
   */
  disabled?: boolean;
  /**
   * Allow mouse pointers to drive the joystick. Default: true, matching the
   * previous mouse-and-touch behavior. Set false for touch-only controls.
   */
  allowMouse?: boolean;
  /**
   * CSS selector for the element the joystick's touch-anywhere region is scoped
   * to. Pointer-downs outside that element are ignored, letting the joystick sit
   * inside a game viewport rather than owning the whole window. Defaults to the
   * component's own full-screen container.
   */
  hostSelector?: string;
  /** Accessible label for the control. Default: 'Virtual joystick control'. */
  label?: string;
  /** CSS class for the touch container. */
  className?: string;
  /** CSS styles for the touch container (full-screen touch area). */
  containerStyle?: React.CSSProperties;
  /** CSS styles for the joystick base (circular control). */
  baseStyle?: React.CSSProperties;
  /** @deprecated Use containerStyle instead. */
  style?: React.CSSProperties;
}

interface JoystickVisualState {
  active: boolean;
  originX: number;
  originY: number;
  knobX: number;
  knobY: number;
}

const NEUTRAL: JoystickVisualState = {
  active: false,
  originX: 0,
  originY: 0,
  knobX: 0,
  knobY: 0,
};

const NEUTRAL_VECTOR: JoystickVector = { x: 0, y: 0, magnitude: 0, angle: 0 };

/**
 * Elements that should swallow a pointer-down rather than spawning a joystick.
 * Without this, a touch-anywhere origin makes every on-screen button unusable.
 */
const INTERACTIVE_SELECTOR =
  "button,a,input,textarea,select,summary,[role='button'],[data-joystick-ignore]";

/**
 * Build a translucent glow from an accent color.
 *
 * Appending an alpha suffix to the raw value only works for 6-digit hex —
 * `white8f` or `rgb(...)8f` is an invalid color and the browser drops the whole
 * shadow silently. So expand hex to rgba() and fall back to the untouched value
 * for named/functional colors, which still glow, just opaquely.
 */
function glow(accent: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(accent.trim());
  if (!hex) return accent;
  const int = Number.parseInt(hex[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A floating virtual joystick for mobile and touch devices.
 *
 * The stick has no fixed home: it materializes wherever the pointer first lands
 * inside its host region and follows that pointer until release. It tracks a
 * single `pointerId`, so a second finger — firing a weapon, hitting a HUD
 * button — never steals or perturbs an in-progress drag.
 *
 * @category UI
 */
export function VirtualJoystick({
  onMove,
  onChange,
  onStart,
  onEnd,
  size = 100,
  color = 'white',
  accent,
  opacity = 0.5,
  deadZone = 0,
  disabled = false,
  allowMouse = true,
  hostSelector,
  label = 'Virtual joystick control',
  className,
  containerStyle,
  baseStyle,
  style,
}: VirtualJoystickProps) {
  // Handle deprecated style prop
  const effectiveContainerStyle = containerStyle ?? style;
  const effectiveAccent = accent ?? color;
  const radius = size / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [visual, setVisual] = useState<JoystickVisualState>(NEUTRAL);

  // Callbacks are read through refs so that re-rendering with a new inline
  // handler does not tear down and re-arm the window listeners mid-drag.
  const handlers = useRef({ onMove, onChange, onStart, onEnd });
  useEffect(() => {
    handlers.current = { onMove, onChange, onStart, onEnd };
  }, [onMove, onChange, onStart, onEnd]);

  useEffect(() => {
    if (disabled) {
      activePointer.current = null;
      setVisual(NEUTRAL);
      handlers.current.onMove?.(0, 0);
      handlers.current.onChange?.(NEUTRAL_VECTOR);
      return undefined;
    }

    const readHost = (): HTMLElement | null => {
      const self = containerRef.current;
      if (!self) return null;
      if (!hostSelector) return self;
      return self.closest<HTMLElement>(hostSelector) ?? self;
    };

    const isInsideHost = (event: PointerEvent) => {
      const host = readHost();
      if (!host) return false;
      const target = event.target;
      // The full-screen container sits above the host, so a pointer landing on
      // it is inside by geometry even though it is not a DOM descendant.
      if (target instanceof Node && host.contains(target)) return true;
      const rect = host.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest(INTERACTIVE_SELECTOR));
    };

    const emit = (vector: JoystickVector) => {
      handlers.current.onMove?.(vector.x, vector.y);
      handlers.current.onChange?.(vector);
    };

    const updateVector = (event: PointerEvent) => {
      const rawDx = event.clientX - origin.current.x;
      const rawDy = event.clientY - origin.current.y;
      const vector = normalizeJoystick({ x: rawDx, y: rawDy }, radius, deadZone);

      // The knob tracks the raw pointer so it stays under the finger, while the
      // emitted vector is deadzone-adjusted. Decoupling them keeps the deadzone
      // from making the visual feel stuck.
      const distance = Math.hypot(rawDx, rawDy);
      const clamped = Math.min(radius, distance);
      const unitX = distance > 0 ? rawDx / distance : 0;
      const unitY = distance > 0 ? rawDy / distance : 0;

      setVisual({
        active: true,
        originX: origin.current.x,
        originY: origin.current.y,
        knobX: unitX * clamped,
        knobY: unitY * clamped,
      });
      emit(vector);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (activePointer.current !== null) return;
      if (event.pointerType === 'mouse' && !allowMouse) return;
      if (!isInsideHost(event)) return;
      if (isInteractiveTarget(event.target)) return;
      if (event.cancelable) event.preventDefault();

      activePointer.current = event.pointerId;
      origin.current = { x: event.clientX, y: event.clientY };
      handlers.current.onStart?.();
      updateVector(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointer.current !== event.pointerId) return;
      if (event.cancelable) event.preventDefault();
      updateVector(event);
    };

    const endPointer = (event: PointerEvent) => {
      if (activePointer.current !== event.pointerId) return;
      activePointer.current = null;
      setVisual(NEUTRAL);
      emit(NEUTRAL_VECTOR);
      handlers.current.onEnd?.();
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endPointer);
      window.removeEventListener('pointercancel', endPointer);
      activePointer.current = null;
    };
  }, [allowMouse, deadZone, disabled, hostSelector, radius]);

  const joystickBaseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `2px solid ${color}`,
    position: 'fixed',
    left: visual.originX - radius,
    top: visual.originY - radius,
    opacity: visual.active ? 1 : opacity,
    pointerEvents: 'none',
    display: visual.active ? 'block' : 'none',
    boxShadow: `0 0 22px ${glow(effectiveAccent, 0.24)}, inset 0 0 24px rgba(255, 255, 255, 0.08)`,
    zIndex: 1000,
    ...baseStyle,
  };

  const knobStyle: React.CSSProperties = {
    width: radius,
    height: radius,
    borderRadius: '50%',
    backgroundColor: effectiveAccent,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.92), ${effectiveAccent})`,
    boxShadow: `0 8px 18px rgba(0, 0, 0, 0.35), 0 0 18px ${glow(effectiveAccent, 0.56)}`,
    position: 'absolute',
    left: size / 4 + visual.knobX,
    top: size / 4 + visual.knobY,
    pointerEvents: 'none',
  };

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        data-testid="virtual-joystick-area"
        data-joystick-active={visual.active ? 'true' : 'false'}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 999,
          touchAction: 'none',
          pointerEvents: 'none',
          ...effectiveContainerStyle,
        }}
        role="application"
        aria-label={label}
      />
      <div data-testid="virtual-joystick-base" title={label} style={joystickBaseStyle}>
        <div data-testid="virtual-joystick-knob" style={knobStyle} />
      </div>
    </>
  );
}
