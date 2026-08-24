import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import type { YukaNavMeshProps, YukaNavMeshRef } from './types';
import { createPolygonsFromGeometry, threeVector3ToYuka, yukaVector3ToThree } from './utils';

/**
 * Navigation mesh component for AI pathfinding.
 * Creates a walkable surface from Three.js geometry for A* pathfinding.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <YukaNavMesh
 *   geometry={floorGeometry}
 *   visible={true}
 *   color="#0088ff"
 * />
 * ```
 */
export const YukaNavMesh = forwardRef<YukaNavMeshRef, YukaNavMeshProps>(function YukaNavMesh(
  { geometry, visible = false, wireframe = true, color = 0x0088ff },
  ref
) {
  const navMeshRef = useRef<YUKA.NavMesh>(new YUKA.NavMesh());
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const navMesh = navMeshRef.current;

    const positionAttr = geometry.getAttribute('position');
    const indexAttr = geometry.getIndex();

    if (!positionAttr) return;

    const vertices: number[] = [];
    for (let i = 0; i < positionAttr.count; i++) {
      vertices.push(positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i));
    }

    const indices: number[] = [];
    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i++) {
        indices.push(indexAttr.getX(i));
      }
    } else {
      for (let i = 0; i < positionAttr.count; i++) {
        indices.push(i);
      }
    }

    navMesh.fromPolygons(createPolygonsFromGeometry(vertices, indices));
  }, [geometry]);

  useImperativeHandle(
    ref,
    () => ({
      navMesh: navMeshRef.current,
      findPath: (from: THREE.Vector3, to: THREE.Vector3) => {
        const fromYuka = threeVector3ToYuka(from);
        const toYuka = threeVector3ToYuka(to);
        const path = navMeshRef.current.findPath(fromYuka, toYuka);
        return path.map((p: YUKA.Vector3) => yukaVector3ToThree(p));
      },
      getRandomRegion: () => {
        const regions = navMeshRef.current.regions;
        if (regions.length === 0) return null;
        return regions[Math.floor(Math.random() * regions.length)];
      },
      getClosestRegion: (point: THREE.Vector3) => {
        const yukaPoint = threeVector3ToYuka(point);
        return navMeshRef.current.getClosestRegion(yukaPoint);
      },
    }),
    []
  );

  if (!visible) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});
