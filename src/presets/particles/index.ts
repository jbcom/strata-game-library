/**
 * Particle System Preset - GPU-accelerated particle effects
 *
 * Provides particle systems for fire, smoke, explosions, magic effects,
 * sparks, debris, and other visual effects.
 */

import * as THREE from 'three';
import {
    createParticleEmitter,
    type EmissionShape,
    type EmitterShapeParams,
    type ParticleBehavior,
    ParticleEmitter,
    type ParticleEmitterConfig,
    type ParticleForces,
} from '../../core/particles';

// Core exports are now available from '@jbcom/strata' or '@jbcom/strata/core'
// @deprecated Import ParticleEmitter, createParticleEmitter from '@jbcom/strata' instead
// Re-exporting for backwards compatibility - will be removed in v2.0
export { ParticleEmitter, createParticleEmitter };
export type {
    ParticleEmitterConfig,
    EmissionShape,
    ParticleForces,
    ParticleBehavior,
    EmitterShapeParams,
};

export interface ParticleEmitterOptions {
    maxParticles?: number;
    lifetime?: number;
    rate?: number;
    shape?: 'point' | 'box' | 'sphere' | 'cone';
    shapeParams?: {
        width?: number;
        height?: number;
        depth?: number;
        radius?: number;
        angle?: number;
    };
    velocity?: {
        min: THREE.Vector3;
        max: THREE.Vector3;
    };
    acceleration?: THREE.Vector3;
    color?: {
        start: THREE.Color;
        end: THREE.Color;
    };
    size?: {
        start: number;
        end: number;
    };
    opacity?: {
        start: number;
        end: number;
    };
    rotation?: {
        min: number;
        max: number;
    };
    texture?: THREE.Texture;
    blending?: THREE.Blending;
}

export interface ParticleSystem {
    group: THREE.Group;
    update: (deltaTime: number) => void;
    dispose: () => void;
}

export function createParticleSystem(options: ParticleEmitterOptions = {}): ParticleSystem {
    const {
        maxParticles = 1000,
        lifetime = 2.0,
        rate = 100,
        shape = 'point',
        velocity = {
            min: new THREE.Vector3(-1, 1, -1),
            max: new THREE.Vector3(1, 3, 1),
        },
        acceleration = new THREE.Vector3(0, -9.8, 0),
        color = {
            start: new THREE.Color(1, 1, 1),
            end: new THREE.Color(1, 0, 0),
        },
        size = { start: 0.1, end: 0.05 },
        opacity = { start: 1.0, end: 0.0 },
        texture,
        blending = THREE.AdditiveBlending,
    } = options;

    if (maxParticles <= 0) {
        throw new Error('createParticleSystem: maxParticles must be positive');
    }
    if (lifetime <= 0) {
        throw new Error('createParticleSystem: lifetime must be positive');
    }
    if (rate <= 0) {
        throw new Error('createParticleSystem: rate must be positive');
    }

    const group = new THREE.Group();

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uTexture: { value: texture || null },
            uColorStart: { value: color.start },
            uColorEnd: { value: color.end },
            uSizeStart: { value: size.start },
            uSizeEnd: { value: size.end },
            uOpacityStart: { value: opacity.start },
            uOpacityEnd: { value: opacity.end },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, maxParticles);
    mesh.frustumCulled = false;
    group.add(mesh);

    const particles: Array<{
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        age: number;
        lifetime: number;
        size: number;
        rotation: number;
        rotationSpeed: number;
    }> = [];

    let emitAccumulator = 0;

    const update = (deltaTime: number) => {
        material.uniforms.uTime.value += deltaTime;

        emitAccumulator += rate * deltaTime;
        while (emitAccumulator >= 1 && particles.length < maxParticles) {
            emitParticle();
            emitAccumulator -= 1;
        }

        const matrix = new THREE.Matrix4();
        let visibleCount = 0;

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.age += deltaTime;
            particle.rotation += particle.rotationSpeed * deltaTime;

            if (particle.age >= particle.lifetime) {
                particles.splice(i, 1);
                continue;
            }

            particle.velocity.add(acceleration.clone().multiplyScalar(deltaTime));
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            matrix.makeRotationZ(particle.rotation);
            matrix.scale(new THREE.Vector3(particle.size, particle.size, 1));
            matrix.setPosition(particle.position);
            mesh.setMatrixAt(visibleCount, matrix);
            visibleCount++;
        }

        mesh.instanceMatrix.needsUpdate = true;
        mesh.count = visibleCount;
    };

    const emitParticle = () => {
        const position = getEmitPosition(shape, options.shapeParams);
        const vel = new THREE.Vector3(
            THREE.MathUtils.randFloat(velocity.min.x, velocity.max.x),
            THREE.MathUtils.randFloat(velocity.min.y, velocity.max.y),
            THREE.MathUtils.randFloat(velocity.min.z, velocity.max.z)
        );

        particles.push({
            position: position.clone(),
            velocity: vel,
            age: 0,
            lifetime: lifetime * THREE.MathUtils.randFloat(0.8, 1.2),
            size: THREE.MathUtils.randFloat(size.start * 0.8, size.start * 1.2),
            rotation: THREE.MathUtils.randFloat(0, Math.PI * 2),
            rotationSpeed: THREE.MathUtils.randFloat(-2, 2),
        });
    };

    const getEmitPosition = (
        shape: string,
        params?: ParticleEmitterOptions['shapeParams']
    ): THREE.Vector3 => {
        switch (shape) {
            case 'point':
                return new THREE.Vector3(0, 0, 0);
            case 'box':
                return new THREE.Vector3(
                    THREE.MathUtils.randFloat(-(params?.width || 1) / 2, (params?.width || 1) / 2),
                    THREE.MathUtils.randFloat(
                        -(params?.height || 1) / 2,
                        (params?.height || 1) / 2
                    ),
                    THREE.MathUtils.randFloat(-(params?.depth || 1) / 2, (params?.depth || 1) / 2)
                );
            case 'sphere': {
                const radius = params?.radius || 1;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                return new THREE.Vector3(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                );
            }
            case 'cone': {
                const radius = params?.radius || 1;
                const angle = params?.angle || Math.PI / 4;
                const height = params?.height || 1;
                const t = Math.random();
                // Use angle to calculate cone radius based on height
                const coneRadius = Math.tan(angle) * height * t;
                const theta = Math.random() * Math.PI * 2;
                return new THREE.Vector3(
                    Math.min(coneRadius, radius) * Math.cos(theta),
                    height * t,
                    Math.min(coneRadius, radius) * Math.sin(theta)
                );
            }
            default:
                return new THREE.Vector3(0, 0, 0);
        }
    };

    const dispose = () => {
        geometry.dispose();
        material.dispose();
        if (texture) texture.dispose();
        group.remove(mesh);
    };

    return { group, update, dispose };
}

const particleVertexShader = /* glsl */ `
  attribute vec3 instancePosition;
  attribute float instanceAge;
  attribute float instanceLifetime;
  attribute float instanceSize;
  attribute float instanceRotation;

  uniform float uTime;
  uniform float uSizeStart;
  uniform float uSizeEnd;

  varying float vAge;
  varying float vLifetime;
  varying vec2 vUv;

  void main() {
      vUv = uv;
      vAge = instanceAge;
      vLifetime = instanceLifetime;

      float t = instanceAge / instanceLifetime;
      float size = mix(uSizeStart, uSizeEnd, t);

      vec3 pos = position * size;

      float c = cos(instanceRotation);
      float s = sin(instanceRotation);
      pos.xy = vec2(
          pos.x * c - pos.y * s,
          pos.x * s + pos.y * c
      );

      pos += instancePosition;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const particleFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;
  uniform float uOpacityStart;
  uniform float uOpacityEnd;

  varying float vAge;
  varying float vLifetime;
  varying vec2 vUv;

  void main() {
      float t = vAge / vLifetime;

      vec3 color = mix(uColorStart, uColorEnd, t);
      float opacity = mix(uOpacityStart, uOpacityEnd, t);

      vec4 texColor = texture2D(uTexture, vUv);
      color *= texColor.rgb;
      opacity *= texColor.a;

      gl_FragColor = vec4(color, opacity);
  }
`;

export interface ParticlePreset extends ParticleEmitterConfig {
    name: string;
    description?: string;
}

export const firePreset: ParticlePreset = {
    name: 'fire',
    description: 'Realistic fire effect with flickering flames',
    maxParticles: 500,
    emissionRate: 80,
    lifetime: 1.5,
    lifetimeVariance: 0.3,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 2, 0),
    velocityVariance: new THREE.Vector3(0.5, 0.5, 0.5),
    startColor: 0xffaa00,
    endColor: 0xff2200,
    startSize: 0.3,
    endSize: 0.05,
    startOpacity: 1.0,
    endOpacity: 0.0,
    shape: 'cone',
    shapeParams: {
        radius: 0.5,
        angle: Math.PI / 6,
        height: 0.2,
    },
    forces: {
        gravity: new THREE.Vector3(0, 0.5, 0),
        turbulence: 2.0,
        turbulenceScale: 2.0,
        turbulenceSpeed: 3.0,
    },
    behavior: {
        fadeOut: 0.3,
        colorGradient: [
            new THREE.Color(0xffffff),
            new THREE.Color(0xffff00),
            new THREE.Color(0xff8800),
            new THREE.Color(0xff2200),
            new THREE.Color(0x330000),
        ],
        colorGradientStops: [0, 0.1, 0.3, 0.6, 1.0],
    },
    blending: THREE.AdditiveBlending,
};

export const smokePreset: ParticlePreset = {
    name: 'smoke',
    description: 'Billowing smoke effect',
    maxParticles: 300,
    emissionRate: 30,
    lifetime: 4.0,
    lifetimeVariance: 0.4,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 1.5, 0),
    velocityVariance: new THREE.Vector3(0.8, 0.3, 0.8),
    startColor: 0x444444,
    endColor: 0x888888,
    startSize: 0.2,
    endSize: 1.5,
    startOpacity: 0.6,
    endOpacity: 0.0,
    shape: 'sphere',
    shapeParams: {
        radius: 0.3,
    },
    forces: {
        gravity: new THREE.Vector3(0, 0.3, 0),
        wind: new THREE.Vector3(0.5, 0, 0),
        turbulence: 1.5,
        turbulenceScale: 0.5,
        turbulenceSpeed: 0.5,
    },
    behavior: {
        fadeIn: 0.1,
        fadeOut: 0.5,
        spin: true,
        spinSpeed: 0.5,
    },
    blending: THREE.NormalBlending,
    depthWrite: false,
};

export const sparksPreset: ParticlePreset = {
    name: 'sparks',
    description: 'Flying sparks and embers',
    maxParticles: 200,
    emissionRate: 50,
    lifetime: 2.0,
    lifetimeVariance: 0.5,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 5, 0),
    velocityVariance: new THREE.Vector3(3, 2, 3),
    startColor: 0xffcc00,
    endColor: 0xff4400,
    startSize: 0.05,
    endSize: 0.02,
    startOpacity: 1.0,
    endOpacity: 0.0,
    shape: 'point',
    forces: {
        gravity: new THREE.Vector3(0, -9.8, 0),
        turbulence: 0.5,
        turbulenceScale: 1.0,
        turbulenceSpeed: 2.0,
    },
    behavior: {
        fadeOut: 0.2,
        colorGradient: [
            new THREE.Color(0xffffff),
            new THREE.Color(0xffcc00),
            new THREE.Color(0xff6600),
            new THREE.Color(0xff2200),
        ],
        colorGradientStops: [0, 0.2, 0.5, 1.0],
    },
    blending: THREE.AdditiveBlending,
};

export const magicPreset: ParticlePreset = {
    name: 'magic',
    description: 'Magical sparkle and shimmer effect',
    maxParticles: 400,
    emissionRate: 60,
    lifetime: 2.5,
    lifetimeVariance: 0.4,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0.5, 0),
    velocityVariance: new THREE.Vector3(1, 1, 1),
    startColor: 0x8844ff,
    endColor: 0x00ffff,
    startSize: 0.15,
    endSize: 0.02,
    startOpacity: 1.0,
    endOpacity: 0.0,
    shape: 'sphere',
    shapeParams: {
        radius: 1.0,
    },
    forces: {
        gravity: new THREE.Vector3(0, 0.2, 0),
        turbulence: 2.0,
        turbulenceScale: 1.5,
        turbulenceSpeed: 1.0,
    },
    behavior: {
        fadeIn: 0.1,
        fadeOut: 0.3,
        spin: true,
        spinSpeed: 2.0,
        colorGradient: [
            new THREE.Color(0xffffff),
            new THREE.Color(0x8844ff),
            new THREE.Color(0x4488ff),
            new THREE.Color(0x00ffff),
        ],
        colorGradientStops: [0, 0.3, 0.6, 1.0],
    },
    blending: THREE.AdditiveBlending,
};

export const sparklePreset = magicPreset;

export const explosionPreset: ParticlePreset = {
    name: 'explosion',
    description: 'Explosive burst effect',
    maxParticles: 300,
    emissionRate: 0,
    lifetime: 1.5,
    lifetimeVariance: 0.3,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    velocityVariance: new THREE.Vector3(10, 10, 10),
    startColor: 0xffaa00,
    endColor: 0x330000,
    startSize: 0.5,
    endSize: 0.1,
    startOpacity: 1.0,
    endOpacity: 0.0,
    shape: 'sphere',
    shapeParams: {
        radius: 0.5,
    },
    forces: {
        gravity: new THREE.Vector3(0, -5, 0),
        turbulence: 1.0,
        turbulenceScale: 2.0,
        turbulenceSpeed: 2.0,
    },
    behavior: {
        fadeOut: 0.4,
        shrink: true,
        shrinkStart: 0.3,
        colorGradient: [
            new THREE.Color(0xffffff),
            new THREE.Color(0xffff00),
            new THREE.Color(0xff8800),
            new THREE.Color(0xff2200),
            new THREE.Color(0x330000),
        ],
        colorGradientStops: [0, 0.1, 0.25, 0.5, 1.0],
    },
    blending: THREE.AdditiveBlending,
};

export function createFireEffect(position?: THREE.Vector3): ParticleEmitter {
    const config = { ...firePreset };
    if (position) config.position = position;
    return new ParticleEmitter(config);
}

export function createSmokeEffect(position?: THREE.Vector3): ParticleEmitter {
    const config = { ...smokePreset };
    if (position) config.position = position;
    return new ParticleEmitter(config);
}

export function createSparksEffect(position?: THREE.Vector3): ParticleEmitter {
    const config = { ...sparksPreset };
    if (position) config.position = position;
    return new ParticleEmitter(config);
}

export function createMagicEffect(position?: THREE.Vector3): ParticleEmitter {
    const config = { ...magicPreset };
    if (position) config.position = position;
    return new ParticleEmitter(config);
}

export function createExplosionEffect(
    position?: THREE.Vector3,
    burstCount: number = 200
): ParticleEmitter {
    const config = { ...explosionPreset };
    if (position) config.position = position;
    const emitter = new ParticleEmitter(config);
    // Check if burst method exists before calling
    if (typeof emitter.burst === 'function') {
        emitter.burst(burstCount);
    }
    return emitter;
}

export const particlePresets = {
    fire: firePreset,
    smoke: smokePreset,
    sparks: sparksPreset,
    magic: magicPreset,
    sparkle: sparklePreset,
    explosion: explosionPreset,
};

export function createFromPreset(
    presetName: keyof typeof particlePresets,
    overrides?: Partial<ParticleEmitterConfig>
): ParticleEmitter {
    const preset = particlePresets[presetName];
    if (!preset) {
        throw new Error(`Unknown particle preset: ${presetName}`);
    }
    const config = { ...preset, ...overrides };
    return new ParticleEmitter(config);
}
