import { render } from '@testing-library/react';
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { GyroscopeCamera } from '../index';

// Mock R3F useThree and useFrame
vi.mock('@react-three/fiber', () => ({
    useThree: () => ({
        camera: new THREE.PerspectiveCamera(),
    }),
    useFrame: (callback: any) => {
        // Simple mock implementation
        return callback;
    },
}));

describe('GyroscopeCamera', () => {
    it('should render (it returns null but registers listeners)', () => {
        const { container } = render(<GyroscopeCamera />);
        expect(container.firstChild).toBeNull();
    });

    it('should handle DeviceOrientationEvent if available', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        render(<GyroscopeCamera />);
        expect(addSpy).toHaveBeenCalledWith('deviceorientation', expect.any(Function));
        expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.any(Object));
    });
});
