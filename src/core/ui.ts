/**
 * Core UI Utilities
 *
 * Provides types, configurations, and helper functions for game UI elements.
 * Pure TypeScript implementation with no React dependencies.
 */

import * as THREE from 'three';

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

export type TextDirection = 'ltr' | 'rtl' | 'auto';

export interface ProgressBarConfig {
    value: number;
    maxValue: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    showText?: boolean;
    textFormat?: 'percentage' | 'fraction' | 'value' | 'none';
    animationDuration?: number;
    segments?: number;
    glowColor?: string;
    glowIntensity?: number;
}

export interface InventorySlot {
    id: string;
    itemId?: string;
    itemName?: string;
    itemIcon?: string;
    quantity?: number;
    maxStack?: number;
    locked?: boolean;
    highlighted?: boolean;
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface InventoryConfig {
    slots: InventorySlot[];
    columns: number;
    rows: number;
    slotSize?: number;
    slotGap?: number;
    backgroundColor?: string;
    slotBackgroundColor?: string;
    slotBorderColor?: string;
    selectedSlotBorderColor?: string;
    showTooltips?: boolean;
    allowDrag?: boolean;
    showQuantity?: boolean;
    rarityColors?: Record<string, string>;
}

export interface DialogLine {
    speaker?: string;
    text: string;
    speakerImage?: string;
    choices?: DialogChoice[];
    autoAdvance?: boolean;
    autoAdvanceDelay?: number;
    emotion?: string;
    voiceClip?: string;
}

export interface DialogChoice {
    id: string;
    text: string;
    disabled?: boolean;
    condition?: () => boolean;
    consequence?: string;
}

export interface DialogConfig {
    lines: DialogLine[];
    currentLine?: number;
    typewriterSpeed?: number;
    textColor?: string;
    backgroundColor?: string;
    speakerColor?: string;
    fontSize?: number;
    fontFamily?: string;
    textDirection?: TextDirection;
    showSpeakerImage?: boolean;
    imagePosition?: 'left' | 'right';
    continueIndicator?: string;
    skipEnabled?: boolean;
    padding?: number;
    maxWidth?: number;
    position?: UIAnchor;
}

export interface TooltipConfig {
    title?: string;
    description?: string;
    stats?: Array<{ label: string; value: string | number; color?: string }>;
    rarity?: string;
    rarityColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    maxWidth?: number;
    fontSize?: number;
    padding?: number;
    showDelay?: number;
    hideDelay?: number;
}

export interface NotificationConfig {
    id?: string;
    message: string;
    title?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    icon?: string;
    duration?: number;
    position?: UIAnchor;
    dismissible?: boolean;
    progress?: boolean;
    onDismiss?: () => void;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    animationIn?: string;
    animationOut?: string;
}

export interface MinimapConfig {
    size?: number;
    zoom?: number;
    rotation?: number;
    followPlayer?: boolean;
    rotateWithPlayer?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    playerIcon?: string;
    playerColor?: string;
    playerSize?: number;
    markerTypes?: Record<string, MinimapMarker>;
    fogOfWar?: boolean;
    showCompass?: boolean;
}

export interface MinimapMarker {
    icon?: string;
    color?: string;
    size?: number;
    label?: string;
    blinking?: boolean;
}

export interface CrosshairConfig {
    type?: 'dot' | 'cross' | 'circle' | 'custom';
    size?: number;
    thickness?: number;
    gap?: number;
    color?: string;
    outlineColor?: string;
    outlineWidth?: number;
    opacity?: number;
    dot?: boolean;
    dotSize?: number;
    dynamic?: boolean;
    spreadMultiplier?: number;
}

export interface DamageNumberConfig {
    value: number;
    type?: 'normal' | 'critical' | 'heal' | 'miss' | 'block';
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    duration?: number;
    floatDistance?: number;
    fadeStart?: number;
    scale?: number;
    randomOffset?: number;
}

export interface NameplateConfig {
    name: string;
    title?: string;
    level?: number;
    healthBar?: ProgressBarConfig;
    guild?: string;
    faction?: string;
    nameColor?: string;
    titleColor?: string;
    backgroundColor?: string;
    showHealthBar?: boolean;
    showLevel?: boolean;
    distance?: number;
    fadeStart?: number;
    fadeEnd?: number;
}

export interface ScreenPosition {
    x: number;
    y: number;
    visible: boolean;
    distance: number;
}

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

export function calculateFade(distance: number, fadeStart: number, fadeEnd: number): number {
    if (distance <= fadeStart) return 1;
    if (distance >= fadeEnd) return 0;
    // Guard against division by zero when fadeStart equals fadeEnd
    if (fadeEnd === fadeStart) return 1;
    return 1 - (distance - fadeStart) / (fadeEnd - fadeStart);
}

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

export function clampProgress(value: number, maxValue: number): number {
    return Math.max(0, Math.min(value, maxValue));
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function easeOutCubic(t: number): number {
    return 1 - (1 - t) ** 3;
}

export function easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function getTextDirection(text: string): 'ltr' | 'rtl' {
    const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlChars.test(text) ? 'rtl' : 'ltr';
}

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

export function formatNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toString();
}

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
