import { Line } from '@react-three/drei';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as YUKA from 'yuka';
import type { YukaPathProps, YukaPathRef } from './types';

/**
 * Path definition component for AI agents to follow.
 * Provides waypoints for FollowPathBehavior and path visualization.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <YukaPath
 *   waypoints={[[0,0,0], [10,0,0], [10,0,10]]}
 *   loop={true}
 *   visible={true}
 * />
 * ```
 */
export const YukaPath = forwardRef<YukaPathRef, YukaPathProps>(function YukaPath(
    {
        waypoints,
        loop = false,
        visible = false,
        color = 0x00ff00,
        lineWidth = 2,
        showWaypoints = false,
        waypointSize = 0.2,
        waypointColor,
        showDirection = false,
    },
    ref
) {
    const pathRef = useRef<YUKA.Path>(new YUKA.Path());

    useEffect(() => {
        const path = pathRef.current;
        path.clear();
        path.loop = loop;

        for (const [x, y, z] of waypoints) {
            path.add(new YUKA.Vector3(x, y, z));
        }
    }, [waypoints, loop]);

    useImperativeHandle(
        ref,
        () => ({
            path: pathRef.current,
        }),
        []
    );

    const linePoints = useMemo(() => {
        if (!visible || waypoints.length < 2) return null;

        const points: Array<[number, number, number]> = [...waypoints];
        if (loop && points.length > 2) {
            points.push(waypoints[0]);
        }
        return points;
    }, [waypoints, loop, visible]);

    const directionArrows = useMemo(() => {
        if (!showDirection || !visible || waypoints.length < 2) return [];

        const arrows: Array<{
            position: [number, number, number];
            rotation: [number, number, number];
        }> = [];

        const pointCount = loop ? waypoints.length : waypoints.length - 1;
        for (let i = 0; i < pointCount; i++) {
            const from = waypoints[i];
            const to = waypoints[(i + 1) % waypoints.length];

            const midX = (from[0] + to[0]) / 2;
            const midY = (from[1] + to[1]) / 2;
            const midZ = (from[2] + to[2]) / 2;

            const dx = to[0] - from[0];
            const dy = to[1] - from[1];
            const dz = to[2] - from[2];
            const yaw = Math.atan2(dx, dz);
            const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

            arrows.push({
                position: [midX, midY, midZ],
                rotation: [pitch, yaw, 0],
            });
        }

        return arrows;
    }, [waypoints, loop, showDirection, visible]);

    const effectiveWaypointColor = waypointColor ?? color;

    if (!visible) {
        return null;
    }

    return (
        <group>
            {linePoints && linePoints.length >= 2 && (
                <Line points={linePoints} color={color} lineWidth={lineWidth} />
            )}

            {showWaypoints &&
                waypoints.map((wp) => (
                    <mesh key={`waypoint-${wp[0]}-${wp[1]}-${wp[2]}`} position={wp}>
                        <sphereGeometry args={[waypointSize, 8, 8]} />
                        <meshBasicMaterial color={effectiveWaypointColor} />
                    </mesh>
                ))}

            {showDirection &&
                directionArrows.map((arrow) => (
                    <mesh
                        key={`arrow-${arrow.position[0]}-${arrow.position[1]}-${arrow.position[2]}`}
                        position={arrow.position}
                        rotation={arrow.rotation}
                    >
                        <coneGeometry args={[waypointSize * 0.5, waypointSize * 1.5, 6]} />
                        <meshBasicMaterial color={color} />
                    </mesh>
                ))}
        </group>
    );
});
