---
title: "skyVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / skyVertexShader

# Variable: skyVertexShader

> `const` **skyVertexShader**: "\n  varying vec2 vUv;\n  varying vec3 vPosition;\n  \n  void main() \{\n      vUv = uv;\n      vPosition = position;\n      gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n  \}\n"

Defined in: [sky.ts:7](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/sky.ts#L7)

Procedural Sky Shaders

Day/night cycle, stars, weather effects
