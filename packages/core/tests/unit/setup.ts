/**
 * Unit test setup file
 *
 * Mocks WebGL and DOM APIs for tests that don't need real rendering
 */

// Mock WebGL context for Three.js
if (typeof document !== 'undefined') {
  // Create a comprehensive WebGL mock that satisfies Three.js
  const createWebGLMock = () => {
    const mockGL: Record<string, unknown> = {
      // Version and capability info
      VERSION: 0x1f02,
      VENDOR: 0x1f00,
      RENDERER: 0x1f01,
      SHADING_LANGUAGE_VERSION: 0x8b8c,
      MAX_TEXTURE_SIZE: 4096,
      MAX_CUBE_MAP_TEXTURE_SIZE: 4096,
      MAX_VERTEX_ATTRIBS: 16,
      MAX_TEXTURE_IMAGE_UNITS: 16,
      MAX_VERTEX_TEXTURE_IMAGE_UNITS: 16,
      MAX_COMBINED_TEXTURE_IMAGE_UNITS: 32,
      MAX_VERTEX_UNIFORM_VECTORS: 256,
      MAX_FRAGMENT_UNIFORM_VECTORS: 256,
      MAX_VARYING_VECTORS: 15,
      MAX_RENDERBUFFER_SIZE: 4096,
      MAX_VIEWPORT_DIMS: [4096, 4096],

      getParameter: (param: number) => {
        const params: Record<number, unknown> = {
          7938: 'WebGL 2.0', // VERSION
          7936: 'Mock Vendor', // VENDOR
          7937: 'Mock Renderer', // RENDERER
          35724: 'WebGL GLSL ES 3.00', // SHADING_LANGUAGE_VERSION
          3379: 4096, // MAX_TEXTURE_SIZE
          34076: 4096, // MAX_CUBE_MAP_TEXTURE_SIZE
          34921: 16, // MAX_VERTEX_ATTRIBS
          34930: 16, // MAX_TEXTURE_IMAGE_UNITS
          35660: 16, // MAX_VERTEX_TEXTURE_IMAGE_UNITS
          35661: 32, // MAX_COMBINED_TEXTURE_IMAGE_UNITS
          36347: 256, // MAX_VERTEX_UNIFORM_VECTORS
          36349: 256, // MAX_FRAGMENT_UNIFORM_VECTORS
          36348: 15, // MAX_VARYING_VECTORS
          34024: 4096, // MAX_RENDERBUFFER_SIZE
          3386: [4096, 4096], // MAX_VIEWPORT_DIMS
        };
        return params[param] ?? 0;
      },

      getExtension: () => null,
      getSupportedExtensions: () => [],
      getContextAttributes: () => ({
        alpha: true,
        antialias: true,
        depth: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default',
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        stencil: true,
      }),
      isContextLost: () => false,

      // Shader functions
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      getShaderInfoLog: () => '',
      getShaderPrecisionFormat: () => ({
        rangeMin: 127,
        rangeMax: 127,
        precision: 23,
      }),
      deleteShader: () => {},

      // Program functions
      createProgram: () => ({}),
      attachShader: () => {},
      detachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: (program: unknown, pname: number) => {
        // LINK_STATUS, DELETE_STATUS, VALIDATE_STATUS
        if (pname === 0x8b82) return true; // LINK_STATUS
        if (pname === 0x8b80) return false; // DELETE_STATUS
        if (pname === 0x8b83) return true; // VALIDATE_STATUS
        if (pname === 0x8b86) return 0; // ACTIVE_ATTRIBUTES
        if (pname === 0x8b89) return 0; // ACTIVE_UNIFORMS
        return 0;
      },
      getProgramInfoLog: () => '',
      useProgram: () => {},
      deleteProgram: () => {},
      validateProgram: () => {},

      // Uniform and attribute functions
      getUniformLocation: () => ({}),
      getActiveUniform: (_program: unknown, index: number) => ({
        name: `uniform${index}`,
        size: 1,
        type: 0x1406, // FLOAT
      }),
      getActiveAttrib: (_program: unknown, index: number) => ({
        name: `attrib${index}`,
        size: 1,
        type: 0x1406, // FLOAT
      }),
      getAttribLocation: () => 0,
      uniform1f: () => {},
      uniform1fv: () => {},
      uniform1i: () => {},
      uniform1iv: () => {},
      uniform2f: () => {},
      uniform2fv: () => {},
      uniform2i: () => {},
      uniform2iv: () => {},
      uniform3f: () => {},
      uniform3fv: () => {},
      uniform3i: () => {},
      uniform3iv: () => {},
      uniform4f: () => {},
      uniform4fv: () => {},
      uniform4i: () => {},
      uniform4iv: () => {},
      uniformMatrix2fv: () => {},
      uniformMatrix3fv: () => {},
      uniformMatrix4fv: () => {},
      vertexAttrib1f: () => {},
      vertexAttrib2f: () => {},
      vertexAttrib3f: () => {},
      vertexAttrib4f: () => {},
      vertexAttrib1fv: () => {},
      vertexAttrib2fv: () => {},
      vertexAttrib3fv: () => {},
      vertexAttrib4fv: () => {},
      vertexAttribPointer: () => {},
      enableVertexAttribArray: () => {},
      disableVertexAttribArray: () => {},
      vertexAttribDivisor: () => {},

      // Buffer functions
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      bufferSubData: () => {},
      deleteBuffer: () => {},

      // Texture functions
      createTexture: () => ({}),
      bindTexture: () => {},
      activeTexture: () => {},
      texImage2D: () => {},
      texSubImage2D: () => {},
      texImage3D: () => {},
      texSubImage3D: () => {},
      copyTexSubImage3D: () => {},
      compressedTexImage3D: () => {},
      compressedTexSubImage3D: () => {},
      texStorage2D: () => {},
      texStorage3D: () => {},
      texParameteri: () => {},
      texParameterf: () => {},
      generateMipmap: () => {},
      deleteTexture: () => {},
      pixelStorei: () => {},
      compressedTexImage2D: () => {},
      compressedTexSubImage2D: () => {},
      copyTexImage2D: () => {},
      copyTexSubImage2D: () => {},
      getTexParameter: () => 0,

      // Framebuffer functions
      createFramebuffer: () => ({}),
      bindFramebuffer: () => {},
      framebufferTexture2D: () => {},
      framebufferRenderbuffer: () => {},
      checkFramebufferStatus: () => 36053, // FRAMEBUFFER_COMPLETE
      deleteFramebuffer: () => {},

      // Renderbuffer functions
      createRenderbuffer: () => ({}),
      bindRenderbuffer: () => {},
      renderbufferStorage: () => {},
      renderbufferStorageMultisample: () => {},
      deleteRenderbuffer: () => {},

      // Drawing functions
      drawArrays: () => {},
      drawElements: () => {},
      drawArraysInstanced: () => {},
      drawElementsInstanced: () => {},
      drawBuffers: () => {},
      drawRangeElements: () => {},
      readPixels: () => {},
      readBuffer: () => {},
      blitFramebuffer: () => {},
      invalidateFramebuffer: () => {},
      invalidateSubFramebuffer: () => {},
      getBufferSubData: () => {},
      copyBufferSubData: () => {},

      // State functions
      viewport: () => {},
      scissor: () => {},
      clearColor: () => {},
      clearDepth: () => {},
      clearStencil: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      blendFunc: () => {},
      blendFuncSeparate: () => {},
      blendEquation: () => {},
      blendEquationSeparate: () => {},
      blendColor: () => {},
      depthFunc: () => {},
      depthMask: () => {},
      depthRange: () => {},
      colorMask: () => {},
      cullFace: () => {},
      frontFace: () => {},
      lineWidth: () => {},
      polygonOffset: () => {},
      stencilFunc: () => {},
      stencilFuncSeparate: () => {},
      stencilMask: () => {},
      stencilMaskSeparate: () => {},
      stencilOp: () => {},
      stencilOpSeparate: () => {},
      sampleCoverage: () => {},
      hint: () => {},

      // VAO (WebGL2)
      createVertexArray: () => ({}),
      bindVertexArray: () => {},
      deleteVertexArray: () => {},

      // Query
      createQuery: () => ({}),
      deleteQuery: () => {},
      beginQuery: () => {},
      endQuery: () => {},
      getQueryParameter: () => 0,

      // Transform feedback (WebGL2)
      createTransformFeedback: () => ({}),
      deleteTransformFeedback: () => {},
      bindTransformFeedback: () => {},
      beginTransformFeedback: () => {},
      endTransformFeedback: () => {},
      transformFeedbackVaryings: () => {},

      // Sync (WebGL2)
      fenceSync: () => ({}),
      deleteSync: () => {},
      clientWaitSync: () => 0x911a, // ALREADY_SIGNALED
      waitSync: () => {},
      getSyncParameter: () => 0x9119, // SIGNALED

      // Uniform buffer (WebGL2)
      getUniformBlockIndex: () => 0,
      uniformBlockBinding: () => {},
      bindBufferBase: () => {},
      bindBufferRange: () => {},

      // Misc
      flush: () => {},
      finish: () => {},
      getError: () => 0,
      isEnabled: () => false,
      isTexture: () => true,
      isBuffer: () => true,
      isProgram: () => true,
      isShader: () => true,
      isFramebuffer: () => true,
      isRenderbuffer: () => true,

      // Canvas
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      canvas: null as HTMLCanvasElement | null,

      // WebGL constants
      FRAGMENT_SHADER: 35632,
      VERTEX_SHADER: 35633,
      ARRAY_BUFFER: 34962,
      ELEMENT_ARRAY_BUFFER: 34963,
      UNIFORM_BUFFER: 35345,
      STATIC_DRAW: 35044,
      DYNAMIC_DRAW: 35048,
      STREAM_DRAW: 35040,
      TRIANGLES: 4,
      TRIANGLE_STRIP: 5,
      TRIANGLE_FAN: 6,
      LINES: 1,
      LINE_STRIP: 3,
      LINE_LOOP: 2,
      POINTS: 0,
      TEXTURE_2D: 3553,
      TEXTURE_CUBE_MAP: 34067,
      TEXTURE_3D: 32879,
      TEXTURE_2D_ARRAY: 35866,
      TEXTURE_WRAP_S: 10242,
      TEXTURE_WRAP_T: 10243,
      TEXTURE_WRAP_R: 32882,
      TEXTURE_MIN_FILTER: 10241,
      TEXTURE_MAG_FILTER: 10240,
      REPEAT: 10497,
      CLAMP_TO_EDGE: 33071,
      MIRRORED_REPEAT: 33648,
      NEAREST: 9728,
      LINEAR: 9729,
      LINEAR_MIPMAP_LINEAR: 9987,
      NEAREST_MIPMAP_NEAREST: 9984,
      NEAREST_MIPMAP_LINEAR: 9985,
      LINEAR_MIPMAP_NEAREST: 9986,
      RGBA: 6408,
      RGB: 6407,
      RED: 6403,
      RG: 33319,
      RGBA8: 32856,
      RGB8: 32849,
      RGBA32F: 34836,
      RGB32F: 34837,
      RGBA16F: 34842,
      RGB16F: 34843,
      R8: 33321,
      RG8: 33323,
      R16F: 33325,
      R32F: 33326,
      UNSIGNED_BYTE: 5121,
      UNSIGNED_SHORT: 5123,
      UNSIGNED_INT: 5125,
      FLOAT: 5126,
      HALF_FLOAT: 5131,
      BYTE: 5120,
      SHORT: 5122,
      INT: 5124,
      COLOR_BUFFER_BIT: 16384,
      DEPTH_BUFFER_BIT: 256,
      STENCIL_BUFFER_BIT: 1024,
      DEPTH_TEST: 2929,
      BLEND: 3042,
      CULL_FACE: 2884,
      SCISSOR_TEST: 3089,
      STENCIL_TEST: 2960,
      DITHER: 3024,
      POLYGON_OFFSET_FILL: 32823,
      SAMPLE_ALPHA_TO_COVERAGE: 32926,
      SAMPLE_COVERAGE: 32928,
      LEQUAL: 515,
      LESS: 513,
      GREATER: 516,
      GEQUAL: 518,
      EQUAL: 514,
      NOTEQUAL: 517,
      ALWAYS: 519,
      NEVER: 512,
      DEPTH_COMPONENT: 6402,
      DEPTH_COMPONENT16: 33189,
      DEPTH_COMPONENT24: 33190,
      DEPTH_COMPONENT32F: 36012,
      DEPTH_STENCIL: 34041,
      DEPTH24_STENCIL8: 35056,
      TEXTURE0: 33984,
      UNPACK_FLIP_Y_WEBGL: 37440,
      UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
      UNPACK_ALIGNMENT: 3317,
      PACK_ALIGNMENT: 3333,
      FRAMEBUFFER: 36160,
      RENDERBUFFER: 36161,
      READ_FRAMEBUFFER: 36008,
      DRAW_FRAMEBUFFER: 36009,
      COLOR_ATTACHMENT0: 36064,
      DEPTH_ATTACHMENT: 36096,
      STENCIL_ATTACHMENT: 36128,
      DEPTH_STENCIL_ATTACHMENT: 33306,
      FRAMEBUFFER_COMPLETE: 36053,
      SRC_ALPHA: 770,
      ONE_MINUS_SRC_ALPHA: 771,
      ONE: 1,
      ZERO: 0,
      SRC_COLOR: 768,
      DST_COLOR: 774,
      ONE_MINUS_SRC_COLOR: 769,
      ONE_MINUS_DST_COLOR: 775,
      DST_ALPHA: 772,
      ONE_MINUS_DST_ALPHA: 773,
      CONSTANT_COLOR: 32769,
      ONE_MINUS_CONSTANT_COLOR: 32770,
      CONSTANT_ALPHA: 32771,
      ONE_MINUS_CONSTANT_ALPHA: 32772,
      FUNC_ADD: 32774,
      FUNC_SUBTRACT: 32778,
      FUNC_REVERSE_SUBTRACT: 32779,
      MIN: 32775,
      MAX: 32776,
      BACK: 1029,
      FRONT: 1028,
      FRONT_AND_BACK: 1032,
      CW: 2304,
      CCW: 2305,
      LINK_STATUS: 35714,
      COMPILE_STATUS: 35713,
      ACTIVE_ATTRIBUTES: 35721,
      ACTIVE_UNIFORMS: 35718,
      DELETE_STATUS: 35712,
      VALIDATE_STATUS: 35715,
    };
    return mockGL;
  };

  // Create a minimal 2D context mock for canvas operations
  const create2DContextMock = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }),
    putImageData: () => {},
    createImageData: () => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }),
    setTransform: () => {},
    resetTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    arcTo: () => {},
    rect: () => {},
    clip: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    transform: () => {},
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    strokeText: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    createPattern: () => ({}),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    getLineDash: () => [],
    setLineDash: () => {},
    ellipse: () => {},
    canvas: null as HTMLCanvasElement | null,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineDashOffset: 0,
    imageSmoothingEnabled: true,
  });

  // Override getContext to return mocks
  HTMLCanvasElement.prototype.getContext = function (
    contextType: string,
    _options?: unknown
  ): RenderingContext | null {
    if (
      contextType === 'webgl' ||
      contextType === 'webgl2' ||
      contextType === 'experimental-webgl'
    ) {
      const ctx = createWebGLMock();
      ctx.canvas = this;
      return ctx as unknown as WebGLRenderingContext;
    }
    if (contextType === '2d') {
      const ctx = create2DContextMock();
      ctx.canvas = this;
      return ctx as unknown as CanvasRenderingContext2D;
    }
    return null;
  };
}
