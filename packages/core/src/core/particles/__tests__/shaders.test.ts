import { describe, expect, it } from 'vitest';
import { MAX_GRADIENT_STOPS, particleFragmentShader, particleVertexShader } from '../shaders';

describe('particle shaders', () => {
  describe('MAX_GRADIENT_STOPS', () => {
    it('matches the array size declared in the fragment shader', () => {
      expect(particleFragmentShader).toContain(
        `uniform vec3 uColorGradient[${MAX_GRADIENT_STOPS}];`
      );
      expect(particleFragmentShader).toContain(
        `uniform float uColorGradientStops[${MAX_GRADIENT_STOPS}];`
      );
    });

    it('leaves room for the fixed loop bound to reach the last pair', () => {
      // The gradient loop runs to MAX-1 so it can read index i+1.
      expect(particleFragmentShader).toContain(`i < ${MAX_GRADIENT_STOPS - 1}`);
    });
  });

  describe('vertex shader', () => {
    it('declares every per-instance attribute the emitter writes', () => {
      for (const attribute of [
        'instanceAge',
        'instanceLifetime',
        'instanceSize',
        'instanceRotation',
        'instanceColorIndex',
      ]) {
        expect(particleVertexShader).toContain(`attribute float ${attribute};`);
      }
    });

    it('writes gl_Position', () => {
      expect(particleVertexShader).toContain('gl_Position');
    });

    it('clamps normalized age so an overshooting particle cannot extrapolate size', () => {
      expect(particleVertexShader).toContain('clamp(instanceAge / instanceLifetime, 0.0, 1.0)');
    });

    it('billboards in view space via instanceMatrix', () => {
      expect(particleVertexShader).toContain('modelViewMatrix * instanceMatrix');
    });

    it('passes the varyings the fragment stage reads', () => {
      expect(particleVertexShader).toContain('varying float vAge;');
      expect(particleVertexShader).toContain('varying float vLifetime;');
      expect(particleVertexShader).toContain('varying float vColorIndex;');
      expect(particleVertexShader).toContain('varying vec2 vUv;');
    });

    it('has balanced braces', () => {
      const open = (particleVertexShader.match(/\{/g) ?? []).length;
      const close = (particleVertexShader.match(/\}/g) ?? []).length;
      expect(open).toBe(close);
    });
  });

  describe('fragment shader', () => {
    it('writes gl_FragColor', () => {
      expect(particleFragmentShader).toContain('gl_FragColor');
    });

    it('declares every uniform the emitter material supplies', () => {
      for (const uniform of [
        'uTexture',
        'uHasTexture',
        'uColorStart',
        'uColorEnd',
        'uOpacityStart',
        'uOpacityEnd',
        'uColorGradientCount',
        'uFadeIn',
        'uFadeOut',
      ]) {
        expect(particleFragmentShader).toContain(uniform);
      }
    });

    it('falls back to a two-colour mix when there are too few gradient stops', () => {
      expect(particleFragmentShader).toContain('if (uColorGradientCount <= 1)');
      expect(particleFragmentShader).toContain('mix(uColorStart, uColorEnd, t)');
    });

    it('guards both fades against a zero duration to avoid dividing by zero', () => {
      expect(particleFragmentShader).toContain('uFadeIn > 0.0');
      expect(particleFragmentShader).toContain('uFadeOut > 0.0');
    });

    it('discards fragments outside the unit disc when untextured', () => {
      expect(particleFragmentShader).toContain('discard');
    });

    it('declares the varyings the vertex stage sets', () => {
      expect(particleFragmentShader).toContain('varying float vAge;');
      expect(particleFragmentShader).toContain('varying float vLifetime;');
      expect(particleFragmentShader).toContain('varying vec2 vUv;');
    });

    it('has balanced braces and parentheses', () => {
      const open = (particleFragmentShader.match(/\{/g) ?? []).length;
      const close = (particleFragmentShader.match(/\}/g) ?? []).length;
      expect(open).toBe(close);
      const popen = (particleFragmentShader.match(/\(/g) ?? []).length;
      const pclose = (particleFragmentShader.match(/\)/g) ?? []).length;
      expect(popen).toBe(pclose);
    });
  });

  describe('shared contract', () => {
    it('keeps varying declarations consistent across both stages', () => {
      for (const decl of ['varying float vAge;', 'varying float vLifetime;', 'varying vec2 vUv;']) {
        expect(particleVertexShader).toContain(decl);
        expect(particleFragmentShader).toContain(decl);
      }
    });

    it('ships non-empty source for both stages', () => {
      expect(particleVertexShader.trim().length).toBeGreaterThan(0);
      expect(particleFragmentShader.trim().length).toBeGreaterThan(0);
    });
  });
});
