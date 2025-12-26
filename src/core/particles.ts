/**
 * High-Performance GPU-Based Particle System.
 *
 * Provides specialized classes and types for rendering thousands of particles
 * using GPU instancing. Features customizable emission shapes, physics forces,
 * and time-based behavioral modifiers.
 *
 * @packageDocumentation
 * @module core/particles
 * @category Effects & Atmosphere
 */

import * as THREE from 'three';

/** Valid shapes for particle emission volumes. @category Effects & Atmosphere */
export type EmissionShape = 'point' | 'sphere' | 'cone' | 'box';

/**
 * Configuration for physics forces applied to particles.
 * @category Effects & Atmosphere
 */
export interface ParticleForces {
    /** Global gravity vector applied per frame. */
    gravity?: THREE.Vector3;
    /** Wind vector applied per frame. */
    wind?: THREE.Vector3;
    /** Magnitude of random turbulence. */
    turbulence?: number;
    /** Spatial scale of the turbulence noise. */
    turbulenceScale?: number;
    /** Temporal speed of the turbulence animation. */
    turbulenceSpeed?: number;
}

/**
 * Behavioral modifiers for particle lifecycle.
 * @category Effects & Atmosphere
 */
export interface ParticleBehavior {
    /** Time in seconds to fade from 0 to full opacity. */
    fadeIn?: number;
    /** Time in seconds to fade from full to 0 opacity before death. */
    fadeOut?: number;
    /** Whether particles shrink over their lifetime. */
    shrink?: boolean;
    /** Normalized age (0-1) at which shrinking begins. */
    shrinkStart?: number;
    /** Array of colors to interpolate through over lifetime. */
    colorGradient?: THREE.Color[];
    /** Normalized age stops (0-1) for color gradient interpolation. */
    colorGradientStops?: number[];
    /** Whether particles rotate over time. */
    spin?: boolean;
    /** Speed of rotation in radians per second. */
    spinSpeed?: number;
}

/**
 * Dimensions and configuration for emission shapes.
 * @category Effects & Atmosphere
 */
export interface EmitterShapeParams {
    /** Width for 'box' shape. */
    width?: number;
    /** Height for 'box' and 'cone' shapes. */
    height?: number;
    /** Depth for 'box' shape. */
    depth?: number;
    /** Radius for 'sphere' and 'cone' shapes. */
    radius?: number;
    /** Opening angle for 'cone' shape in radians. */
    angle?: number;
    /** Orientation vector for directional shapes. */
    direction?: THREE.Vector3;
}

/**
 * Complete configuration for a particle emitter.
 * @category Effects & Atmosphere
 */
export interface ParticleEmitterConfig {
    /** Maximum number of concurrent particles. */
    maxParticles?: number;
    /** Number of particles to spawn per second. */
    emissionRate?: number;
    /** Base particle lifetime in seconds. */
    lifetime?: number;
    /** Random variance applied to lifetime. */
    lifetimeVariance?: number;
    /** World position of the emitter. */
    position?: THREE.Vector3;
    /** Random variance applied to spawn position. */
    positionVariance?: THREE.Vector3;
    /** Initial velocity vector. */
    velocity?: THREE.Vector3;
    /** Random variance applied to initial velocity. */
    velocityVariance?: THREE.Vector3;
    /** Color at time of spawn. */
    startColor?: THREE.ColorRepresentation;
    /** Color at time of death (if no gradient is used). */
    endColor?: THREE.ColorRepresentation;
    /** Size at time of spawn. */
    startSize?: number;
    /** Size at time of death. */
    endSize?: number;
    /** Random variance applied to initial size. */
    sizeVariance?: number;
    /** Opacity at time of spawn (0-1). */
    startOpacity?: number;
    /** Opacity at time of death (0-1). */
    endOpacity?: number;
    /** Geometric volume for emission. */
    shape?: EmissionShape;
    /** Parameters for the selected emission shape. */
    shapeParams?: EmitterShapeParams;
    /** Physical forces applied to particles. */
    forces?: ParticleForces;
    /** Lifecycle behavioral modifiers. */
    behavior?: ParticleBehavior;
    /** Optional texture for particle sprites. */
    texture?: THREE.Texture;
    /** GPU blending mode. */
    blending?: THREE.Blending;
    /** Whether particles write to the depth buffer. */
    depthWrite?: boolean;
    /** Whether to sort particles by depth. */
    sortParticles?: boolean;
}

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    age: number;
    lifetime: number;
    startSize: number;
    rotation: number;
    rotationSpeed: number;
    colorIndex: number;
    active: boolean;
}

const particleVertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSizeStart;
    uniform float uSizeEnd;

    attribute float instanceAge;
    attribute float instanceLifetime;
    attribute float instanceSize;
    attribute float instanceRotation;
    attribute float instanceColorIndex;

    varying float vAge;
    varying float vLifetime;
    varying float vColorIndex;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vAge = instanceAge;
        vLifetime = instanceLifetime;
        vColorIndex = instanceColorIndex;

        float t = clamp(instanceAge / instanceLifetime, 0.0, 1.0);
        float size = mix(uSizeStart, uSizeEnd, t) * instanceSize;

        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

        float c = cos(instanceRotation);
        float s = sin(instanceRotation);
        vec2 rotatedPos = vec2(
            position.x * c - position.y * s,
            position.x * s + position.y * c
        );

        mvPosition.xy += rotatedPos * size;

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const particleFragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform bool uHasTexture;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uOpacityStart;
    uniform float uOpacityEnd;
    uniform vec3 uColorGradient[8];
    uniform float uColorGradientStops[8];
    uniform int uColorGradientCount;
    uniform float uFadeIn;
    uniform float uFadeOut;

    varying float vAge;
    varying float vLifetime;
    varying float vColorIndex;
    varying vec2 vUv;

    vec3 getGradientColor(float t) {
        if (uColorGradientCount <= 1) {
            return mix(uColorStart, uColorEnd, t);
        }

        for (int i = 0; i < 7; i++) {
            if (i + 1 >= uColorGradientCount) break;
            if (t >= uColorGradientStops[i] && t <= uColorGradientStops[i + 1]) {
                float localT = (t - uColorGradientStops[i]) / (uColorGradientStops[i + 1] - uColorGradientStops[i]);
                return mix(uColorGradient[i], uColorGradient[i + 1], localT);
            }
        }
        return uColorGradient[uColorGradientCount - 1];
    }

    void main() {
        float t = clamp(vAge / vLifetime, 0.0, 1.0);

        vec3 color = getGradientColor(t);
        float opacity = mix(uOpacityStart, uOpacityEnd, t);

        // Fade in/out
        if (t < uFadeIn && uFadeIn > 0.0) {
            opacity *= t / uFadeIn;
        }
        if (t > (1.0 - uFadeOut) && uFadeOut > 0.0) {
            opacity *= (1.0 - t) / uFadeOut;
        }

        if (uHasTexture) {
            vec4 texColor = texture2D(uTexture, vUv);
            color *= texColor.rgb;
            opacity *= texColor.a;
        } else {
            // Circular particle without texture
            float dist = length(vUv - 0.5) * 2.0;
            if (dist > 1.0) discard;
            opacity *= 1.0 - smoothstep(0.5, 1.0, dist);
        }

        gl_FragColor = vec4(color, opacity);
    }
`;

function noise3D(x: number, y: number, z: number): number {
    const p = Math.floor(x) + Math.floor(y) * 157 + Math.floor(z) * 113;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const fz = z - Math.floor(z);

    const hash = (n: number) => {
        const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
        return s - Math.floor(s);
    };

    const a = hash(p);
    const b = hash(p + 1);
    const c = hash(p + 157);
    const d = hash(p + 158);
    const e = hash(p + 113);
    const f = hash(p + 114);
    const g = hash(p + 270);
    const h = hash(p + 271);

    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const uz = fz * fz * (3 - 2 * fz);

    return (
        (a +
            (b - a) * ux +
            (c - a) * uy +
            (a - b - c + d) * ux * uy +
            (e - a) * uz +
            (a - b - e + f) * ux * uz +
            (a - c - e + g) * uy * uz +
            (-a + b + c - d + e - f - g + h) * ux * uy * uz) *
            2 -
        1
    );
}

/**
 * Core particle emitter class for GPU-based particle systems.
 * @category Effects & Atmosphere
 */
export class ParticleEmitterCore {
    public readonly mesh: THREE.InstancedMesh;
    public readonly material: THREE.ShaderMaterial;
    public readonly geometry: THREE.BufferGeometry;

    private config: Required<ParticleEmitterConfig>;
    private particles: Particle[] = [];
    private emitAccumulator = 0;
    private time = 0;

    private ageAttribute: THREE.InstancedBufferAttribute;
    private lifetimeAttribute: THREE.InstancedBufferAttribute;
    private sizeAttribute: THREE.InstancedBufferAttribute;
    private rotationAttribute: THREE.InstancedBufferAttribute;
    private colorIndexAttribute: THREE.InstancedBufferAttribute;

    private tempMatrix = new THREE.Matrix4();
    private tempPosition = new THREE.Vector3();
    private tempVelocity = new THREE.Vector3();

    // Cached group to avoid creating new group on each getter call
    private _group: THREE.Group | null = null;

    constructor(config: ParticleEmitterConfig = {}) {
        this.config = {
            maxParticles: config.maxParticles ?? 1000,
            emissionRate: config.emissionRate ?? 100,
            lifetime: config.lifetime ?? 2.0,
            lifetimeVariance: config.lifetimeVariance ?? 0.2,
            position: config.position ?? new THREE.Vector3(0, 0, 0),
            positionVariance: config.positionVariance ?? new THREE.Vector3(0, 0, 0),
            velocity: config.velocity ?? new THREE.Vector3(0, 1, 0),
            velocityVariance: config.velocityVariance ?? new THREE.Vector3(0.5, 0.5, 0.5),
            startColor: config.startColor ?? 0xffffff,
            endColor: config.endColor ?? 0xffffff,
            startSize: config.startSize ?? 0.1,
            endSize: config.endSize ?? 0.05,
            sizeVariance: config.sizeVariance ?? 0.2,
            startOpacity: config.startOpacity ?? 1.0,
            endOpacity: config.endOpacity ?? 0.0,
            shape: config.shape ?? 'point',
            shapeParams: config.shapeParams ?? {},
            forces: config.forces ?? {},
            behavior: config.behavior ?? {},
            texture: config.texture ?? (null as any),
            blending: config.blending ?? THREE.AdditiveBlending,
            depthWrite: config.depthWrite ?? false,
            sortParticles: config.sortParticles ?? false,
        };

        if (this.config.maxParticles <= 0) {
            throw new Error('ParticleEmitter: maxParticles must be positive');
        }
        if (this.config.lifetime <= 0) {
            throw new Error('ParticleEmitter: lifetime must be positive');
        }
        if (this.config.emissionRate < 0) {
            throw new Error('ParticleEmitter: emissionRate cannot be negative');
        }

        this.geometry = new THREE.PlaneGeometry(1, 1);

        const startColor = new THREE.Color(this.config.startColor);
        const endColor = new THREE.Color(this.config.endColor);

        const colorGradient = this.config.behavior.colorGradient || [startColor, endColor];
        const colorGradientStops =
            this.config.behavior.colorGradientStops ||
            colorGradient.map((_, i) => i / (colorGradient.length - 1));

        // Create individual Color instances to avoid shared references
        const gradientColors = Array.from({ length: 8 }, () => new THREE.Color(0, 0, 0));
        const gradientStops = new Array(8).fill(0);
        colorGradient.slice(0, 8).forEach((c, i) => {
            gradientColors[i] = c instanceof THREE.Color ? c : new THREE.Color(c);
            gradientStops[i] = colorGradientStops[i] ?? i / (colorGradient.length - 1);
        });

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: this.config.texture },
                uHasTexture: { value: !!this.config.texture },
                uColorStart: { value: startColor },
                uColorEnd: { value: endColor },
                uSizeStart: { value: this.config.startSize },
                uSizeEnd: { value: this.config.endSize },
                uOpacityStart: { value: this.config.startOpacity },
                uOpacityEnd: { value: this.config.endOpacity },
                uColorGradient: { value: gradientColors },
                uColorGradientStops: { value: gradientStops },
                uColorGradientCount: { value: colorGradient.length },
                uFadeIn: { value: this.config.behavior.fadeIn ?? 0 },
                uFadeOut: { value: this.config.behavior.fadeOut ?? 0 },
            },
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            depthWrite: this.config.depthWrite,
            blending: this.config.blending,
            side: THREE.DoubleSide,
        });

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.config.maxParticles);
        this.mesh.frustumCulled = false;
        this.mesh.count = 0;

        const maxP = this.config.maxParticles;
        this.ageAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxP), 1);
        this.lifetimeAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxP), 1);
        this.sizeAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxP), 1);
        this.rotationAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxP), 1);
        this.colorIndexAttribute = new THREE.InstancedBufferAttribute(new Float32Array(maxP), 1);

        this.geometry.setAttribute('instanceAge', this.ageAttribute);
        this.geometry.setAttribute('instanceLifetime', this.lifetimeAttribute);
        this.geometry.setAttribute('instanceSize', this.sizeAttribute);
        this.geometry.setAttribute('instanceRotation', this.rotationAttribute);
        this.geometry.setAttribute('instanceColorIndex', this.colorIndexAttribute);

        for (let i = 0; i < maxP; i++) {
            this.particles.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                age: 0,
                lifetime: 1,
                startSize: 1,
                rotation: 0,
                rotationSpeed: 0,
                colorIndex: 0,
                active: false,
            });
        }
    }

    private getEmitPosition(): THREE.Vector3 {
        const { shape, shapeParams } = this.config;
        this.tempPosition.set(0, 0, 0);

        switch (shape) {
            case 'point':
                break;

            case 'box': {
                const w = shapeParams.width ?? 1;
                const h = shapeParams.height ?? 1;
                const d = shapeParams.depth ?? 1;
                this.tempPosition.set(
                    (Math.random() - 0.5) * w,
                    (Math.random() - 0.5) * h,
                    (Math.random() - 0.5) * d
                );
                break;
            }

            case 'sphere': {
                const r = shapeParams.radius ?? 1;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                this.tempPosition.set(
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi)
                );
                break;
            }

            case 'cone': {
                const r = shapeParams.radius ?? 1;
                const _angle = shapeParams.angle ?? Math.PI / 4;
                const height = shapeParams.height ?? 1;

                const t = Math.random();
                const coneRadius = r * t;
                const theta = Math.random() * Math.PI * 2;

                this.tempPosition.set(
                    coneRadius * Math.cos(theta),
                    height * t,
                    coneRadius * Math.sin(theta)
                );

                const dir = shapeParams.direction ?? new THREE.Vector3(0, 1, 0);
                if (dir.y !== 1 || dir.x !== 0 || dir.z !== 0) {
                    const up = new THREE.Vector3(0, 1, 0);
                    const q = new THREE.Quaternion().setFromUnitVectors(
                        up,
                        dir.clone().normalize()
                    );
                    this.tempPosition.applyQuaternion(q);
                }
                break;
            }
        }

        this.tempPosition.add(this.config.position);
        this.tempPosition.add(
            new THREE.Vector3(
                (Math.random() - 0.5) * 2 * this.config.positionVariance.x,
                (Math.random() - 0.5) * 2 * this.config.positionVariance.y,
                (Math.random() - 0.5) * 2 * this.config.positionVariance.z
            )
        );

        return this.tempPosition.clone();
    }

    private getEmitVelocity(): THREE.Vector3 {
        const { velocity, velocityVariance, shape, shapeParams } = this.config;

        this.tempVelocity.copy(velocity);
        this.tempVelocity.add(
            new THREE.Vector3(
                (Math.random() - 0.5) * 2 * velocityVariance.x,
                (Math.random() - 0.5) * 2 * velocityVariance.y,
                (Math.random() - 0.5) * 2 * velocityVariance.z
            )
        );

        if (shape === 'cone') {
            const dir = shapeParams.direction ?? new THREE.Vector3(0, 1, 0);
            const angle = shapeParams.angle ?? Math.PI / 4;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * angle;

            const coneVel = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
            );

            if (dir.y !== 1 || dir.x !== 0 || dir.z !== 0) {
                const up = new THREE.Vector3(0, 1, 0);
                const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
                coneVel.applyQuaternion(q);
            }

            this.tempVelocity.copy(coneVel.multiplyScalar(velocity.length()));
        }

        return this.tempVelocity.clone();
    }

    private emitParticle(): boolean {
        const inactiveIndex = this.particles.findIndex((p) => !p.active);
        if (inactiveIndex === -1) return false;

        const particle = this.particles[inactiveIndex];
        particle.position.copy(this.getEmitPosition());
        particle.velocity.copy(this.getEmitVelocity());
        particle.age = 0;
        particle.lifetime =
            this.config.lifetime * (1 + (Math.random() - 0.5) * 2 * this.config.lifetimeVariance);
        particle.startSize = 1 + (Math.random() - 0.5) * 2 * this.config.sizeVariance;
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = this.config.behavior.spin
            ? (this.config.behavior.spinSpeed ?? 1) * (Math.random() - 0.5) * 2
            : 0;
        particle.colorIndex = Math.random();
        particle.active = true;

        return true;
    }

    update(deltaTime: number): void {
        this.time += deltaTime;
        this.material.uniforms.uTime.value = this.time;

        const { forces, behavior } = this.config;
        const gravity = forces.gravity ?? new THREE.Vector3(0, 0, 0);
        const wind = forces.wind ?? new THREE.Vector3(0, 0, 0);
        const turbulence = forces.turbulence ?? 0;
        const turbulenceScale = forces.turbulenceScale ?? 1;
        const turbulenceSpeed = forces.turbulenceSpeed ?? 1;

        this.emitAccumulator += this.config.emissionRate * deltaTime;
        while (this.emitAccumulator >= 1) {
            if (!this.emitParticle()) break;
            this.emitAccumulator -= 1;
        }

        let visibleCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (!particle.active) continue;

            particle.age += deltaTime;

            if (particle.age >= particle.lifetime) {
                particle.active = false;
                continue;
            }

            particle.velocity.add(gravity.clone().multiplyScalar(deltaTime));
            particle.velocity.add(wind.clone().multiplyScalar(deltaTime));

            if (turbulence > 0) {
                const nx = noise3D(
                    particle.position.x * turbulenceScale,
                    particle.position.y * turbulenceScale,
                    this.time * turbulenceSpeed
                );
                const ny = noise3D(
                    particle.position.y * turbulenceScale,
                    particle.position.z * turbulenceScale,
                    this.time * turbulenceSpeed + 100
                );
                const nz = noise3D(
                    particle.position.z * turbulenceScale,
                    particle.position.x * turbulenceScale,
                    this.time * turbulenceSpeed + 200
                );
                particle.velocity.add(
                    new THREE.Vector3(nx, ny, nz).multiplyScalar(turbulence * deltaTime)
                );
            }

            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.rotation += particle.rotationSpeed * deltaTime;

            this.tempMatrix.makeRotationZ(particle.rotation);
            this.tempMatrix.setPosition(particle.position);
            this.mesh.setMatrixAt(visibleCount, this.tempMatrix);

            this.ageAttribute.setX(visibleCount, particle.age);
            this.lifetimeAttribute.setX(visibleCount, particle.lifetime);
            this.sizeAttribute.setX(visibleCount, particle.startSize);
            this.rotationAttribute.setX(visibleCount, particle.rotation);
            this.colorIndexAttribute.setX(visibleCount, particle.colorIndex);

            visibleCount++;
        }

        this.mesh.count = visibleCount;
        this.mesh.instanceMatrix.needsUpdate = true;
        this.ageAttribute.needsUpdate = true;
        this.lifetimeAttribute.needsUpdate = true;
        this.sizeAttribute.needsUpdate = true;
        this.rotationAttribute.needsUpdate = true;
        this.colorIndexAttribute.needsUpdate = true;
    }

    emit(count: number): void {
        for (let i = 0; i < count; i++) {
            if (!this.emitParticle()) break;
        }
    }

    burst(count: number): void {
        this.emit(count);
    }

    reset(): void {
        for (const particle of this.particles) {
            particle.active = false;
        }
        this.mesh.count = 0;
        this.emitAccumulator = 0;
    }

    setPosition(position: THREE.Vector3): void {
        this.config.position.copy(position);
    }

    setEmissionRate(rate: number): void {
        this.config.emissionRate = rate;
    }

    dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
        if (this.config.texture) {
            this.config.texture.dispose();
        }
    }

    get group(): THREE.Group {
        // Return cached group to avoid reparenting mesh on each access
        if (!this._group) {
            this._group = new THREE.Group();
            this._group.add(this.mesh);
        }
        return this._group;
    }

    get activeParticleCount(): number {
        return this.particles.filter((p) => p.active).length;
    }
}

/**
 * Factory function to create a new particle emitter.
 * @param config - Optional configuration for the emitter
 * @returns A new ParticleEmitterCore instance
 * @category Effects & Atmosphere
 */
export function createParticleEmitter(config?: ParticleEmitterConfig): ParticleEmitterCore {
    return new ParticleEmitterCore(config);
}

/**
 * @deprecated Use `ParticleEmitterCore` instead. This alias will be removed in v2.0.
 * @category Effects & Atmosphere
 */
export { ParticleEmitterCore as ParticleEmitter };

/**
 * Type alias for backwards compatibility.
 * @deprecated Use `ParticleEmitterCore` instead.
 */
export type ParticleEmitterType = ParticleEmitterCore;
