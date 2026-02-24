[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricPointLightFragmentShader

# Variable: volumetricPointLightFragmentShader

> `const` **volumetricPointLightFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uLightColor;\n  uniform float uIntensity;\n  uniform float uRadius;\n  uniform float uDustDensity;\n  uniform float uFlicker;\n  uniform vec3 uLightPosition;\n  \n  varying vec3 vWorldPosition;\n  varying vec3 vNormal;\n  varying vec3 vViewDirection;\n  varying float vDistanceToCenter;\n  \n  float hash(vec3 p) \{\n      p = fract(p \* vec3(443.897, 441.423, 437.195));\n      p += dot(p, p.yxz + 19.19);\n      return fract((p.x + p.y) \* p.z);\n  \}\n  \n  float noise(vec3 p) \{\n      vec3 i = floor(p);\n      vec3 f = fract(p);\n      f = f \* f \* (3.0 - 2.0 \* f);\n      \n      return mix(\n          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),\n              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),\n          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),\n              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),\n          f.z\n      );\n  \}\n  \n  void main() \{\n      float distFactor = 1.0 - smoothstep(0.0, uRadius, vDistanceToCenter);\n      distFactor = pow(distFactor, 1.5);\n      \n      float dust = noise(vWorldPosition \* 3.0 + vec3(uTime \* 0.1));\n      dust = 0.5 + 0.5 \* dust;\n      dust \*= uDustDensity;\n      \n      float flicker = 1.0;\n      if (uFlicker \> 0.0) \{\n          flicker = 0.8 + 0.2 \* sin(uTime \* 10.0 + noise(vec3(uTime)) \* 5.0);\n          flicker = mix(1.0, flicker, uFlicker);\n      \}\n      \n      float edgeFade = 1.0 - abs(dot(vNormal, vViewDirection));\n      edgeFade = pow(edgeFade, 1.5);\n      \n      float alpha = distFactor \* dust \* uIntensity \* flicker \* edgeFade;\n      alpha = clamp(alpha, 0.0, 0.7);\n      \n      vec3 color = uLightColor \* (1.0 + 0.2 \* distFactor);\n      \n      gl\_FragColor = vec4(color, alpha);\n  \}\n"

Defined in: [godRays.ts:210](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/godRays.ts#L210)
