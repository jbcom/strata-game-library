/**
 * Setup file for integration tests
 *
 * Mocks Three.js WebGL context and React Three Fiber
 */
import { vi } from 'vitest';

// Mock WebGL
global.WebGLRenderingContext = vi.fn() as any;
global.WebGL2RenderingContext = vi.fn() as any;

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getParameter: vi.fn(),
  getExtension: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  useProgram: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  blendFunc: vi.fn(),
  depthFunc: vi.fn(),
  cullFace: vi.fn(),
  frontFace: vi.fn(),
  pixelStorei: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  generateMipmap: vi.fn(),
  activeTexture: vi.fn(),
  bindTexture: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  uniform3fv: vi.fn(),
  uniform1f: vi.fn(),
  uniform1i: vi.fn(),
  getUniformLocation: vi.fn(),
  getAttribLocation: vi.fn(),
})) as any;
