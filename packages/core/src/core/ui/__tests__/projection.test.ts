import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { calculateFade, getAnchorOffset, screenToWorld, worldToScreen } from '../projection';

const W = 800;
const H = 600;

/** A camera at +Z looking down -Z at the origin, matrices already updated. */
function makeCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return camera;
}

describe('getAnchorOffset', () => {
  it('leaves topLeft unshifted', () => {
    expect(getAnchorOffset('topLeft', 100, 50)).toEqual({ x: 0, y: 0 });
  });

  it('shifts a right-anchored element fully left by its width', () => {
    expect(getAnchorOffset('topRight', 100, 50)).toEqual({ x: -100, y: 0 });
  });

  it('shifts a bottom-anchored element fully up by its height', () => {
    expect(getAnchorOffset('bottomLeft', 100, 50)).toEqual({ x: 0, y: -50 });
  });

  it('shifts bottomRight by both dimensions', () => {
    expect(getAnchorOffset('bottomRight', 100, 50)).toEqual({ x: -100, y: -50 });
  });

  it('halves both dimensions for center', () => {
    expect(getAnchorOffset('center', 100, 50)).toEqual({ x: -50, y: -25 });
  });

  it('centers only the cross-axis for edge anchors', () => {
    expect(getAnchorOffset('top', 100, 50)).toEqual({ x: -50, y: 0 });
    expect(getAnchorOffset('bottom', 100, 50)).toEqual({ x: -50, y: -50 });
    expect(getAnchorOffset('left', 100, 50)).toEqual({ x: 0, y: -25 });
    expect(getAnchorOffset('right', 100, 50)).toEqual({ x: -100, y: -25 });
  });

  it('returns a zero offset for zero-sized elements at every anchor', () => {
    const anchors = [
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'center',
      'top',
      'bottom',
      'left',
      'right',
    ] as const;
    for (const anchor of anchors) {
      const offset = getAnchorOffset(anchor, 0, 0);
      // Negating a zero width yields -0, which Object.is (and so both toBe and
      // toEqual) treats as distinct from +0. Assert magnitude instead.
      expect(offset.x).toBeCloseTo(0, 10);
      expect(offset.y).toBeCloseTo(0, 10);
    }
  });

  it('produces positive offsets for negative dimensions, mirroring the sign flip', () => {
    expect(getAnchorOffset('topRight', -100, -50)).toEqual({ x: 100, y: 0 });
    expect(getAnchorOffset('center', -100, -50)).toEqual({ x: 50, y: 25 });
  });

  it('falls back to a zero offset for an unrecognised anchor', () => {
    expect(getAnchorOffset('nonsense' as never, 100, 50)).toEqual({ x: 0, y: 0 });
  });
});

describe('worldToScreen', () => {
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    camera = makeCamera();
  });

  it('maps a point at the camera centerline to the middle of the viewport', () => {
    const result = worldToScreen(new THREE.Vector3(0, 0, 0), camera, W, H);
    expect(result.x).toBeCloseTo(W / 2, 5);
    expect(result.y).toBeCloseTo(H / 2, 5);
    expect(result.visible).toBe(true);
  });

  it('reports the true world distance to the camera', () => {
    const result = worldToScreen(new THREE.Vector3(0, 0, 0), camera, W, H);
    expect(result.distance).toBeCloseTo(10, 5);
  });

  it('maps a point to the right of center to the right half of the screen', () => {
    const result = worldToScreen(new THREE.Vector3(2, 0, 0), camera, W, H);
    expect(result.x).toBeGreaterThan(W / 2);
    expect(result.y).toBeCloseTo(H / 2, 5);
  });

  it('inverts the Y axis, so world +Y maps to a smaller screen Y', () => {
    const result = worldToScreen(new THREE.Vector3(0, 2, 0), camera, W, H);
    expect(result.y).toBeLessThan(H / 2);
  });

  it('marks a point behind the camera as not visible', () => {
    const result = worldToScreen(new THREE.Vector3(0, 0, 50), camera, W, H);
    expect(result.visible).toBe(false);
  });

  it('marks an on-axis but off-frustum point as not visible', () => {
    const result = worldToScreen(new THREE.Vector3(1000, 0, 0), camera, W, H);
    expect(result.visible).toBe(false);
    expect(result.x).toBeGreaterThan(W);
  });

  it('still reports a distance for points that are not visible', () => {
    const result = worldToScreen(new THREE.Vector3(0, 0, 60), camera, W, H);
    expect(result.visible).toBe(false);
    expect(result.distance).toBeCloseTo(50, 5);
  });

  it('does not mutate the position it is given', () => {
    const position = new THREE.Vector3(3, 4, 5);
    worldToScreen(position, camera, W, H);
    expect(position.toArray()).toEqual([3, 4, 5]);
  });

  it('scales the mapping with the supplied viewport size', () => {
    const small = worldToScreen(new THREE.Vector3(0, 0, 0), camera, 100, 100);
    expect(small.x).toBeCloseTo(50, 5);
    expect(small.y).toBeCloseTo(50, 5);
  });

  it('treats a zero-width viewport as degenerate rather than throwing', () => {
    const result = worldToScreen(new THREE.Vector3(0, 0, 0), camera, 0, 0);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.visible).toBe(true);
  });

  it('works with an orthographic camera', () => {
    const ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
    ortho.position.set(0, 0, 10);
    ortho.lookAt(0, 0, 0);
    ortho.updateMatrixWorld(true);
    ortho.updateProjectionMatrix();
    const result = worldToScreen(new THREE.Vector3(0, 0, 0), ortho, W, H);
    expect(result.x).toBeCloseTo(W / 2, 5);
    expect(result.y).toBeCloseTo(H / 2, 5);
    expect(result.visible).toBe(true);
  });
});

describe('screenToWorld', () => {
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    camera = makeCamera();
  });

  it('round-trips the viewport center back to the world origin at z=0', () => {
    const world = screenToWorld(W / 2, H / 2, camera, W, H, 0);
    expect(world.x).toBeCloseTo(0, 4);
    expect(world.y).toBeCloseTo(0, 4);
    expect(world.z).toBeCloseTo(0, 4);
  });

  it('lands exactly on the requested target depth', () => {
    const world = screenToWorld(W / 2, H / 2, camera, W, H, -5);
    expect(world.z).toBeCloseTo(-5, 4);
  });

  it('defaults the target depth to zero', () => {
    const explicit = screenToWorld(W / 2, H / 2, camera, W, H, 0);
    const implicit = screenToWorld(W / 2, H / 2, camera, W, H);
    expect(implicit.toArray()).toEqual(explicit.toArray());
  });

  it('round-trips an off-center point through worldToScreen', () => {
    const original = new THREE.Vector3(2, -1, 0);
    const screen = worldToScreen(original, camera, W, H);
    const back = screenToWorld(screen.x, screen.y, camera, W, H, 0);
    expect(back.x).toBeCloseTo(original.x, 4);
    expect(back.y).toBeCloseTo(original.y, 4);
    expect(back.z).toBeCloseTo(original.z, 4);
  });

  it('maps a rightward screen point to a larger world X', () => {
    const world = screenToWorld(W * 0.75, H / 2, camera, W, H, 0);
    expect(world.x).toBeGreaterThan(0);
  });

  it('maps a downward screen point to a smaller world Y', () => {
    const world = screenToWorld(W / 2, H * 0.75, camera, W, H, 0);
    expect(world.y).toBeLessThan(0);
  });

  it('does not mutate the camera position', () => {
    screenToWorld(10, 20, camera, W, H, -3);
    expect(camera.position.toArray()).toEqual([0, 0, 10]);
  });

  it('returns a finite point 100 units along the ray when the ray is parallel to the XY plane', () => {
    // Camera at the origin looking along -X: every ray has a near-zero Z component,
    // so the plane intersection is degenerate and the guard must engage.
    const parallel = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    parallel.position.set(0, 0, 0);
    parallel.lookAt(-1, 0, 0);
    parallel.updateMatrixWorld(true);
    parallel.updateProjectionMatrix();

    const world = screenToWorld(W / 2, H / 2, parallel, W, H, 50);
    expect(Number.isFinite(world.x)).toBe(true);
    expect(Number.isFinite(world.y)).toBe(true);
    expect(Number.isFinite(world.z)).toBe(true);
    expect(world.length()).toBeCloseTo(100, 3);
  });

  it('returns a Vector3 instance', () => {
    expect(screenToWorld(0, 0, camera, W, H)).toBeInstanceOf(THREE.Vector3);
  });
});

describe('calculateFade', () => {
  it('is fully opaque at and before the fade start', () => {
    expect(calculateFade(0, 10, 20)).toBe(1);
    expect(calculateFade(10, 10, 20)).toBe(1);
  });

  it('is fully transparent at and beyond the fade end', () => {
    expect(calculateFade(20, 10, 20)).toBe(0);
    expect(calculateFade(1000, 10, 20)).toBe(0);
  });

  it('interpolates linearly across the fade band', () => {
    expect(calculateFade(15, 10, 20)).toBeCloseTo(0.5, 10);
    expect(calculateFade(12.5, 10, 20)).toBeCloseTo(0.75, 10);
    expect(calculateFade(17.5, 10, 20)).toBeCloseTo(0.25, 10);
  });

  it('stays opaque when the band has zero width', () => {
    // distance < start and distance >= end are both false only when equal,
    // and the equal case is caught by the <= start branch.
    expect(calculateFade(10, 10, 10)).toBe(1);
    expect(calculateFade(5, 10, 10)).toBe(1);
    expect(calculateFade(15, 10, 10)).toBe(0);
  });

  it('is opaque for negative distances', () => {
    expect(calculateFade(-5, 10, 20)).toBe(1);
  });

  it('resolves an inverted band by guard order, staying opaque out to fadeStart', () => {
    // With start=20 and end=10 the two guards overlap for 10..20. The
    // `distance <= fadeStart` test runs first and wins, so the whole overlap
    // reads as fully opaque and only distances past fadeStart go transparent.
    expect(calculateFade(5, 20, 10)).toBe(1);
    expect(calculateFade(15, 20, 10)).toBe(1);
    expect(calculateFade(20, 20, 10)).toBe(1);
    expect(calculateFade(25, 20, 10)).toBe(0);
  });

  it('never returns a value outside 0..1 across the whole band', () => {
    for (let d = -5; d <= 30; d += 0.5) {
      const opacity = calculateFade(d, 10, 20);
      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  });

  it('decreases monotonically as distance grows', () => {
    let previous = calculateFade(0, 10, 20);
    for (let d = 0.5; d <= 25; d += 0.5) {
      const current = calculateFade(d, 10, 20);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('returns NaN only when the distance itself is NaN', () => {
    expect(calculateFade(Number.NaN, 10, 20)).toBeNaN();
  });

  it('is transparent at infinite distance', () => {
    expect(calculateFade(Number.POSITIVE_INFINITY, 10, 20)).toBe(0);
  });
});
