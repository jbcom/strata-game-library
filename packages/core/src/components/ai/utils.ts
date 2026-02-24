import * as THREE from 'three';
import * as YUKA from 'yuka';

/**
 * Syncs a Yuka GameEntity's transform to a Three.js Object3D.
 * @internal
 */
export function syncYukaToThree(yukaEntity: YUKA.GameEntity, threeObject: THREE.Object3D): void {
  const matrix = yukaEntity.worldMatrix;
  threeObject.matrix.set(
    matrix.elements[0],
    matrix.elements[3],
    matrix.elements[6],
    0,
    matrix.elements[1],
    matrix.elements[4],
    matrix.elements[7],
    0,
    matrix.elements[2],
    matrix.elements[5],
    matrix.elements[8],
    0,
    yukaEntity.position.x,
    yukaEntity.position.y,
    yukaEntity.position.z,
    1
  );
  threeObject.matrixAutoUpdate = false;
  threeObject.matrixWorldNeedsUpdate = true;
}

/**
 * Converts a Yuka Vector3 to a Three.js Vector3.
 */
export function yukaVector3ToThree(yukaVec: YUKA.Vector3): THREE.Vector3 {
  return new THREE.Vector3(yukaVec.x, yukaVec.y, yukaVec.z);
}

/**
 * Converts a Three.js Vector3 to a Yuka Vector3.
 */
export function threeVector3ToYuka(threeVec: THREE.Vector3): YUKA.Vector3 {
  return new YUKA.Vector3(threeVec.x, threeVec.y, threeVec.z);
}

/**
 * Creates Yuka polygons from Three.js vertex and index arrays.
 * @internal
 */
export function createPolygonsFromGeometry(vertices: number[], indices: number[]): YUKA.Polygon[] {
  const polygons: YUKA.Polygon[] = [];

  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;

    const v0 = new YUKA.Vector3(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
    const v1 = new YUKA.Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
    const v2 = new YUKA.Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);

    const polygon = new YUKA.Polygon();
    polygon.fromContour([v0, v1, v2]);
    polygons.push(polygon);
  }

  return polygons;
}
