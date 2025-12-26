
import type React from 'react';
import type { MinimapProps } from './types';

/**
 * Top-Down Tactical Minimap.
 *
 * Provides a highly-customizable 2D radar or map view that tracks players and points of
 * interest (POI) in real-time. Supports orientation tracking, zoom levels, and
 * custom marker definitions.
 *
 * **Key Features:**
 * - **Tracking:** Real-time player and NPC position/rotation synchronization.
 * - **Markers:** Extensible marker system with support for custom types and colors.
 * - **Dynamic View:** Configurable zoom levels and optional player-relative rotation.
 * - **Navigation:** Integrated north-facing compass indicator.
 *
 * @category UI & Interaction
 *
 * @example
 * ```tsx
 * // Square radar with quest markers
 * <Minimap
 *   size={180}
 *   zoom={2.0}
 *   playerPosition={[playerX, playerZ]}
 *   playerRotation={currentHeading}
 *   rotateWithPlayer={true}
 *   markers={[
 *     { id: 'q1', position: [50, 50], type: 'quest' },
 *     { id: 'e1', position: [-20, 10], type: 'enemy' }
 *   ]}
 *   markerTypes={{
 *     quest: { color: '#fbbf24', size: 8, blinking: true },
 *     enemy: { color: '#ef4444', size: 6 }
 *   }}
 *   borderRadius={8}
 * />
 * ```
 *
 * ## Interactive Demos
 * <iframe src="../../demos/minimap.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Live Minimap Demo](../../demos/minimap.html)
 */
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
    className,
    style,
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        width: size,
        height: size,
        backgroundColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        overflow: 'hidden',
        ...style,
    };

    const mapStyle: React.CSSProperties = {
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
