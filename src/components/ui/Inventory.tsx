
import type React from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import type { InventoryProps, InventoryRef, InventorySlot } from './types';

/**
 * Professional Grid-Based Inventory System.
 *
 * A robust, RPG-ready inventory management system that renders as a high-performance
 * HTML overlay. Supports modern interaction patterns including drag-and-drop,
 * rarity-based styling, slot selection, and locked states.
 *
 * **Key Features:**
 * - **Interactivity:** Full drag-and-drop support for item reordering.
 * - **Visual Feedback:** Rarity-based borders, hover scaling, and selection highlights.
 * - **Flexible Layout:** Responsive grid with configurable columns, rows, and slot sizes.
 * - **State Sync:** Reflects quantities, stack limits, and slot status in real-time.
 *
 * @category UI & Interaction
 *
 * @example
 * ```tsx
 * // 8x2 RPG Hotbar configuration
 * <Inventory
 *   columns={8}
 *   rows={2}
 *   slots={[
 *     { id: '1', itemName: 'Health Potion', itemIcon: '/icons/potion.png', quantity: 5, rarity: 'common' },
 *     { id: '2', itemName: 'Magic Sword', itemIcon: '/icons/sword.png', rarity: 'rare', highlighted: true },
 *     { id: '3', locked: true }
 *   ]}
 *   onSlotClick={(slot) => equipItem(slot)}
 *   onSlotDrop={(from, to) => swapItems(from, to)}
 * />
 * ```
 *
 * ## Interactive Demos
 * <iframe src="../../demos/ui.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Live UI Demo](../../demos/ui.html)
 */
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

        const handlePointerUp = useCallback(() => {
            if (draggedIndex !== null) setDraggedIndex(null);
        }, [draggedIndex]);

        useEffect(() => {
            window.addEventListener('pointerup', handlePointerUp);
            return () => window.removeEventListener('pointerup', handlePointerUp);
        }, [handlePointerUp]);

        if (!visible) return null;

        const containerWidth = columns * slotSize + (columns - 1) * slotGap + 20;

        const containerStyle: React.CSSProperties = {
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
                        <button
                            type="button"
                            key={slot.id}
                            aria-label={`${slot.itemName}${slot.quantity && slot.quantity > 1 ? ` (${slot.quantity})` : ''}`}
                            aria-disabled={slot.locked}
                            style={{
                                width: slotSize,
                                height: slotSize,
                                padding: 0,
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
                                    aria-label="Locked"
                                    role="img"
                                    style={{
                                        position: 'absolute',
                                        fontSize: 18,
                                        color: '#9ca3af',
                                    }}
                                >
                                    🔒
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }
);

Inventory.displayName = 'Inventory';
