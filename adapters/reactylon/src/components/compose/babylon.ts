import {
  type AbstractMesh,
  type AnimationGroup,
  type Material as BabylonMaterial,
  Color3,
  MeshBuilder,
  PBRMaterial,
  Quaternion,
  type Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import {
  executePropInteractionAction,
  type PropRuntimeInteractionAction,
  type PropRuntimeInteractionResult,
  type PropRuntimeInteractionState,
} from '@strata-game-library/core/compose';
import type {
  ReactylonRuntimeCreatureBoneDescriptor,
  ReactylonRuntimeCreatureDescriptor,
  ReactylonRuntimeMaterialDescriptor,
  ReactylonRuntimePropDescriptor,
  ReactylonRuntimePropNodeDescriptor,
} from './types.js';

type RuntimeAxis = 'x' | 'y' | 'z';

interface CapsuleDimensions {
  axis: RuntimeAxis;
  length: number;
  radius: number;
}

interface PrimitiveMeshResult {
  mesh: AbstractMesh;
  baseRotation: Quaternion;
}

export interface BabylonRuntimeAssetLoadResult {
  meshes: AbstractMesh[];
  animationGroups?: AnimationGroup[];
}

export interface BabylonRuntimeAssetLoaderContext {
  scene: Scene;
  root: TransformNode;
  source: string;
  kind: 'prop-node' | 'creature-asset';
  material?: BabylonMaterial;
  materialSlot?: ReactylonRuntimeMaterialDescriptor;
  propNode?: ReactylonRuntimePropNodeDescriptor;
  creature?: ReactylonRuntimeCreatureDescriptor;
}

export type BabylonRuntimeAssetLoader = (
  source: string,
  context: BabylonRuntimeAssetLoaderContext
) => Promise<AbstractMesh[] | BabylonRuntimeAssetLoadResult>;

export interface BabylonRuntimeAssetLoadingOptions {
  assetLoader?: BabylonRuntimeAssetLoader;
  useSourceMaterials?: boolean;
}

export interface BabylonRuntimeMaterialOptions {
  namePrefix?: string;
}

export type BabylonRuntimeMaterialFactory = (
  slot: ReactylonRuntimeMaterialDescriptor,
  scene: Scene
) => BabylonMaterial;

export interface BabylonRuntimeMeshFactoryContext {
  scene: Scene;
  root: TransformNode;
  material: BabylonMaterial;
  materialSlot: ReactylonRuntimeMaterialDescriptor;
}

export type BabylonRuntimePropMeshFactory = (
  node: ReactylonRuntimePropNodeDescriptor,
  context: BabylonRuntimeMeshFactoryContext
) => AbstractMesh | AbstractMesh[] | null | undefined;

export type BabylonRuntimeCreatureMeshFactory = (
  bone: ReactylonRuntimeCreatureBoneDescriptor,
  context: BabylonRuntimeMeshFactoryContext
) => AbstractMesh | AbstractMesh[] | null | undefined;

export interface BabylonRuntimeInstantiationOptions extends BabylonRuntimeMaterialOptions {
  rootName?: string;
  materialFactory?: BabylonRuntimeMaterialFactory;
  disposeMaterials?: boolean;
}

export interface BabylonRuntimePropInstantiationOptions extends BabylonRuntimeInstantiationOptions {
  createNodeMesh?: BabylonRuntimePropMeshFactory;
}

export interface BabylonRuntimeCreatureInstantiationOptions
  extends BabylonRuntimeInstantiationOptions {
  createBoneMesh?: BabylonRuntimeCreatureMeshFactory;
}

export interface BabylonRuntimePropAssetInstantiationOptions
  extends BabylonRuntimePropInstantiationOptions,
    BabylonRuntimeAssetLoadingOptions {}

export interface BabylonRuntimeCreatureAssetInstantiationOptions
  extends BabylonRuntimeCreatureInstantiationOptions,
    BabylonRuntimeAssetLoadingOptions {
  animation?: string;
}

export interface BabylonRuntimePropInstance {
  kind: 'prop';
  descriptor: ReactylonRuntimePropDescriptor;
  root: TransformNode;
  meshes: AbstractMesh[];
  materials: Record<string, BabylonMaterial>;
  executeInteraction(
    action: string | PropRuntimeInteractionAction,
    state?: PropRuntimeInteractionState
  ): PropRuntimeInteractionResult;
  dispose(): void;
}

export interface BabylonRuntimeCreatureInstance {
  kind: 'creature';
  descriptor: ReactylonRuntimeCreatureDescriptor;
  root: TransformNode;
  meshes: AbstractMesh[];
  materials: Record<string, BabylonMaterial>;
  animationGroups: AnimationGroup[];
  playAnimation(animation: string, loop?: boolean): boolean;
  dispose(): void;
}

function toVector3([x, y, z]: [number, number, number]): Vector3 {
  return new Vector3(x, y, z);
}

function toQuaternion(rotation: [number, number, number, number] | undefined): Quaternion {
  return rotation
    ? new Quaternion(rotation[0], rotation[1], rotation[2], rotation[3])
    : Quaternion.Identity();
}

function colorFromDescriptor(color: ReactylonRuntimeMaterialDescriptor['baseColor']): Color3 {
  if (Array.isArray(color)) {
    return new Color3(color[0], color[1], color[2]);
  }

  if (typeof color === 'number') {
    return Color3.FromHexString(`#${color.toString(16).padStart(6, '0')}`);
  }

  return Color3.FromHexString(color.startsWith('#') ? color : `#${color}`);
}

function materialName(
  slot: ReactylonRuntimeMaterialDescriptor,
  options: BabylonRuntimeMaterialOptions
): string {
  return `${options.namePrefix ?? 'strata'}:${slot.id}`;
}

function splitAssetSource(source: string): { rootUrl: string; sceneFilename: string } {
  const slashIndex = source.lastIndexOf('/');

  if (slashIndex < 0) {
    return { rootUrl: '', sceneFilename: source };
  }

  return {
    rootUrl: source.slice(0, slashIndex + 1),
    sceneFilename: source.slice(slashIndex + 1),
  };
}

async function loadBabylonAssetMeshes(
  source: string,
  context: BabylonRuntimeAssetLoaderContext
): Promise<BabylonRuntimeAssetLoadResult> {
  const { rootUrl, sceneFilename } = splitAssetSource(source);
  const result = await SceneLoader.ImportMeshAsync(null, rootUrl, sceneFilename, context.scene);

  return {
    meshes: result.meshes,
    animationGroups: result.animationGroups,
  };
}

async function loadRuntimeAsset(
  source: string,
  context: BabylonRuntimeAssetLoaderContext,
  assetLoader: BabylonRuntimeAssetLoader | undefined
): Promise<BabylonRuntimeAssetLoadResult> {
  const result = await (assetLoader ?? loadBabylonAssetMeshes)(source, context);

  return Array.isArray(result) ? { meshes: result } : result;
}

/**
 * Creates a native Babylon PBR material from a runtime composition material descriptor.
 */
export function createBabylonRuntimeMaterial(
  slot: ReactylonRuntimeMaterialDescriptor,
  scene: Scene,
  options: BabylonRuntimeMaterialOptions = {}
): PBRMaterial {
  const material = new PBRMaterial(materialName(slot, options), scene);

  material.albedoColor = colorFromDescriptor(slot.baseColor);
  material.roughness = slot.roughness;
  material.metallic = slot.metalness;
  material.alpha = slot.opacity;
  material.transparencyMode = slot.transparent
    ? PBRMaterial.PBRMATERIAL_ALPHABLEND
    : PBRMaterial.PBRMATERIAL_OPAQUE;
  material.metadata = {
    strataRuntimeMaterial: slot,
    strataMaterialProceduralPlan: slot.procedural,
  };

  return material;
}

function buildMaterials(
  scene: Scene,
  slots: Record<string, ReactylonRuntimeMaterialDescriptor>,
  options: BabylonRuntimeInstantiationOptions
): Record<string, BabylonMaterial> {
  return Object.fromEntries(
    Object.values(slots).map((slot) => [
      slot.id,
      (options.materialFactory ?? createBabylonRuntimeMaterial)(slot, scene),
    ])
  );
}

function capsuleDimensions(size: [number, number, number]): CapsuleDimensions {
  const axes: Array<{ axis: RuntimeAxis; diameter: number }> = [
    { axis: 'x', diameter: Math.max(0, size[0]) },
    { axis: 'y', diameter: Math.max(0, size[1]) },
    { axis: 'z', diameter: Math.max(0, size[2]) },
  ];

  axes.sort((a, b) => b.diameter - a.diameter);

  const [longest, crossA, crossB] = axes;
  const radius = ((crossA?.diameter ?? 0) + (crossB?.diameter ?? 0)) / 4;

  return {
    axis: longest?.axis ?? 'y',
    length: Math.max(2 * radius, longest?.diameter ?? 0),
    radius,
  };
}

function capsuleRotation(axis: RuntimeAxis): Quaternion {
  switch (axis) {
    case 'x':
      return Quaternion.FromEulerAngles(0, 0, -Math.PI / 2);
    case 'z':
      return Quaternion.FromEulerAngles(Math.PI / 2, 0, 0);
    case 'y':
      return Quaternion.Identity();
  }
}

function createPrimitiveMesh(
  scene: Scene,
  name: string,
  shape:
    | ReactylonRuntimePropNodeDescriptor['shape']
    | ReactylonRuntimeCreatureBoneDescriptor['shape'],
  size: [number, number, number]
): PrimitiveMeshResult {
  switch (shape) {
    case 'sphere': {
      const mesh = MeshBuilder.CreateSphere(name, { diameter: 1, segments: 24 }, scene);
      mesh.scaling = toVector3(size);
      return { mesh, baseRotation: Quaternion.Identity() };
    }
    case 'cylinder': {
      const mesh = MeshBuilder.CreateCylinder(
        name,
        { diameter: 1, height: 1, tessellation: 24 },
        scene
      );
      mesh.scaling = toVector3(size);
      return { mesh, baseRotation: Quaternion.Identity() };
    }
    case 'capsule': {
      const dimensions = capsuleDimensions(size);
      const mesh = MeshBuilder.CreateCapsule(
        name,
        { height: dimensions.length, radius: dimensions.radius, tessellation: 24 },
        scene
      );
      return { mesh, baseRotation: capsuleRotation(dimensions.axis) };
    }
    case 'box':
    case 'mesh':
    case 'custom': {
      const mesh = MeshBuilder.CreateBox(name, { size: 1 }, scene);
      mesh.scaling = toVector3(size);
      return { mesh, baseRotation: Quaternion.Identity() };
    }
  }
}

function normalizeMeshes(meshes: AbstractMesh | AbstractMesh[] | null | undefined): AbstractMesh[] {
  if (!meshes) {
    return [];
  }

  return Array.isArray(meshes) ? meshes : [meshes];
}

function mergeMetadata(
  existing: unknown,
  metadata: Record<string, unknown>
): Record<string, unknown> {
  return typeof existing === 'object' && existing !== null
    ? { ...(existing as Record<string, unknown>), ...metadata }
    : metadata;
}

function clonePropInteractionAction(
  action: PropRuntimeInteractionAction
): PropRuntimeInteractionAction {
  return {
    ...action,
    nodeIds: [...action.nodeIds],
    payload: action.payload
      ? {
          ...action.payload,
          contents: action.payload.contents ? [...action.payload.contents] : undefined,
        }
      : undefined,
  };
}

function propInteractionActionsForNode(
  descriptor: ReactylonRuntimePropDescriptor,
  nodeId: string
): PropRuntimeInteractionAction[] {
  return descriptor.interactionActions
    .filter((action) => action.nodeIds.includes(nodeId))
    .map(clonePropInteractionAction);
}

function applyMeshTransform(
  mesh: AbstractMesh,
  root: TransformNode,
  position: [number, number, number],
  rotation: [number, number, number, number] | undefined,
  baseRotation: Quaternion,
  material: BabylonMaterial,
  metadata: Record<string, unknown>
): void {
  mesh.parent = root;
  mesh.position = toVector3(position);
  mesh.rotationQuaternion = toQuaternion(rotation).multiply(baseRotation);
  mesh.material = material;
  mesh.metadata = mergeMetadata(mesh.metadata, metadata);
}

function createAssetContainer(
  scene: Scene,
  root: TransformNode,
  name: string,
  position: [number, number, number],
  rotation: [number, number, number, number] | undefined,
  scale: [number, number, number],
  metadata: Record<string, unknown>
): TransformNode {
  const container = new TransformNode(name, scene);

  container.parent = root;
  container.position = toVector3(position);
  container.rotationQuaternion = toQuaternion(rotation);
  container.scaling = toVector3(scale);
  container.metadata = mergeMetadata(container.metadata, metadata);

  return container;
}

function attachLoadedMeshes(
  meshes: AbstractMesh[],
  container: TransformNode,
  material: BabylonMaterial | undefined,
  useSourceMaterials: boolean,
  metadata: Record<string, unknown>
): void {
  const loaded = new Set<AbstractMesh>(meshes);

  for (const mesh of meshes) {
    if (!mesh.parent || !loaded.has(mesh.parent as AbstractMesh)) {
      mesh.parent = container;
    }

    if (!useSourceMaterials && material) {
      mesh.material = material;
    }

    mesh.metadata = mergeMetadata(mesh.metadata, metadata);
  }
}

function resolveCreatureAnimationName(
  descriptor: ReactylonRuntimeCreatureDescriptor,
  animation: string
): string {
  return descriptor.asset?.animationClips[animation] ?? animation;
}

function playCreatureAnimation(
  descriptor: ReactylonRuntimeCreatureDescriptor,
  animationGroups: AnimationGroup[],
  animation: string,
  loop = true
): boolean {
  const clipName = resolveCreatureAnimationName(descriptor, animation);
  const group = animationGroups.find((candidate) => candidate.name === clipName);

  if (!group) {
    return false;
  }

  group.start(loop);
  return true;
}

function applyRootTransform(
  root: TransformNode,
  position: [number, number, number],
  rotation: [number, number, number, number] | undefined,
  scale: [number, number, number]
): void {
  root.position = toVector3(position);
  root.rotationQuaternion = toQuaternion(rotation);
  root.scaling = toVector3(scale);
}

function disposeInstance(
  root: TransformNode,
  meshes: AbstractMesh[],
  materials: Record<string, BabylonMaterial>,
  disposeMaterials: boolean
): void {
  for (const mesh of meshes) {
    mesh.dispose();
  }

  if (disposeMaterials) {
    for (const material of Object.values(materials)) {
      material.dispose();
    }
  }

  root.dispose();
}

/**
 * Instantiates a Reactylon runtime prop descriptor as native Babylon meshes/materials.
 */
export function instantiateBabylonRuntimeProp(
  scene: Scene,
  descriptor: ReactylonRuntimePropDescriptor,
  options: BabylonRuntimePropInstantiationOptions = {}
): BabylonRuntimePropInstance {
  const root = new TransformNode(options.rootName ?? descriptor.id, scene);
  const materials = buildMaterials(scene, descriptor.materialSlots, options);
  const meshes: AbstractMesh[] = [];

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimeKind: 'prop',
    strataRuntime: descriptor,
    strataRuntimeInteractionActions: descriptor.interactionActions.map(clonePropInteractionAction),
  });

  for (const node of descriptor.nodes) {
    const materialSlot = descriptor.materialSlots[node.materialSlot];
    const material = materials[node.materialSlot];

    if (!materialSlot || !material) {
      throw new Error(
        `Missing Babylon material slot "${node.materialSlot}" for prop "${descriptor.id}"`
      );
    }

    const customMeshes = normalizeMeshes(
      options.createNodeMesh?.(node, { scene, root, material, materialSlot })
    );
    const createdMeshes =
      customMeshes.length > 0
        ? customMeshes.map((mesh) => ({ mesh, baseRotation: Quaternion.Identity() }))
        : [createPrimitiveMesh(scene, node.id, node.shape, node.size)];

    for (const { mesh, baseRotation } of createdMeshes) {
      applyMeshTransform(mesh, root, node.position, node.rotation, baseRotation, material, {
        strataRuntimeKind: 'prop-node',
        strataRuntimeNode: node,
        strataRuntimeMaterialSlot: materialSlot,
        strataRuntimeMeshSource: node.mesh,
        strataRuntimeInteractionActions: propInteractionActionsForNode(descriptor, node.id),
      });
      meshes.push(mesh);
    }
  }

  return {
    kind: 'prop',
    descriptor,
    root,
    meshes,
    materials,
    executeInteraction: (action, state) => executePropInteractionAction(descriptor, action, state),
    dispose: () => disposeInstance(root, meshes, materials, options.disposeMaterials ?? true),
  };
}

/**
 * Instantiates a Reactylon runtime prop descriptor and asynchronously loads mesh-backed nodes.
 */
export async function instantiateBabylonRuntimePropAsync(
  scene: Scene,
  descriptor: ReactylonRuntimePropDescriptor,
  options: BabylonRuntimePropAssetInstantiationOptions = {}
): Promise<BabylonRuntimePropInstance> {
  const root = new TransformNode(options.rootName ?? descriptor.id, scene);
  const materials = buildMaterials(scene, descriptor.materialSlots, options);
  const meshes: AbstractMesh[] = [];

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimeKind: 'prop',
    strataRuntime: descriptor,
    strataRuntimeInteractionActions: descriptor.interactionActions.map(clonePropInteractionAction),
  });

  for (const node of descriptor.nodes) {
    const materialSlot = descriptor.materialSlots[node.materialSlot];
    const material = materials[node.materialSlot];

    if (!materialSlot || !material) {
      throw new Error(
        `Missing Babylon material slot "${node.materialSlot}" for prop "${descriptor.id}"`
      );
    }

    const metadata = {
      strataRuntimeKind: 'prop-node',
      strataRuntimeNode: node,
      strataRuntimeMaterialSlot: materialSlot,
      strataRuntimeMeshSource: node.mesh,
      strataRuntimeInteractionActions: propInteractionActionsForNode(descriptor, node.id),
    };
    const customMeshes = normalizeMeshes(
      options.createNodeMesh?.(node, { scene, root, material, materialSlot })
    );

    if (customMeshes.length > 0) {
      for (const mesh of customMeshes) {
        applyMeshTransform(
          mesh,
          root,
          node.position,
          node.rotation,
          Quaternion.Identity(),
          material,
          metadata
        );
        meshes.push(mesh);
      }
      continue;
    }

    if (node.shape === 'mesh' && node.mesh) {
      const container = createAssetContainer(
        scene,
        root,
        `${node.id}:asset`,
        node.position,
        node.rotation,
        node.size,
        metadata
      );
      const loaded = await loadRuntimeAsset(
        node.mesh,
        {
          scene,
          root,
          source: node.mesh,
          kind: 'prop-node',
          material,
          materialSlot,
          propNode: node,
        },
        options.assetLoader
      );

      attachLoadedMeshes(
        loaded.meshes,
        container,
        material,
        options.useSourceMaterials ?? false,
        metadata
      );
      meshes.push(...loaded.meshes);
      continue;
    }

    const { mesh, baseRotation } = createPrimitiveMesh(scene, node.id, node.shape, node.size);
    applyMeshTransform(mesh, root, node.position, node.rotation, baseRotation, material, metadata);
    meshes.push(mesh);
  }

  return {
    kind: 'prop',
    descriptor,
    root,
    meshes,
    materials,
    executeInteraction: (action, state) => executePropInteractionAction(descriptor, action, state),
    dispose: () => disposeInstance(root, meshes, materials, options.disposeMaterials ?? true),
  };
}

/**
 * Instantiates a Reactylon runtime creature descriptor as native Babylon meshes/materials.
 */
export function instantiateBabylonRuntimeCreature(
  scene: Scene,
  descriptor: ReactylonRuntimeCreatureDescriptor,
  options: BabylonRuntimeCreatureInstantiationOptions = {}
): BabylonRuntimeCreatureInstance {
  const root = new TransformNode(options.rootName ?? descriptor.id, scene);
  const materials = buildMaterials(scene, descriptor.materialSlots, options);
  const meshes: AbstractMesh[] = [];

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimeKind: 'creature',
    strataRuntime: descriptor,
  });

  for (const bone of descriptor.bones) {
    const materialSlot = descriptor.materialSlots[bone.materialSlot];
    const material = materials[bone.materialSlot];

    if (!materialSlot || !material) {
      throw new Error(
        `Missing Babylon material slot "${bone.materialSlot}" for creature "${descriptor.id}"`
      );
    }

    const customMeshes = normalizeMeshes(
      options.createBoneMesh?.(bone, { scene, root, material, materialSlot })
    );
    const createdMeshes =
      customMeshes.length > 0
        ? customMeshes.map((mesh) => ({ mesh, baseRotation: Quaternion.Identity() }))
        : [createPrimitiveMesh(scene, bone.id, bone.shape, bone.size)];

    for (const { mesh, baseRotation } of createdMeshes) {
      applyMeshTransform(mesh, root, bone.position, bone.rotation, baseRotation, material, {
        strataRuntimeKind: 'creature-bone',
        strataRuntimeBone: bone,
        strataRuntimeMaterialSlot: materialSlot,
      });
      meshes.push(mesh);
    }
  }

  return {
    kind: 'creature',
    descriptor,
    root,
    meshes,
    materials,
    animationGroups: [],
    playAnimation: () => false,
    dispose: () => disposeInstance(root, meshes, materials, options.disposeMaterials ?? true),
  };
}

/**
 * Instantiates an asset-backed runtime creature through Babylon's async mesh loading pipeline.
 *
 * Falls back to primitive bone instantiation when the descriptor has no asset model.
 */
export async function instantiateBabylonRuntimeCreatureAsset(
  scene: Scene,
  descriptor: ReactylonRuntimeCreatureDescriptor,
  options: BabylonRuntimeCreatureAssetInstantiationOptions = {}
): Promise<BabylonRuntimeCreatureInstance> {
  const model = descriptor.asset?.model;

  if (!model) {
    return instantiateBabylonRuntimeCreature(scene, descriptor, options);
  }

  const root = new TransformNode(options.rootName ?? `${descriptor.id}:asset`, scene);
  const materials = buildMaterials(scene, descriptor.materialSlots, options);
  const meshes: AbstractMesh[] = [];
  const animation = options.animation
    ? resolveCreatureAnimationName(descriptor, options.animation)
    : undefined;
  const metadata = {
    strataRuntimeKind: 'creature-asset',
    strataRuntime: descriptor,
    strataRuntimeCreature: descriptor,
    strataRuntimeAssetModel: model,
    strataRuntimeAnimation: animation,
  };

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, metadata);

  const loaded = await loadRuntimeAsset(
    model,
    {
      scene,
      root,
      source: model,
      kind: 'creature-asset',
      creature: descriptor,
    },
    options.assetLoader
  );
  const material = Object.values(materials)[0];
  const animationGroups = loaded.animationGroups ?? [];

  attachLoadedMeshes(loaded.meshes, root, material, options.useSourceMaterials ?? true, metadata);

  if (animation) {
    playCreatureAnimation(descriptor, animationGroups, animation, true);
  }

  meshes.push(...loaded.meshes);

  return {
    kind: 'creature',
    descriptor,
    root,
    meshes,
    materials,
    animationGroups,
    playAnimation: (nextAnimation, loop = true) =>
      playCreatureAnimation(descriptor, animationGroups, nextAnimation, loop),
    dispose: () => disposeInstance(root, meshes, materials, options.disposeMaterials ?? true),
  };
}
