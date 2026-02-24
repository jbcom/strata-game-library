/**
 * Core-Only Usage Example
 *
 * This file demonstrates how to use Strata's core functions
 * without React. This is useful for:
 * - Server-side rendering
 * - Node.js scripts
 * - Non-React frameworks (Vue, Svelte, etc.)
 * - Custom game engines
 */

import * as THREE from 'three';

// In a real project, you would import from @jbcom/strata:
// import { generateInstanceData, createInstancedMesh } from '@jbcom/strata/core';

/**
 * Example: Generate instanced vegetation data
 *
 * This creates position/rotation/scale data for thousands
 * of instances using seeded random for reproducible results.
 */
export function generateVegetation() {
  // Mock implementation - in real usage, import from @jbcom/strata
  const instances = [];
  const seed = 42; // Deterministic seed

  // Seeded random number generator
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Generate instance data
  for (let i = 0; i < 1000; i++) {
    const x = (random() - 0.5) * 100;
    const z = (random() - 0.5) * 100;
    const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3;

    instances.push({
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(0, random() * Math.PI * 2, 0),
      scale: new THREE.Vector3(0.8 + random() * 0.4, 0.8 + random() * 0.4, 0.8 + random() * 0.4),
    });
  }

  return instances;
}

/**
 * Example: Create instanced mesh from data
 *
 * This creates a THREE.InstancedMesh that can be added
 * to any Three.js scene.
 */
export function createGrassField(): THREE.InstancedMesh {
  const instances = generateVegetation();

  // Create geometry (grass blade)
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([-0.05, 0, 0, 0.05, 0, 0, 0, 1, 0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Create material
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a7c23,
    side: THREE.DoubleSide,
  });

  // Create instanced mesh
  const mesh = new THREE.InstancedMesh(geometry, material, instances.length);

  // Set instance matrices
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  instances.forEach((instance, i) => {
    quaternion.setFromEuler(instance.rotation);
    matrix.compose(instance.position, quaternion, instance.scale);
    mesh.setMatrixAt(i, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;

  return mesh;
}

/**
 * Example: Using with vanilla Three.js
 */
export function setupVanillaScene() {
  // Create scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add grass field
  const grassField = createGrassField();
  scene.add(grassField);

  // Add lighting
  scene.add(new THREE.AmbientLight(0x404040));
  scene.add(new THREE.DirectionalLight(0xffffff, 1));

  // Position camera
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  return { scene, camera, renderer };
}
