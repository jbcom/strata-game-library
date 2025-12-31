/**
 * Core User Interface Utilities and Definitions.
 *
 * Provides pure TypeScript logic, configurations, and helper functions for building
 * immersive, game-ready UI systems that bridge the gap between 2D interfaces and 3D scenes.
 *
 * **Key Features:**
 * - **Coordinate Mapping:** Transform world positions to screen space for nameplates and markers.
 * - **HUD Systems:** Definitions and logic for crosshairs, minimaps, and progress bars.
 * - **Interaction:** Advanced dialogue and inventory state definitions.
 * - **Accessibility:** Automatic RTL (right-to-left) text detection.
 *
 * @packageDocumentation
 * @module core/ui
 * @category UI & Interaction
 *
 * @example
 * ```typescript
 * // Convert world position to screen coordinates for a nameplate
 * const screenPos = worldToScreen(entityPosition, camera, window.innerWidth, window.innerHeight);
 * if (screenPos.visible) {
 *   updateUIElement(screenPos.x, screenPos.y);
 * }
 * ```
 */

import * as THREE from 'three';
import { easeOutCubic, easeOutElastic, lerp } from './math/utils';

export { lerp, easeOutCubic, easeOutElastic };

/**
 * Screen-space anchor points for UI elements.
 * @category UI & Interaction
 */
export type UIAnchor =
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';

/**
 * Supported text directions.
 * @category UI & Interaction
 */
export type TextDirection = 'ltr' | 'rtl' | 'auto';

/**
 * Configuration for a progress bar UI element.
 * @category UI & Interaction
 */
export interface ProgressBarConfig {
    /** Current progress value. */
    value: number;
    /** Maximum value representing 100% completion. */
    maxValue: number;
    /** Physical or pixel width. */
    width?: number;
    /** Physical or pixel height. */
    height?: number;
    /** CSS-compatible background color string. */
    backgroundColor?: string;
    /** CSS-compatible fill color string. */
    fillColor?: string;
    /** CSS-compatible border color string. */
    borderColor?: string;
    /** Border thickness in pixels. */
    borderWidth?: number;
    /** Border radius in pixels for rounded corners. */
    borderRadius?: number;
    /** Whether to display text (e.g., "75%"). */
    showText?: boolean;
    /** Format for the displayed progress text. */
    textFormat?: 'percentage' | 'fraction' | 'value' | 'none';
    /** Duration of fill animations in milliseconds. */
    animationDuration?: number;
    /** Number of visual segments (e.g., for segmented health bars). */
    segments?: number;
    /** CSS-compatible glow color string. */
    glowColor?: string;
    /** Intensity of the glow effect (0-1). */
    glowIntensity?: number;
}

/**
 * Definition of a single item slot in an inventory.
 * @category UI & Interaction
 */
export interface InventorySlot {
    /** Unique identifier for this slot. */
    id: string;
    /** ID of the item currently occupying this slot. */
    itemId?: string;
    /** Display name of the item. */
    itemName?: string;
    /** Path to the item's icon image. */
    itemIcon?: string;
    /** Current quantity of the item. */
    quantity?: number;
    /** Maximum stack size for this item. */
    maxStack?: number;
    /** Whether this slot is locked (unusable). */
    locked?: boolean;
    /** Whether this slot is currently highlighted. */
    highlighted?: boolean;
    /** Item rarity, used for background coloring and categorization. */
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Configuration for an inventory grid or container.
 * @category UI & Interaction
 */
export interface InventoryConfig {
    /** Array of slots defining the inventory contents. */
    slots: InventorySlot[];
    /** Number of columns in the grid. */
    columns: number;
    /** Number of rows in the grid. */
    rows: number;
    /** Pixel size of each slot. */
    slotSize?: number;
    /** Gap between slots in pixels. */
    slotGap?: number;
    /** CSS-compatible background color for the container. */
    backgroundColor?: string;
    /** CSS-compatible background color for each slot. */
    slotBackgroundColor?: string;
    /** CSS-compatible border color for each slot. */
    slotBorderColor?: string;
    /** Border color for the currently selected slot. */
    selectedSlotBorderColor?: string;
    /** Whether to show information tooltips on hover. */
    showTooltips?: boolean;
    /** Whether to allow dragging items between slots. */
    allowDrag?: boolean;
    /** Whether to display item quantities. */
    showQuantity?: boolean;
    /** Mapping of rarity names to CSS-compatible color strings. */
    rarityColors?: Record<string, string>;
}

/**
 * A single line of text in a dialogue sequence.
 * @category UI & Interaction
 */
export interface DialogLine {
    /** Name of the character speaking. */
    speaker?: string;
    /** The actual dialogue text to display. */
    text: string;
    /** Path to an image representing the speaker. */
    speakerImage?: string;
    /** Array of interactive choices available after this line. */
    choices?: DialogChoice[];
    /** Whether to advance to the next line automatically. */
    autoAdvance?: boolean;
    /** Delay in milliseconds before auto-advancing. */
    autoAdvanceDelay?: number;
    /** Optional emotion tag for facial expression synchronization. */
    emotion?: string;
    /** Path to an audio file for this dialogue line. */
    voiceClip?: string;
}

/**
 * An interactive choice presented during a dialogue.
 * @category UI & Interaction
 */
export interface DialogChoice {
    /** Unique identifier for this choice. */
    id: string;
    /** Text displayed to the user for this choice. */
    text: string;
    /** Whether this choice is currently disabled. */
    disabled?: boolean;
    /** Optional function to determine if this choice should be visible. */
    condition?: () => boolean;
    /** Optional tag for branching logic consequence. */
    consequence?: string;
}

/**
 * Configuration for a dialogue system.
 * @category UI & Interaction
 */
export interface DialogConfig {
    /** The full sequence of lines in this dialogue. */
    lines: DialogLine[];
    /** Index of the line currently being displayed. */
    currentLine?: number;
    /** Characters per second for the typewriter effect. */
    typewriterSpeed?: number;
    /** CSS-compatible text color string. */
    textColor?: string;
    /** CSS-compatible background color string. */
    backgroundColor?: string;
    /** CSS-compatible speaker name color string. */
    speakerColor?: string;
    /** Base font size in pixels. */
    fontSize?: number;
    /** CSS-compatible font family string. */
    fontFamily?: string;
    /** Direction of text flow. */
    textDirection?: TextDirection;
    /** Whether to display character portraits. */
    showSpeakerImage?: boolean;
    /** Position of the character portrait relative to the text. */
    imagePosition?: 'left' | 'right';
    /** Character shown when more text is available. */
    continueIndicator?: string;
    /** Whether users can skip the typewriter animation. */
    skipEnabled?: boolean;
    /** Internal container padding in pixels. */
    padding?: number;
    /** Maximum width of the dialogue box in pixels. */
    maxWidth?: number;
    /** Screen corner anchor point. */
    position?: UIAnchor;
}

/**
 * Configuration for hoverable tooltips.
 * @category UI & Interaction
 */
export interface TooltipConfig {
    /** Main heading of the tooltip. */
    title?: string;
    /** Detailed descriptive text. */
    description?: string;
    /** Key-value pairs of statistics to display (e.g., for item stats). */
    stats?: Array<{ label: string; value: string | number; color?: string }>;
    /** Display string for item rarity. */
    rarity?: string;
    /** Color string for rarity text or border. */
    rarityColor?: string;
    /** CSS-compatible background color string. */
    backgroundColor?: string;
    /** CSS-compatible border color string. */
    borderColor?: string;
    /** CSS-compatible text color string. */
    textColor?: string;
    /** Maximum width in pixels. */
    maxWidth?: number;
    /** Base font size in pixels. */
    fontSize?: number;
    /** Internal padding in pixels. */
    padding?: number;
    /** Delay in milliseconds before showing the tooltip. */
    showDelay?: number;
    /** Delay in milliseconds before hiding the tooltip. */
    hideDelay?: number;
}

/**
 * Configuration for temporary screen notifications or "toasts".
 * @category UI & Interaction
 */
export interface NotificationConfig {
    /** Unique identifier for the notification. */
    id?: string;
    /** Main text message to display. */
    message: string;
    /** Optional bold heading. */
    title?: string;
    /** Visual style category. */
    type?: 'info' | 'success' | 'warning' | 'error';
    /** Path to an icon image or emoji character. */
    icon?: string;
    /** Duration in milliseconds before auto-hiding. */
    duration?: number;
    /** Screen corner anchor point. */
    position?: UIAnchor;
    /** Whether the user can manually close the notification. */
    dismissible?: boolean;
    /** Whether to show a countdown progress bar. */
    progress?: boolean;
    /** Callback fired when the notification is dismissed. */
    onDismiss?: () => void;
    /** CSS-compatible background color string. */
    backgroundColor?: string;
    /** CSS-compatible text color string. */
    textColor?: string;
    /** CSS-compatible border color string. */
    borderColor?: string;
    /** Name of the entry animation. */
    animationIn?: string;
    /** Name of the exit animation. */
    animationOut?: string;
}

/**
 * Configuration for an in-game minimap or radar system.
 * @category UI & Interaction
 */
export interface MinimapConfig {
    /** Pixel size of the map (square). */
    size?: number;
    /** Current zoom level (meters per pixel). */
    zoom?: number;
    /** Manual rotation offset in radians. */
    rotation?: number;
    /** Whether the map centers on the player. */
    followPlayer?: boolean;
    /** Whether the map rotates to match the player's heading. */
    rotateWithPlayer?: boolean;
    /** CSS-compatible background color string. */
    backgroundColor?: string;
    /** CSS-compatible border color string. */
    borderColor?: string;
    /** Border thickness in pixels. */
    borderWidth?: number;
    /** Corner radius (size/2 for circular maps). */
    borderRadius?: number;
    /** Path to the player icon image. */
    playerIcon?: string;
    /** Color for the player indicator. */
    playerColor?: string;
    /** Size of the player indicator in pixels. */
    playerSize?: number;
    /** Definitions for custom marker types. */
    markerTypes?: Record<string, MinimapMarker>;
    /** Whether to enable fog-of-war exploration. */
    fogOfWar?: boolean;
    /** Whether to display a north-facing compass needle. */
    showCompass?: boolean;
}

/**
 * Definition of an interactive marker on the minimap.
 * @category UI & Interaction
 */
export interface MinimapMarker {
    /** Path to an icon image. */
    icon?: string;
    /** Color for the marker indicator. */
    color?: string;
    /** Size of the marker in pixels. */
    size?: number;
    /** Text label to show on hover or next to marker. */
    label?: string;
    /** Whether the marker should pulse or blink. */
    blinking?: boolean;
}

/**
 * Configuration for a screen reticle or crosshair.
 * @category UI & Interaction
 */
export interface CrosshairConfig {
    /** Visual style of the reticle. */
    type?: 'dot' | 'cross' | 'circle' | 'custom';
    /** Base size in pixels. */
    size?: number;
    /** Thickness of the lines in pixels. */
    thickness?: number;
    /** Gap between crosshair segments in pixels. */
    gap?: number;
    /** CSS-compatible color string. */
    color?: string;
    /** Color for the reticle outline. */
    outlineColor?: string;
    /** Width of the outline in pixels. */
    outlineWidth?: number;
    /** Global opacity (0-1). */
    opacity?: number;
    /** Whether to show a center dot. */
    dot?: boolean;
    /** Size of the center dot in pixels. */
    dotSize?: number;
    /** Whether the crosshair expands with weapon spread. */
    dynamic?: boolean;
    /** Sensitivity of the dynamic expansion. */
    spreadMultiplier?: number;
}

/**
 * Configuration for animated damage/healing text numbers.
 * @category UI & Interaction
 */
export interface DamageNumberConfig {
    /** The numeric value to display. */
    value: number;
    /** Category determining visual style (color/size). */
    type?: 'normal' | 'critical' | 'heal' | 'miss' | 'block';
    /** CSS-compatible color string override. */
    color?: string;
    /** Font size in pixels. */
    fontSize?: number;
    /** CSS-compatible font family string. */
    fontFamily?: string;
    /** CSS font-weight value. */
    fontWeight?: string;
    /** Total animation duration in milliseconds. */
    duration?: number;
    /** Vertical distance the number floats upwards. */
    floatDistance?: number;
    /** Percentage of duration (0-1) when fading begins. */
    fadeStart?: number;
    /** Initial scale multiplier for impact emphasis. */
    scale?: number;
    /** Maximum random horizontal jitter in pixels. */
    randomOffset?: number;
}

/**
 * Configuration for world-space entity nameplates and health bars.
 * @category UI & Interaction
 */
export interface NameplateConfig {
    /** Entity name to display. */
    name: string;
    /** Optional sub-title or title (e.g., "The Destroyer"). */
    title?: string;
    /** Character level or rank. */
    level?: number;
    /** Configuration for the integrated health bar. */
    healthBar?: ProgressBarConfig;
    /** Guild or faction name. */
    guild?: string;
    /** Faction name or tag. */
    faction?: string;
    /** Color for the main name text. */
    nameColor?: string;
    /** Color for the title text. */
    titleColor?: string;
    /** Background container color. */
    backgroundColor?: string;
    /** Whether to display the integrated health bar. */
    showHealthBar?: boolean;
    /** Whether to display the level indicator. */
    showLevel?: boolean;
    /** Current distance from camera (for auto-scaling/fading). */
    distance?: number;
    /** Distance when nameplate starts to fade out. */
    fadeStart?: number;
    /** Distance when nameplate is completely hidden. */
    fadeEnd?: number;
}

/**
 * Result of a world-to-screen projection.
 * @category UI & Interaction
 */
export interface ScreenPosition {
    /** Screen X coordinate in pixels. */
    x: number;
    /** Screen Y coordinate in pixels. */
    y: number;
    /** Whether the point is within the camera's view frustum and not behind it. */
    visible: boolean;
    /** World distance from the camera. */
    distance: number;
}

/**
 * Calculates the pixel offset for an element based on a screen anchor.
 *
 * @category UI & Interaction
 * @param anchor - The screen corner or center to anchor to.
 * @param width - Width of the UI element in pixels.
 * @param height - Height of the UI element in pixels.
 * @returns An {x, y} offset object.
 */
export function getAnchorOffset(
    anchor: UIAnchor,
    width: number,
    height: number
): { x: number; y: number } {
    switch (anchor) {
        case 'topLeft':
            return { x: 0, y: 0 };
        case 'topRight':
            return { x: -width, y: 0 };
        case 'bottomLeft':
            return { x: 0, y: -height };
        case 'bottomRight':
            return { x: -width, y: -height };
        case 'center':
            return { x: -width / 2, y: -height / 2 };
        case 'top':
            return { x: -width / 2, y: 0 };
        case 'bottom':
            return { x: -width / 2, y: -height };
        case 'left':
            return { x: 0, y: -height / 2 };
        case 'right':
            return { x: -width, y: -height / 2 };
        default:
            return { x: 0, y: 0 };
    }
}

/**
 * Projects a 3D world position into 2D screen coordinates.
 *
 * Essential for placing HTML-based UI elements (nameplates, HUD markers)
 * correctly over 3D game objects.
 *
 * @category UI & Interaction
 * @param position - The world position to project.
 * @param camera - The active Three.js camera.
 * @param width - Current viewport width in pixels.
 * @param height - Current viewport height in pixels.
 * @returns ScreenPosition object containing pixel coordinates and visibility.
 */
export function worldToScreen(
    position: THREE.Vector3,
    camera: THREE.Camera,
    width: number,
    height: number
): ScreenPosition {
    const vector = position.clone();
    vector.project(camera);

    const behindCamera = vector.z > 1;

    const x = (vector.x * 0.5 + 0.5) * width;
    const y = (-vector.y * 0.5 + 0.5) * height;

    const visible = !behindCamera && x >= 0 && x <= width && y >= 0 && y <= height;

    const distance = position.distanceTo(camera.position);

    return { x, y, visible, distance };
}

/**
 * Unprojects 2D screen coordinates into a 3D world position at a specific depth.
 *
 * Used for mouse interaction, placement tools, or aiming systems.
 *
 * @category UI & Interaction
 * @param screenX - Pixel X coordinate.
 * @param screenY - Pixel Y coordinate.
 * @param camera - The active Three.js camera.
 * @param width - Viewport width in pixels.
 * @param height - Viewport height in pixels.
 * @param targetZ - The world Z-depth to project to (default: 0).
 * @returns The resulting Vector3 in world space.
 */
export function screenToWorld(
    screenX: number,
    screenY: number,
    camera: THREE.Camera,
    width: number,
    height: number,
    targetZ: number = 0
): THREE.Vector3 {
    const vector = new THREE.Vector3((screenX / width) * 2 - 1, -(screenY / height) * 2 + 1, 0.5);

    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();

    // Guard against division by zero when camera ray is parallel to XY plane
    if (Math.abs(dir.z) < 0.000001) {
        // Return a point at a reasonable distance along the ray
        return camera.position.clone().add(dir.multiplyScalar(100));
    }

    const distance = (targetZ - camera.position.z) / dir.z;

    return camera.position.clone().add(dir.multiplyScalar(distance));
}

/**
 * Calculates a 0-1 opacity fade based on distance.
 *
 * Used to smoothly hide UI elements as they get further from or closer to the camera.
 *
 * @category UI & Interaction
 * @param distance - Current distance from camera.
 * @param fadeStart - Distance where fading begins.
 * @param fadeEnd - Distance where element is fully transparent.
 * @returns Opacity value (0-1).
 */
export function calculateFade(distance: number, fadeStart: number, fadeEnd: number): number {
    if (distance <= fadeStart) return 1;
    if (distance >= fadeEnd) return 0;
    // Guard against division by zero when fadeStart equals fadeEnd
    if (fadeEnd === fadeStart) return 1;
    return 1 - (distance - fadeStart) / (fadeEnd - fadeStart);
}

/**
 * Formats progress values into human-readable strings.
 *
 * @category UI & Interaction
 * @param value - Current value.
 * @param maxValue - Maximum value.
 * @param format - Output format choice.
 * @returns Formatted string (e.g., "50%", "10/20").
 */
export function formatProgressText(
    value: number,
    maxValue: number,
    format: 'percentage' | 'fraction' | 'value' | 'none'
): string {
    switch (format) {
        case 'percentage':
            // Guard against division by zero when maxValue is zero
            return maxValue === 0 ? '0%' : `${Math.round((value / maxValue) * 100)}%`;
        case 'fraction':
            return `${Math.round(value)}/${Math.round(maxValue)}`;
        case 'value':
            return `${Math.round(value)}`;
        default:
            return '';
    }
}

/**
 * Clamps a progress value between 0 and its maximum.
 *
 * @category UI & Interaction
 * @param value - Input value.
 * @param maxValue - Ceiling value.
 * @returns Clamped progress value.
 */
export function clampProgress(value: number, maxValue: number): number {
    return Math.max(0, Math.min(value, maxValue));
}

/**
 * Detects if a string primarily contains right-to-left characters.
 *
 * Useful for automatic UI orientation in multilingual games.
 *
 * @category UI & Interaction
 * @param text - The string to analyze.
 * @returns 'rtl' or 'ltr'.
 */
export function getTextDirection(text: string): 'ltr' | 'rtl' {
    const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlChars.test(text) ? 'rtl' : 'ltr';
}

/**
 * Creates a default ProgressBar configuration with common gaming styles.
 * @category UI & Interaction
 */
export function createDefaultProgressBar(): ProgressBarConfig {
    return {
        value: 100,
        maxValue: 100,
        width: 100,
        height: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        fillColor: '#4ade80',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderRadius: 2,
        showText: false,
        textFormat: 'percentage',
        animationDuration: 300,
    };
}

/**
 * Creates a default inventory configuration with a specified grid size.
 * @category UI & Interaction
 * @param columns - Number of columns (default: 6).
 * @param rows - Number of rows (default: 4).
 */
export function createDefaultInventory(columns: number = 6, rows: number = 4): InventoryConfig {
    const slots: InventorySlot[] = [];
    for (let i = 0; i < columns * rows; i++) {
        slots.push({ id: `slot-${i}` });
    }

    return {
        slots,
        columns,
        rows,
        slotSize: 48,
        slotGap: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        slotBackgroundColor: 'rgba(50, 50, 50, 0.8)',
        slotBorderColor: 'rgba(100, 100, 100, 0.5)',
        selectedSlotBorderColor: '#d4af37',
        showTooltips: true,
        allowDrag: true,
        showQuantity: true,
        rarityColors: {
            common: '#9ca3af',
            uncommon: '#22c55e',
            rare: '#3b82f6',
            epic: '#a855f7',
            legendary: '#f59e0b',
        },
    };
}

/**
 * Creates a default dialogue system configuration.
 * @category UI & Interaction
 */
export function createDefaultDialog(): DialogConfig {
    return {
        lines: [],
        currentLine: 0,
        typewriterSpeed: 30,
        textColor: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        speakerColor: '#d4af37',
        fontSize: 16,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textDirection: 'auto',
        showSpeakerImage: true,
        imagePosition: 'left',
        continueIndicator: '▼',
        skipEnabled: true,
        padding: 20,
        maxWidth: 600,
        position: 'bottom',
    };
}

/**
 * Creates a default tooltip configuration with standard dark-mode styling.
 * @category UI & Interaction
 */
export function createDefaultTooltip(): TooltipConfig {
    return {
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderColor: 'rgba(100, 100, 100, 0.5)',
        textColor: '#ffffff',
        maxWidth: 250,
        fontSize: 14,
        padding: 12,
        showDelay: 200,
        hideDelay: 0,
    };
}

/**
 * Creates a default notification configuration.
 * @category UI & Interaction
 */
export function createDefaultNotification(): NotificationConfig {
    return {
        message: '',
        type: 'info',
        duration: 5000,
        position: 'topRight',
        dismissible: true,
        progress: true,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        textColor: '#ffffff',
        animationIn: 'slideIn',
        animationOut: 'fadeOut',
    };
}

/**
 * Creates a default minimap configuration.
 * @category UI & Interaction
 */
export function createDefaultMinimap(): MinimapConfig {
    return {
        size: 150,
        zoom: 1,
        rotation: 0,
        followPlayer: true,
        rotateWithPlayer: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderRadius: 75,
        playerColor: '#4ade80',
        playerSize: 8,
        fogOfWar: false,
        showCompass: true,
    };
}

/**
 * Creates a default crosshair configuration.
 * @category UI & Interaction
 */
export function createDefaultCrosshair(): CrosshairConfig {
    return {
        type: 'cross',
        size: 20,
        thickness: 2,
        gap: 4,
        color: '#ffffff',
        outlineColor: '#000000',
        outlineWidth: 1,
        opacity: 0.8,
        dot: true,
        dotSize: 2,
        dynamic: false,
        spreadMultiplier: 1,
    };
}

/**
 * Creates a default damage number configuration with standard impact styling.
 * @category UI & Interaction
 */
export function createDefaultDamageNumber(): DamageNumberConfig {
    return {
        value: 0,
        type: 'normal',
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'Impact, sans-serif',
        fontWeight: 'bold',
        duration: 1500,
        floatDistance: 60,
        fadeStart: 0.5,
        scale: 1,
        randomOffset: 20,
    };
}

/**
 * Creates a default nameplate configuration.
 * @category UI & Interaction
 */
export function createDefaultNameplate(): NameplateConfig {
    return {
        name: 'Unknown',
        nameColor: '#ffffff',
        titleColor: '#a8a29e',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        showHealthBar: true,
        showLevel: true,
        fadeStart: 15,
        fadeEnd: 25,
    };
}

/**
 * Gets the standard color for a damage number type.
 * @category UI & Interaction
 * @param type - The category of damage (e.g., 'critical', 'heal').
 * @returns CSS-compatible color string.
 */
export function getDamageNumberColor(type: DamageNumberConfig['type']): string {
    switch (type) {
        case 'critical':
            return '#ff6b6b';
        case 'heal':
            return '#4ade80';
        case 'miss':
            return '#9ca3af';
        case 'block':
            return '#60a5fa';
        default:
            return '#ffffff';
    }
}

/**
 * Formats a number with commas and human-readable suffixes (K, M).
 *
 * @category UI & Interaction
 * @param value - The number to format.
 * @returns Formatted string (e.g., "1.2K", "5.0M").
 */
export function formatNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toString();
}

/**
 * Gets the standard icon character for a notification type.
 * @category UI & Interaction
 * @param type - The notification category.
 * @returns A single-character icon string.
 */
export function getNotificationIcon(type: NotificationConfig['type']): string {
    switch (type) {
        case 'success':
            return '✓';
        case 'warning':
            return '⚠';
        case 'error':
            return '✕';
        default:
            return 'ℹ';
    }
}

/**
 * Gets the standard theme color for a notification type.
 * @category UI & Interaction
 * @param type - The notification category.
 * @returns CSS-compatible color string.
 */
export function getNotificationColor(type: NotificationConfig['type']): string {
    switch (type) {
        case 'success':
            return '#4ade80';
        case 'warning':
            return '#fbbf24';
        case 'error':
            return '#ef4444';
        default:
            return '#60a5fa';
    }
}
