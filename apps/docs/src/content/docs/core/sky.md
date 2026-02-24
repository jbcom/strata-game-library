---
title: Sky & Atmosphere
description: Procedural sky with atmospheric scattering, day/night cycle, and celestial bodies
---

# ☀️ Sky & Atmosphere

Strata's sky system provides physically-based atmospheric scattering with a dynamic day/night cycle, stars, sun/moon positioning, and horizon fog blending.

## Quick Start

```tsx
import { ProceduralSky } from '@strata-game-library/core';

<ProceduralSky sunPosition={[100, 50, 100]} />
```

## Components

### `<ProceduralSky>`

Complete procedural sky with all features:

```tsx
import { ProceduralSky, createTimeOfDay } from '@strata-game-library/core';

<ProceduralSky
  // Sun position (can use sunPosition or timeOfDay)
  sunPosition={[100, 50, 100]}
  // OR
  timeOfDay={createTimeOfDay(14, 30)}  // 2:30 PM

  // Atmosphere
  turbidity={10}           // Haziness (2-20)
  rayleigh={2}            // Blue scattering
  mieCoefficient={0.005}  // Sun halo
  mieDirectionalG={0.8}   // Halo sharpness

  // Sun
  sunIntensity={1}
  sunColor="#ffffff"
  sunSize={0.04}

  // Moon (visible at night)
  moon
  moonPhase={0.5}  // 0=new, 0.5=full, 1=new
  moonIntensity={0.1}

  // Stars
  stars
  starCount={5000}
  starBrightness={1}
  starTwinkle

  // Horizon
  horizonFog
  horizonColor="#8899aa"
  horizonBlend={0.3}

  // Exposure
  exposure={0.5}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sunPosition` | `[number, number, number]` | `[0, 1, 0]` | Sun position vector |
| `timeOfDay` | `TimeOfDay` | - | Time-based sun position |
| `turbidity` | `number` | `10` | Atmospheric haziness |
| `rayleigh` | `number` | `2` | Blue sky scattering |
| `mieCoefficient` | `number` | `0.005` | Sun halo coefficient |
| `mieDirectionalG` | `number` | `0.8` | Halo directionality |
| `sunIntensity` | `number` | `1` | Sun brightness |
| `moon` | `boolean` | `false` | Show moon at night |
| `stars` | `boolean` | `false` | Show stars at night |
| `horizonFog` | `boolean` | `false` | Fog at horizon |

## Time of Day

### Using `createTimeOfDay`

```tsx
import { createTimeOfDay } from '@strata-game-library/core';

// Specific time
const noon = createTimeOfDay(12, 0);      // 12:00 PM
const sunset = createTimeOfDay(18, 30);   // 6:30 PM
const midnight = createTimeOfDay(0, 0);   // 12:00 AM

<ProceduralSky timeOfDay={noon} />
```

### Animated Day/Night Cycle

```tsx
import { useState, useEffect } from 'react';
import { createTimeOfDay } from '@strata-game-library/core';

function AnimatedSky() {
  const [hour, setHour] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(h => (h + 0.05) % 24);  // Cycle through day
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const minutes = (hour % 1) * 60;

  return (
    <ProceduralSky
      timeOfDay={createTimeOfDay(Math.floor(hour), minutes)}
      stars
      moon
    />
  );
}
```

### Geographic Sun Position

```tsx
import { calculateSunPosition } from '@strata-game-library/core';

const sunPos = calculateSunPosition({
  latitude: 40.7128,    // NYC
  longitude: -74.0060,
  date: new Date(),
  timezone: -5
});

<ProceduralSky sunPosition={sunPos} />
```

## Atmospheric Effects

### Rayleigh Scattering

Controls blue sky color:

```tsx
// Deep blue sky
<ProceduralSky rayleigh={3} turbidity={2} />

// Pale sky
<ProceduralSky rayleigh={0.5} turbidity={15} />

// Alien purple sky
<ProceduralSky
  rayleigh={4}
  rayleighColor={[0.5, 0.2, 0.8]}  // Custom scattering
/>
```

### Mie Scattering

Controls sun halo:

```tsx
// Large soft halo
<ProceduralSky mieCoefficient={0.01} mieDirectionalG={0.7} />

// Small sharp halo
<ProceduralSky mieCoefficient={0.003} mieDirectionalG={0.95} />

// No halo
<ProceduralSky mieCoefficient={0} />
```

### Turbidity

Controls atmospheric haziness:

```tsx
// Crystal clear
<ProceduralSky turbidity={2} />

// Light haze
<ProceduralSky turbidity={10} />

// Heavy fog/smog
<ProceduralSky turbidity={20} />
```

## Celestial Bodies

### Sun Customization

```tsx
<ProceduralSky
  sunSize={0.06}           // Larger sun
  sunIntensity={1.5}       // Brighter
  sunColor="#ffdd88"       // Warm color
  sunCorona                // Add corona effect
  sunCoronaSize={0.2}
/>
```

### Moon

```tsx
<ProceduralSky
  moon
  moonPhase={0.5}          // Full moon
  moonSize={0.03}
  moonIntensity={0.15}
  moonColor="#eeeeee"
  moonTexture={moonTexture}  // Optional texture
/>
```

### Stars

```tsx
<ProceduralSky
  stars
  starCount={8000}
  starBrightness={1.2}
  starTwinkle
  starTwinkleSpeed={0.5}

  // Milky Way (optional)
  milkyWay
  milkyWayTexture={milkyWayTexture}
  milkyWayIntensity={0.3}
/>
```

## Sky Presets

### Clear Day

```tsx
import { SkyPresets } from '@strata-game-library/presets';

<ProceduralSky {...SkyPresets.CLEAR_DAY} />
```

### Sunset

```tsx
<ProceduralSky {...SkyPresets.SUNSET} />

// Or manual
<ProceduralSky
  timeOfDay={createTimeOfDay(18, 45)}
  turbidity={8}
  rayleigh={1}
  mieCoefficient={0.01}
/>
```

### Overcast

```tsx
<ProceduralSky {...SkyPresets.OVERCAST} />

// Or manual
<ProceduralSky
  turbidity={20}
  rayleigh={0.5}
  exposure={0.3}
/>
```

### Night

```tsx
<ProceduralSky {...SkyPresets.NIGHT} />

// Or manual
<ProceduralSky
  timeOfDay={createTimeOfDay(2, 0)}
  stars
  starCount={8000}
  moon
  moonPhase={0.75}
/>
```

### Alien World

```tsx
<ProceduralSky
  // Purple sky
  rayleighColor={[0.4, 0.1, 0.6]}
  rayleigh={5}

  // Green sun
  sunColor="#88ff44"
  sunSize={0.1}

  // Two moons
  moons={[
    { phase: 0.3, size: 0.05, color: '#ff8844' },
    { phase: 0.7, size: 0.02, color: '#88ffff' }
  ]}
/>
```

## Integration with Lighting

The sky automatically provides scene lighting:

```tsx
import { ProceduralSky, SkyLight } from '@strata-game-library/core';

<ProceduralSky timeOfDay={createTimeOfDay(14, 0)}>
  {/* Directional light follows sun */}
  <SkyLight
    intensity={1.2}
    castShadow
    shadow-mapSize={[2048, 2048]}
  />
</ProceduralSky>

// Or manually link
const skyRef = useRef();
const lightRef = useRef();

useFrame(() => {
  if (skyRef.current && lightRef.current) {
    lightRef.current.position.copy(skyRef.current.sunPosition);
  }
});
```

## Shader Access

Use sky shaders directly:

```tsx
import {
  skyVertexShader,
  skyFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader
} from '@strata-game-library/shaders';

const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  uniforms: {
    sunPosition: { value: new THREE.Vector3(100, 50, 100) },
    turbidity: { value: 10 },
    rayleigh: { value: 2 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 }
  },
  side: THREE.BackSide
});
```

## Performance

The sky shader is efficient, but consider:

```tsx
// Mobile optimization
<ProceduralSky
  stars={false}           // Disable stars
  moon={false}            // Disable moon
  resolution={256}        // Lower sky resolution
/>

// Desktop
<ProceduralSky
  stars
  starCount={5000}
  moon
  resolution={512}
/>
```

## Live Demo

<iframe
  src="https://strata-game-library.github.io/examples/sky-volumetrics/"
  class="showcase-iframe"
  title="Sky & Volumetrics Demo"
></iframe>

[View Full Demo](https://strata-game-library.github.io/examples/sky-volumetrics/) | [View Source](https://github.com/strata-game-library/examples/tree/main/sky-volumetrics)

## Related

- [Sky Shaders](/shaders/sky/) - Direct shader access
- [Cloud Shaders](/shaders/clouds/) - Volumetric clouds
- [Volumetrics](/core/volumetrics/) - Fog and god rays
