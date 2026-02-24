---
title: "dustParticlesVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / dustParticlesVertexShader

# Variable: dustParticlesVertexShader

> `const` **dustParticlesVertexShader**: "\n    varying vec2 vUv;\n    \n    void main() \{\n        vUv = uv;\n        gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n    \}\n"

Defined in: [volumetrics.ts:471](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics.ts#L471)
