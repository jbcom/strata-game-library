/**
 * Core Level of Detail (LOD) System.
 *
 * Provides pure TypeScript utilities for distance-based rendering optimization,
 * including mesh simplification, billboard generation, and automated LOD level switching.
 *
 * @packageDocumentation
 * @module core/lod
 * @category Rendering Pipeline
 */

import * as THREE from 'three';

export interface LODLevel {
    distance: number;
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material;
    visible?: boolean;
}

export interface LODConfig {
    levels: LODLevel[];
    hysteresis?: number;
    transitionDuration?: number;
    fadeMode?: 'instant' | 'crossfade' | 'dither';
}

export interface LODState {
    currentLevel: number;
    previousLevel: number;
    transitionProgress: number;
    isTransitioning: boolean;
}

export interface ImpostorConfig {
    resolution?: number;
    views?: number;
    billboardMode?: 'spherical' | 'cylindrical';
    updateFrequency?: number;
}

export interface SimplificationOptions {
    targetRatio: number;
    preserveTexture?: boolean;
    preserveNormals?: boolean;
    preserveBorders?: boolean;
    maxError?: number;
}

export class LODManager {
    private objects: Map<
        string,
        {
            config: LODConfig;
            state: LODState;
            object: THREE.Object3D;
            levels: THREE.Object3D[];
        }
    > = new Map();
    private nextId: number = 0;
    private cameraPosition: THREE.Vector3 = new THREE.Vector3();
    // Reusable vector to avoid allocations in update loop
    private tempObjectPosition: THREE.Vector3 = new THREE.Vector3();

    generateId(): string {
        return `lod_${this.nextId++}`;
    }

    register(object: THREE.Object3D, config: LODConfig): string {
        const id = this.generateId();
        const state: LODState = {
            currentLevel: 0,
            previousLevel: 0,
            transitionProgress: 1,
            isTransitioning: false,
        };

        this.objects.set(id, {
            config: {
                ...config,
                hysteresis: config.hysteresis ?? 0.1,
                transitionDuration: config.transitionDuration ?? 0.3,
                fadeMode: config.fadeMode ?? 'instant',
            },
            state,
            object,
            levels: [],
        });

        return id;
    }

    unregister(id: string): boolean {
        return this.objects.delete(id);
    }

    update(cameraPosition: THREE.Vector3, deltaTime: number): void {
        this.cameraPosition.copy(cameraPosition);

        this.objects.forEach((entry) => {
            const { config, state, object } = entry;
            // Reuse temporary vector to avoid allocations
            object.getWorldPosition(this.tempObjectPosition);

            const distance = this.tempObjectPosition.distanceTo(this.cameraPosition);
            const targetLevel = this.calculateLevel(distance, config, state);

            if (targetLevel !== state.currentLevel) {
                state.previousLevel = state.currentLevel;
                state.currentLevel = targetLevel;
                state.isTransitioning = config.fadeMode !== 'instant';
                state.transitionProgress = 0;
            }

            if (state.isTransitioning) {
                state.transitionProgress += deltaTime / (config.transitionDuration ?? 0.3);
                if (state.transitionProgress >= 1) {
                    state.transitionProgress = 1;
                    state.isTransitioning = false;
                }
            }
        });
    }

    private calculateLevel(distance: number, config: LODConfig, state: LODState): number {
        const hysteresis = config.hysteresis ?? 0.1;
        const levels = config.levels;

        for (let i = 0; i < levels.length; i++) {
            const threshold = levels[i].distance;
            const hysteresisOffset =
                state.currentLevel > i ? -hysteresis * threshold : hysteresis * threshold;

            if (distance < threshold + hysteresisOffset) {
                return i;
            }
        }

        return levels.length - 1;
    }

    getState(id: string): LODState | undefined {
        return this.objects.get(id)?.state;
    }

    getCurrentLevel(id: string): number {
        return this.objects.get(id)?.state.currentLevel ?? 0;
    }

    getTransitionProgress(id: string): number {
        return this.objects.get(id)?.state.transitionProgress ?? 1;
    }

    isTransitioning(id: string): boolean {
        return this.objects.get(id)?.state.isTransitioning ?? false;
    }

    clear(): void {
        this.objects.clear();
    }

    get count(): number {
        return this.objects.size;
    }
}

export function calculateLODLevel(
    objectPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3,
    levels: LODLevel[]
): number {
    if (!levels || levels.length === 0) {
        throw new Error('calculateLODLevel: levels array cannot be empty');
    }

    const distance = objectPosition.distanceTo(cameraPosition);

    for (let i = 0; i < levels.length; i++) {
        if (distance < levels[i].distance) {
            return i;
        }
    }

    return levels.length - 1;
}

export function createLODLevels(
    distances: number[],
    geometries?: THREE.BufferGeometry[],
    materials?: THREE.Material[]
): LODLevel[] {
    return distances.map((distance, i) => ({
        distance,
        geometry: geometries?.[i],
        material: materials?.[i],
        visible: true,
    }));
}

/**
 * Simplify geometry by sampling complete triangles.
 *
 * Note: This is a naive triangle decimation that preserves mesh topology
 * by operating on complete triangles rather than individual vertices.
 * For production use with complex meshes, consider using a proper
 * mesh simplification library (e.g., meshoptimizer, simplify-geometry).
 */
export function simplifyGeometry(
    geometry: THREE.BufferGeometry,
    options: SimplificationOptions
): THREE.BufferGeometry {
    const { targetRatio, preserveNormals = true } = options;

    const positionAttr = geometry.getAttribute('position');
    if (!positionAttr) {
        return geometry.clone();
    }

    const normalAttr = geometry.getAttribute('normal');
    const uvAttr = geometry.getAttribute('uv');
    const indexAttr = geometry.getIndex();

    // Calculate triangle count
    const triangleCount = indexAttr ? indexAttr.count / 3 : positionAttr.count / 3;

    const targetTriangles = Math.max(1, Math.floor(triangleCount * targetRatio));

    if (targetTriangles >= triangleCount) {
        return geometry.clone();
    }

    const simplified = new THREE.BufferGeometry();

    // Calculate step to sample complete triangles
    const triangleStep = Math.max(1, Math.ceil(triangleCount / targetTriangles));

    const newPositions: number[] = [];
    const newNormals: number[] = [];
    const newUvs: number[] = [];

    for (let tri = 0; tri < triangleCount; tri += triangleStep) {
        // Process all 3 vertices of this triangle
        for (let v = 0; v < 3; v++) {
            // Get vertex index - use index buffer if available
            const vertexIndex = indexAttr ? indexAttr.getX(tri * 3 + v) : tri * 3 + v;

            newPositions.push(
                positionAttr.getX(vertexIndex),
                positionAttr.getY(vertexIndex),
                positionAttr.getZ(vertexIndex)
            );

            if (preserveNormals && normalAttr) {
                newNormals.push(
                    normalAttr.getX(vertexIndex),
                    normalAttr.getY(vertexIndex),
                    normalAttr.getZ(vertexIndex)
                );
            }

            if (uvAttr) {
                newUvs.push(uvAttr.getX(vertexIndex), uvAttr.getY(vertexIndex));
            }
        }
    }

    simplified.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));

    if (newNormals.length > 0) {
        simplified.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    }

    if (newUvs.length > 0) {
        simplified.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
    }

    return simplified;
}

export function generateLODGeometries(
    baseGeometry: THREE.BufferGeometry,
    levels: number,
    minRatio: number = 0.1
): THREE.BufferGeometry[] {
    const geometries: THREE.BufferGeometry[] = [baseGeometry.clone()];

    for (let i = 1; i < levels; i++) {
        const ratio = 1 - (i / (levels - 1)) * (1 - minRatio);
        geometries.push(simplifyGeometry(baseGeometry, { targetRatio: ratio }));
    }

    return geometries;
}

export function createImpostorTexture(
    renderer: THREE.WebGLRenderer,
    object: THREE.Object3D,
    config: ImpostorConfig = {}
): THREE.Texture | null {
    const { resolution = 256, views = 8, billboardMode = 'cylindrical' } = config;

    // Check if renderer has a valid WebGL context rather than checking for document
    const gl = renderer?.getContext();
    if (!gl || gl.isContextLost()) {
        return null;
    }

    const renderTarget = new THREE.WebGLRenderTarget(resolution * views, resolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
    });

    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Scale camera frustum based on object size
    // Factor of 0.6 provides padding while ensuring object fits in view
    // (accounts for rotation and prevents clipping at extreme angles)
    const frustumSize = maxDim * 0.6;
    const camera = new THREE.OrthographicCamera(
        -frustumSize,
        frustumSize,
        frustumSize,
        -frustumSize,
        0.1,
        maxDim * 4
    );
    const scene = new THREE.Scene();

    const objectClone = object.clone();
    scene.add(objectClone);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight, directionalLight);

    const originalRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(renderTarget);

    for (let i = 0; i < views; i++) {
        const angle = (i / views) * Math.PI * 2;
        const distance = maxDim * 2;

        if (billboardMode === 'spherical') {
            camera.position.set(
                Math.cos(angle) * distance,
                distance * 0.5,
                Math.sin(angle) * distance
            );
        } else {
            camera.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        }

        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        const viewport = new THREE.Vector4(i * resolution, 0, resolution, resolution);
        renderer.setViewport(viewport);
        renderer.render(scene, camera);
    }

    renderer.setRenderTarget(originalRenderTarget);
    renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height);

    const texture = renderTarget.texture.clone();
    texture.needsUpdate = true;

    // Clean up temporary scene resources
    objectClone.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
                for (const m of node.material) {
                    m.dispose();
                }
            } else {
                node.material?.dispose();
            }
        }
    });
    scene.remove(objectClone);
    scene.remove(ambientLight);
    scene.remove(directionalLight);

    renderTarget.dispose();

    return texture;
}

export function createImpostorGeometry(
    width: number = 1,
    height: number = 1,
    views: number = 8
): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(width, height);

    geometry.userData.views = views;
    geometry.userData.viewWidth = 1 / views;

    return geometry;
}

export function updateImpostorUV(
    geometry: THREE.BufferGeometry,
    cameraAngle: number,
    views: number = 8
): void {
    let angle = cameraAngle;
    while (angle < 0) angle += Math.PI * 2;
    angle = angle % (Math.PI * 2);

    const viewIndex = Math.floor((angle / (Math.PI * 2)) * views) % views;
    const viewWidth = 1 / views;
    const uOffset = viewIndex * viewWidth;

    const uvAttr = geometry.getAttribute('uv');
    if (!uvAttr) return;

    uvAttr.setXY(0, uOffset, 0);
    uvAttr.setXY(1, uOffset + viewWidth, 0);
    uvAttr.setXY(2, uOffset, 1);
    uvAttr.setXY(3, uOffset + viewWidth, 1);
    uvAttr.needsUpdate = true;
}

export function calculateImpostorAngle(
    objectPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3
): number {
    const direction = new THREE.Vector3().subVectors(cameraPosition, objectPosition).normalize();
    return Math.atan2(direction.x, direction.z);
}

export function interpolateLODMaterials(
    material1: THREE.Material,
    material2: THREE.Material,
    progress: number
): void {
    // THREE.Material base class includes opacity and transparent properties
    material1.opacity = 1 - progress;
    material2.opacity = progress;
    material1.transparent = true;
    material2.transparent = true;
}

export function createDitherPattern(size: number = 4): THREE.DataTexture {
    const data = new Uint8Array(size * size);

    const bayerMatrix = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.floor((bayerMatrix[i % 16] / 16) * 255);
    }

    const texture = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RedFormat,
        THREE.UnsignedByteType
    );
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
}

export function calculateScreenSpaceSize(
    objectPosition: THREE.Vector3,
    objectSize: number,
    camera: THREE.PerspectiveCamera,
    screenHeight: number
): number {
    const distance = objectPosition.distanceTo(camera.position);
    const fov = camera.fov * (Math.PI / 180);
    const screenSize = (objectSize / (2 * distance * Math.tan(fov / 2))) * screenHeight;
    return screenSize;
}

export function shouldUseLOD(screenSize: number, threshold: number = 50): boolean {
    return screenSize < threshold;
}

export interface VegetationLODConfig {
    highDetailDistance: number;
    mediumDetailDistance: number;
    lowDetailDistance: number;
    impostorDistance: number;
    cullDistance: number;
    transitionWidth?: number;
}

export function createVegetationLODLevels(config: VegetationLODConfig): LODLevel[] {
    return [
        { distance: config.highDetailDistance },
        { distance: config.mediumDetailDistance },
        { distance: config.lowDetailDistance },
        { distance: config.impostorDistance },
        { distance: config.cullDistance, visible: false },
    ];
}

export function calculateVegetationDensity(distance: number, config: VegetationLODConfig): number {
    if (distance < config.highDetailDistance) {
        return 1.0;
    } else if (distance < config.mediumDetailDistance) {
        return 0.7;
    } else if (distance < config.lowDetailDistance) {
        return 0.4;
    } else if (distance < config.impostorDistance) {
        return 0.2;
    } else if (distance < config.cullDistance) {
        return 0.1;
    }
    return 0;
}

export function batchLODObjects(
    objects: THREE.Object3D[],
    cameraPosition: THREE.Vector3,
    levels: LODLevel[]
): Map<number, THREE.Object3D[]> {
    const batches = new Map<number, THREE.Object3D[]>();

    for (let i = 0; i < levels.length; i++) {
        batches.set(i, []);
    }

    const tempPos = new THREE.Vector3();
    objects.forEach((object) => {
        object.getWorldPosition(tempPos);
        const level = calculateLODLevel(tempPos, cameraPosition, levels);
        batches.get(level)?.push(object);
    });

    return batches;
}
