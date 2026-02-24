import { describe, expect, it } from 'vitest';
import { createSkyMaterial } from '../../../src/core/sky';

// Note: THREE is not directly used in tests but imported for type compatibility

describe('createSkyMaterial', () => {
  it('should allow sunAngle between -180 and 360', () => {
    // These should not throw
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: -180 } })).not.toThrow();
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: 360 } })).not.toThrow();
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: -30 } })).not.toThrow();
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: 210 } })).not.toThrow();
  });

  it('should throw for sunAngle outside [-180, 360]', () => {
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: -181 } })).toThrow();
    expect(() => createSkyMaterial({ timeOfDay: { sunAngle: 361 } })).toThrow();
  });

  it('should correctly merge default timeOfDay state', () => {
    const material = createSkyMaterial({ timeOfDay: { sunAngle: 45 } });
    expect(material.uniforms.uSunAngle.value).toBe(45);
    expect(material.uniforms.uSunIntensity.value).toBe(1.0); // Default
  });
});
