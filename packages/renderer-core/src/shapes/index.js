import * as generators from './generators.js';
/**
 * Map of all shape generators
 */
export const shapeGenerators = {
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
export function generateShapePath(shape, options) {
  const generator = shapeGenerators[shape];
  if (!generator) {
    throw new Error(`Unknown shape: ${shape}`);
  }
  return generator(options);
}
export { calculateTextBox, measureText, wrapText } from './text-measure.js';
export { DEFAULT_SHAPE_OPTIONS } from './types.js';
//# sourceMappingURL=index.js.map
