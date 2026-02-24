[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricFogMeshFragmentShader

# Variable: volumetricFogMeshFragmentShader

> `const` **volumetricFogMeshFragmentShader**: "\n  uniform float uTime;\n  uniform vec3 uFogColor;\n  uniform float uFogDensity;\n  uniform float uFogHeight;\n  uniform vec3 uCameraPosition;\n  \n  varying vec3 vWorldPosition;\n  varying vec3 vViewDirection;\n  \n  float hash(vec3 p) \{\n      p = fract(p \* vec3(443.897, 441.423, 437.195));\n      p += dot(p, p.yxz + 19.19);\n      return fract((p.x + p.y) \* p.z);\n  \}\n  \n  float noise(vec3 p) \{\n      vec3 i = floor(p);\n      vec3 f = fract(p);\n      f = f \* f \* (3.0 - 2.0 \* f);\n      \n      return mix(\n          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),\n              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),\n          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),\n              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),\n          f.z\n      );\n  \}\n  \n  float fbm(vec3 p) \{\n      float value = 0.0;\n      float amplitude = 0.5;\n      for (int i = 0; i \< 4; i++) \{\n          value += amplitude \* noise(p);\n          p \*= 2.0;\n          amplitude \*= 0.5;\n      \}\n      return value;\n  \}\n  \n  void main() \{\n      // Height-based density\n      float heightFactor = exp(-max(0.0, vWorldPosition.y) / uFogHeight);\n      \n      // Animated noise for volumetric appearance\n      vec3 noisePos = vWorldPosition \* 0.02 + vec3(uTime \* 0.02, 0.0, uTime \* 0.01);\n      float noiseVal = fbm(noisePos);\n      \n      float fogAmount = uFogDensity \* heightFactor \* (0.5 + 0.5 \* noiseVal);\n      \n      // Fade near edges\n      float dist = length(vWorldPosition.xz - uCameraPosition.xz);\n      float edgeFade = smoothstep(80.0, 40.0, dist);\n      \n      fogAmount \*= edgeFade;\n      \n      gl\_FragColor = vec4(uFogColor, fogAmount);\n  \}\n"

Defined in: [volumetrics-components.ts:22](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics-components.ts#L22)
