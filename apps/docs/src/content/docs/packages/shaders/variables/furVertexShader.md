---
title: "furVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / furVertexShader

# Variable: furVertexShader

> `const` **furVertexShader**: "\n  uniform float layerOffset;\n  uniform float spacing;\n  uniform float time;\n  \n  varying vec2 vUv;\n  varying float vLayer;\n  varying vec3 vNormal;\n  \n  void main() \{\n    vUv = uv;\n    vLayer = layerOffset;\n    vNormal = normalize(normalMatrix \* normal);\n    \n    // Multi-layer shell displacement: Extrude along normal per layer\n    vec3 pos = position + normal \* (layerOffset \* spacing);\n    \n    // Wind animation for fur tips - more pronounced at higher layers\n    float windStrength = pow(layerOffset, 2.0);\n    pos.x += sin(time \* 2.0 + position.y \* 2.0 + position.z \* 1.5) \* 0.01 \* windStrength;\n    pos.z += cos(time \* 1.5 + position.x \* 2.0 + position.y \* 1.0) \* 0.01 \* windStrength;\n    \n    // Gravity droop - more pronounced at tips\n    pos.y -= pow(layerOffset, 2.5) \* 0.04;\n    \n    gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(pos, 1.0);\n  \}\n"

Defined in: [fur.ts:11](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/fur.ts#L11)

Fur shell shader - layered alpha-tested shells for volumetric fur effect
Migrated from rivermarsh procedural rendering system.

Multi-layer shell displacement with wind animation and density falloff.
