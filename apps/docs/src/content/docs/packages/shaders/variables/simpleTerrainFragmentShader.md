---
title: "simpleTerrainFragmentShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / simpleTerrainFragmentShader

# Variable: simpleTerrainFragmentShader

> `const` **simpleTerrainFragmentShader**: "\n  uniform vec3 uGroundColor;\n  uniform vec3 uRockColor;\n  uniform float uRoughness;\n  \n  varying vec2 vUv;\n  varying vec3 vPosition;\n  varying vec3 vNormal;\n  \n  float hash(vec2 p) \{\n    return fract(sin(dot(p, vec2(127.1, 311.7))) \* 43758.5453);\n  \}\n  \n  float noise(vec2 p) \{\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f \* f \* (3.0 - 2.0 \* f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  \}\n  \n  void main() \{\n    // Base color with noise variation\n    float n = noise(vPosition.xz \* 0.5);\n    vec3 color = mix(uGroundColor \* 0.8, uGroundColor \* 1.2, n);\n    \n    // Add rock color based on slope\n    float slope = 1.0 - vNormal.y;\n    color = mix(color, uRockColor, smoothstep(0.3, 0.7, slope));\n    \n    // Simple lighting\n    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));\n    float lighting = max(dot(vNormal, lightDir), 0.3);\n    color \*= lighting;\n    \n    // Add roughness variation\n    float roughnessNoise = noise(vPosition.xz \* 2.0);\n    color \*= 1.0 - uRoughness \* roughnessNoise \* 0.3;\n    \n    gl\_FragColor = vec4(color, 1.0);\n  \}\n"

Defined in: [terrain.ts:401](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/terrain.ts#L401)
