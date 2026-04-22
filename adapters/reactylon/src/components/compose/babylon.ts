import {
  type AbstractMesh,
  type AnimationGroup,
  type Material as BabylonMaterial,
  Color3,
  MaterialPluginBase,
  MeshBuilder,
  PBRMaterial,
  PhysicsMotionType,
  Quaternion,
  type Scene,
  SceneLoader,
  ShaderLanguage,
  type Skeleton,
  TransformNode,
  type UniformBuffer,
  Vector3,
} from '@babylonjs/core';
import {
  type CreatureRuntimeRigBindingPlan,
  createCreatureRigBindingPlan,
  createPropInteractionController,
  type MaterialProceduralLayer,
  type MaterialProceduralPlan,
  type MaterialProceduralUniform,
  type PropRuntimeInteractionAction,
  type PropRuntimeInteractionController,
  type PropRuntimeInteractionEffect,
  type PropRuntimeInteractionResult,
  type PropRuntimeInteractionState,
  type RuntimePhysicsProfile,
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

export const BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME = 'StrataRuntimeProceduralMaterial';

export interface BabylonRuntimeAssetLoadResult {
  meshes: AbstractMesh[];
  animationGroups?: AnimationGroup[];
  skeletons?: Skeleton[];
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
  interactionState: PropRuntimeInteractionState;
  interactionController: PropRuntimeInteractionController;
  setInteractionState(state: PropRuntimeInteractionState): PropRuntimeInteractionState;
  resetInteractionState(state?: PropRuntimeInteractionState): PropRuntimeInteractionState;
  executeInteraction(
    action: string | PropRuntimeInteractionAction,
    state?: PropRuntimeInteractionState
  ): PropRuntimeInteractionResult;
  dispose(): void;
}

export type BabylonRuntimePropPhysicsEffect = Extract<
  PropRuntimeInteractionEffect,
  { type: 'physics' }
>;

export interface BabylonRuntimePropPhysicsObjectState {
  mode?: RuntimePhysicsProfile['mode'];
  colliderEnabled?: boolean;
  awake?: boolean;
  lastOperation: BabylonRuntimePropPhysicsEffect['operation'];
}

export interface BabylonRuntimePropPhysicsApplication {
  effect: BabylonRuntimePropPhysicsEffect;
  node: ReactylonRuntimePropNodeDescriptor;
  mesh: AbstractMesh;
  state: BabylonRuntimePropPhysicsObjectState;
}

export interface BabylonRuntimeCreatureInstance {
  kind: 'creature';
  descriptor: ReactylonRuntimeCreatureDescriptor;
  root: TransformNode;
  meshes: AbstractMesh[];
  materials: Record<string, BabylonMaterial>;
  skeletons: Skeleton[];
  animationGroups: AnimationGroup[];
  rigBinding: CreatureRuntimeRigBindingPlan;
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

function colorFromProceduralUniform(uniform: MaterialProceduralUniform): Color3 {
  const value = uniform.value;

  if (uniform.type !== 'color' || typeof value === 'number') {
    return new Color3(Number(value), Number(value), Number(value));
  }

  if (Array.isArray(value)) {
    return new Color3(value[0], value[1], value[2]);
  }

  return Color3.FromHexString(value.startsWith('#') ? value : `#${value}`);
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
    skeletons: result.skeletons,
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

function stripUniformDeclarations(shaderChunk: string): string {
  return shaderChunk
    .split('\n')
    .filter((line) => !line.trim().startsWith('uniform '))
    .join('\n')
    .trim();
}

function proceduralUniformDeclaration(uniform: MaterialProceduralUniform): string {
  switch (uniform.type) {
    case 'color':
      return `uniform vec3 ${uniform.name};`;
    case 'int':
      return `uniform int ${uniform.name};`;
    case 'float':
      return `uniform float ${uniform.name};`;
  }
}

function proceduralUniformBufferDeclaration(uniform: MaterialProceduralUniform): {
  name: string;
  size: number;
  type: string;
} {
  switch (uniform.type) {
    case 'color':
      return { name: uniform.name, size: 3, type: 'vec3' };
    case 'int':
      return { name: uniform.name, size: 1, type: 'int' };
    case 'float':
      return { name: uniform.name, size: 1, type: 'float' };
  }
}

function layerMaskName(layer: MaterialProceduralLayer): string {
  return `${layer.functionName}_mask`;
}

function createBabylonProceduralMaskDeclarations(layers: MaterialProceduralLayer[]): string {
  return layers
    .map(
      (layer) =>
        `  float ${layerMaskName(layer)} = ${layer.functionName}(vPositionW, normalize(vNormalW), strataRuntimeProceduralUv());`
    )
    .join('\n');
}

function babylonProceduralTargetColor(layer: MaterialProceduralLayer, maskName: string): string {
  if (layer.color !== undefined) {
    return `${layer.functionName}_color`;
  }

  if (layer.secondaryColor !== undefined) {
    return `${layer.functionName}_secondaryColor`;
  }

  return `surfaceAlbedo * (1.0 + ${maskName} * 0.2)`;
}

function createBabylonProceduralAlbedoInjection(plan: MaterialProceduralPlan): string {
  const layers = plan.layers.filter(
    (layer) => layer.channels.includes('baseColor') || layer.channels.includes('opacity')
  );

  if (layers.length === 0) {
    return '';
  }

  const masks = createBabylonProceduralMaskDeclarations(layers);
  const colorApplication = layers
    .filter((layer) => layer.channels.includes('baseColor'))
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  surfaceAlbedo = mix(surfaceAlbedo, ${babylonProceduralTargetColor(layer, maskName)}, ${maskName});`;
    })
    .join('\n');
  const opacityApplication = layers
    .filter((layer) => layer.channels.includes('opacity'))
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  alpha = clamp(alpha * (1.0 - ${maskName} * 0.35), 0.0, 1.0);`;
    })
    .join('\n');

  return [masks, colorApplication, opacityApplication].filter(Boolean).join('\n');
}

function createBabylonProceduralReflectivityInjection(plan: MaterialProceduralPlan): string {
  const layers = plan.layers.filter(
    (layer) => layer.channels.includes('roughness') || layer.channels.includes('metalness')
  );

  if (layers.length === 0) {
    return '';
  }

  const masks = createBabylonProceduralMaskDeclarations(layers);
  const roughnessApplication = layers
    .filter((layer) => layer.channels.includes('roughness'))
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  metallicRoughness.g = clamp(metallicRoughness.g + ${maskName} * 0.35, 0.0, 1.0);`;
    })
    .join('\n');
  const metalnessApplication = layers
    .filter((layer) => layer.channels.includes('metalness'))
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  metallicRoughness.r = clamp(metallicRoughness.r - ${maskName} * 0.25, 0.0, 1.0);`;
    })
    .join('\n');

  return [masks, roughnessApplication, metalnessApplication].filter(Boolean).join('\n');
}

function createBabylonProceduralEmissiveInjection(plan: MaterialProceduralPlan): string {
  const layers = plan.layers.filter((layer) => layer.channels.includes('emissive'));

  if (layers.length === 0) {
    return '';
  }

  const masks = createBabylonProceduralMaskDeclarations(layers);
  const emissiveApplication = layers
    .map((layer) => {
      const maskName = layerMaskName(layer);
      return `  finalEmissive = mix(finalEmissive, finalEmissive + vec3(${maskName} * 0.2), ${maskName});`;
    })
    .join('\n');

  return [masks, emissiveApplication].filter(Boolean).join('\n');
}

function createBabylonProceduralDefinitions(plan: MaterialProceduralPlan): string {
  const shaderChunk = stripUniformDeclarations(plan.shaderChunk);
  const uvHelper = /* glsl */ `
vec2 strataRuntimeProceduralUv() {
#if defined(MAINUV1)
  return vMainUV1;
#elif defined(MAINUV2)
  return vMainUV2;
#else
  return vec2(0.0);
#endif
}
`.trim();

  return [shaderChunk, uvHelper].filter(Boolean).join('\n\n');
}

type BabylonMaterialWithPlugins = PBRMaterial & {
  pluginManager?: {
    getPlugin<T>(name: string): T | null;
  };
};

export class BabylonRuntimeProceduralMaterialPlugin extends MaterialPluginBase {
  readonly plan: MaterialProceduralPlan;

  constructor(material: PBRMaterial, plan: MaterialProceduralPlan) {
    super(material, BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME, 210, undefined, false, false);
    this.plan = plan;
    this._pluginManager._addPlugin(this);
    this._enable(true);
  }

  override getClassName(): string {
    return 'BabylonRuntimeProceduralMaterialPlugin';
  }

  override isCompatible(shaderLanguage: ShaderLanguage): boolean {
    return shaderLanguage === ShaderLanguage.GLSL;
  }

  override getUniforms(): {
    ubo: { name: string; size: number; type: string }[];
    fragment: string;
  } {
    return {
      ubo: this.plan.uniforms.map(proceduralUniformBufferDeclaration),
      fragment: this.plan.uniforms.map(proceduralUniformDeclaration).join('\n'),
    };
  }

  override bindForSubMesh(uniformBuffer: UniformBuffer): void {
    for (const uniform of this.plan.uniforms) {
      if (uniform.type === 'color') {
        uniformBuffer.updateColor3(uniform.name, colorFromProceduralUniform(uniform));
        continue;
      }

      if (uniform.type === 'int') {
        uniformBuffer.updateInt(uniform.name, Number(uniform.value));
        continue;
      }

      uniformBuffer.updateFloat(uniform.name, Number(uniform.value));
    }
  }

  override getCustomCode(
    shaderType: string,
    shaderLanguage: ShaderLanguage = ShaderLanguage.GLSL
  ): Record<string, string> | null {
    if (shaderType !== 'fragment' || shaderLanguage !== ShaderLanguage.GLSL) {
      return null;
    }

    return {
      CUSTOM_FRAGMENT_DEFINITIONS: createBabylonProceduralDefinitions(this.plan),
      CUSTOM_FRAGMENT_UPDATE_ALBEDO: createBabylonProceduralAlbedoInjection(this.plan),
      CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS: createBabylonProceduralReflectivityInjection(
        this.plan
      ),
      CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION: createBabylonProceduralEmissiveInjection(
        this.plan
      ),
    };
  }
}

export function getBabylonRuntimeProceduralMaterialPlugin(
  material: PBRMaterial
): BabylonRuntimeProceduralMaterialPlugin | null {
  return (
    (material as BabylonMaterialWithPlugins).pluginManager?.getPlugin(
      BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME
    ) ?? null
  );
}

export function enableBabylonRuntimeProceduralMaterial(
  material: PBRMaterial,
  plan: MaterialProceduralPlan
): BabylonRuntimeProceduralMaterialPlugin | null {
  if (plan.layers.length === 0 || !plan.shaderChunk) {
    return null;
  }

  const existing = getBabylonRuntimeProceduralMaterialPlugin(material);

  if (existing) {
    return existing;
  }

  return new BabylonRuntimeProceduralMaterialPlugin(material, plan);
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
  const proceduralPlugin = slot.procedural
    ? enableBabylonRuntimeProceduralMaterial(material, slot.procedural)
    : null;
  material.metadata = {
    strataRuntimeMaterial: slot,
    strataMaterialProceduralPlan: slot.procedural,
    strataMaterialProceduralBakePlan: slot.proceduralBake,
    strataBabylonProceduralPlugin: proceduralPlugin ? BABYLON_RUNTIME_PROCEDURAL_PLUGIN_NAME : null,
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

function applyPropInteractionStateMetadata(
  root: TransformNode,
  meshes: AbstractMesh[],
  state: PropRuntimeInteractionState
): void {
  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimeInteractionState: state,
  });

  for (const mesh of meshes) {
    mesh.metadata = mergeMetadata(mesh.metadata, {
      strataRuntimeInteractionState: state,
    });
  }
}

interface BabylonPhysicsBodyLike {
  setMotionType?: (motionType: PhysicsMotionType) => void;
  startAsleep?: boolean;
}

interface BabylonPhysicsImpostorLike {
  wakeUp?: () => unknown;
}

interface BabylonRuntimePropMeshMetadata {
  strataRuntimeNode?: ReactylonRuntimePropNodeDescriptor;
  strataRuntimePhysicsState?: BabylonRuntimePropPhysicsObjectState;
}

function isBabylonRuntimePropPhysicsEffect(
  effect: PropRuntimeInteractionResult['effects'][number]
): effect is BabylonRuntimePropPhysicsEffect {
  return effect.type === 'physics';
}

function babylonMotionTypeForRuntimeMode(
  mode: RuntimePhysicsProfile['mode'] | undefined
): PhysicsMotionType | undefined {
  switch (mode) {
    case 'static':
      return PhysicsMotionType.STATIC;
    case 'dynamic':
      return PhysicsMotionType.DYNAMIC;
    case 'kinematic':
      return PhysicsMotionType.ANIMATED;
    case undefined:
      return undefined;
  }
}

function runtimeNodeIdFromBabylonMesh(mesh: AbstractMesh): string | undefined {
  const metadata = mesh.metadata as BabylonRuntimePropMeshMetadata | undefined;

  return metadata?.strataRuntimeNode?.id;
}

function meshesForRuntimeNode(meshes: AbstractMesh[], nodeId: string): AbstractMesh[] {
  return meshes.filter((mesh) => runtimeNodeIdFromBabylonMesh(mesh) === nodeId);
}

function nextBabylonPropPhysicsState(
  mesh: AbstractMesh,
  effect: BabylonRuntimePropPhysicsEffect
): BabylonRuntimePropPhysicsObjectState {
  const metadata = mesh.metadata as BabylonRuntimePropMeshMetadata | undefined;
  const previous = metadata?.strataRuntimePhysicsState;
  const state: BabylonRuntimePropPhysicsObjectState = {
    ...previous,
    lastOperation: effect.operation,
  };

  switch (effect.operation) {
    case 'set-mode':
      if (effect.mode) {
        state.mode = effect.mode;
      }
      break;
    case 'disable-collider':
      state.colliderEnabled = false;
      break;
    case 'enable-collider':
      state.colliderEnabled = true;
      break;
    case 'wake-body':
      state.awake = true;
      break;
  }

  mesh.metadata = mergeMetadata(mesh.metadata, {
    strataRuntimePhysicsState: state,
  });

  return state;
}

function applyBabylonPhysicsEffectToMesh(
  mesh: AbstractMesh,
  effect: BabylonRuntimePropPhysicsEffect
): void {
  const body = (mesh as unknown as { physicsBody?: BabylonPhysicsBodyLike }).physicsBody;
  const impostor = (mesh as unknown as { physicsImpostor?: BabylonPhysicsImpostorLike })
    .physicsImpostor;

  switch (effect.operation) {
    case 'set-mode': {
      const motionType = babylonMotionTypeForRuntimeMode(effect.mode);

      if (motionType !== undefined) {
        body?.setMotionType?.(motionType);
      }
      break;
    }
    case 'disable-collider':
      mesh.checkCollisions = false;
      mesh.isPickable = false;
      break;
    case 'enable-collider':
      mesh.checkCollisions = true;
      mesh.isPickable = true;
      break;
    case 'wake-body':
      if (body) {
        body.startAsleep = false;
      }
      impostor?.wakeUp?.();
      break;
  }
}

function applyBabylonPropPhysicsRootMetadata(
  root: TransformNode,
  applications: BabylonRuntimePropPhysicsApplication[]
): void {
  const metadata = root.metadata as
    | { strataRuntimePhysicsStateByNode?: Record<string, BabylonRuntimePropPhysicsObjectState> }
    | undefined;
  const byNode = { ...(metadata?.strataRuntimePhysicsStateByNode ?? {}) };

  for (const application of applications) {
    byNode[application.node.id] = application.state;
  }

  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimePhysicsStateByNode: byNode,
  });
}

export function applyBabylonPropInteractionPhysicsEffects(
  descriptor: ReactylonRuntimePropDescriptor,
  root: TransformNode,
  meshes: AbstractMesh[],
  result: PropRuntimeInteractionResult
): BabylonRuntimePropPhysicsApplication[] {
  const nodes = new Map(descriptor.nodes.map((node) => [node.id, node]));
  const applications: BabylonRuntimePropPhysicsApplication[] = [];

  for (const effect of result.effects) {
    if (!isBabylonRuntimePropPhysicsEffect(effect)) {
      continue;
    }

    for (const nodeId of effect.nodeIds) {
      const node = nodes.get(nodeId);

      if (!node) {
        continue;
      }

      for (const mesh of meshesForRuntimeNode(meshes, nodeId)) {
        applyBabylonPhysicsEffectToMesh(mesh, effect);
        applications.push({
          effect,
          node,
          mesh,
          state: nextBabylonPropPhysicsState(mesh, effect),
        });
      }
    }
  }

  applyBabylonPropPhysicsRootMetadata(root, applications);
  return applications;
}

function createBabylonPropInteractionController(
  descriptor: ReactylonRuntimePropDescriptor,
  root: TransformNode,
  meshes: AbstractMesh[]
): {
  controller: PropRuntimeInteractionController;
  getState(): PropRuntimeInteractionState;
  setState(state: PropRuntimeInteractionState): PropRuntimeInteractionState;
  resetState(state?: PropRuntimeInteractionState): PropRuntimeInteractionState;
  execute(
    action: string | PropRuntimeInteractionAction,
    state?: PropRuntimeInteractionState
  ): PropRuntimeInteractionResult;
} {
  const controller = createPropInteractionController(descriptor);

  const sync = (state: PropRuntimeInteractionState): PropRuntimeInteractionState => {
    applyPropInteractionStateMetadata(root, meshes, state);
    return state;
  };

  return {
    controller,
    getState: () => controller.getState(),
    setState: (state) => sync(controller.setState(state)),
    resetState: (state) => sync(controller.reset(state)),
    execute: (action, state) => {
      if (state) {
        controller.setState(state);
      }

      const result = controller.execute(action);
      sync(result.nextState);
      applyBabylonPropInteractionPhysicsEffects(descriptor, root, meshes, result);
      return result;
    },
  };
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

function sourceBoneNamesFromSkeletons(skeletons: Skeleton[]): string[] {
  const names = new Set<string>();

  for (const skeleton of skeletons) {
    for (const bone of skeleton.bones) {
      names.add(bone.name);
    }
  }

  return [...names];
}

function createBabylonCreatureRigBindingPlan(
  descriptor: ReactylonRuntimeCreatureDescriptor,
  skeletons: Skeleton[] = []
): CreatureRuntimeRigBindingPlan {
  const sourceBoneNames = sourceBoneNamesFromSkeletons(skeletons);

  return sourceBoneNames.length > 0
    ? createCreatureRigBindingPlan(descriptor, sourceBoneNames)
    : descriptor.rigBinding;
}

function rigBindingForBone(
  plan: CreatureRuntimeRigBindingPlan,
  boneId: string
): CreatureRuntimeRigBindingPlan['bindings'][number] | undefined {
  return plan.bindings.find((binding) => binding.boneId === boneId);
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

  const interactions = createBabylonPropInteractionController(descriptor, root, meshes);
  interactions.resetState();

  return {
    kind: 'prop',
    descriptor,
    root,
    meshes,
    materials,
    get interactionState() {
      return interactions.getState();
    },
    interactionController: interactions.controller,
    setInteractionState: interactions.setState,
    resetInteractionState: interactions.resetState,
    executeInteraction: interactions.execute,
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

  const interactions = createBabylonPropInteractionController(descriptor, root, meshes);
  interactions.resetState();

  return {
    kind: 'prop',
    descriptor,
    root,
    meshes,
    materials,
    get interactionState() {
      return interactions.getState();
    },
    interactionController: interactions.controller,
    setInteractionState: interactions.setState,
    resetInteractionState: interactions.resetState,
    executeInteraction: interactions.execute,
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
  const rigBinding = createBabylonCreatureRigBindingPlan(descriptor);

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, {
    strataRuntimeKind: 'creature',
    strataRuntime: descriptor,
    strataRuntimeRigBinding: rigBinding,
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
        strataRuntimeRigBoneBinding: rigBindingForBone(rigBinding, bone.boneId),
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
    skeletons: [],
    animationGroups: [],
    rigBinding,
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
  const baseMetadata = {
    strataRuntimeKind: 'creature-asset',
    strataRuntime: descriptor,
    strataRuntimeCreature: descriptor,
    strataRuntimeAssetModel: model,
    strataRuntimeAnimation: animation,
  };

  applyRootTransform(root, descriptor.position, descriptor.rotation, descriptor.scale);
  root.metadata = mergeMetadata(root.metadata, baseMetadata);

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
  const skeletons = loaded.skeletons ?? [];
  const rigBinding = createBabylonCreatureRigBindingPlan(descriptor, skeletons);
  const metadata = {
    ...baseMetadata,
    strataRuntimeRigBinding: rigBinding,
  };

  root.metadata = mergeMetadata(root.metadata, metadata);
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
    skeletons,
    animationGroups,
    rigBinding,
    playAnimation: (nextAnimation, loop = true) =>
      playCreatureAnimation(descriptor, animationGroups, nextAnimation, loop),
    dispose: () => disposeInstance(root, meshes, materials, options.disposeMaterials ?? true),
  };
}
