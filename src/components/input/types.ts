import type * as THREE from 'three';
import type { DragState, InputAxis, InputEvent } from '../../core/input';

/**
 * Base ref interface for all input controls.
 * @category UI & Interaction
 */
export interface InputControlRef {
    /** Get current axis values (usually -1 to 1). */
    getAxis: () => InputAxis;
    /** Get the world position of the control. */
    getWorldPosition: () => THREE.Vector3;
    /** Whether the control is currently being interacted with. */
    isActive: () => boolean;
    /** Reset the control to its neutral state. */
    reset: () => void;
}

/**
 * Event callbacks for input controls.
 * @category UI & Interaction
 */
export interface InputControlEvents {
    /** Fired when the control is first pressed or activated. */
    onActivate?: (event: InputEvent) => void;
    /** Fired when the control is released or deactivated. */
    onDeactivate?: (event: InputEvent) => void;
    /** Fired continuously as axis values change. */
    onAxisChange?: (axis: InputAxis, worldPosition: THREE.Vector3) => void;
    /** Fired on initial interaction start. */
    onPress?: (event: InputEvent) => void;
    /** Fired when interaction ends. */
    onRelease?: (event: InputEvent) => void;
}

/**
 * Props for the Joystick3D component.
 * @category UI & Interaction
 */
export interface Joystick3DProps extends InputControlEvents {
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Color of the joystick base. Default: '#333333'. */
    baseColor?: THREE.ColorRepresentation;
    /** Color of the joystick stalk. Default: '#555555'. */
    stalkColor?: THREE.ColorRepresentation;
    /** Color of the draggable knob. Default: '#ff6600'. */
    knobColor?: THREE.ColorRepresentation;
    /** Overall scale multiplier. Default: 1.0. */
    size?: number;
    /** Deadzone threshold (0-1). Movements below this are ignored. Default: 0.1. */
    deadzone?: number;
    /** Speed at which the joystick returns to center. Default: 8. */
    returnSpeed?: number;
    /** Maximum tilt angle in radians. Default: PI / 6. */
    maxTilt?: number;
}

/**
 * Ref interface for Joystick3D.
 * @category UI & Interaction
 */
export interface Joystick3DRef extends InputControlRef {
    /** Add a visual/haptic trauma effect to the joystick. */
    addTrauma: (amount: number) => void;
}

/**
 * Props for the GroundSwitch component.
 * @category UI & Interaction
 */
export interface GroundSwitchProps extends InputControlEvents {
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Primary axis of movement ('x' or 'z'). Default: 'z'. */
    axis?: 'x' | 'z';
    /** Distance the lever travels in each direction. Default: 0.5. */
    throwDistance?: number;
    /** Visual material style. Default: 'steel'. */
    material?: 'steel' | 'brass' | 'chrome';
    /** Overall scale multiplier. Default: 1.0. */
    size?: number;
}

/**
 * Ref interface for GroundSwitch.
 * @category UI & Interaction
 */
export interface GroundSwitchRef extends InputControlRef {
    /** Toggle the switch position manually. */
    toggle: () => void;
    /** Manually set the switch value (-1 to 1). */
    setValue: (value: number) => void;
}

/**
 * Props for the PressurePlate component.
 * @category UI & Interaction
 */
export interface PressurePlateProps extends InputControlEvents {
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Plate dimensions [width, height, depth]. Default: [1, 0.15, 1]. */
    size?: [number, number, number];
    /** Depth at which the plate activates. Default: 0.08. */
    activationDepth?: number;
    /** Return spring stiffness. Default: 12. */
    springiness?: number;
    /** Inactive plate color. Default: '#aa4444'. */
    color?: THREE.ColorRepresentation;
    /** Active plate color. Default: '#44aa44'. */
    activeColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for PressurePlate.
 * @category UI & Interaction
 */
export interface PressurePlateRef extends InputControlRef {
    /** Manually set the pressed state. */
    setPressed: (pressed: boolean) => void;
    /** Get current pressure normalized to activation depth. */
    getPressure: () => number;
}

/**
 * Props for the WallButton component.
 * @category UI & Interaction
 */
export interface WallButtonProps extends InputControlEvents {
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** World rotation [x, y, z] in radians. Default: [0, 0, 0]. */
    rotation?: [number, number, number];
    /** Button scale multiplier. Default: 0.3. */
    size?: number;
    /** Interaction mode. 'toggle' stays pressed until next click. Default: 'momentary'. */
    type?: 'momentary' | 'toggle';
    /** Neutral button color. Default: '#cc3333'. */
    color?: THREE.ColorRepresentation;
    /** Pressed/active button color. Default: '#33cc33'. */
    activeColor?: THREE.ColorRepresentation;
    /** Color of the button housing. Default: '#444444'. */
    housingColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for WallButton.
 * @category UI & Interaction
 */
export interface WallButtonRef extends InputControlRef {
    /** Programmatically trigger a press event. */
    press: () => void;
    /** Manually set the active state. */
    setActive: (active: boolean) => void;
}

export type TriggerShape = 'box' | 'sphere' | 'cylinder' | 'custom';
export type TriggerBehavior = 'momentary' | 'toggle' | 'axis' | 'pressure';

/**
 * Configuration for trigger geometry.
 * @category UI & Interaction
 */
export interface TriggerConfig {
    /** Geometric primitive for the trigger. */
    shape: TriggerShape;
    /** Scale of the trigger. Default: 1. */
    size?: [number, number, number] | number;
    /** Geometry segments for rounded shapes. Default: 16. */
    segments?: number;
    /** Optional custom BufferGeometry. */
    customGeometry?: THREE.BufferGeometry;
}

/**
 * Configuration for trigger material appearance.
 * @category UI & Interaction
 */
export interface TriggerMaterialConfig {
    /** Neutral color. */
    color?: THREE.ColorRepresentation;
    /** Active/pressed color. */
    activeColor?: THREE.ColorRepresentation;
    /** Surface roughness. Default: 0.5. */
    roughness?: number;
    /** Surface metalness. Default: 0.5. */
    metalness?: number;
    /** Glow intensity when active. */
    emissiveIntensity?: number;
}

/**
 * Configuration for trigger behavior.
 * @category UI & Interaction
 */
export interface TriggerBehaviorConfig {
    /** Logic type for the trigger. */
    type: TriggerBehavior;
    /** Primary axis for movement ('x', 'y', 'z'). Default: 'y'. */
    axis?: 'x' | 'y' | 'z';
    /** Activation threshold (0-1). Default: 0.5. */
    threshold?: number;
    /** Return spring stiffness. Default: 12. */
    springiness?: number;
    /** Return speed when not using springs. Default: 8. */
    returnSpeed?: number;
}

/**
 * Props for the TriggerComposer component.
 * @category UI & Interaction
 */
export interface TriggerComposerProps extends InputControlEvents {
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** World rotation [x, y, z] in radians. Default: [0, 0, 0]. */
    rotation?: [number, number, number];
    /** Shape and geometry configuration. */
    shapeConfig: TriggerConfig;
    /** Visual appearance configuration. */
    materialConfig?: TriggerMaterialConfig;
    /** Interaction logic configuration. */
    behaviorConfig?: TriggerBehaviorConfig;
}

/**
 * Ref interface for TriggerComposer.
 * @category UI & Interaction
 */
export interface TriggerComposerRef extends InputControlRef {
    /** Manually set the trigger value (-1 to 1). */
    setValue: (value: number) => void;
    /** Access the underlying Mesh instance. */
    getMesh: () => THREE.Mesh | null;
}

export type { InputAxis, InputEvent, DragState };
