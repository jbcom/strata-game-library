import type {
  MaterialDefinition,
  MaterialType,
  OrganicProperties,
  ShellProperties,
  VolumetricProperties,
} from './types';

/**
 * Creates a base material definition with common defaults
 */
function createBaseMaterial(
  id: string,
  type: MaterialType,
  options: Partial<MaterialDefinition>
): MaterialDefinition {
  return {
    id,
    type,
    baseColor: '#ffffff',
    roughness: 0.5,
    metalness: 0,
    ...options,
  };
}

/**
 * Creates a fur (shell) material definition
 */
export function createFurMaterial(
  id: string,
  options: Partial<Omit<MaterialDefinition, 'shell'>> & { shell?: Partial<ShellProperties> }
): MaterialDefinition {
  const { physics, shell, ...rest } = options;
  return createBaseMaterial(id, 'shell', {
    ...rest,
    physics: {
      density: 80,
      friction: 0.8,
      restitution: 0.05,
      ...physics,
    },
    shell: {
      layers: 24,
      length: 0.05,
      density: 5000,
      thickness: 0.01,
      curvature: 0.5,
      colorVariation: 0.1,
      ...shell,
    } as ShellProperties,
  });
}

/**
 * Creates a metal material definition
 */
export function createMetalMaterial(
  id: string,
  options: Partial<MaterialDefinition>
): MaterialDefinition {
  const { physics, ...rest } = options;
  return createBaseMaterial(id, 'solid', {
    metalness: 1.0,
    roughness: 0.3,
    physics: {
      density: 7800,
      friction: 0.35,
      restitution: 0.2,
      ...physics,
    },
    ...rest,
  });
}

/**
 * Creates a wood material definition
 */
export function createWoodMaterial(
  id: string,
  options: Partial<MaterialDefinition> & { grain?: string }
): MaterialDefinition {
  const { physics, ...rest } = options;
  return createBaseMaterial(id, 'solid', {
    roughness: 0.7,
    metalness: 0,
    physics: {
      density: 700,
      friction: 0.6,
      restitution: 0.25,
      ...physics,
    },
    ...rest,
  });
}

/**
 * Creates a shell material definition (like turtle shell)
 */
export function createShellMaterial(
  id: string,
  options: Partial<MaterialDefinition> & { pattern?: string; segments?: number }
): MaterialDefinition {
  const { physics, ...rest } = options;
  return createBaseMaterial(id, 'solid', {
    roughness: 0.4,
    metalness: 0.1,
    physics: {
      density: 1200,
      friction: 0.45,
      restitution: 0.2,
      ...physics,
    },
    ...rest,
  });
}

/**
 * Creates a volumetric material definition
 */
export function createVolumetricMaterial(
  id: string,
  options: Partial<Omit<MaterialDefinition, 'volumetric'>> & {
    volumetric?: Partial<VolumetricProperties>;
  }
): MaterialDefinition {
  const { physics, volumetric, ...rest } = options;
  return createBaseMaterial(id, 'volumetric', {
    ...rest,
    physics: {
      density: 2650,
      friction: 0.3,
      restitution: 0.15,
      ...physics,
    },
    volumetric: {
      refraction: 1.5,
      absorption: '#ffffff',
      transparency: 0.8,
      ...volumetric,
    } as VolumetricProperties,
  });
}

/**
 * Creates an organic material definition (with SSS)
 */
export function createOrganicMaterial(
  id: string,
  options: Partial<Omit<MaterialDefinition, 'organic'>> & {
    organic?: Partial<OrganicProperties>;
  }
): MaterialDefinition {
  const { organic, physics, ...rest } = options;
  return createBaseMaterial(id, 'organic', {
    ...rest,
    physics: {
      density: 1050,
      friction: 0.7,
      restitution: 0.05,
      ...physics,
    },
    organic: {
      scatterColor: '#ff0000',
      scatterDistance: 0.1,
      ...organic,
    } as OrganicProperties,
  });
}
