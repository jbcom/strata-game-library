import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
    getAnchorOffset,
    worldToScreen,
    screenToWorld,
    calculateFade,
    formatProgressText,
    clampProgress,
    lerp,
    easeOutCubic,
    easeOutElastic,
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
    type UIAnchor,
    type ProgressBarConfig,
    type InventoryConfig,
    type DialogConfig,
} from '../../src/core/ui';

describe('UI Anchor System', () => {
    it('should return correct offset for topLeft anchor', () => {
        const offset = getAnchorOffset('topLeft', 100, 50);
        expect(offset).toEqual({ x: 0, y: 0 });
    });

    it('should return correct offset for topRight anchor', () => {
        const offset = getAnchorOffset('topRight', 100, 50);
        expect(offset).toEqual({ x: -100, y: 0 });
    });

    it('should return correct offset for bottomLeft anchor', () => {
        const offset = getAnchorOffset('bottomLeft', 100, 50);
        expect(offset).toEqual({ x: 0, y: -50 });
    });

    it('should return correct offset for bottomRight anchor', () => {
        const offset = getAnchorOffset('bottomRight', 100, 50);
        expect(offset).toEqual({ x: -100, y: -50 });
    });

    it('should return correct offset for center anchor', () => {
        const offset = getAnchorOffset('center', 100, 50);
        expect(offset).toEqual({ x: -50, y: -25 });
    });

    it('should return correct offset for top anchor', () => {
        const offset = getAnchorOffset('top', 100, 50);
        expect(offset).toEqual({ x: -50, y: 0 });
    });

    it('should return correct offset for bottom anchor', () => {
        const offset = getAnchorOffset('bottom', 100, 50);
        expect(offset).toEqual({ x: -50, y: -50 });
    });

    it('should return correct offset for left anchor', () => {
        const offset = getAnchorOffset('left', 100, 50);
        expect(offset).toEqual({ x: 0, y: -25 });
    });

    it('should return correct offset for right anchor', () => {
        const offset = getAnchorOffset('right', 100, 50);
        expect(offset).toEqual({ x: -100, y: -25 });
    });
});

describe('Screen Space Positioning', () => {
    let camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        camera = new THREE.PerspectiveCamera(75, 1920 / 1080, 0.1, 1000);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
    });

    it('should convert world position to screen coordinates', () => {
        const position = new THREE.Vector3(0, 0, 0);
        const result = worldToScreen(position, camera, 1920, 1080);
        
        expect(result.x).toBeCloseTo(960, 0);
        expect(result.y).toBeCloseTo(540, 0);
        expect(result.visible).toBe(true);
    });

    it('should mark position behind camera as not visible', () => {
        const position = new THREE.Vector3(0, 0, 15);
        const result = worldToScreen(position, camera, 1920, 1080);
        
        expect(result.visible).toBe(false);
    });

    it('should calculate distance correctly', () => {
        const position = new THREE.Vector3(0, 0, 0);
        const result = worldToScreen(position, camera, 1920, 1080);
        
        expect(result.distance).toBeCloseTo(10, 1);
    });
});

describe('Fade Calculation', () => {
    it('should return 1 when distance is less than fadeStart', () => {
        expect(calculateFade(5, 10, 20)).toBe(1);
    });

    it('should return 0 when distance is greater than fadeEnd', () => {
        expect(calculateFade(25, 10, 20)).toBe(0);
    });

    it('should return 0.5 when distance is at midpoint', () => {
        expect(calculateFade(15, 10, 20)).toBeCloseTo(0.5, 5);
    });

    it('should return 1 at fadeStart', () => {
        expect(calculateFade(10, 10, 20)).toBe(1);
    });

    it('should return 0 at fadeEnd', () => {
        expect(calculateFade(20, 10, 20)).toBe(0);
    });
});

describe('Progress Text Formatting', () => {
    it('should format as percentage', () => {
        expect(formatProgressText(75, 100, 'percentage')).toBe('75%');
    });

    it('should format as fraction', () => {
        expect(formatProgressText(75, 100, 'fraction')).toBe('75/100');
    });

    it('should format as value only', () => {
        expect(formatProgressText(75, 100, 'value')).toBe('75');
    });

    it('should return empty string for none', () => {
        expect(formatProgressText(75, 100, 'none')).toBe('');
    });

    it('should round percentage values', () => {
        expect(formatProgressText(33.33, 100, 'percentage')).toBe('33%');
    });
});

describe('Clamp Progress', () => {
    it('should clamp value to max', () => {
        expect(clampProgress(150, 100)).toBe(100);
    });

    it('should clamp value to 0', () => {
        expect(clampProgress(-50, 100)).toBe(0);
    });

    it('should not change value within range', () => {
        expect(clampProgress(50, 100)).toBe(50);
    });
});

describe('Interpolation Functions', () => {
    it('should lerp correctly at 0', () => {
        expect(lerp(0, 100, 0)).toBe(0);
    });

    it('should lerp correctly at 1', () => {
        expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should lerp correctly at 0.5', () => {
        expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('should ease out cubic at 0', () => {
        expect(easeOutCubic(0)).toBe(0);
    });

    it('should ease out cubic at 1', () => {
        expect(easeOutCubic(1)).toBe(1);
    });

    it('should ease out elastic at 0', () => {
        expect(easeOutElastic(0)).toBe(0);
    });

    it('should ease out elastic at 1', () => {
        expect(easeOutElastic(1)).toBe(1);
    });
});

describe('Text Direction Detection', () => {
    it('should detect LTR for English text', () => {
        expect(getTextDirection('Hello World')).toBe('ltr');
    });

    it('should detect RTL for Arabic text', () => {
        expect(getTextDirection('مرحبا بالعالم')).toBe('rtl');
    });

    it('should detect RTL for Hebrew text', () => {
        expect(getTextDirection('שלום עולם')).toBe('rtl');
    });

    it('should detect LTR for numbers', () => {
        expect(getTextDirection('12345')).toBe('ltr');
    });
});

describe('Default Factory Functions', () => {
    it('should create default progress bar config', () => {
        const config = createDefaultProgressBar();
        
        expect(config.value).toBe(100);
        expect(config.maxValue).toBe(100);
        expect(config.width).toBe(100);
        expect(config.height).toBe(10);
        expect(config.showText).toBe(false);
        expect(config.animationDuration).toBe(300);
    });

    it('should create default inventory config', () => {
        const config = createDefaultInventory(4, 3);
        
        expect(config.columns).toBe(4);
        expect(config.rows).toBe(3);
        expect(config.slots.length).toBe(12);
        expect(config.slotSize).toBe(48);
        expect(config.showTooltips).toBe(true);
        expect(config.allowDrag).toBe(true);
    });

    it('should create default inventory with correct slot IDs', () => {
        const config = createDefaultInventory(2, 2);
        
        expect(config.slots[0].id).toBe('slot-0');
        expect(config.slots[1].id).toBe('slot-1');
        expect(config.slots[2].id).toBe('slot-2');
        expect(config.slots[3].id).toBe('slot-3');
    });

    it('should create default dialog config', () => {
        const config = createDefaultDialog();
        
        expect(config.lines).toEqual([]);
        expect(config.currentLine).toBe(0);
        expect(config.typewriterSpeed).toBe(30);
        expect(config.textDirection).toBe('auto');
        expect(config.skipEnabled).toBe(true);
    });

    it('should create default tooltip config', () => {
        const config = createDefaultTooltip();
        
        expect(config.maxWidth).toBe(250);
        expect(config.fontSize).toBe(14);
        expect(config.padding).toBe(12);
        expect(config.showDelay).toBe(200);
    });

    it('should create default notification config', () => {
        const config = createDefaultNotification();
        
        expect(config.type).toBe('info');
        expect(config.duration).toBe(5000);
        expect(config.dismissible).toBe(true);
        expect(config.progress).toBe(true);
    });

    it('should create default minimap config', () => {
        const config = createDefaultMinimap();
        
        expect(config.size).toBe(150);
        expect(config.zoom).toBe(1);
        expect(config.followPlayer).toBe(true);
        expect(config.showCompass).toBe(true);
    });

    it('should create default crosshair config', () => {
        const config = createDefaultCrosshair();
        
        expect(config.type).toBe('cross');
        expect(config.size).toBe(20);
        expect(config.dot).toBe(true);
        expect(config.dynamic).toBe(false);
    });

    it('should create default damage number config', () => {
        const config = createDefaultDamageNumber();
        
        expect(config.value).toBe(0);
        expect(config.type).toBe('normal');
        expect(config.duration).toBe(1500);
        expect(config.floatDistance).toBe(60);
    });

    it('should create default nameplate config', () => {
        const config = createDefaultNameplate();
        
        expect(config.name).toBe('Unknown');
        expect(config.showHealthBar).toBe(true);
        expect(config.showLevel).toBe(true);
        expect(config.fadeStart).toBe(15);
        expect(config.fadeEnd).toBe(25);
    });
});

describe('Damage Number Colors', () => {
    it('should return white for normal damage', () => {
        expect(getDamageNumberColor('normal')).toBe('#ffffff');
    });

    it('should return red for critical damage', () => {
        expect(getDamageNumberColor('critical')).toBe('#ff6b6b');
    });

    it('should return green for healing', () => {
        expect(getDamageNumberColor('heal')).toBe('#4ade80');
    });

    it('should return gray for miss', () => {
        expect(getDamageNumberColor('miss')).toBe('#9ca3af');
    });

    it('should return blue for block', () => {
        expect(getDamageNumberColor('block')).toBe('#60a5fa');
    });
});

describe('Number Formatting', () => {
    it('should format small numbers normally', () => {
        expect(formatNumber(123)).toBe('123');
    });

    it('should format thousands with K suffix', () => {
        expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should format millions with M suffix', () => {
        expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('should round to nearest integer for small numbers', () => {
        expect(formatNumber(123.7)).toBe('124');
    });
});

describe('Notification Helpers', () => {
    it('should return correct icon for success', () => {
        expect(getNotificationIcon('success')).toBe('✓');
    });

    it('should return correct icon for warning', () => {
        expect(getNotificationIcon('warning')).toBe('⚠');
    });

    it('should return correct icon for error', () => {
        expect(getNotificationIcon('error')).toBe('✕');
    });

    it('should return correct icon for info', () => {
        expect(getNotificationIcon('info')).toBe('ℹ');
    });

    it('should return correct color for success', () => {
        expect(getNotificationColor('success')).toBe('#4ade80');
    });

    it('should return correct color for warning', () => {
        expect(getNotificationColor('warning')).toBe('#fbbf24');
    });

    it('should return correct color for error', () => {
        expect(getNotificationColor('error')).toBe('#ef4444');
    });

    it('should return correct color for info', () => {
        expect(getNotificationColor('info')).toBe('#60a5fa');
    });
});
