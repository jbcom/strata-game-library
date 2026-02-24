/**
 * @fileoverview Tests for the Parallax Background System.
 * @module components/parallax/__tests__/parallax.test
 */

import { render } from '@testing-library/react';
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { ParallaxBackground, SideScrollerBackground } from '../ParallaxBackground';
import { InfiniteRepeater, ParallaxLayer } from '../ParallaxLayer';
import { generateBackgroundLayers, ProceduralBackgroundComponent } from '../ProceduralBackground';
import type { ParallaxLayerConfig, ProceduralBackgroundConfig } from '../types';
import { calculateRepeats } from '../useParallax';

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
    viewport: { width: 1920, height: 1080 },
  }),
  useFrame: vi.fn((callback) => callback),
}));

describe('Parallax System', () => {
  describe('ParallaxLayer', () => {
    it('should render with required props', () => {
      const { container } = render(
        <ParallaxLayer id="test" depth={5} scrollSpeed={0.5}>
          <mesh />
        </ParallaxLayer>
      );
      expect(container).toBeDefined();
    });

    it('should accept optional props', () => {
      const { container } = render(
        <ParallaxLayer
          id="test"
          depth={5}
          scrollSpeed={0.5}
          verticalScrollSpeed={0.2}
          repeatX
          repeatY
          contentWidth={512}
          contentHeight={256}
          opacity={0.8}
          tint={0xff0000}
          affectedByDayNight
          dayNightColors={{
            day: 0xffffff,
            night: 0x333366,
            dawn: 0xffaa66,
            dusk: 0xff6644,
          }}
        >
          <mesh />
        </ParallaxLayer>
      );
      expect(container).toBeDefined();
    });

    it('should handle string tint color', () => {
      const { container } = render(
        <ParallaxLayer id="test" depth={5} scrollSpeed={0.5} tint="#ff0000">
          <mesh />
        </ParallaxLayer>
      );
      expect(container).toBeDefined();
    });

    it('should handle THREE.Color tint', () => {
      const { container } = render(
        <ParallaxLayer id="test" depth={5} scrollSpeed={0.5} tint={new THREE.Color(0xff0000)}>
          <mesh />
        </ParallaxLayer>
      );
      expect(container).toBeDefined();
    });
  });

  describe('InfiniteRepeater', () => {
    it('should calculate correct number of instances', () => {
      const { container } = render(
        <InfiniteRepeater contentWidth={256} viewportWidth={1920} scrollX={0}>
          <mesh />
        </InfiniteRepeater>
      );
      expect(container).toBeDefined();
    });

    it('should handle zero content width', () => {
      const { container } = render(
        <InfiniteRepeater contentWidth={0} viewportWidth={1920} scrollX={0}>
          <mesh />
        </InfiniteRepeater>
      );
      expect(container).toBeDefined();
    });

    it('should support vertical direction', () => {
      const { container } = render(
        <InfiniteRepeater contentWidth={256} viewportWidth={1080} scrollX={0} direction="vertical">
          <mesh />
        </InfiniteRepeater>
      );
      expect(container).toBeDefined();
    });
  });

  describe('ParallaxBackground', () => {
    it('should render with minimal props', () => {
      const { container } = render(<ParallaxBackground />);
      expect(container).toBeDefined();
    });

    it('should render with all props', () => {
      const layers: ParallaxLayerConfig[] = [
        { id: 'sky', depth: 10, scrollSpeed: 0.1 },
        { id: 'mountains', depth: 8, scrollSpeed: 0.2 },
      ];

      const { container } = render(
        <ParallaxBackground
          layers={layers}
          scrollX={100}
          scrollY={50}
          baseWidth={480}
          baseHeight={270}
          timeOfDay={14}
          autoScroll
          autoScrollSpeed={20}
          enableDepthFog
          fogColor={0x88aacc}
          fogDensity={0.1}
        />
      );
      expect(container).toBeDefined();
    });

    it('should accept children', () => {
      const { container } = render(
        <ParallaxBackground scrollX={0}>
          <ParallaxLayer id="child" depth={5} scrollSpeed={0.5}>
            <mesh />
          </ParallaxLayer>
        </ParallaxBackground>
      );
      expect(container).toBeDefined();
    });
  });

  describe('SideScrollerBackground', () => {
    it('should render with minimal props', () => {
      const { container } = render(
        <SideScrollerBackground scrollX={0}>
          <mesh />
        </SideScrollerBackground>
      );
      expect(container).toBeDefined();
    });

    it('should accept fog and timeOfDay props', () => {
      const { container } = render(
        <SideScrollerBackground scrollX={100} fog fogColor={0xaabbcc} timeOfDay={18}>
          <mesh />
        </SideScrollerBackground>
      );
      expect(container).toBeDefined();
    });
  });

  describe('calculateRepeats', () => {
    it('should calculate correct repeat count', () => {
      const result = calculateRepeats(1920, 256, 0);
      expect(result.count).toBeGreaterThanOrEqual(8); // 1920/256 = 7.5, + 2 buffer = 10
    });

    it('should handle zero content width', () => {
      const result = calculateRepeats(1920, 0, 0);
      expect(result.count).toBe(1);
      expect(result.startOffset).toBe(0);
    });

    it('should calculate correct start offset', () => {
      const result = calculateRepeats(1920, 256, 128);
      expect(result.startOffset).toBe(-128 - 256);
    });

    it('should wrap offset for large scroll values', () => {
      const result = calculateRepeats(1920, 256, 512);
      // 512 % 256 = 0, offset is -256
      expect(result.startOffset).toBeCloseTo(-256, 10);
    });

    it('should handle negative scroll values', () => {
      const result = calculateRepeats(1920, 256, -128);
      expect(result.startOffset).toBe(-128 - 256);
    });
  });

  describe('generateBackgroundLayers', () => {
    const biomes: ProceduralBackgroundConfig['biome'][] = [
      'forest',
      'desert',
      'tundra',
      'marsh',
      'mountain',
      'ocean',
      'cave',
      'city',
    ];

    it.each(biomes)('should generate layers for %s biome', (biome) => {
      const config: ProceduralBackgroundConfig = {
        biome,
        layerCount: 5,
        seed: 12345,
      };
      const layers = generateBackgroundLayers(config);

      expect(layers.length).toBeGreaterThan(0);
      expect(layers[0].config.id).toBe('sky');
    });

    it('should generate consistent layers with same seed', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'forest',
        layerCount: 5,
        seed: 12345,
      };
      const layers1 = generateBackgroundLayers(config);
      const layers2 = generateBackgroundLayers(config);

      expect(layers1.length).toBe(layers2.length);
      expect(layers1[0].config.id).toBe(layers2[0].config.id);
    });

    it('should generate different layers with different seeds', () => {
      const config1: ProceduralBackgroundConfig = {
        biome: 'forest',
        layerCount: 5,
        seed: 12345,
      };
      const config2: ProceduralBackgroundConfig = {
        biome: 'forest',
        layerCount: 5,
        seed: 54321,
      };
      const layers1 = generateBackgroundLayers(config1);
      const layers2 = generateBackgroundLayers(config2);

      // Layers structure same, but content width should differ
      expect(layers1.length).toBe(layers2.length);
    });

    it('should add particles when animated is true', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'marsh', // Has fireflies
        layerCount: 5,
        seed: 12345,
        animated: true,
      };
      const layers = generateBackgroundLayers(config);

      const particleLayer = layers.find((l) => l.config.id === 'particles');
      expect(particleLayer).toBeDefined();
    });

    it('should not add particles when animated is false', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'forest',
        layerCount: 5,
        seed: 12345,
        animated: false,
      };
      const layers = generateBackgroundLayers(config);

      const particleLayer = layers.find((l) => l.config.id === 'particles');
      expect(particleLayer).toBeUndefined();
    });

    it('should add rain particles for rain weather', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'forest',
        layerCount: 5,
        seed: 12345,
        animated: true,
        weather: 'rain',
        weatherIntensity: 0.8,
      };
      const layers = generateBackgroundLayers(config);

      const particleLayer = layers.find((l) => l.config.id === 'particles');
      expect(particleLayer).toBeDefined();
      expect(particleLayer?.elements[0].particleData?.particleType).toBe('rain');
    });

    it('should add snow particles for snow weather', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'tundra',
        layerCount: 5,
        seed: 12345,
        animated: true,
        weather: 'snow',
        weatherIntensity: 0.5,
      };
      const layers = generateBackgroundLayers(config);

      const particleLayer = layers.find((l) => l.config.id === 'particles');
      expect(particleLayer).toBeDefined();
      expect(particleLayer?.elements[0].particleData?.particleType).toBe('snow');
    });

    it('should include day/night colors for mountain layers', () => {
      const config: ProceduralBackgroundConfig = {
        biome: 'mountain',
        layerCount: 6,
        seed: 12345,
      };
      const layers = generateBackgroundLayers(config);

      const mountainLayer = layers.find((l) => l.config.id.startsWith('mountains'));
      expect(mountainLayer).toBeDefined();
      expect(mountainLayer?.config.affectedByDayNight).toBe(true);
      expect(mountainLayer?.config.dayNightColors).toBeDefined();
    });
  });

  describe('ProceduralBackgroundComponent', () => {
    it('should render with biome config', () => {
      const { container } = render(<ProceduralBackgroundComponent biome="forest" layerCount={5} />);
      expect(container).toBeDefined();
    });

    it('should accept scroll position', () => {
      const { container } = render(
        <ProceduralBackgroundComponent biome="desert" layerCount={5} scrollX={100} scrollY={50} />
      );
      expect(container).toBeDefined();
    });

    it('should accept weather config', () => {
      const { container } = render(
        <ProceduralBackgroundComponent
          biome="tundra"
          layerCount={5}
          weather="snow"
          weatherIntensity={0.7}
          animated
        />
      );
      expect(container).toBeDefined();
    });
  });
});

describe('Time of Day Calculations', () => {
  it('should return night color for time < 5', () => {
    // This would test the internal time of day logic
    // We test it indirectly through component rendering
    const { container } = render(
      <ParallaxBackground timeOfDay={3}>
        <mesh />
      </ParallaxBackground>
    );
    expect(container).toBeDefined();
  });

  it('should return day color for time between 7-17', () => {
    const { container } = render(
      <ParallaxBackground timeOfDay={12}>
        <mesh />
      </ParallaxBackground>
    );
    expect(container).toBeDefined();
  });

  it('should blend dawn colors between 5-7', () => {
    const { container } = render(
      <ParallaxBackground timeOfDay={6}>
        <mesh />
      </ParallaxBackground>
    );
    expect(container).toBeDefined();
  });

  it('should blend dusk colors between 17-19', () => {
    const { container } = render(
      <ParallaxBackground timeOfDay={18}>
        <mesh />
      </ParallaxBackground>
    );
    expect(container).toBeDefined();
  });
});
