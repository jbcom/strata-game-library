import { Instance, Instances } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import type { InstanceData } from '../../core/instancing';

/**
 * Props for the GPUInstancedMesh component.
 * @category World Building
 * @interface GPUInstancedMeshProps
 */
export interface GPUInstancedMeshProps {
    /** The geometry to use for each instance. */
    geometry: THREE.BufferGeometry;
    /** The material to use for each instance. */
    material: THREE.Material;
    /** Maximum number of instances to render. */
    count: number;
    /** Array of instance transform data. */
    instances: InstanceData[];
    /**
     * Enable wind animation effect.
     * @remarks Requires compatible GPU shader integration. Default: true.
     */
    enableWind?: boolean;
    /**
     * Strength of wind animation (0-1). Default: 0.5.
     * @remarks Requires compatible GPU shader integration.
     */
    windStrength?: number;
    /**
     * Distance at which LOD transitions occur in units. Default: 100.
     * @remarks Requires compatible GPU shader integration.
     */
    lodDistance?: number;
    /** Enable frustum culling for the entire system. Default: true. */
    frustumCulled?: boolean;
    /** Enable shadow casting for all instances. Default: true. */
    castShadow?: boolean;
    /** Enable shadow receiving for all instances. Default: true. */
    receiveShadow?: boolean;
}

/**
 * Generic component for rendering large numbers of instances with high performance.
 *
 * Powered by `@react-three/drei`'s `Instances` component for efficient GPU batching.
 *
 * @category World Building
 * @internal
 */
export function GPUInstancedMesh({
    geometry,
    material,
    count,
    instances,
    // Reserved for future wind/LOD implementation
    enableWind: _enableWind = true,
    windStrength: _windStrength = 0.5,
    lodDistance: _lodDistance = 100,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true,
}: GPUInstancedMeshProps) {
    const _meshRef = useRef<THREE.InstancedMesh>(null);
    const _camera = useThree().camera;

    // Input validation
    if (!geometry) {
        throw new Error('GPUInstancedMesh: geometry is required');
    }
    if (!material) {
        throw new Error('GPUInstancedMesh: material is required');
    }
    if (count <= 0) {
        throw new Error('GPUInstancedMesh: count must be positive');
    }
    if (!instances || instances.length === 0) {
        throw new Error('GPUInstancedMesh: instances array cannot be empty');
    }

    const instanceCount = Math.min(instances.length, count);
    return (
        <Instances
            limit={instanceCount}
            range={instanceCount}
            frustumCulled={frustumCulled}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        >
            {/* drei's Instances expects geometry and material as primitive children */}
            <primitive object={geometry} attach="geometry" />
            <primitive object={material} attach="material" />
            {instances.slice(0, instanceCount).map((instance) => (
                <Instance
                    key={`inst-${instance.position.x.toFixed(2)}-${instance.position.y.toFixed(2)}-${instance.position.z.toFixed(2)}`}
                    position={instance.position as unknown as [number, number, number]}
                    rotation={[instance.rotation.x, instance.rotation.y, instance.rotation.z]}
                    scale={instance.scale as unknown as [number, number, number]}
                />
            ))}
        </Instances>
    );
}
