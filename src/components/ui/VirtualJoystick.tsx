import type React from 'react';
import { useCallback, useRef, useState } from 'react';

export interface VirtualJoystickProps {
    /** Called when the joystick moves. Values are normalized between -1 and 1. */
    onMove?: (x: number, y: number) => void;
    /** Called when the joystick starts being used. */
    onStart?: () => void;
    /** Called when the joystick is released. */
    onEnd?: () => void;
    /** Size of the joystick base in pixels. Default: 100. */
    size?: number;
    /** Color of the joystick base and knob. Default: 'white'. */
    color?: string;
    /** Opacity of the joystick when not in use. Default: 0.5. */
    opacity?: number;
    /** CSS class for the touch container. */
    className?: string;
    /** CSS styles for the touch container (full-screen touch area). */
    containerStyle?: React.CSSProperties;
    /** CSS styles for the joystick base (circular control). */
    baseStyle?: React.CSSProperties;
    /** @deprecated Use containerStyle instead. */
    style?: React.CSSProperties;
}

/**
 * A generalized Virtual Joystick component for mobile and touch devices.
 *
 * @category UI
 */
export function VirtualJoystick({
    onMove,
    onStart,
    onEnd,
    size = 100,
    color = 'white',
    opacity = 0.5,
    className,
    containerStyle,
    baseStyle,
    style,
}: VirtualJoystickProps) {
    // Handle deprecated style prop
    const effectiveContainerStyle = containerStyle ?? style;
    const [isActive, setIsActive] = useState(false);
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleStart = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            setOrigin({ x: clientX, y: clientY });
            setKnobPos({ x: 0, y: 0 });
            setIsActive(true);
            onStart?.();
        },
        [onStart]
    );

    const handleMove = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            if (!isActive) return;

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const dx = clientX - origin.x;
            const dy = clientY - origin.y;

            const maxDist = size / 2;
            const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
            const angle = Math.atan2(dy, dx);

            const normalizedX = (Math.cos(angle) * dist) / maxDist;
            const normalizedY = (Math.sin(angle) * dist) / maxDist;

            setKnobPos({ x: normalizedX * maxDist, y: normalizedY * maxDist });
            onMove?.(normalizedX, normalizedY);
        },
        [isActive, origin, size, onMove]
    );

    const handleEnd = useCallback(() => {
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove?.(0, 0);
        onEnd?.();
    }, [onMove, onEnd]);

    const joystickBaseStyle: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        position: 'fixed',
        left: origin.x - size / 2,
        top: origin.y - size / 2,
        opacity: isActive ? 1 : opacity,
        pointerEvents: 'none',
        display: isActive ? 'block' : 'none',
        zIndex: 1000,
        ...baseStyle,
    };

    const knobStyle: React.CSSProperties = {
        width: size / 2,
        height: size / 2,
        borderRadius: '50%',
        backgroundColor: color,
        position: 'absolute',
        left: size / 4 + knobPos.x,
        top: size / 4 + knobPos.y,
        pointerEvents: 'none',
    };

    return (
        <>
            <div
                ref={containerRef}
                className={className}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 999,
                    touchAction: 'none',
                    ...effectiveContainerStyle,
                }}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                role="application"
                aria-label="Virtual joystick control"
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
            />
            <div style={joystickBaseStyle}>
                <div style={knobStyle} />
            </div>
        </>
    );
}
