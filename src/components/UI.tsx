/**
 * UI React Components
 *
 * Provides React components for game UI elements using @react-three/drei's Html component.
 * @module components/UI
 */

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import {
    type CSSProperties,
    forwardRef,
    type ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import type * as THREE from 'three';
import {
    type CrosshairConfig,
    calculateFade,
    clampProgress,
    type DamageNumberConfig,
    type DialogConfig,
    easeOutCubic,
    formatNumber,
    formatProgressText,
    getDamageNumberColor,
    getNotificationColor,
    getNotificationIcon,
    getTextDirection,
    type InventoryConfig,
    type InventorySlot,
    lerp,
    type MinimapConfig,
    type NameplateConfig,
    type NotificationConfig,
    type ProgressBarConfig,
    type TooltipConfig,
    type UIAnchor,
} from '../core/ui';

export interface HealthBarProps extends Partial<ProgressBarConfig> {
    position?: [number, number, number];
    offset?: [number, number];
    occlude?: boolean;
    distanceFade?: { start: number; end: number };
    className?: string;
    style?: CSSProperties;
}

export interface HealthBarRef {
    setValue: (value: number) => void;
    setMaxValue: (maxValue: number) => void;
    flash: () => void;
}

export const HealthBar = forwardRef<HealthBarRef, HealthBarProps>(
    (
        {
            value = 100,
            maxValue = 100,
            width = 100,
            height = 10,
            backgroundColor = 'rgba(0, 0, 0, 0.7)',
            fillColor = '#4ade80',
            borderColor = 'rgba(255, 255, 255, 0.3)',
            borderWidth = 1,
            borderRadius = 2,
            showText = false,
            textFormat = 'percentage',
            animationDuration = 300,
            segments,
            glowColor,
            glowIntensity = 0.5,
            position = [0, 0, 0],
            offset = [0, 0],
            occlude = true,
            distanceFade,
            className,
            style,
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState(value);
        const [isFlashing, setIsFlashing] = useState(false);
        const animationRef = useRef<number>(undefined);
        const startValueRef = useRef(value);
        const startTimeRef = useRef(0);
        const { camera } = useThree();
        const groupRef = useRef<THREE.Group>(null);
        const [opacity, setOpacity] = useState(1);

        useEffect(() => {
            startValueRef.current = displayValue;
            startTimeRef.current = performance.now();

            const animate = () => {
                const elapsed = performance.now() - startTimeRef.current;
                const progress = Math.min(elapsed / animationDuration, 1);
                const eased = easeOutCubic(progress);
                const newValue = lerp(startValueRef.current, value, eased);
                setDisplayValue(newValue);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }, [value, animationDuration, displayValue]);

        useFrame(() => {
            if (distanceFade && groupRef.current) {
                const distance = groupRef.current.position.distanceTo(camera.position);
                const fade = calculateFade(distance, distanceFade.start, distanceFade.end);
                setOpacity(fade);
            }
        });

        useImperativeHandle(ref, () => ({
            setValue: (newValue: number) => setDisplayValue(newValue),
            setMaxValue: () => {},
            flash: () => {
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 200);
            },
        }));

        const percentage = (clampProgress(displayValue, maxValue) / maxValue) * 100;
        const text = formatProgressText(displayValue, maxValue, textFormat);

        const containerStyle: CSSProperties = {
            width,
            height,
            backgroundColor,
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius,
            position: 'relative',
            overflow: 'hidden',
            opacity,
            transition: isFlashing ? 'none' : undefined,
            filter: isFlashing ? 'brightness(1.5)' : undefined,
            boxShadow: glowColor ? `0 0 ${glowIntensity * 20}px ${glowColor}` : undefined,
            ...style,
        };

        const fillStyle: CSSProperties = {
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: fillColor,
            transition: `width ${animationDuration}ms ease-out`,
            position: 'absolute',
            left: 0,
            top: 0,
        };

        const textStyle: CSSProperties = {
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            fontSize: Math.min(height - 2, 12),
            lineHeight: `${height}px`,
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            fontWeight: 'bold',
            zIndex: 1,
        };

        return (
            <group ref={groupRef} position={position}>
                <Html
                    center
                    occlude={occlude}
                    style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }}
                    className={className}
                >
                    <div style={containerStyle}>
                        {segments ? (
                            <div style={{ display: 'flex', height: '100%', gap: 1 }}>
                                {Array.from({ length: segments }).map((_, i) => {
                                    const segmentPercentage = ((i + 1) / segments) * 100;
                                    const isFilled = percentage >= segmentPercentage;
                                    const isPartial =
                                        percentage > (i / segments) * 100 && !isFilled;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                backgroundColor: isFilled
                                                    ? fillColor
                                                    : isPartial
                                                      ? `${fillColor}80`
                                                      : 'transparent',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={fillStyle} />
                        )}
                        {showText && <span style={textStyle}>{text}</span>}
                    </div>
                </Html>
            </group>
        );
    }
);

HealthBar.displayName = 'HealthBar';

export interface NameplateProps extends Partial<NameplateConfig> {
    position?: [number, number, number];
    offset?: [number, number];
    occlude?: boolean;
    className?: string;
    style?: CSSProperties;
}

export interface NameplateRef {
    setName: (name: string) => void;
    setHealth: (value: number, maxValue: number) => void;
}

export const Nameplate = forwardRef<NameplateRef, NameplateProps>(
    (
        {
            name = 'Unknown',
            title,
            level,
            healthBar,
            guild,
            nameColor = '#ffffff',
            titleColor = '#a8a29e',
            backgroundColor = 'rgba(0, 0, 0, 0.5)',
            showHealthBar = true,
            showLevel = true,
            fadeStart = 15,
            fadeEnd = 25,
            position = [0, 0, 0],
            offset = [0, 0],
            occlude = true,
            className,
            style,
        },
        ref
    ) => {
        const { camera } = useThree();
        const groupRef = useRef<THREE.Group>(null);
        const [opacity, setOpacity] = useState(1);
        const [currentName, setCurrentName] = useState(name);
        const [health, setHealth] = useState({
            value: healthBar?.value ?? 100,
            maxValue: healthBar?.maxValue ?? 100,
        });

        useFrame(() => {
            if (groupRef.current) {
                const distance = groupRef.current.position.distanceTo(camera.position);
                const fade = calculateFade(distance, fadeStart, fadeEnd);
                setOpacity(fade);
            }
        });

        useImperativeHandle(ref, () => ({
            setName: (newName: string) => setCurrentName(newName),
            setHealth: (value: number, maxValue: number) => setHealth({ value, maxValue }),
        }));

        const containerStyle: CSSProperties = {
            padding: '4px 8px',
            backgroundColor,
            borderRadius: 4,
            opacity,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            ...style,
        };

        const percentage = (health.value / health.maxValue) * 100;

        return (
            <group ref={groupRef} position={position}>
                <Html
                    center
                    occlude={occlude}
                    style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }}
                    className={className}
                >
                    <div style={containerStyle}>
                        {showLevel && level !== undefined && (
                            <span style={{ color: '#fbbf24', marginRight: 4, fontSize: 12 }}>
                                Lv.{level}
                            </span>
                        )}
                        <span style={{ color: nameColor, fontWeight: 'bold', fontSize: 14 }}>
                            {currentName}
                        </span>
                        {title && <div style={{ color: titleColor, fontSize: 11 }}>{title}</div>}
                        {guild && (
                            <div style={{ color: '#60a5fa', fontSize: 11 }}>&lt;{guild}&gt;</div>
                        )}
                        {showHealthBar && (
                            <div
                                style={{
                                    marginTop: 4,
                                    height: 6,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        backgroundColor:
                                            percentage > 50
                                                ? '#4ade80'
                                                : percentage > 25
                                                  ? '#fbbf24'
                                                  : '#ef4444',
                                        transition: 'width 0.3s ease-out',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </Html>
            </group>
        );
    }
);

Nameplate.displayName = 'Nameplate';

export interface DamageNumberProps extends Partial<DamageNumberConfig> {
    position: [number, number, number];
    onComplete?: () => void;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
    value = 0,
    type = 'normal',
    color,
    fontSize = 24,
    fontFamily = 'Impact, sans-serif',
    fontWeight = 'bold',
    duration = 1500,
    floatDistance = 60,
    fadeStart = 0.5,
    scale = 1,
    randomOffset = 20,
    position,
    onComplete,
}) => {
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef(performance.now());
    const offsetRef = useRef({
        x: (Math.random() - 0.5) * randomOffset,
        y: 0,
    });

    useFrame(() => {
        const elapsed = performance.now() - startTimeRef.current;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);

        if (newProgress >= 1 && onComplete) {
            onComplete();
        }
    });

    const displayColor = color || getDamageNumberColor(type);
    const y = offsetRef.current.y - easeOutCubic(progress) * floatDistance;
    const opacity = progress > fadeStart ? 1 - (progress - fadeStart) / (1 - fadeStart) : 1;
    const currentScale = type === 'critical' ? scale * (1 + (1 - progress) * 0.5) : scale;

    const textStyle: CSSProperties = {
        color: displayColor,
        fontSize: fontSize * currentScale,
        fontFamily,
        fontWeight,
        textShadow: `
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            2px 2px 0 #000,
            0 0 10px ${displayColor}
        `,
        opacity,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
    };

    return (
        <group position={position}>
            <Html
                center
                style={{
                    transform: `translate(${offsetRef.current.x}px, ${y}px)`,
                }}
            >
                <div style={textStyle}>
                    {type === 'miss'
                        ? 'MISS'
                        : type === 'block'
                          ? 'BLOCKED'
                          : formatNumber(Math.abs(value))}
                    {type === 'critical' && '!'}
                    {type === 'heal' && ' +'}
                </div>
            </Html>
        </group>
    );
};

export interface ProgressBar3DProps {
    value: number;
    maxValue: number;
    width?: number;
    height?: number;
    depth?: number;
    fillColor?: string;
    backgroundColor?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    billboard?: boolean;
}

export const ProgressBar3D: React.FC<ProgressBar3DProps> = ({
    value,
    maxValue,
    width = 1,
    height = 0.1,
    depth = 0.05,
    fillColor = '#4ade80',
    backgroundColor = '#1f2937',
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    billboard = false,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (billboard && groupRef.current) {
            groupRef.current.quaternion.copy(camera.quaternion);
        }
    });

    const percentage = clampProgress(value, maxValue) / maxValue;
    const fillWidth = width * percentage;

    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[width, height, depth]} />
                <meshBasicMaterial color={backgroundColor} />
            </mesh>
            <mesh position={[-(width - fillWidth) / 2, 0, depth / 2 + 0.001]}>
                <boxGeometry args={[fillWidth, height, 0.001]} />
                <meshBasicMaterial color={fillColor} />
            </mesh>
        </group>
    );
};

export interface InventoryProps extends Partial<InventoryConfig> {
    onSlotClick?: (slot: InventorySlot, index: number) => void;
    onSlotDrop?: (fromIndex: number, toIndex: number) => void;
    onSlotHover?: (slot: InventorySlot | null, index: number) => void;
    selectedIndex?: number;
    visible?: boolean;
    anchor?: UIAnchor;
    className?: string;
    style?: CSSProperties;
}

export interface InventoryRef {
    selectSlot: (index: number) => void;
    setSlots: (slots: InventorySlot[]) => void;
}

export const Inventory = forwardRef<InventoryRef, InventoryProps>(
    (
        {
            slots = [],
            columns = 6,
            rows = 4,
            slotSize = 48,
            slotGap = 4,
            backgroundColor = 'rgba(0, 0, 0, 0.8)',
            slotBackgroundColor = 'rgba(50, 50, 50, 0.8)',
            slotBorderColor = 'rgba(100, 100, 100, 0.5)',
            selectedSlotBorderColor = '#d4af37',
            showTooltips = true,
            showQuantity = true,
            rarityColors = {
                common: '#9ca3af',
                uncommon: '#22c55e',
                rare: '#3b82f6',
                epic: '#a855f7',
                legendary: '#f59e0b',
            },
            onSlotClick,
            onSlotDrop,
            onSlotHover,
            selectedIndex,
            visible = true,
            anchor = 'center',
            className,
            style,
        },
        ref
    ) => {
        const [currentSlots, setCurrentSlots] = useState(slots);
        const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
        const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

        useEffect(() => {
            setCurrentSlots(slots);
        }, [slots]);

        useImperativeHandle(ref, () => ({
            selectSlot: (index: number) => onSlotClick?.(currentSlots[index], index),
            setSlots: (newSlots: InventorySlot[]) => setCurrentSlots(newSlots),
        }));

        if (!visible) return null;

        const containerWidth = columns * slotSize + (columns - 1) * slotGap + 20;
        const _containerHeight = rows * slotSize + (rows - 1) * slotGap + 20;

        const containerStyle: CSSProperties = {
            position: 'fixed',
            width: containerWidth,
            padding: 10,
            backgroundColor,
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${slotSize}px)`,
            gap: slotGap,
            zIndex: 1000,
            ...style,
        };

        return (
            <div style={containerStyle} className={className}>
                {currentSlots.slice(0, columns * rows).map((slot, index) => {
                    const isSelected = index === selectedIndex;
                    const isHovered = index === hoveredIndex;
                    const isDragged = index === draggedIndex;
                    const rarityColor = slot.rarity ? rarityColors[slot.rarity] : undefined;

                    return (
                        <div
                            key={slot.id}
                            style={{
                                width: slotSize,
                                height: slotSize,
                                backgroundColor: slotBackgroundColor,
                                border: `2px solid ${isSelected ? selectedSlotBorderColor : rarityColor || slotBorderColor}`,
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                cursor: slot.locked ? 'not-allowed' : 'pointer',
                                opacity: slot.locked ? 0.5 : isDragged ? 0.5 : 1,
                                transform: isHovered && !slot.locked ? 'scale(1.05)' : undefined,
                                transition: 'transform 0.1s, border-color 0.1s',
                                boxShadow: slot.highlighted
                                    ? `0 0 10px ${selectedSlotBorderColor}`
                                    : undefined,
                            }}
                            onClick={() => !slot.locked && onSlotClick?.(slot, index)}
                            onMouseEnter={() => {
                                setHoveredIndex(index);
                                onSlotHover?.(slot, index);
                            }}
                            onMouseLeave={() => {
                                setHoveredIndex(null);
                                onSlotHover?.(null, index);
                            }}
                            draggable={!slot.locked}
                            onDragStart={() => setDraggedIndex(index)}
                            onDragEnd={() => setDraggedIndex(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                                if (draggedIndex !== null && draggedIndex !== index) {
                                    onSlotDrop?.(draggedIndex, index);
                                }
                            }}
                        >
                            {slot.itemIcon && (
                                <img
                                    src={slot.itemIcon}
                                    alt={slot.itemName}
                                    style={{
                                        maxWidth: '80%',
                                        maxHeight: '80%',
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}
                            {showQuantity && slot.quantity !== undefined && slot.quantity > 1 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: 2,
                                        right: 4,
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        color: '#ffffff',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                    }}
                                >
                                    {slot.quantity}
                                </span>
                            )}
                            {slot.locked && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        fontSize: 18,
                                        color: '#9ca3af',
                                    }}
                                >
                                    🔒
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
);

Inventory.displayName = 'Inventory';

export interface TooltipProps extends Partial<TooltipConfig> {
    x?: number;
    y?: number;
    visible?: boolean;
    children?: ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    title,
    description,
    stats,
    rarity,
    rarityColor,
    backgroundColor = 'rgba(20, 20, 20, 0.95)',
    borderColor = 'rgba(100, 100, 100, 0.5)',
    textColor = '#ffffff',
    maxWidth = 250,
    fontSize = 14,
    padding = 12,
    x = 0,
    y = 0,
    visible = true,
    children,
    className,
}) => {
    if (!visible) return null;

    const containerStyle: CSSProperties = {
        position: 'fixed',
        left: x,
        top: y,
        maxWidth,
        padding,
        backgroundColor,
        border: `1px solid ${rarityColor || borderColor}`,
        borderRadius: 6,
        color: textColor,
        fontSize,
        zIndex: 2000,
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    };

    return (
        <div style={containerStyle} className={className}>
            {rarity && (
                <div
                    style={{
                        color: rarityColor,
                        fontSize: 11,
                        marginBottom: 2,
                        textTransform: 'uppercase',
                    }}
                >
                    {rarity}
                </div>
            )}
            {title && (
                <div
                    style={{ fontWeight: 'bold', marginBottom: 4, color: rarityColor || textColor }}
                >
                    {title}
                </div>
            )}
            {description && (
                <div style={{ color: '#a8a29e', marginBottom: stats?.length ? 8 : 0 }}>
                    {description}
                </div>
            )}
            {stats && stats.length > 0 && (
                <div>
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}
                        >
                            <span style={{ color: '#9ca3af' }}>{stat.label}</span>
                            <span style={{ color: stat.color || '#4ade80' }}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}
            {children}
        </div>
    );
};

export interface DialogBoxProps extends Partial<DialogConfig> {
    onLineComplete?: (lineIndex: number) => void;
    onDialogComplete?: () => void;
    onChoiceSelect?: (choiceId: string, lineIndex: number) => void;
    visible?: boolean;
    className?: string;
    style?: CSSProperties;
}

export interface DialogBoxRef {
    advance: () => void;
    skip: () => void;
    reset: () => void;
    setLine: (index: number) => void;
}

export const DialogBox = forwardRef<DialogBoxRef, DialogBoxProps>(
    (
        {
            lines = [],
            currentLine = 0,
            typewriterSpeed = 30,
            textColor = '#ffffff',
            backgroundColor = 'rgba(0, 0, 0, 0.85)',
            speakerColor = '#d4af37',
            fontSize = 16,
            fontFamily = 'system-ui, -apple-system, sans-serif',
            textDirection = 'auto',
            showSpeakerImage = true,
            imagePosition = 'left',
            continueIndicator = '▼',
            skipEnabled = true,
            padding = 20,
            maxWidth = 600,
            onLineComplete,
            onDialogComplete,
            onChoiceSelect,
            visible = true,
            className,
            style,
        },
        ref
    ) => {
        const [lineIndex, setLineIndex] = useState(currentLine);
        const [displayedText, setDisplayedText] = useState('');
        const [isTyping, setIsTyping] = useState(false);
        const [showContinue, setShowContinue] = useState(false);
        const typewriterRef = useRef<NodeJS.Timeout>(undefined);

        const line = lines[lineIndex];

        useEffect(() => {
            setLineIndex(currentLine);
        }, [currentLine]);

        const advance = useCallback(() => {
            if (isTyping && skipEnabled) {
                if (typewriterRef.current) clearInterval(typewriterRef.current);
                setDisplayedText(line?.text || '');
                setIsTyping(false);
                setShowContinue(!line?.choices?.length);
                return;
            }

            if (lineIndex < lines.length - 1) {
                setLineIndex(lineIndex + 1);
            } else {
                onDialogComplete?.();
            }
        }, [isTyping, skipEnabled, line, lineIndex, lines.length, onDialogComplete]);

        useEffect(() => {
            if (!line || !visible) return;

            setDisplayedText('');
            setIsTyping(true);
            setShowContinue(false);

            let charIndex = 0;
            const text = line.text;

            typewriterRef.current = setInterval(() => {
                if (charIndex < text.length) {
                    setDisplayedText(text.slice(0, charIndex + 1));
                    charIndex++;
                } else {
                    clearInterval(typewriterRef.current);
                    setIsTyping(false);
                    setShowContinue(!line.choices?.length);
                    onLineComplete?.(lineIndex);

                    if (line.autoAdvance) {
                        setTimeout(() => advance(), line.autoAdvanceDelay || 2000);
                    }
                }
            }, 1000 / typewriterSpeed);

            return () => {
                if (typewriterRef.current) clearInterval(typewriterRef.current);
            };
        }, [line, lineIndex, typewriterSpeed, visible, advance, onLineComplete]);

        useImperativeHandle(ref, () => ({
            advance,
            skip: () => {
                if (typewriterRef.current) clearInterval(typewriterRef.current);
                setDisplayedText(line?.text || '');
                setIsTyping(false);
            },
            reset: () => {
                setLineIndex(0);
                setDisplayedText('');
            },
            setLine: (index: number) => setLineIndex(index),
        }));

        if (!visible || !line) return null;

        const detectedDirection =
            textDirection === 'auto' ? getTextDirection(line.text) : textDirection;

        const containerStyle: CSSProperties = {
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth,
            width: '90%',
            padding,
            backgroundColor,
            borderRadius: 8,
            fontFamily,
            fontSize,
            color: textColor,
            direction: detectedDirection,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            ...style,
        };

        return (
            <div style={containerStyle} onClick={advance} className={className}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: imagePosition === 'right' ? 'row-reverse' : 'row',
                        gap: 16,
                    }}
                >
                    {showSpeakerImage && line.speakerImage && (
                        <img
                            src={line.speakerImage}
                            alt={line.speaker}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                objectFit: 'cover',
                            }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        {line.speaker && (
                            <div
                                style={{ color: speakerColor, fontWeight: 'bold', marginBottom: 8 }}
                            >
                                {line.speaker}
                            </div>
                        )}
                        <div style={{ lineHeight: 1.6, minHeight: 48 }}>
                            {displayedText}
                            {isTyping && (
                                <span style={{ animation: 'blink 0.5s infinite' }}>|</span>
                            )}
                        </div>
                        {line.choices && !isTyping && (
                            <div
                                style={{
                                    marginTop: 16,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                }}
                            >
                                {line.choices.map((choice) => (
                                    <button
                                        key={choice.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                                !choice.disabled &&
                                                (!choice.condition || choice.condition())
                                            ) {
                                                onChoiceSelect?.(choice.id, lineIndex);
                                            }
                                        }}
                                        disabled={choice.disabled}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: 4,
                                            color: choice.disabled ? '#666' : '#fff',
                                            cursor: choice.disabled ? 'not-allowed' : 'pointer',
                                            textAlign:
                                                detectedDirection === 'rtl' ? 'right' : 'left',
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showContinue && (
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginTop: 8,
                                    animation: 'bounce 0.5s infinite alternate',
                                }}
                            >
                                {continueIndicator}
                            </div>
                        )}
                    </div>
                </div>
                <style>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(4px); }
                }
            `}</style>
            </div>
        );
    }
);

DialogBox.displayName = 'DialogBox';

export interface NotificationProps extends NotificationConfig {
    onDismiss?: () => void;
    className?: string;
    style?: CSSProperties;
}

export const Notification: React.FC<NotificationProps> = ({
    message,
    title,
    type = 'info',
    duration = 5000,
    dismissible = true,
    progress = true,
    onDismiss,
    className,
    style,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progressValue, setProgressValue] = useState(100);

    useEffect(() => {
        if (duration <= 0) return;

        const startTime = performance.now();
        const timer = setInterval(() => {
            const elapsed = performance.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgressValue(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                setIsVisible(false);
                onDismiss?.();
            }
        }, 50);

        return () => clearInterval(timer);
    }, [duration, onDismiss]);

    if (!isVisible) return null;

    const accentColor = getNotificationColor(type);
    const icon = getNotificationIcon(type);

    const containerStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: 280,
        maxWidth: 400,
        position: 'relative',
        overflow: 'hidden',
        ...style,
    };

    return (
        <div style={containerStyle} className={className}>
            <span style={{ fontSize: 20, color: accentColor }}>{icon}</span>
            <div style={{ flex: 1 }}>
                {title && (
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#ffffff' }}>
                        {title}
                    </div>
                )}
                <div style={{ color: '#d1d5db', fontSize: 14 }}>{message}</div>
            </div>
            {dismissible && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onDismiss?.();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 18,
                    }}
                >
                    ×
                </button>
            )}
            {progress && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: `${progressValue}%`,
                        height: 3,
                        backgroundColor: accentColor,
                        transition: 'width 50ms linear',
                    }}
                />
            )}
        </div>
    );
};

export interface MinimapProps extends Partial<MinimapConfig> {
    markers?: Array<{ position: [number, number]; type?: string; id: string }>;
    playerPosition?: [number, number];
    playerRotation?: number;
    mapImage?: string;
    anchor?: UIAnchor;
    className?: string;
    style?: CSSProperties;
}

export const Minimap: React.FC<MinimapProps> = ({
    size = 150,
    zoom = 1,
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    borderColor = 'rgba(255, 255, 255, 0.3)',
    borderWidth = 2,
    borderRadius = 75,
    playerColor = '#4ade80',
    playerSize = 8,
    rotateWithPlayer = false,
    showCompass = true,
    markers = [],
    playerPosition = [0, 0],
    playerRotation = 0,
    mapImage,
    markerTypes = {},
    anchor = 'topRight',
    className,
    style,
}) => {
    const containerStyle: CSSProperties = {
        position: 'fixed',
        width: size,
        height: size,
        backgroundColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        overflow: 'hidden',
        ...style,
    };

    const mapStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        transform: rotateWithPlayer ? `rotate(${-playerRotation}rad)` : undefined,
        transition: 'transform 0.1s',
    };

    return (
        <div style={containerStyle} className={className}>
            <div style={mapStyle}>
                {mapImage && (
                    <img
                        src={mapImage}
                        alt="map"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${zoom})`,
                        }}
                    />
                )}
                {markers.map((marker) => {
                    const markerConfig = marker.type ? markerTypes[marker.type] : undefined;
                    const relX = (marker.position[0] - playerPosition[0]) * zoom + size / 2;
                    const relY = (marker.position[1] - playerPosition[1]) * zoom + size / 2;

                    if (relX < 0 || relX > size || relY < 0 || relY > size) return null;

                    return (
                        <div
                            key={marker.id}
                            style={{
                                position: 'absolute',
                                left: relX,
                                top: relY,
                                width: markerConfig?.size || 6,
                                height: markerConfig?.size || 6,
                                backgroundColor: markerConfig?.color || '#ef4444',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    );
                })}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 0,
                        height: 0,
                        borderLeft: `${playerSize / 2}px solid transparent`,
                        borderRight: `${playerSize / 2}px solid transparent`,
                        borderBottom: `${playerSize}px solid ${playerColor}`,
                        transform: `translate(-50%, -50%) rotate(${rotateWithPlayer ? 0 : playerRotation}rad)`,
                    }}
                />
            </div>
            {showCompass && (
                <div
                    style={{
                        position: 'absolute',
                        top: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    }}
                >
                    N
                </div>
            )}
        </div>
    );
};

export interface CrosshairProps extends Partial<CrosshairConfig> {
    spread?: number;
    className?: string;
    style?: CSSProperties;
}

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

    const containerStyle: CSSProperties = {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        opacity,
        ...style,
    };

    const lineStyle = (rotation: number): CSSProperties => ({
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

export type {
    CrosshairConfig,
    DamageNumberConfig,
    DialogChoice,
    DialogConfig,
    DialogLine,
    InventoryConfig,
    InventorySlot,
    MinimapConfig,
    NameplateConfig,
    NotificationConfig,
    ProgressBarConfig,
    TooltipConfig,
    UIAnchor,
} from '../core/ui';
