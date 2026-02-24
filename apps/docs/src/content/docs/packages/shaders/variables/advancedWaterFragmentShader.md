---
title: "advancedWaterFragmentShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / advancedWaterFragmentShader

# Variable: advancedWaterFragmentShader

> `const` **advancedWaterFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uWaterColor;\n  uniform vec3 uDeepWaterColor;\n  uniform vec3 uFoamColor;\n  uniform float uCausticIntensity;\n  varying vec2 vUv;\n  varying vec3 vPosition;\n  varying float vElevation;\n  \n  float hash(vec2 p) \{\n    return fract(sin(dot(p, vec2(127.1, 311.7))) \* 43758.5453);\n  \}\n  \n  float noise(vec2 p) \{\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f \* f \* (3.0 - 2.0 \* f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  \}\n  \n  float caustic(vec2 uv, float time) \{\n    vec2 p = uv \* 10.0;\n    \n    float c1 = noise(p + time \* 0.3);\n    float c2 = noise(p \* 1.5 - time \* 0.2);\n    float c3 = noise(p \* 2.0 + time \* 0.4);\n    \n    return (c1 + c2 + c3) / 3.0;\n  \}\n  \n  void main() \{\n    vec2 causticUV = vUv + vec2(sin(uTime \* 0.5) \* 0.1, cos(uTime \* 0.3) \* 0.1);\n    float causticPattern = caustic(causticUV, uTime);\n    causticPattern = pow(causticPattern, 2.0) \* uCausticIntensity;\n    \n    float depthFactor = smoothstep(-0.1, 0.1, vElevation);\n    vec3 waterColor = mix(uDeepWaterColor, uWaterColor, depthFactor);\n    \n    vec3 finalColor = waterColor + vec3(causticPattern);\n    \n    if (vElevation \> 0.08) \{\n      finalColor = mix(finalColor, uFoamColor, smoothstep(0.08, 0.12, vElevation));\n    \}\n    \n    float fresnel = pow(1.0 - abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0))), 2.0);\n    finalColor += vec3(fresnel \* 0.1);\n    \n    gl\_FragColor = vec4(finalColor, 0.75);\n  \}\n"

Defined in: [water.ts:209](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/water.ts#L209)
