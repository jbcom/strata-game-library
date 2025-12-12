/**
 * Input Presets
 *
 * Pre-configured input control setups for common use cases.
 */

import type {
    GroundSwitchProps,
    Joystick3DProps,
    PressurePlateProps,
    TriggerBehaviorConfig,
    TriggerComposerProps,
    TriggerConfig,
    TriggerMaterialConfig,
    WallButtonProps,
} from '../components/Input';

export interface InputPreset<T> {
    name: string;
    description: string;
    props: Partial<T>;
}

export interface JoystickPreset extends InputPreset<Joystick3DProps> {
    type: 'joystick';
}

export interface SwitchPreset extends InputPreset<GroundSwitchProps> {
    type: 'switch';
}

export interface PlatePreset extends InputPreset<PressurePlateProps> {
    type: 'plate';
}

export interface ButtonPreset extends InputPreset<WallButtonProps> {
    type: 'button';
}

export interface TriggerPreset extends InputPreset<TriggerComposerProps> {
    type: 'trigger';
}

export type InputPresetType =
    | JoystickPreset
    | SwitchPreset
    | PlatePreset
    | ButtonPreset
    | TriggerPreset;

export const WASD_JOYSTICK_PRESET: JoystickPreset = {
    type: 'joystick',
    name: 'WASD Movement',
    description: 'Classic WASD-style movement joystick with responsive feel',
    props: {
        baseColor: '#2a2a2a',
        stalkColor: '#404040',
        knobColor: '#ff6b00',
        size: 1.2,
        deadzone: 0.15,
        returnSpeed: 10,
        maxTilt: Math.PI / 5,
    },
};

export const FLIGHT_STICK_PRESET: JoystickPreset = {
    type: 'joystick',
    name: 'Flight Stick',
    description: 'Aircraft-style joystick with larger dead zone and smooth return',
    props: {
        baseColor: '#1a1a1a',
        stalkColor: '#333333',
        knobColor: '#00aaff',
        size: 1.5,
        deadzone: 0.2,
        returnSpeed: 6,
        maxTilt: Math.PI / 4,
    },
};

export const ARCADE_STICK_PRESET: JoystickPreset = {
    type: 'joystick',
    name: 'Arcade Stick',
    description: 'Snappy arcade-style joystick for fighting games',
    props: {
        baseColor: '#000000',
        stalkColor: '#222222',
        knobColor: '#ff0000',
        size: 0.8,
        deadzone: 0.1,
        returnSpeed: 20,
        maxTilt: Math.PI / 8,
    },
};

export const DOOR_SWITCH_PRESET: SwitchPreset = {
    type: 'switch',
    name: 'Door Switch',
    description: 'Heavy-duty switch for opening doors or gates',
    props: {
        axis: 'z',
        throwDistance: 0.6,
        material: 'brass',
        size: 1.2,
    },
};

export const RAILWAY_SWITCH_PRESET: SwitchPreset = {
    type: 'switch',
    name: 'Railway Switch',
    description: 'Industrial railway-style lever switch',
    props: {
        axis: 'x',
        throwDistance: 0.8,
        material: 'steel',
        size: 1.5,
    },
};

export const CIRCUIT_BREAKER_PRESET: SwitchPreset = {
    type: 'switch',
    name: 'Circuit Breaker',
    description: 'Electrical panel circuit breaker switch',
    props: {
        axis: 'z',
        throwDistance: 0.3,
        material: 'chrome',
        size: 0.6,
    },
};

export const TRAP_TRIGGER_PRESET: PlatePreset = {
    type: 'plate',
    name: 'Trap Trigger',
    description: 'Hidden pressure plate for triggering traps',
    props: {
        size: [1.5, 0.1, 1.5],
        activationDepth: 0.05,
        springiness: 20,
        color: '#8b7355',
        activeColor: '#ff4444',
    },
};

export const FLOOR_BUTTON_PRESET: PlatePreset = {
    type: 'plate',
    name: 'Floor Button',
    description: 'Large floor-mounted activation button',
    props: {
        size: [2, 0.2, 2],
        activationDepth: 0.12,
        springiness: 8,
        color: '#4477aa',
        activeColor: '#44ff44',
    },
};

export const WEIGHT_PLATE_PRESET: PlatePreset = {
    type: 'plate',
    name: 'Weight Plate',
    description: 'Pressure-sensitive plate requiring weight to activate',
    props: {
        size: [1.2, 0.15, 1.2],
        activationDepth: 0.1,
        springiness: 6,
        color: '#666666',
        activeColor: '#ffaa00',
    },
};

export const ELEVATOR_BUTTON_PRESET: ButtonPreset = {
    type: 'button',
    name: 'Elevator Button',
    description: 'Standard elevator call button',
    props: {
        size: 0.15,
        type: 'momentary',
        color: '#888888',
        activeColor: '#ffcc00',
        housingColor: '#333333',
    },
};

export const EMERGENCY_STOP_PRESET: ButtonPreset = {
    type: 'button',
    name: 'Emergency Stop',
    description: 'Large red emergency stop button',
    props: {
        size: 0.4,
        type: 'toggle',
        color: '#cc0000',
        activeColor: '#00ff00',
        housingColor: '#ffff00',
    },
};

export const ARCADE_BUTTON_PRESET: ButtonPreset = {
    type: 'button',
    name: 'Arcade Button',
    description: 'Classic arcade-style push button',
    props: {
        size: 0.25,
        type: 'momentary',
        color: '#0066ff',
        activeColor: '#00ffff',
        housingColor: '#222222',
    },
};

export const VEHICLE_THROTTLE_PRESET: TriggerPreset = {
    type: 'trigger',
    name: 'Vehicle Throttle',
    description: 'Throttle lever for vehicles',
    props: {
        shapeConfig: {
            shape: 'cylinder',
            size: [0.15, 0.5, 0.15],
            segments: 16,
        },
        materialConfig: {
            color: '#444444',
            activeColor: '#00ff00',
            roughness: 0.3,
            metalness: 0.8,
        },
        behaviorConfig: {
            type: 'axis',
            axis: 'y',
            springiness: 8,
            returnSpeed: 4,
        },
    },
};

export const GUN_TRIGGER_PRESET: TriggerPreset = {
    type: 'trigger',
    name: 'Gun Trigger',
    description: 'Weapon firing trigger',
    props: {
        shapeConfig: {
            shape: 'box',
            size: [0.1, 0.15, 0.05],
        },
        materialConfig: {
            color: '#333333',
            activeColor: '#ff3300',
            roughness: 0.5,
            metalness: 0.6,
        },
        behaviorConfig: {
            type: 'pressure',
            threshold: 0.7,
            springiness: 25,
            returnSpeed: 15,
        },
    },
};

export const PICKUP_SPHERE_PRESET: TriggerPreset = {
    type: 'trigger',
    name: 'Pickup Sphere',
    description: 'Glowing collectible sphere',
    props: {
        shapeConfig: {
            shape: 'sphere',
            size: 0.5,
            segments: 24,
        },
        materialConfig: {
            color: '#ffdd00',
            activeColor: '#ffffff',
            roughness: 0.2,
            metalness: 0.3,
            emissiveIntensity: 0.8,
        },
        behaviorConfig: {
            type: 'momentary',
            springiness: 20,
        },
    },
};

export const POWER_SWITCH_PRESET: TriggerPreset = {
    type: 'trigger',
    name: 'Power Switch',
    description: 'Industrial power toggle switch',
    props: {
        shapeConfig: {
            shape: 'box',
            size: [0.2, 0.4, 0.1],
        },
        materialConfig: {
            color: '#cc0000',
            activeColor: '#00cc00',
            roughness: 0.4,
            metalness: 0.7,
        },
        behaviorConfig: {
            type: 'toggle',
            springiness: 15,
        },
    },
};

export const ALL_JOYSTICK_PRESETS: JoystickPreset[] = [
    WASD_JOYSTICK_PRESET,
    FLIGHT_STICK_PRESET,
    ARCADE_STICK_PRESET,
];

export const ALL_SWITCH_PRESETS: SwitchPreset[] = [
    DOOR_SWITCH_PRESET,
    RAILWAY_SWITCH_PRESET,
    CIRCUIT_BREAKER_PRESET,
];

export const ALL_PLATE_PRESETS: PlatePreset[] = [
    TRAP_TRIGGER_PRESET,
    FLOOR_BUTTON_PRESET,
    WEIGHT_PLATE_PRESET,
];

export const ALL_BUTTON_PRESETS: ButtonPreset[] = [
    ELEVATOR_BUTTON_PRESET,
    EMERGENCY_STOP_PRESET,
    ARCADE_BUTTON_PRESET,
];

export const ALL_TRIGGER_PRESETS: TriggerPreset[] = [
    VEHICLE_THROTTLE_PRESET,
    GUN_TRIGGER_PRESET,
    PICKUP_SPHERE_PRESET,
    POWER_SWITCH_PRESET,
];

export const ALL_INPUT_PRESETS: InputPresetType[] = [
    ...ALL_JOYSTICK_PRESETS,
    ...ALL_SWITCH_PRESETS,
    ...ALL_PLATE_PRESETS,
    ...ALL_BUTTON_PRESETS,
    ...ALL_TRIGGER_PRESETS,
];

export function getPresetByName(name: string): InputPresetType | undefined {
    return ALL_INPUT_PRESETS.find((preset) => preset.name === name);
}

export function getPresetsByType<T extends InputPresetType['type']>(
    type: T
): Extract<InputPresetType, { type: T }>[] {
    return ALL_INPUT_PRESETS.filter((preset) => preset.type === type) as Extract<
        InputPresetType,
        { type: T }
    >[];
}

export function createCustomJoystickPreset(
    name: string,
    description: string,
    props: Partial<Joystick3DProps>
): JoystickPreset {
    return {
        type: 'joystick',
        name,
        description,
        props: { ...WASD_JOYSTICK_PRESET.props, ...props },
    };
}

export function createCustomSwitchPreset(
    name: string,
    description: string,
    props: Partial<GroundSwitchProps>
): SwitchPreset {
    return {
        type: 'switch',
        name,
        description,
        props: { ...DOOR_SWITCH_PRESET.props, ...props },
    };
}

export function createCustomPlatePreset(
    name: string,
    description: string,
    props: Partial<PressurePlateProps>
): PlatePreset {
    return {
        type: 'plate',
        name,
        description,
        props: { ...TRAP_TRIGGER_PRESET.props, ...props },
    };
}

export function createCustomButtonPreset(
    name: string,
    description: string,
    props: Partial<WallButtonProps>
): ButtonPreset {
    return {
        type: 'button',
        name,
        description,
        props: { ...ELEVATOR_BUTTON_PRESET.props, ...props },
    };
}

export function createCustomTriggerPreset(
    name: string,
    description: string,
    shapeConfig: TriggerConfig,
    materialConfig?: TriggerMaterialConfig,
    behaviorConfig?: Partial<TriggerBehaviorConfig>
): TriggerPreset {
    const baseBehavior = VEHICLE_THROTTLE_PRESET.props.behaviorConfig!;
    return {
        type: 'trigger',
        name,
        description,
        props: {
            shapeConfig,
            materialConfig: { ...VEHICLE_THROTTLE_PRESET.props.materialConfig, ...materialConfig },
            behaviorConfig: { ...baseBehavior, ...behaviorConfig },
        },
    };
}
