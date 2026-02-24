import type React from 'react';
import type { CrosshairProps } from './types';

/**
 * Customizable Gameplay Crosshair.
 *
 * Renders a dynamic or static reticle at the center of the screen. Supports
 * various styles (cross, dot, circle), spread scaling for recoil, and
 * high-visibility outlines.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <Crosshair
 *   type="cross"
 *   dynamic
 *   spread={currentRecoil}
 *   color="green"
 * />
 * ```
 */
export const Crosshair: React.FC<CrosshairProps> = ({
  type = 'cross',
  size = 20,
  thickness = 2,
  gap = 4,
  color = '#ffffff',
  outlineColor = '#000000',
  outlineWidth = 1,
  opacity = 0.8,
  dot = true,
  dotSize = 2,
  dynamic = false,
  spreadMultiplier = 1,
  spread = 0,
  className,
  style,
}) => {
  const currentGap = dynamic ? gap + spread * spreadMultiplier : gap;
  const halfSize = size / 2;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 1000,
    opacity,
    ...style,
  };

  const lineStyle = (rotation: number): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: halfSize - currentGap,
    height: thickness,
    backgroundColor: color,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) translateX(${currentGap + (halfSize - currentGap) / 2}px)`,
    boxShadow: outlineWidth > 0 ? `0 0 0 ${outlineWidth}px ${outlineColor}` : undefined,
  });

  if (type === 'dot') {
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: '50%',
            boxShadow: `0 0 0 ${outlineWidth}px ${outlineColor}`,
          }}
        />
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            width: size,
            height: size,
            border: `${thickness}px solid ${color}`,
            borderRadius: '50%',
            boxShadow: `0 0 0 ${outlineWidth}px ${outlineColor}`,
          }}
        />
        {dot && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={lineStyle(0)} />
      <div style={lineStyle(90)} />
      <div style={lineStyle(180)} />
      <div style={lineStyle(270)} />
      {dot && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 0 ${outlineWidth}px ${outlineColor}`,
          }}
        />
      )}
    </div>
  );
};
