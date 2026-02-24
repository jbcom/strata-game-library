# Sky & Volumetrics Showcase

An interactive demonstration of Strata's procedural sky and atmospheric effects system.

## Features Demonstrated

- **Procedural Sky** - Dynamic sky rendering with day/night cycle
- **Time of Day System** - Control sun angle, intensity, and ambient lighting
- **Star Visibility** - Stars appear as night falls
- **Atmospheric Fog** - Adjustable fog density for depth and mood
- **Weather Effects** - Simulate various weather conditions
- **Preset System** - Quick presets for dawn, noon, sunset, night, and stormy weather

## What's Included

- **Dynamic Sun Positioning** - Sun moves across the sky based on angle
- **Ambient Lighting** - Adjusts with time of day
- **Star Field** - Visible during night hours
- **Fog Effects** - Volumetric fog for atmosphere
- **Interactive Controls** - Real-time adjustment of all parameters

## Running the Demo

```bash
# From this directory
pnpm install
pnpm dev
```

Visit `http://localhost:3003` to see the demo.

## Code Walkthrough

### Basic Sky Setup

```typescript
import { ProceduralSky } from '@jbcom/strata';

<ProceduralSky
    timeOfDay={{
        sunAngle: 60,          // 0=horizon, 90=zenith
        sunIntensity: 1.0,     // 0-1
        ambientLight: 0.8,     // 0-1
        starVisibility: 0,     // 0-1
        fogDensity: 0,         // 0-1
    }}
    weather={{
        intensity: 0,          // 0-1
    }}
    size={[300, 150]}
    distance={100}
/>
```

### Time of Day Presets

The demo includes several preset configurations:

#### Dawn

```typescript
{
    sunAngle: 10,
    sunIntensity: 0.4,
    ambientLight: 0.3,
    starVisibility: 0.5,
    fogDensity: 0.3,
}
```

#### Noon

```typescript
{
    sunAngle: 90,
    sunIntensity: 1.0,
    ambientLight: 1.0,
    starVisibility: 0,
    fogDensity: 0,
}
```

#### Night

```typescript
{
    sunAngle: 0,
    sunIntensity: 0,
    ambientLight: 0.1,
    starVisibility: 1.0,
    fogDensity: 0.1,
}
```

## Interactive Controls

Use the Leva controls panel to adjust:

### Time of Day

- **Sun Angle** - Position of sun in sky (0-180°)
- **Sun Intensity** - Brightness of sunlight (0-1)
- **Ambient Light** - Overall scene brightness (0-1)
- **Star Visibility** - Visibility of stars (0-1)

### Atmosphere

- **Fog Density** - Thickness of atmospheric fog (0-1)
- **Weather Intensity** - Strength of weather effects (0-1)

### Presets

- **Custom** - Use manual controls
- **Dawn** - Early morning lighting
- **Noon** - Bright midday sun
- **Sunset** - Golden hour lighting
- **Night** - Dark with stars
- **Stormy** - Overcast with heavy fog

## Use Cases

This system is perfect for:

- **Open-world games** - Dynamic day/night cycle
- **Weather simulation** - Changing atmospheric conditions
- **Mood setting** - Control lighting for different scenes
- **Time-lapse effects** - Animate through different times of day

## Copy-Paste Ready

```typescript
// Install Strata
pnpm install @jbcom/strata

// Import and use
import { ProceduralSky } from '@jbcom/strata';
import { useState } from 'react';
import { useFrame } from '@react-three/fiber';

function Scene() {
    const [time, setTime] = useState(0);

    useFrame((_, delta) => {
        setTime(t => t + delta * 0.1); // Animate time
    });

    const sunAngle = (time % 24) * 7.5; // 360° / 24 hours * time

    return (
        <ProceduralSky
            timeOfDay={{
                sunAngle,
                sunIntensity: Math.max(0, Math.sin(sunAngle * Math.PI / 180)),
                starVisibility: 1 - Math.max(0, Math.sin(sunAngle * Math.PI / 180)),
            }}
        />
    );
}
```

## Learn More

- [Strata Documentation](../../README.md)
- [Sky Core API](../../src/core/sky.ts)
- [Volumetrics Core API](../../src/core/volumetrics.ts)
- [Sky Shaders](../../src/shaders/sky.ts)
