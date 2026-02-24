---
title: "godRaysFragmentShader"
---

[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / godRaysFragmentShader

# Variable: godRaysFragmentShader

> `const` **godRaysFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uLightPosition;\n  uniform vec3 uLightColor;\n  uniform float uIntensity;\n  uniform float uDecay;\n  uniform float uDensity;\n  uniform float uWeight;\n  uniform float uExposure;\n  uniform int uSamples;\n  uniform vec2 uResolution;\n  uniform float uScattering;\n  uniform float uNoiseFactor;\n  \n  varying vec2 vUv;\n  varying vec3 vWorldPosition;\n  \n  float hash(vec2 p) \{\n      return fract(sin(dot(p, vec2(12.9898, 78.233))) \* 43758.5453);\n  \}\n  \n  float noise(vec2 p) \{\n      vec2 i = floor(p);\n      vec2 f = fract(p);\n      f = f \* f \* (3.0 - 2.0 \* f);\n      \n      return mix(\n          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\n          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),\n          f.y\n      );\n  \}\n  \n  float fbm(vec2 p) \{\n      float value = 0.0;\n      float amplitude = 0.5;\n      for (int i = 0; i \< 4; i++) \{\n          value += amplitude \* noise(p);\n          p \*= 2.0;\n          amplitude \*= 0.5;\n      \}\n      return value;\n  \}\n  \n  void main() \{\n      // Protect against division by zero when uSamples is 0\n      int samples = max(uSamples, 1);\n      \n      vec2 lightScreenPos = uLightPosition.xy;\n      vec2 deltaTexCoord = (vUv - lightScreenPos) \* uDensity / float(samples);\n      \n      vec2 texCoord = vUv;\n      float illuminationDecay = 1.0;\n      vec3 color = vec3(0.0);\n      \n      #define MAX\_SAMPLES 100\n      for (int i = 0; i \< MAX\_SAMPLES; i++) \{\n          if (i \>= samples) break;\n          \n          texCoord -= deltaTexCoord;\n          \n          float noiseVal = 1.0;\n          if (uNoiseFactor \> 0.0) \{\n              noiseVal = 0.5 + 0.5 \* fbm(texCoord \* 10.0 + uTime \* 0.1);\n          \}\n          \n          float dist = length(texCoord - lightScreenPos);\n          float falloff = exp(-dist \* uScattering);\n          \n          vec3 sampleColor = uLightColor \* falloff \* noiseVal;\n          sampleColor \*= illuminationDecay \* uWeight;\n          \n          color += sampleColor;\n          illuminationDecay \*= uDecay;\n      \}\n      \n      color \*= uExposure \* uIntensity;\n      \n      float alpha = length(color) \* 0.5;\n      alpha = clamp(alpha, 0.0, 1.0);\n      \n      gl\_FragColor = vec4(color, alpha);\n  \}\n"

Defined in: [godRays.ts:34](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L34)
