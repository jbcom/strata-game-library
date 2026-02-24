---
title: "advancedWaterVertexShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / advancedWaterVertexShader

# Variable: advancedWaterVertexShader

> `const` **advancedWaterVertexShader**: "\n  uniform float uTime;\n  varying vec2 vUv;\n  varying vec3 vPosition;\n  varying float vElevation;\n  \n  float hash(vec2 p) \{\n    return fract(sin(dot(p, vec2(127.1, 311.7))) \* 43758.5453);\n  \}\n  \n  float noise(vec2 p) \{\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f \* f \* (3.0 - 2.0 \* f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  \}\n  \n  float fbm(vec2 p) \{\n    float value = 0.0;\n    float amplitude = 0.5;\n    float frequency = 1.0;\n    \n    for (int i = 0; i \< 4; i++) \{\n      value += amplitude \* noise(p \* frequency);\n      amplitude \*= 0.5;\n      frequency \*= 2.0;\n    \}\n    \n    return value;\n  \}\n  \n  void main() \{\n    vUv = uv;\n    vPosition = position;\n    \n    vec3 pos = position;\n    \n    float wave1 = sin(pos.x \* 0.4 + uTime \* 0.8) \* 0.15;\n    float wave2 = sin(pos.y \* 0.3 + uTime \* 1.2) \* 0.12;\n    float wave3 = sin((pos.x + pos.y) \* 0.2 + uTime \* 0.6) \* 0.1;\n    \n    float noiseValue = fbm(vec2(pos.x \* 0.1, pos.y \* 0.1) + uTime \* 0.05);\n    \n    pos.y += wave1 + wave2 + wave3 + noiseValue \* 0.1;\n    \n    vElevation = pos.y;\n    gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(pos, 1.0);\n  \}\n"

Defined in: [water.ts:153](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/water.ts#L153)

Advanced water shader with caustics

Lifted from Otterfall prototype.
