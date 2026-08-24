/**
 * GPU-instanced particle emitter.
 *
 * Owns the renderer-bound half of the particle system: the instanced mesh, the
 * shader material, the per-instance attribute buffers, and the per-frame
 * simulation loop that writes into them. Emission-volume sampling lives in
 * `./emission` and turbulence noise in `./noise`.
 *
 * @packageDocumentation
 * @module core/particles/emitter
 * @category Effects & Atmosphere
 */

import * as THREE from 'three';
import { gameRandom } from '../shared/random';
import { computeEmitPosition, computeEmitVelocity } from './emission';
import { noise3D } from './noise';
import { MAX_GRADIENT_STOPS, particleFragmentShader, particleVertexShader } from './shaders';
import type { Particle, ParticleEmitterConfig } from './types';

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
      texture: config.texture ?? (null as unknown as THREE.Texture),
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
    const gradientColors = Array.from(
      { length: MAX_GRADIENT_STOPS },
      () => new THREE.Color(0, 0, 0)
    );
    const gradientStops = new Array(MAX_GRADIENT_STOPS).fill(0);
    colorGradient.slice(0, MAX_GRADIENT_STOPS).forEach((c, i) => {
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
    return computeEmitPosition({
      shape: this.config.shape,
      shapeParams: this.config.shapeParams,
      position: this.config.position,
      positionVariance: this.config.positionVariance,
    });
  }

  private getEmitVelocity(): THREE.Vector3 {
    return computeEmitVelocity({
      velocity: this.config.velocity,
      velocityVariance: this.config.velocityVariance,
      shape: this.config.shape,
      shapeParams: this.config.shapeParams,
    });
  }

  private emitParticle(): boolean {
    const inactiveIndex = this.particles.findIndex((p) => !p.active);
    if (inactiveIndex === -1) return false;

    const particle = this.particles[inactiveIndex];
    particle.position.copy(this.getEmitPosition());
    particle.velocity.copy(this.getEmitVelocity());
    particle.age = 0;
    particle.lifetime =
      this.config.lifetime * (1 + (gameRandom() - 0.5) * 2 * this.config.lifetimeVariance);
    particle.startSize = 1 + (gameRandom() - 0.5) * 2 * this.config.sizeVariance;
    particle.rotation = gameRandom() * Math.PI * 2;
    particle.rotationSpeed = this.config.behavior.spin
      ? (this.config.behavior.spinSpeed ?? 1) * (gameRandom() - 0.5) * 2
      : 0;
    particle.colorIndex = gameRandom();
    particle.active = true;

    return true;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.uTime.value = this.time;

    const { forces } = this.config;
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
        particle.velocity.add(new THREE.Vector3(nx, ny, nz).multiplyScalar(turbulence * deltaTime));
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
