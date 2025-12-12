/**
 * @module Experience
 * @category Player Experience
 *
 * Player Experience - Cameras, Input, Audio, and UI
 *
 * Everything that connects the player to your game - how they see it,
 * how they control it, what they hear, and what information they receive.
 *
 * @example
 * ```tsx
 * import { FollowCamera, AudioProvider, HealthBar } from '@jbcom/strata/api/experience';
 *
 * function Game() {
 *   return (
 *     <AudioProvider>
 *       <FollowCamera target={playerRef} distance={5} />
 *       <HealthBar current={75} max={100} />
 *     </AudioProvider>
 *   );
 * }
 * ```
 */

// Camera Systems - React components
export {
    FollowCamera,
    OrbitCamera,
    FPSCamera,
    CinematicCamera,
    CameraShake,
    useCameraTransition,
} from '../components';

export type {
    FollowCameraProps,
    FollowCameraRef,
    OrbitCameraProps,
    OrbitCameraRef,
    FPSCameraProps,
    FPSCameraRef,
    CinematicCameraProps,
    CinematicCameraRef,
    CameraShakeProps,
    CameraShakeRef,
    CameraTransitionProps,
} from '../components';

// Camera Systems - Core utilities
export {
    CameraShake as CoreCameraShake,
    FOVTransition,
    lerp,
    lerpVector3,
    slerp,
    smoothDamp,
    smoothDampVector3,
    easeInOutCubic,
    easeOutCubic,
    easeInCubic,
    easeOutElastic,
    evaluateCatmullRom,
    calculateLookAhead,
    calculateHeadBob,
    calculateScreenShakeIntensity,
} from '../core';

export type {
    CameraShakeConfig,
    FOVTransitionConfig,
    CameraPath,
    ScreenShakeIntensity,
} from '../core';

// Input Handling - React components
export {
    Joystick3D,
    GroundSwitch,
    PressurePlate,
    WallButton,
    TriggerComposer,
} from '../components';

export type {
    InputControlRef,
    InputControlEvents,
    Joystick3DProps,
    Joystick3DRef,
    GroundSwitchProps,
    GroundSwitchRef,
    PressurePlateProps,
    PressurePlateRef,
    WallButtonProps,
    WallButtonRef,
    TriggerShape,
    TriggerBehavior,
    TriggerConfig,
    TriggerMaterialConfig,
    TriggerBehaviorConfig,
    TriggerComposerProps,
    TriggerComposerRef,
} from '../components';

// Input Handling - Core utilities
export {
    InputManager,
    InputStateMachine,
    HapticFeedback,
    createInputManager,
    normalizeAxisValue,
    clampAxis,
    axisToAngle,
    axisToMagnitude,
    angleToAxis,
} from '../core';

export type {
    DragState,
    InputAxis,
    InputEvent,
    HapticPattern,
    GamepadState,
    PointerState,
    InputManagerConfig,
} from '../core';

// Audio System - React components
export {
    AudioProvider,
    AudioListener,
    PositionalAudio,
    AmbientAudio,
    AudioZone,
    AudioEmitter,
    AudioEnvironment,
    FootstepAudio,
    WeatherAudio,
    useAudioContext,
    useAudioManager,
} from '../components';

export type {
    AudioContextValue,
    AudioProviderProps,
    AudioListenerProps,
    PositionalAudioProps,
    PositionalAudioRef,
    AmbientAudioProps,
    AmbientAudioRef,
    AudioZoneProps,
    AudioZoneRef,
    AudioEmitterProps,
    AudioEmitterRef,
    AudioEnvironmentProps,
    FootstepAudioProps,
    FootstepAudioRef,
    WeatherAudioProps,
} from '../components';

// Audio System - Core utilities
export {
    Howl,
    Howler,
    SoundManager,
    SpatialAudio,
    createSoundManager,
    createSpatialAudio,
    ENVIRONMENT_PRESETS,
    DEFAULT_SPATIAL_CONFIG,
    isAudioContextUnlocked,
    unlockAudioContext,
    setupAutoUnlock,
    getAudioContext,
    suspendAudioContext,
    resumeAudioContext,
} from '../core';

export type {
    AudioConfig,
    SoundConfig,
    SpatialConfig,
    AudioBus,
    AudioMixer,
    DistanceModel,
    AudioFormat,
    EnvironmentPreset,
    EnvironmentEffectConfig,
    AudioListenerState,
} from '../core';

// Game UI - React components
export {
    HealthBar,
    Nameplate,
    DamageNumber,
    ProgressBar3D,
    Inventory,
    Tooltip,
    DialogBox,
    Notification,
    Minimap,
    Crosshair,
} from '../components';

export type {
    HealthBarProps,
    HealthBarRef,
    NameplateProps,
    NameplateRef,
    DamageNumberProps,
    ProgressBar3DProps,
    InventoryProps,
    InventoryRef,
    TooltipProps,
    DialogBoxProps,
    DialogBoxRef,
    NotificationProps,
    MinimapProps,
    CrosshairProps,
} from '../components';

// Game UI - Core utilities
export {
    getAnchorOffset,
    worldToScreen,
    screenToWorld,
    calculateFade,
    formatProgressText,
    clampProgress,
    uiLerp,
    uiEaseOutCubic,
    uiEaseOutElastic,
    getTextDirection,
    createDefaultProgressBar,
    createDefaultInventory,
    createDefaultDialog,
    createDefaultTooltip,
    createDefaultNotification,
    createDefaultMinimap,
    createDefaultCrosshair,
    createDefaultDamageNumber,
    createDefaultNameplate,
    getDamageNumberColor,
    formatNumber,
    getNotificationIcon,
    getNotificationColor,
} from '../core';

export type {
    UIAnchor,
    TextDirection,
    ProgressBarConfig,
    InventorySlot,
    InventoryConfig,
    DialogLine,
    DialogChoice,
    DialogConfig,
    TooltipConfig,
    NotificationConfig,
    MinimapConfig,
    MinimapMarker,
    CrosshairConfig,
    DamageNumberConfig,
    NameplateConfig,
    ScreenPosition,
} from '../core';
