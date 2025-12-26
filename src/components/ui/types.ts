import type { CSSProperties, ReactNode } from 'react';
import type {
    CrosshairConfig,
    DamageNumberConfig,
    DialogChoice,
    DialogConfig,
    DialogLine,
    InventoryConfig,
    InventorySlot,
    MinimapConfig,
    NameplateConfig,
    NotificationConfig,
    ProgressBarConfig,
    TooltipConfig,
    UIAnchor,
} from '../../core/ui';

/**
 * Props for the HealthBar component.
 *
 * Renders a world-space health bar that tracks a 3D target. Useful for NPCs,
 * players, and destructible objects.
 *
 * @category UI & Interaction
 */
export interface HealthBarProps extends Partial<ProgressBarConfig> {
    /** World position [x, y, z] to anchor the bar. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Screen-space pixel offset [x, y] from the anchor point. Default: [0, 0]. */
    offset?: [number, number];
    /** Whether the bar can be hidden by 3D objects in the scene. Default: true. */
    occlude?: boolean;
    /** Distances { start, end } for automatic opacity fading based on camera proximity. */
    distanceFade?: { start: number; end: number };
    /** Custom CSS class for the root HTML element. */
    className?: string;
    /** Custom inline CSS styles for the root HTML element. */
    style?: CSSProperties;
}

/**
 * Ref interface for imperative HealthBar control.
 * @category UI & Interaction
 */
export interface HealthBarRef {
    /** Manually set the current fill value (0 to maxValue). */
    setValue: (value: number) => void;
    /** Update the maximum possible value. */
    setMaxValue: (maxValue: number) => void;
    /** Trigger a visual 'flash' effect, typically used when damage is taken. */
    flash: () => void;
}

/**
 * Props for the Nameplate component.
 *
 * Displays character names, titles, and health bars in world space above entities.
 *
 * @category UI & Interaction
 */
export interface NameplateProps extends Partial<NameplateConfig> {
    /** World position [x, y, z] to anchor the nameplate. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** Screen-space pixel offset [x, y] from the anchor point. Default: [0, 0]. */
    offset?: [number, number];
    /** Whether the plate can be obscured by 3D geometry. Default: true. */
    occlude?: boolean;
    /** Custom CSS class for styling. */
    className?: string;
    /** Custom inline CSS styles. */
    style?: CSSProperties;
}

/**
 * Ref interface for imperative Nameplate control.
 * @category UI & Interaction
 */
export interface NameplateRef {
    /** Update the main displayed name string. */
    setName: (name: string) => void;
    /** Update the integrated health bar levels. */
    setHealth: (value: number, maxValue: number) => void;
}

/**
 * Props for the DamageNumber component.
 *
 * Displays floating, animated text in world space to indicate damage or healing.
 *
 * @category UI & Interaction
 */
export interface DamageNumberProps extends Partial<DamageNumberConfig> {
    /** Starting world position [x, y, z] where the number appears. */
    position: [number, number, number];
    /** Callback fired when the fade animation completes and the component can be unmounted. */
    onComplete?: () => void;
}

/**
 * Props for the ProgressBar3D component.
 *
 * A physical 3D progress bar rendered with Three.js geometry instead of HTML/CSS.
 * Useful for in-world interactions (e.g., loading bars on terminals).
 *
 * @category UI & Interaction
 */
export interface ProgressBar3DProps {
    /** Current fill progress value. */
    value: number;
    /** Maximum progress value (100%). */
    maxValue: number;
    /** Physical width in world units. Default: 1.0. */
    width?: number;
    /** Physical height in world units. Default: 0.1. */
    height?: number;
    /** Physical depth in world units. Default: 0.05. */
    depth?: number;
    /** Hex or CSS color for the filled portion. Default: '#4ade80'. */
    fillColor?: string;
    /** Hex or CSS color for the background trough. Default: '#1f2937'. */
    backgroundColor?: string;
    /** World position [x, y, z]. Default: [0, 0, 0]. */
    position?: [number, number, number];
    /** World rotation [x, y, z] in radians. Default: [0, 0, 0]. */
    rotation?: [number, number, number];
    /** If true, the bar always rotates to face the camera. Default: false. */
    billboard?: boolean;
}

/**
 * Props for the Inventory component.
 *
 * Renders a grid-based item container with support for dragging, tooltips, and selection.
 *
 * @category UI & Interaction
 */
export interface InventoryProps extends Partial<InventoryConfig> {
    /** Callback fired when an item slot is clicked. */
    onSlotClick?: (slot: InventorySlot, index: number) => void;
    /** Callback fired when an item is dropped onto a new slot index. */
    onSlotDrop?: (fromIndex: number, toIndex: number) => void;
    /** Callback fired when a slot is hovered. */
    onSlotHover?: (slot: InventorySlot | null, index: number) => void;
    /** Index of the currently highlighted or active slot. */
    selectedIndex?: number;
    /** Toggles visibility of the inventory UI. Default: true. */
    visible?: boolean;
    /** Screen corner or center to anchor the inventory container. Default: 'center'. */
    anchor?: UIAnchor;
    /** Custom CSS class for the container. */
    className?: string;
    /** Custom inline CSS styles for the container. */
    style?: CSSProperties;
}

/**
 * Ref interface for imperative Inventory control.
 * @category UI & Interaction
 */
export interface InventoryRef {
    /** Programmatically select a slot by its index. */
    selectSlot: (index: number) => void;
    /** Replace the entire set of inventory data. */
    setSlots: (slots: InventorySlot[]) => void;
}

/**
 * Props for the Tooltip component.
 *
 * Provides a context-sensitive information overlay that follows the mouse or anchors to elements.
 *
 * @category UI & Interaction
 */
export interface TooltipProps extends Partial<TooltipConfig> {
    /** Current screen X position in pixels. */
    x?: number;
    /** Current screen Y position in pixels. */
    y?: number;
    /** Toggles visibility. Default: true. */
    visible?: boolean;
    /** Additional React children to render within the tooltip. */
    children?: ReactNode;
    /** Custom CSS class for styling. */
    className?: string;
}

/**
 * Props for the DialogBox component.
 *
 * A full-featured dialogue system for RPGs and visual novels with typewriter effects.
 *
 * @category UI & Interaction
 */
export interface DialogBoxProps extends Partial<DialogConfig> {
    /** Callback fired whenever a single line finishes its typewriter animation. */
    onLineComplete?: (lineIndex: number) => void;
    /** Callback fired when the final line in the sequence is reached and advanced. */
    onDialogComplete?: () => void;
    /** Callback fired when the user selects a branching choice. */
    onChoiceSelect?: (choiceId: string, lineIndex: number) => void;
    /** Toggles visibility. Default: true. */
    visible?: boolean;
    /** Custom CSS class for the dialogue container. */
    className?: string;
    /** Custom inline CSS styles. */
    style?: CSSProperties;
}

/**
 * Ref interface for imperative DialogBox control.
 * @category UI & Interaction
 */
export interface DialogBoxRef {
    /** Advance to the next line or instantly complete the current typewriter animation. */
    advance: () => void;
    /** Force-stop the typewriter animation and show the full line text immediately. */
    skip: () => void;
    /** Restart the dialogue sequence from the first line. */
    reset: () => void;
    /** Jump directly to a specific line in the sequence. */
    setLine: (index: number) => void;
}

/**
 * Props for the Notification component.
 *
 * Renders a single "toast" style message that can auto-dismiss.
 *
 * @category UI & Interaction
 */
export interface NotificationProps extends NotificationConfig {
    /** Callback fired when the notification is closed (manually or via timeout). */
    onDismiss?: () => void;
    /** Custom CSS class for styling. */
    className?: string;
    /** Custom inline CSS styles. */
    style?: CSSProperties;
}

/**
 * Props for the Minimap component.
 *
 * Provides a top-down radar or map view with player tracking and interactive markers.
 *
 * @category UI & Interaction
 */
export interface MinimapProps extends Partial<MinimapConfig> {
    /** Array of interactive markers (POI) to display on the map. */
    markers?: Array<{ position: [number, number]; type?: string; id: string }>;
    /** The player's current world coordinates [x, z]. */
    playerPosition?: [number, number];
    /** The player's current heading in radians. */
    playerRotation?: number;
    /** Path to a custom image for the map terrain. */
    mapImage?: string;
    /** Screen corner to anchor the minimap. Default: 'topRight'. */
    anchor?: UIAnchor;
    /** Custom CSS class for the map container. */
    className?: string;
    /** Custom inline CSS styles. */
    style?: CSSProperties;
}

/**
 * Props for the Crosshair component.
 *
 * Renders a custom reticle at the center of the screen for aiming systems.
 *
 * @category UI & Interaction
 */
export interface CrosshairProps extends Partial<CrosshairConfig> {
    /** Current additional reticle spread (0-100+) representing inaccuracy. */
    spread?: number;
    /** Custom CSS class for the crosshair container. */
    className?: string;
    /** Custom inline CSS styles. */
    style?: CSSProperties;
}

export type {
    CrosshairConfig,
    DamageNumberConfig,
    DialogChoice,
    DialogConfig,
    DialogLine,
    InventoryConfig,
    InventorySlot,
    MinimapConfig,
    NameplateConfig,
    NotificationConfig,
    ProgressBarConfig,
    TooltipConfig,
    UIAnchor,
};
