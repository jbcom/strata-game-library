/**
 * Core Decal and Billboard System.
 *
 * Provides utilities for projecting textures onto geometry, creating camera-facing
 * billboards, and managing animated sprite sheets.
 *
 * @packageDocumentation
 * @module core/decals
 * @category World Building
 */

import * as THREE from 'three';

/**
 * Configuration for the decal projector.
 * @category World Building
 */
export interface DecalProjectorConfig {
    /** Target size of the projected decal cube. */
    size: THREE.Vector3;
    /** Projection depth along the normal axis. Default: 1.0. */
    depth?: number;
    /** Time in seconds before decals are automatically removed. Default: 5.0. */
    fadeTime?: number;
    /** Maximum number of active decals allowed. Default: 100. */
    maxDecals?: number;
}

/**
 * Data representing an active decal instance.
 * @category World Building
 */
export interface DecalInstance {
    /** Unique identifier. */
    id: string;
    /** World position. */
    position: THREE.Vector3;
    /** Surface-aligned rotation. */
    rotation: THREE.Euler;
    /** Physical scale. */
    scale: THREE.Vector3;
    /** Current visibility (0-1). */
    opacity: number;
    /** Unix timestamp of creation. */
    createdAt: number;
    /** Duration of the visibility fade in ms. */
    fadeTime: number;
    /** Optional reference to the physical Mesh. */
    mesh?: THREE.Mesh;
}

/**
 * Configuration for billboard behavior.
 * @category World Building
 */
export interface BillboardConfig {
    /** Whether to restrict rotation to the Y-axis (cylindrical). */
    lockY?: boolean;
    /** Local position offset. */
    offset?: THREE.Vector3;
    /** Relative scale multiplier. */
    scaleFactor?: number;
}

/**
 * Configuration for sprite sheet animation.
 * @category World Building
 */
export interface SpriteSheetConfig {
    /** Number of horizontal frames. */
    columns: number;
    /** Number of vertical frames. */
    rows: number;
    /** Total number of animation frames. */
    frameCount?: number;
    /** Playback speed in frames per second. */
    frameRate: number;
    /** Whether to loop the animation. */
    loop?: boolean;
    /** Play forward then backward. */
    pingPong?: boolean;
    /** Frame index to start playback. */
    startFrame?: number;
}

/**
 * Runtime state of a sprite animation.
 * @category World Building
 */
export interface SpriteAnimationState {
    /** Current active frame index. */
    currentFrame: number;
    /** Accumulated playback time. */
    elapsedTime: number;
    /** Whether animation is currently playing. */
    isPlaying: boolean;
    /** Current playback direction (1 for forward, -1 for backward). */
    direction: 1 | -1;
}

export class DecalProjector {
    private config: Required<DecalProjectorConfig>;
    private decals: Map<string, DecalInstance> = new Map();
    private nextId: number = 0;
    private projectorMatrix: THREE.Matrix4 = new THREE.Matrix4();
    private inverseProjectorMatrix: THREE.Matrix4 = new THREE.Matrix4();

    constructor(config: DecalProjectorConfig) {
        this.config = {
            size: config.size.clone(),
            depth: config.depth ?? 1.0,
            fadeTime: config.fadeTime ?? 5.0,
            maxDecals: config.maxDecals ?? 100,
        };
    }

    generateId(): string {
        return `decal_${this.nextId++}`;
    }

    project(
        targetGeometry: THREE.BufferGeometry,
        position: THREE.Vector3,
        normal: THREE.Vector3,
        texture: THREE.Texture,
        options: {
            scale?: number;
            rotation?: number;
            fadeTime?: number;
            material?: THREE.Material;
        } = {}
    ): DecalInstance | null {
        const scale = options.scale ?? 1.0;
        const rotationAngle = options.rotation ?? 0;
        const fadeTime = options.fadeTime ?? this.config.fadeTime;

        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.dot(up)) > 0.99) {
            up.set(0, 0, 1);
        }
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        const rotQuat = new THREE.Quaternion().setFromAxisAngle(normal, rotationAngle);
        quaternion.premultiply(rotQuat);

        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        const decalScale = new THREE.Vector3(
            this.config.size.x * scale,
            this.config.size.y * scale,
            this.config.depth
        );

        this.projectorMatrix.compose(position, quaternion, decalScale);
        this.inverseProjectorMatrix.copy(this.projectorMatrix).invert();

        const decalGeometry = this.clipGeometry(targetGeometry, position, decalScale);
        if (!decalGeometry) {
            return null;
        }

        const decalMaterial =
            options.material ||
            new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                polygonOffsetUnits: -4,
            });

        const mesh = new THREE.Mesh(decalGeometry, decalMaterial);

        const instance: DecalInstance = {
            id: this.generateId(),
            position: position.clone(),
            rotation: euler,
            scale: decalScale,
            opacity: 1.0,
            createdAt: Date.now(),
            fadeTime: fadeTime * 1000,
            mesh,
        };

        if (this.decals.size >= this.config.maxDecals) {
            const oldest = this.getOldestDecal();
            if (oldest) {
                this.removeDecal(oldest.id);
            }
        }

        this.decals.set(instance.id, instance);
        return instance;
    }

    private clipGeometry(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        size: THREE.Vector3
    ): THREE.BufferGeometry | null {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];

        const posAttr = geometry.getAttribute('position');
        const normAttr = geometry.getAttribute('normal');
        const indexAttr = geometry.getIndex();

        if (!posAttr) return null;

        const halfSize = size.clone().multiplyScalar(0.5);
        const tempPos = new THREE.Vector3();
        const tempNorm = new THREE.Vector3();

        // Determine triangle count based on whether geometry is indexed
        const triangleCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

        for (let tri = 0; tri < triangleCount; tri++) {
            const triPositions: THREE.Vector3[] = [];
            const triNormals: THREE.Vector3[] = [];
            let allInside = true;

            for (let j = 0; j < 3; j++) {
                // Get vertex index - use index buffer if available, otherwise sequential
                const vertexIndex = indexAttr ? indexAttr.getX(tri * 3 + j) : tri * 3 + j;

                tempPos.fromBufferAttribute(posAttr, vertexIndex);
                const localPos = tempPos.clone().sub(center);

                triPositions.push(tempPos.clone());

                if (normAttr) {
                    tempNorm.fromBufferAttribute(normAttr, vertexIndex);
                    triNormals.push(tempNorm.clone());
                }

                if (
                    Math.abs(localPos.x) > halfSize.x ||
                    Math.abs(localPos.y) > halfSize.y ||
                    Math.abs(localPos.z) > halfSize.z
                ) {
                    allInside = false;
                }
            }

            if (allInside) {
                for (let j = 0; j < 3; j++) {
                    const p = triPositions[j];
                    const localPos = p.clone().sub(center);

                    positions.push(p.x, p.y, p.z);

                    if (triNormals[j]) {
                        normals.push(triNormals[j].x, triNormals[j].y, triNormals[j].z);
                    }

                    uvs.push(localPos.x / size.x + 0.5, localPos.y / size.y + 0.5);
                }
            }
        }

        if (positions.length === 0) return null;

        const decalGeometry = new THREE.BufferGeometry();
        decalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (normals.length > 0) {
            decalGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        }
        decalGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        return decalGeometry;
    }

    update(_deltaTime: number): void {
        const now = Date.now();
        const toRemove: string[] = [];

        this.decals.forEach((decal, id) => {
            const age = now - decal.createdAt;
            const fadeStart = decal.fadeTime * 0.5;

            if (age > decal.fadeTime) {
                toRemove.push(id);
            } else if (age > fadeStart) {
                const fadeProgress = (age - fadeStart) / (decal.fadeTime - fadeStart);
                decal.opacity = 1.0 - fadeProgress;

                if (decal.mesh?.material) {
                    // Handle both single materials and material arrays
                    const materials = Array.isArray(decal.mesh.material)
                        ? decal.mesh.material
                        : [decal.mesh.material];
                    materials.forEach((mat) => {
                        // THREE.Material base class has opacity property
                        mat.opacity = decal.opacity;
                        mat.transparent = true;
                    });
                }
            }
        });

        for (const id of toRemove) {
            this.removeDecal(id);
        }
    }

    removeDecal(id: string): boolean {
        const decal = this.decals.get(id);
        if (decal) {
            if (decal.mesh) {
                decal.mesh.geometry.dispose();
                // Handle both single materials and material arrays
                const materials = Array.isArray(decal.mesh.material)
                    ? decal.mesh.material
                    : [decal.mesh.material];
                for (const mat of materials) {
                    mat.dispose();
                }
            }
            this.decals.delete(id);
            return true;
        }
        return false;
    }

    getDecal(id: string): DecalInstance | undefined {
        return this.decals.get(id);
    }

    getAllDecals(): DecalInstance[] {
        return Array.from(this.decals.values());
    }

    private getOldestDecal(): DecalInstance | null {
        let oldest: DecalInstance | null = null;
        let oldestTime = Infinity;

        for (const decal of this.decals.values()) {
            if (decal.createdAt < oldestTime) {
                oldestTime = decal.createdAt;
                oldest = decal;
            }
        }

        return oldest;
    }

    clear(): void {
        for (const decal of this.decals.values()) {
            if (decal.mesh) {
                decal.mesh.geometry.dispose();
                // Handle both single materials and material arrays
                const materials = Array.isArray(decal.mesh.material)
                    ? decal.mesh.material
                    : [decal.mesh.material];
                for (const mat of materials) {
                    mat.dispose();
                }
            }
        }
        this.decals.clear();
    }

    get count(): number {
        return this.decals.size;
    }
}

export function updateBillboardRotation(
    mesh: THREE.Object3D,
    camera: THREE.Camera,
    config: BillboardConfig = {}
): void {
    const { lockY = false, offset = new THREE.Vector3() } = config;

    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    worldPos.add(offset);

    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);

    if (lockY) {
        const lookTarget = new THREE.Vector3(cameraPos.x, worldPos.y, cameraPos.z);
        mesh.lookAt(lookTarget);
    } else {
        mesh.lookAt(cameraPos);
    }
}

export function createBillboardMatrix(
    position: THREE.Vector3,
    cameraPosition: THREE.Vector3,
    cameraQuaternion: THREE.Quaternion,
    lockY: boolean = false
): THREE.Matrix4 {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();

    if (lockY) {
        const direction = new THREE.Vector3()
            .subVectors(cameraPosition, position)
            .setY(0)
            .normalize();

        const angle = Math.atan2(direction.x, direction.z);
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    } else {
        quaternion.copy(cameraQuaternion);
    }

    matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));
    return matrix;
}

export function sortBillboardsByDepth(
    billboards: THREE.Object3D[],
    camera: THREE.Camera
): THREE.Object3D[] {
    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);

    const tempPos = new THREE.Vector3();
    const distances: { billboard: THREE.Object3D; distance: number }[] = billboards.map((b) => {
        b.getWorldPosition(tempPos);
        return {
            billboard: b,
            distance: tempPos.distanceToSquared(cameraPos),
        };
    });

    distances.sort((a, b) => b.distance - a.distance);

    return distances.map((d) => d.billboard);
}

export function createSpriteSheetAnimation(config: SpriteSheetConfig): SpriteAnimationState {
    return {
        currentFrame: config.startFrame ?? 0,
        elapsedTime: 0,
        isPlaying: true,
        direction: 1,
    };
}

export function updateSpriteSheetAnimation(
    state: SpriteAnimationState,
    config: SpriteSheetConfig,
    deltaTime: number
): SpriteAnimationState {
    if (!state.isPlaying) return state;

    const frameTime = 1 / config.frameRate;
    const totalFrames = config.frameCount ?? config.columns * config.rows;

    // Handle edge case: single frame animation
    if (totalFrames <= 1) {
        state.currentFrame = 0;
        return state;
    }

    state.elapsedTime += deltaTime;

    if (state.elapsedTime >= frameTime) {
        state.elapsedTime -= frameTime;
        state.currentFrame += state.direction;

        if (state.currentFrame >= totalFrames) {
            if (config.pingPong) {
                state.direction = -1;
                // Clamp to valid range for small frame counts
                state.currentFrame = Math.max(0, totalFrames - 2);
            } else if (config.loop !== false) {
                state.currentFrame = 0;
            } else {
                state.currentFrame = totalFrames - 1;
                state.isPlaying = false;
            }
        } else if (state.currentFrame < 0) {
            if (config.pingPong) {
                state.direction = 1;
                // Clamp to valid range for small frame counts
                state.currentFrame = Math.min(1, totalFrames - 1);
            } else {
                state.currentFrame = 0;
            }
        }
    }

    return state;
}

export function getSpriteSheetUVs(
    frame: number,
    config: SpriteSheetConfig
): { offsetX: number; offsetY: number; scaleX: number; scaleY: number } {
    const column = frame % config.columns;
    const row = Math.floor(frame / config.columns);

    const scaleX = 1 / config.columns;
    const scaleY = 1 / config.rows;
    const offsetX = column * scaleX;
    const offsetY = 1 - (row + 1) * scaleY;

    return { offsetX, offsetY, scaleX, scaleY };
}

export function applySpriteSheetFrame(
    texture: THREE.Texture,
    frame: number,
    config: SpriteSheetConfig
): void {
    const { offsetX, offsetY, scaleX, scaleY } = getSpriteSheetUVs(frame, config);

    texture.offset.set(offsetX, offsetY);
    texture.repeat.set(scaleX, scaleY);
}

export function createSpriteSheetMaterial(
    texture: THREE.Texture,
    config: SpriteSheetConfig,
    options: {
        transparent?: boolean;
        alphaTest?: number;
        depthWrite?: boolean;
        color?: THREE.Color;
    } = {}
): THREE.SpriteMaterial {
    const clonedTexture = texture.clone();
    clonedTexture.needsUpdate = true;

    clonedTexture.repeat.set(1 / config.columns, 1 / config.rows);

    const material = new THREE.SpriteMaterial({
        map: clonedTexture,
        transparent: options.transparent ?? true,
        alphaTest: options.alphaTest ?? 0.1,
        depthWrite: options.depthWrite ?? false,
        color: options.color ?? new THREE.Color(1, 1, 1),
    });

    return material;
}

export function createDecalTexture(
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.Texture | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    drawFn(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createBulletHoleTexture(size: number = 64): THREE.Texture | null {
    return createDecalTexture(size, size, (ctx, w, h) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.3, 'rgba(30, 30, 30, 0.9)');
        gradient.addColorStop(0.6, 'rgba(60, 60, 60, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    });
}

export function createBloodSplatterTexture(size: number = 128): THREE.Texture | null {
    return createDecalTexture(size, size, (ctx, w, h) => {
        const centerX = w / 2;
        const centerY = h / 2;

        ctx.fillStyle = 'rgba(139, 0, 0, 0.9)';

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
            const length = ((0.3 + Math.random() * 0.4) * Math.min(w, h)) / 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
            ctx.lineWidth = 3 + Math.random() * 5;
            ctx.strokeStyle = `rgba(139, 0, 0, ${0.6 + Math.random() * 0.4})`;
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            Math.min(w, h) / 4
        );
        gradient.addColorStop(0, 'rgba(139, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(100, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(80, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(w, h) / 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function createScorchMarkTexture(size: number = 128): THREE.Texture | null {
    return createDecalTexture(size, size, (ctx, w, h) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(20, 20, 20, 1)');
        gradient.addColorStop(0.3, 'rgba(40, 35, 30, 0.8)');
        gradient.addColorStop(0.6, 'rgba(60, 50, 40, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 2 + Math.random() * 5;

            ctx.fillStyle = `rgba(${Math.random() * 30}, ${Math.random() * 20}, 0, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

export function createFootprintTexture(size: number = 64): THREE.Texture | null {
    return createDecalTexture(size, size * 2, (ctx, w, h) => {
        ctx.fillStyle = 'rgba(50, 40, 30, 0.6)';

        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.3, w * 0.3, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        const toePositions = [
            { x: 0.25, y: 0.08, r: 0.08 },
            { x: 0.4, y: 0.05, r: 0.09 },
            { x: 0.55, y: 0.05, r: 0.09 },
            { x: 0.7, y: 0.08, r: 0.08 },
            { x: 0.82, y: 0.12, r: 0.06 },
        ];

        toePositions.forEach((toe) => {
            ctx.beginPath();
            ctx.ellipse(w * toe.x, h * toe.y, w * toe.r, w * toe.r, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.7, w * 0.2, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function createWaterPuddleTexture(size: number = 128): THREE.Texture | null {
    return createDecalTexture(size, size, (ctx, w, h) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(100, 150, 200, 0.6)');
        gradient.addColorStop(0.5, 'rgba(80, 130, 180, 0.4)');
        gradient.addColorStop(0.8, 'rgba(60, 110, 160, 0.2)');
        gradient.addColorStop(1, 'rgba(50, 100, 150, 0)');

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(centerX + radius * 0.8, centerY);

        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const wobble = 0.85 + Math.sin(angle * 5) * 0.15;
            const x = centerX + Math.cos(angle) * radius * wobble;
            const y = centerY + Math.sin(angle) * radius * wobble * 0.9;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const r = radius * (0.3 + i * 0.2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}
