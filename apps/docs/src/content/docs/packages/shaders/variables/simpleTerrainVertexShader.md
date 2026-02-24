[**@strata-game-library/shaders**](../README.md)

***

[@strata-game-library/shaders](../globals.md) / simpleTerrainVertexShader

# Variable: simpleTerrainVertexShader

> `const` **simpleTerrainVertexShader**: "\n  varying vec2 vUv;\n  varying vec3 vPosition;\n  varying vec3 vNormal;\n  \n  float hash(vec2 p) \{\n    return fract(sin(dot(p, vec2(127.1, 311.7))) \* 43758.5453);\n  \}\n  \n  float noise(vec2 p) \{\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f \* f \* (3.0 - 2.0 \* f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  \}\n  \n  void main() \{\n    vUv = uv;\n    \n    vec3 pos = position;\n    \n    // Add terrain height variation using noise\n    float terrainNoise = noise(pos.xz \* 0.1) \* 2.0;\n    terrainNoise += noise(pos.xz \* 0.05) \* 4.0;\n    pos.y += terrainNoise;\n    \n    vPosition = pos;\n    \n    // Calculate normal from noise derivatives\n    float eps = 0.1;\n    float nx = noise((pos.xz + vec2(eps, 0.0)) \* 0.1) - noise((pos.xz - vec2(eps, 0.0)) \* 0.1);\n    float nz = noise((pos.xz + vec2(0.0, eps)) \* 0.1) - noise((pos.xz - vec2(0.0, eps)) \* 0.1);\n    vNormal = normalize(vec3(-nx \* 10.0, 1.0, -nz \* 10.0));\n    \n    gl\_Position = projectionMatrix \* modelViewMatrix \* vec4(pos, 1.0);\n  \}\n"

Defined in: [terrain.ts:357](https://github.com/strata-game-library/shaders/blob/6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df/src/terrain.ts#L357)

Simple terrain shader for non-biome use

Lifted from Otterfall biome selector diorama.
