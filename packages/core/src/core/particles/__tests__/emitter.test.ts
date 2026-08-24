import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createParticleEmitter, ParticleEmitterCore } from '../emitter';

describe('ParticleEmitterCore', () => {
  describe('construction', () => {
    it('builds with all defaults', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.mesh).toBeInstanceOf(THREE.InstancedMesh);
      expect(emitter.material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(emitter.geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(emitter.mesh.count).toBe(0);
      emitter.dispose();
    });

    it('sizes the instanced mesh to maxParticles', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 37 });
      expect(emitter.mesh.instanceMatrix.count).toBe(37);
      emitter.dispose();
    });

    it('allocates one slot per particle in every instance attribute', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 12 });
      for (const name of [
        'instanceAge',
        'instanceLifetime',
        'instanceSize',
        'instanceRotation',
        'instanceColorIndex',
      ]) {
        expect(emitter.geometry.getAttribute(name).count).toBe(12);
      }
      emitter.dispose();
    });

    it('disables frustum culling so particles are not wrongly dropped', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.mesh.frustumCulled).toBe(false);
      emitter.dispose();
    });

    it('rejects a non-positive maxParticles', () => {
      expect(() => new ParticleEmitterCore({ maxParticles: 0 })).toThrow(
        /maxParticles must be positive/
      );
      expect(() => new ParticleEmitterCore({ maxParticles: -5 })).toThrow(
        /maxParticles must be positive/
      );
    });

    it('rejects a non-positive lifetime', () => {
      expect(() => new ParticleEmitterCore({ lifetime: 0 })).toThrow(/lifetime must be positive/);
      expect(() => new ParticleEmitterCore({ lifetime: -1 })).toThrow(/lifetime must be positive/);
    });

    it('rejects a negative emission rate but allows zero', () => {
      expect(() => new ParticleEmitterCore({ emissionRate: -1 })).toThrow(
        /emissionRate cannot be negative/
      );
      const emitter = new ParticleEmitterCore({ emissionRate: 0 });
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });

    it('marks the material as having no texture when none is supplied', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.material.uniforms.uHasTexture.value).toBe(false);
      emitter.dispose();
    });

    it('honours blending and depthWrite configuration', () => {
      const emitter = new ParticleEmitterCore({
        blending: THREE.NormalBlending,
        depthWrite: true,
      });
      expect(emitter.material.blending).toBe(THREE.NormalBlending);
      expect(emitter.material.depthWrite).toBe(true);
      emitter.dispose();
    });

    it('pads the gradient uniforms to the fixed shader array length', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.material.uniforms.uColorGradient.value).toHaveLength(8);
      expect(emitter.material.uniforms.uColorGradientStops.value).toHaveLength(8);
      emitter.dispose();
    });

    it('gives every gradient slot its own Color instance', () => {
      const emitter = new ParticleEmitterCore();
      const colors = emitter.material.uniforms.uColorGradient.value as THREE.Color[];
      expect(new Set(colors).size).toBe(colors.length);
      emitter.dispose();
    });

    it('uses the supplied colour gradient and reports its length', () => {
      const gradient = [
        new THREE.Color(1, 0, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(0, 0, 1),
      ];
      const emitter = new ParticleEmitterCore({ behavior: { colorGradient: gradient } });
      expect(emitter.material.uniforms.uColorGradientCount.value).toBe(3);
      const colors = emitter.material.uniforms.uColorGradient.value as THREE.Color[];
      expect(colors[0].getHex()).toBe(0xff0000);
      expect(colors[2].getHex()).toBe(0x0000ff);
      emitter.dispose();
    });

    it('evenly spaces gradient stops when none are given', () => {
      const gradient = [new THREE.Color(1, 0, 0), new THREE.Color(0, 0, 1)];
      const emitter = new ParticleEmitterCore({ behavior: { colorGradient: gradient } });
      const stops = emitter.material.uniforms.uColorGradientStops.value as number[];
      expect(stops[0]).toBeCloseTo(0);
      expect(stops[1]).toBeCloseTo(1);
      emitter.dispose();
    });

    it('truncates a gradient longer than the shader array', () => {
      const gradient = Array.from({ length: 12 }, () => new THREE.Color(1, 1, 1));
      const emitter = new ParticleEmitterCore({ behavior: { colorGradient: gradient } });
      expect(emitter.material.uniforms.uColorGradient.value).toHaveLength(8);
      emitter.dispose();
    });

    it('passes fade timings through to the material', () => {
      const emitter = new ParticleEmitterCore({ behavior: { fadeIn: 0.25, fadeOut: 0.4 } });
      expect(emitter.material.uniforms.uFadeIn.value).toBe(0.25);
      expect(emitter.material.uniforms.uFadeOut.value).toBe(0.4);
      emitter.dispose();
    });

    it('defaults fade timings to zero', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.material.uniforms.uFadeIn.value).toBe(0);
      expect(emitter.material.uniforms.uFadeOut.value).toBe(0);
      emitter.dispose();
    });
  });

  describe('emit and burst', () => {
    it('activates the requested number of particles', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 0 });
      emitter.emit(10);
      expect(emitter.activeParticleCount).toBe(10);
      emitter.dispose();
    });

    it('caps activation at maxParticles instead of overflowing', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 5, emissionRate: 0 });
      emitter.emit(50);
      expect(emitter.activeParticleCount).toBe(5);
      emitter.dispose();
    });

    it('treats burst as an alias of emit', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 20, emissionRate: 0 });
      emitter.burst(7);
      expect(emitter.activeParticleCount).toBe(7);
      emitter.dispose();
    });

    it('does nothing for a zero or negative count', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 20, emissionRate: 0 });
      emitter.emit(0);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.emit(-5);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });

    it('accumulates across successive emit calls', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 20, emissionRate: 0 });
      emitter.emit(3);
      emitter.emit(4);
      expect(emitter.activeParticleCount).toBe(7);
      emitter.dispose();
    });
  });

  describe('update', () => {
    it('spawns particles at the configured emission rate', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 10 });
      emitter.update(1);
      expect(emitter.activeParticleCount).toBe(10);
      emitter.dispose();
    });

    it('accumulates fractional emissions across frames', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 10 });
      // 0.05s at 10/s is half a particle — not enough on its own.
      emitter.update(0.05);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.update(0.05);
      expect(emitter.activeParticleCount).toBe(1);
      emitter.dispose();
    });

    it('emits nothing at a zero emission rate', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 0 });
      emitter.update(1);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });

    it('publishes the visible count onto the mesh', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 0 });
      emitter.emit(6);
      emitter.update(0.016);
      expect(emitter.mesh.count).toBe(6);
      emitter.dispose();
    });

    it('retires particles once they exceed their lifetime', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 50,
        emissionRate: 0,
        lifetime: 1,
        lifetimeVariance: 0,
      });
      emitter.emit(5);
      expect(emitter.activeParticleCount).toBe(5);
      emitter.update(1.5);
      expect(emitter.activeParticleCount).toBe(0);
      expect(emitter.mesh.count).toBe(0);
      emitter.dispose();
    });

    it('keeps particles alive before their lifetime elapses', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 50,
        emissionRate: 0,
        lifetime: 10,
        lifetimeVariance: 0,
      });
      emitter.emit(5);
      emitter.update(0.1);
      expect(emitter.activeParticleCount).toBe(5);
      emitter.dispose();
    });

    it('advances the time uniform by the accumulated delta', () => {
      const emitter = new ParticleEmitterCore({ emissionRate: 0 });
      emitter.update(0.5);
      emitter.update(0.25);
      expect(emitter.material.uniforms.uTime.value).toBeCloseTo(0.75);
      emitter.dispose();
    });

    it('flags the instance buffers for upload', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 10, emissionRate: 0 });
      emitter.emit(2);
      // `needsUpdate` is a write-only setter in three that bumps `version`,
      // so the version counter is the observable evidence of an upload flag.
      const ageAttribute = emitter.geometry.getAttribute('instanceAge') as THREE.BufferAttribute;
      const matrixVersion = emitter.mesh.instanceMatrix.version;
      const ageVersion = ageAttribute.version;
      emitter.update(0.016);
      expect(emitter.mesh.instanceMatrix.version).toBeGreaterThan(matrixVersion);
      expect(ageAttribute.version).toBeGreaterThan(ageVersion);
      emitter.dispose();
    });

    it('handles a zero delta without advancing or spawning', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 10, emissionRate: 100 });
      emitter.update(0);
      expect(emitter.activeParticleCount).toBe(0);
      expect(emitter.material.uniforms.uTime.value).toBe(0);
      emitter.dispose();
    });

    it('survives a very large delta by retiring everything', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 10,
        emissionRate: 5,
        lifetime: 1,
        lifetimeVariance: 0,
      });
      emitter.update(1000);
      expect(emitter.activeParticleCount).toBeLessThanOrEqual(10);
      expect(Number.isFinite(emitter.material.uniforms.uTime.value)).toBe(true);
      emitter.dispose();
    });

    it('applies gravity to particle motion', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 4,
        emissionRate: 0,
        lifetime: 100,
        lifetimeVariance: 0,
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariance: new THREE.Vector3(0, 0, 0),
        positionVariance: new THREE.Vector3(0, 0, 0),
        forces: { gravity: new THREE.Vector3(0, -10, 0) },
      });
      emitter.emit(1);
      emitter.update(1);
      const matrix = new THREE.Matrix4();
      emitter.mesh.getMatrixAt(0, matrix);
      const position = new THREE.Vector3().setFromMatrixPosition(matrix);
      expect(position.y).toBeLessThan(0);
      emitter.dispose();
    });

    it('applies wind along its own axis', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 4,
        emissionRate: 0,
        lifetime: 100,
        lifetimeVariance: 0,
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariance: new THREE.Vector3(0, 0, 0),
        positionVariance: new THREE.Vector3(0, 0, 0),
        forces: { wind: new THREE.Vector3(5, 0, 0) },
      });
      emitter.emit(1);
      emitter.update(1);
      const matrix = new THREE.Matrix4();
      emitter.mesh.getMatrixAt(0, matrix);
      expect(new THREE.Vector3().setFromMatrixPosition(matrix).x).toBeGreaterThan(0);
      emitter.dispose();
    });

    it('keeps positions finite when turbulence is enabled', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 8,
        emissionRate: 0,
        lifetime: 100,
        lifetimeVariance: 0,
        forces: { turbulence: 5, turbulenceScale: 2, turbulenceSpeed: 3 },
      });
      emitter.emit(4);
      for (let i = 0; i < 20; i++) emitter.update(0.016);
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < emitter.mesh.count; i++) {
        emitter.mesh.getMatrixAt(i, matrix);
        const p = new THREE.Vector3().setFromMatrixPosition(matrix);
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
        expect(Number.isFinite(p.z)).toBe(true);
      }
      emitter.dispose();
    });

    it('does not rotate particles when spin is disabled', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 4,
        emissionRate: 0,
        lifetime: 100,
        lifetimeVariance: 0,
        behavior: { spin: false },
      });
      emitter.emit(1);
      emitter.update(0.1);
      const first = emitter.geometry.getAttribute('instanceRotation').getX(0);
      emitter.update(0.1);
      expect(emitter.geometry.getAttribute('instanceRotation').getX(0)).toBeCloseTo(first);
      emitter.dispose();
    });

    it('compacts live particles to the front of the instance buffer', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 10,
        emissionRate: 0,
        lifetime: 100,
        lifetimeVariance: 0,
      });
      emitter.emit(4);
      emitter.update(0.016);
      const ages = emitter.geometry.getAttribute('instanceAge');
      for (let i = 0; i < 4; i++) {
        expect(ages.getX(i)).toBeGreaterThan(0);
      }
      emitter.dispose();
    });
  });

  describe('reset', () => {
    it('deactivates every particle and clears the draw count', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 50, emissionRate: 0 });
      emitter.emit(20);
      emitter.update(0.016);
      expect(emitter.mesh.count).toBe(20);
      emitter.reset();
      expect(emitter.activeParticleCount).toBe(0);
      expect(emitter.mesh.count).toBe(0);
      emitter.dispose();
    });

    it('clears the fractional emission accumulator', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 50, emissionRate: 10 });
      emitter.update(0.09);
      emitter.reset();
      // Without the accumulator reset, another 0.01s would tip over into a spawn.
      emitter.update(0.05);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });

    it('allows emitting again after a reset', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 10, emissionRate: 0 });
      emitter.emit(10);
      emitter.reset();
      emitter.emit(4);
      expect(emitter.activeParticleCount).toBe(4);
      emitter.dispose();
    });
  });

  describe('setters', () => {
    it('moves the spawn origin', () => {
      const emitter = new ParticleEmitterCore({
        maxParticles: 4,
        emissionRate: 0,
        positionVariance: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        velocityVariance: new THREE.Vector3(0, 0, 0),
        lifetime: 100,
        lifetimeVariance: 0,
      });
      emitter.setPosition(new THREE.Vector3(10, 20, 30));
      emitter.emit(1);
      emitter.update(0.001);
      const matrix = new THREE.Matrix4();
      emitter.mesh.getMatrixAt(0, matrix);
      const p = new THREE.Vector3().setFromMatrixPosition(matrix);
      expect(p.x).toBeCloseTo(10, 1);
      expect(p.y).toBeCloseTo(20, 1);
      expect(p.z).toBeCloseTo(30, 1);
      emitter.dispose();
    });

    it('copies rather than aliases the supplied position vector', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 4, emissionRate: 0 });
      const supplied = new THREE.Vector3(1, 2, 3);
      emitter.setPosition(supplied);
      supplied.set(999, 999, 999);
      emitter.emit(1);
      emitter.update(0.001);
      const matrix = new THREE.Matrix4();
      emitter.mesh.getMatrixAt(0, matrix);
      expect(new THREE.Vector3().setFromMatrixPosition(matrix).x).toBeLessThan(100);
      emitter.dispose();
    });

    it('changes the emission rate for subsequent updates', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 0 });
      emitter.update(1);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.setEmissionRate(20);
      emitter.update(1);
      expect(emitter.activeParticleCount).toBe(20);
      emitter.dispose();
    });

    it('can halt emission by setting the rate to zero', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 100, emissionRate: 50 });
      emitter.setEmissionRate(0);
      emitter.update(1);
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });
  });

  describe('group', () => {
    it('parents the mesh under a group', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.group.children).toContain(emitter.mesh);
      emitter.dispose();
    });

    it('returns the same cached group on repeated access', () => {
      const emitter = new ParticleEmitterCore();
      expect(emitter.group).toBe(emitter.group);
      emitter.dispose();
    });

    it('does not accumulate duplicate children across accesses', () => {
      const emitter = new ParticleEmitterCore();
      void emitter.group;
      void emitter.group;
      void emitter.group;
      expect(emitter.group.children).toHaveLength(1);
      emitter.dispose();
    });
  });

  describe('activeParticleCount', () => {
    it('starts at zero', () => {
      const emitter = new ParticleEmitterCore({ emissionRate: 0 });
      expect(emitter.activeParticleCount).toBe(0);
      emitter.dispose();
    });

    it('never exceeds maxParticles', () => {
      const emitter = new ParticleEmitterCore({ maxParticles: 8, emissionRate: 1000 });
      for (let i = 0; i < 10; i++) emitter.update(0.1);
      expect(emitter.activeParticleCount).toBeLessThanOrEqual(8);
      emitter.dispose();
    });
  });

  describe('dispose', () => {
    it('releases geometry and material', () => {
      const emitter = new ParticleEmitterCore();
      let geometryDisposed = false;
      let materialDisposed = false;
      emitter.geometry.addEventListener('dispose', () => {
        geometryDisposed = true;
      });
      emitter.material.addEventListener('dispose', () => {
        materialDisposed = true;
      });
      emitter.dispose();
      expect(geometryDisposed).toBe(true);
      expect(materialDisposed).toBe(true);
    });

    it('does not throw when no texture was supplied', () => {
      const emitter = new ParticleEmitterCore();
      expect(() => emitter.dispose()).not.toThrow();
    });
  });
});

describe('createParticleEmitter', () => {
  it('returns a ParticleEmitterCore instance', () => {
    const emitter = createParticleEmitter();
    expect(emitter).toBeInstanceOf(ParticleEmitterCore);
    emitter.dispose();
  });

  it('forwards configuration to the constructor', () => {
    const emitter = createParticleEmitter({ maxParticles: 42 });
    expect(emitter.mesh.instanceMatrix.count).toBe(42);
    emitter.dispose();
  });

  it('propagates constructor validation errors', () => {
    expect(() => createParticleEmitter({ maxParticles: 0 })).toThrow(
      /maxParticles must be positive/
    );
  });

  it('returns an independent emitter on each call', () => {
    const a = createParticleEmitter();
    const b = createParticleEmitter();
    expect(a).not.toBe(b);
    expect(a.mesh).not.toBe(b.mesh);
    a.dispose();
    b.dispose();
  });
});
