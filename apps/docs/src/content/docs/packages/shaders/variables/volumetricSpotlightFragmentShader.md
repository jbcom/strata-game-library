---
title: "volumetricSpotlightFragmentShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricSpotlightFragmentShader

# Variable: volumetricSpotlightFragmentShader

> `const` **volumetricSpotlightFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uLightColor;\n  uniform float uIntensity;\n  uniform float uAngle;\n  uniform float uPenumbra;\n  uniform float uDistance;\n  uniform float uDustDensity;\n  uniform vec3 uLightPosition;\n  uniform vec3 uLightDirection;\n  \n  varying vec3 vWorldPosition;\n  varying vec3 vNormal;\n  varying vec3 vViewDirection;\n  \n  float hash(vec3 p) \{\n      p = fract(p \* vec3(443.897, 441.423, 437.195));\n      p += dot(p, p.yxz + 19.19);\n      return fract((p.x + p.y) \* p.z);\n  \}\n  \n  float noise(vec3 p) \{\n      vec3 i = floor(p);\n      vec3 f = fract(p);\n      f = f \* f \* (3.0 - 2.0 \* f);\n      \n      return mix(\n          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),\n              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),\n          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),\n              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),\n          f.z\n      );\n  \}\n  \n  void main() \{\n      vec3 toLight = uLightPosition - vWorldPosition;\n      float dist = length(toLight);\n      vec3 lightDir = normalize(toLight);\n      \n      float cosAngle = dot(-lightDir, normalize(uLightDirection));\n      float spotEffect = smoothstep(cos(uAngle + uPenumbra), cos(uAngle), cosAngle);\n      \n      float distAttenuation = 1.0 - smoothstep(0.0, uDistance, dist);\n      \n      float dust = noise(vWorldPosition \* 2.0 + vec3(uTime \* 0.1, uTime \* 0.05, uTime \* 0.08));\n      dust = 0.3 + 0.7 \* dust;\n      dust \*= uDustDensity;\n      \n      float edgeFade = 1.0 - abs(dot(vNormal, vViewDirection));\n      edgeFade = pow(edgeFade, 2.0);\n      \n      float alpha = spotEffect \* distAttenuation \* dust \* uIntensity \* edgeFade;\n      alpha = clamp(alpha, 0.0, 0.8);\n      \n      gl\_FragColor = vec4(uLightColor, alpha);\n  \}\n"

Defined in: [godRays.ts:133](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L133)
