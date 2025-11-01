import type { NodeShape } from '@lyric-js/core';
import type { ShapeGenerators, ShapeOptions, ShapePath } from './types.js';
import * as generators from './generators.js';

/**
 * Map of all shape generators
 */
export const shapeGenerators: ShapeGenerators = {
  square: generators.square,
  round: generators.round,
  stadium: generators.stadium,
  subroutine: generators.subroutine,
  cylindrical: generators.cylindrical,
  circle: generators.circle,
  asymmetric: generators.asymmetric,
  rhombus: generators.rhombus,
  hexagon: generators.hexagon,
  parallelogram: generators.parallelogram,
  parallelogram_alt: generators.parallelogram_alt,
  trapezoid: generators.trapezoid,
  trapezoid_alt: generators.trapezoid_alt,
  double_circle: generators.double_circle,
};

/**
 * Generate SVG path for a node shape
 */
export function generateShapePath(
  shape: NodeShape,
  options: ShapeOptions,
): ShapePath {
  const generator = shapeGenerators[shape];
  
  if (!generator) {
    throw new Error(`Unknown shape: ${shape}`);
  }
  
  return generator(options);
}

// Re-export types
export type {
  ShapeGenerator,
  ShapeGenerators,
  ShapeOptions,
  ShapePath,
} from './types.js';

export { DEFAULT_SHAPE_OPTIONS } from './types.js';
export { measureText, calculateTextBox, wrapText } from './text-measure.js';
