---
title: "underwaterOverlayVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / underwaterOverlayVertexShader

# Variable: underwaterOverlayVertexShader

> `const` **underwaterOverlayVertexShader**: "\n  varying vec2 vUv;\n  void main() \{\n      vUv = uv;\n      gl\_Position = vec4(position.xy, 0.0, 1.0);\n  \}\n"

Defined in: [volumetrics-components.ts:83](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics-components.ts#L83)
