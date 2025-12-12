/**
 * Decal Preset - Projected decal system
 *
 * Provides decal rendering for bullet holes, blood splatters,
 * damage marks, graffiti, and other surface projections.
 */

import * as THREE from 'three';
import {
    createBloodSplatterTexture,
    createBulletHoleTexture,
    createDecalTexture,
    createFootprintTexture,
    createScorchMarkTexture,
    createWaterPuddleTexture,
} from '../../core/decals';

export interface DecalOptions {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    texture: THREE.Texture;
    normalMap?: THREE.Texture;
    material?: THREE.Material;
    depthTest?: boolean;
    depthWrite?: boolean;
}

export interface DecalPresetOptions {
    position: THREE.Vector3;
    normal: THREE.Vector3;
    size?: number;
    rotation?: number;
    fadeTime?: number;
    texture?: THREE.Texture;
}

/**
 * Create a projected decal
 */
export function createDecal(geometry: THREE.BufferGeometry, options: DecalOptions): THREE.Mesh {
    const {
        position,
        rotation,
        scale,
        texture,
        normalMap,
        material,
        depthTest = true,
        depthWrite = false,
    } = options;

    // Input validation
    if (!geometry) {
        throw new Error('createDecal: geometry is required');
    }
    if (!position) {
        throw new Error('createDecal: position is required');
    }
    if (!rotation) {
        throw new Error('createDecal: rotation is required');
    }
    if (!scale) {
        throw new Error('createDecal: scale is required');
    }
    if (!texture) {
        throw new Error('createDecal: texture is required');
    }

    // Create decal geometry by projecting onto surface
    const decalGeometry = projectDecal(geometry, position, rotation, scale);

    // Create material
    const decalMaterial =
        material ||
        new THREE.MeshPhongMaterial({
            map: texture,
            normalMap: normalMap,
            transparent: true,
            depthTest: depthTest,
            depthWrite: depthWrite,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            wireframe: false,
        });

    const mesh = new THREE.Mesh(decalGeometry, decalMaterial);
    return mesh;
}

/**
 * Project decal onto geometry surface
 */
function projectDecal(
    geometry: THREE.BufferGeometry,
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3
): THREE.BufferGeometry {
    // Create decal box
    const decalBox = new THREE.Box3();
    decalBox.setFromCenterAndSize(position, scale);

    // Transform vertices
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const _indices: number[] = [];

    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');

    if (!positionAttribute) {
        throw new Error('projectDecal: geometry must have position attribute');
    }

    const matrix = new THREE.Matrix4();
    matrix.makeRotationFromEuler(rotation);
    matrix.setPosition(position);

    const inverseMatrix = new THREE.Matrix4().copy(matrix).invert();

    // Clip geometry to decal box
    const tempPosition = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        tempPosition.fromBufferAttribute(positionAttribute, i);

        // Transform to decal space
        tempPosition.applyMatrix4(inverseMatrix);

        // Check if inside decal box
        if (
            Math.abs(tempPosition.x) <= 0.5 &&
            Math.abs(tempPosition.y) <= 0.5 &&
            Math.abs(tempPosition.z) <= 0.5
        ) {
            // Transform back to world space
            tempPosition.applyMatrix4(matrix);
            vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);

            if (normalAttribute) {
                tempNormal.fromBufferAttribute(normalAttribute, i);
                tempNormal.transformDirection(matrix);
                normals.push(tempNormal.x, tempNormal.y, tempNormal.z);
            }

            // UV mapping
            uvs.push(tempPosition.x / scale.x + 0.5, tempPosition.y / scale.y + 0.5);
        }
    }

    // Create new geometry
    const decalGeometry = new THREE.BufferGeometry();
    decalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    if (normals.length > 0) {
        decalGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }
    decalGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return decalGeometry;
}

/**
 * Create a simple bullet hole decal
 */
export function createBulletHoleDecal(
    position: THREE.Vector3,
    normal: THREE.Vector3,
    size: number = 0.1,
    texture?: THREE.Texture
): THREE.Mesh {
    // Create rotation from normal
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    // Create simple texture (could be loaded from file)
    // Use provided texture or create canvas if in browser environment
    let canvasTexture: THREE.Texture;
    if (texture) {
        canvasTexture = texture;
    } else if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        // Draw bullet hole
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(50, 50, 50, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.needsUpdate = true;
    } else {
        // Fallback for non-browser environments (tests, SSR)
        canvasTexture = new THREE.Texture();
    }

    return createDecal(new THREE.PlaneGeometry(1, 1), {
        position,
        rotation,
        scale: new THREE.Vector3(size, size, 0.01),
        texture: canvasTexture,
    });
}

function createDecalFromNormal(
    position: THREE.Vector3,
    normal: THREE.Vector3,
    size: number,
    rotationAngle: number,
    texture: THREE.Texture
): THREE.Mesh {
    // Determine the up vector, avoiding gimbal lock when normal is nearly parallel to Y-axis
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(normal.dot(up)) > 0.99) {
        up.set(0, 0, 1);
    }

    // Calculate tangent and bitangent for proper orientation
    const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Build rotation matrix from tangent, bitangent, normal
    const rotationMatrix = new THREE.Matrix4().makeBasis(tangent, bitangent, normal);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

    // Apply additional rotation around normal axis
    const rotQuat = new THREE.Quaternion().setFromAxisAngle(normal, rotationAngle);
    quaternion.premultiply(rotQuat);
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);

    return mesh;
}

export function createFootprintDecal(options: DecalPresetOptions): THREE.Mesh {
    const { position, normal, size = 0.15, rotation = 0 } = options;

    const texture = options.texture ?? createFootprintTexture(64);
    if (!texture) {
        throw new Error('createFootprintDecal: Could not create texture');
    }

    return createDecalFromNormal(position, normal, size, rotation, texture);
}

export function createBloodSplatterDecal(options: DecalPresetOptions): THREE.Mesh {
    const { position, normal, size = 0.5, rotation = 0 } = options;

    const texture = options.texture ?? createBloodSplatterTexture(128);
    if (!texture) {
        throw new Error('createBloodSplatterDecal: Could not create texture');
    }

    return createDecalFromNormal(position, normal, size, rotation, texture);
}

export function createScorchMarkDecal(options: DecalPresetOptions): THREE.Mesh {
    const { position, normal, size = 0.8, rotation = 0 } = options;

    const texture = options.texture ?? createScorchMarkTexture(128);
    if (!texture) {
        throw new Error('createScorchMarkDecal: Could not create texture');
    }

    return createDecalFromNormal(position, normal, size, rotation, texture);
}

export function createWaterPuddleDecal(options: DecalPresetOptions): THREE.Mesh {
    const { position, normal, size = 1.0, rotation = 0 } = options;

    const texture = options.texture ?? createWaterPuddleTexture(128);
    if (!texture) {
        throw new Error('createWaterPuddleDecal: Could not create texture');
    }

    return createDecalFromNormal(position, normal, size, rotation, texture);
}

export {
    createBulletHoleTexture,
    createBloodSplatterTexture,
    createScorchMarkTexture,
    createFootprintTexture,
    createWaterPuddleTexture,
    createDecalTexture,
};
