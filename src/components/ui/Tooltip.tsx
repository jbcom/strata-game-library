import type React from 'react';
import type { TooltipProps } from './types';

/**
 * Descriptive Information Tooltip.
 *
 * Renders a fixed-position HTML overlay for displaying item stats,
 * descriptions, and labels. Features rarity-based borders and automatic layout.
 *
 * @category UI & Interaction
 * @example
 * ```tsx
 * <Tooltip
 *   title="Ancient Sword"
 *   description="A rusty but reliable blade."
 *   rarity="Epic"
 *   rarityColor="purple"
 *   stats={[{ label: 'Damage', value: '15-20' }]}
 *   x={mousePos.x}
 *   y={mousePos.y}
 * />
 * ```
 */
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

    const containerStyle: React.CSSProperties = {
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
                <div style={{ color: '#a8a29e', marginBottom: (stats?.length ?? 0) > 0 ? 8 : 0 }}>
                    {description}
                </div>
            )}
            {stats && stats.length > 0 && (
                <div>
                    {stats.map((stat) => (
                        <div
                            key={`stat-${stat.label}`}
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
