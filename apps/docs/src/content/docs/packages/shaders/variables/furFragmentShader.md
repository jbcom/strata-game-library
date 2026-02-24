---
title: "furFragmentShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / furFragmentShader

# Variable: furFragmentShader

> `const` **furFragmentShader**: "\n  uniform vec3 colorBase;\n  uniform vec3 colorTip;\n  \n  varying vec2 vUv;\n  varying float vLayer;\n  varying vec3 vNormal;\n  \n  // Simple hash for procedural strands\n  float hash(vec2 p) \{\n    return fract(sin(dot(p, vec2(127.1, 311.7))) \* 43758.5453123);\n  \}\n  \n  void main() \{\n    // Procedural strand pattern via noise\n    float strandNoise = hash(floor(vUv \* 50.0));\n    \n    // Density falloff on outer layers (tapering effect)\n    float density = 1.0 - vLayer \* 0.8;\n    \n    // Alpha test for strands\n    if (step(strandNoise, density) \< 0.5) discard;\n    \n    // Color gradient from base to tip\n    vec3 col = mix(colorBase, colorTip, vLayer);\n    \n    // Ambient occlusion at roots\n    float ao = 0.4 + 0.6 \* vLayer;\n    col \*= ao;\n    \n    // Rim lighting effect for depth perception\n    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));\n    col += vec3(0.1) \* rim \* vLayer;\n    \n    gl\_FragColor = vec4(col, 1.0);\n  \}\n"

Defined in: [fur.ts:40](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/fur.ts#L40)
