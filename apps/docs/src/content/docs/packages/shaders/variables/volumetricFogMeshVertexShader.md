[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / volumetricFogMeshVertexShader

# Variable: volumetricFogMeshVertexShader

> `const` **volumetricFogMeshVertexShader**: "\n  varying vec3 vWorldPosition;\n  varying vec3 vViewDirection;\n  \n  void main() \{\n      vec4 worldPos = modelMatrix \* vec4(position, 1.0);\n      vWorldPosition = worldPos.xyz;\n      vViewDirection = normalize(worldPos.xyz - cameraPosition);\n      gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(position, 1.0);\n  \}\n"

Defined in: [volumetrics-components.ts:10](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/volumetrics-components.ts#L10)
