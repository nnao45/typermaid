import type { NodeShape } from '@lyric-js/core';
import type { ShapeGenerators, ShapeOptions, ShapePath } from './types.js';
/**
 * Map of all shape generators
 */
export declare const shapeGenerators: ShapeGenerators;
/**
 * Generate SVG path for a node shape
 */
export declare function generateShapePath(shape: NodeShape, options: ShapeOptions): ShapePath;
export { calculateTextBox, measureText, wrapText } from './text-measure.js';
export type { ShapeGenerator, ShapeGenerators, ShapeOptions, ShapePath } from './types.js';
export { DEFAULT_SHAPE_OPTIONS } from './types.js';
//# sourceMappingURL=index.d.ts.map
