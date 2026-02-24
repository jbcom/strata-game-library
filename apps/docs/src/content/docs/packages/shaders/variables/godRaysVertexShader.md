---
title: "godRaysVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / godRaysVertexShader

# Variable: godRaysVertexShader

> `const` **godRaysVertexShader**: "\n  varying vec2 vUv;\n  varying vec3 vWorldPosition;\n  \n  void main() \{\n      vUv = uv;\n      vec4 worldPos = modelMatrix \* vec4(position, 1.0);\n      vWorldPosition = worldPos.xyz;\n      gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n  \}\n"

Defined in: [godRays.ts:22](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L22)
