/**
 * SVG string renderer
 */
import type { SVGDocument, ViewBox } from './types.js';
/**
 * Calculate viewBox from layout bounds
 */
export declare function calculateViewBox(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  margin?: number
): ViewBox;
/**
 * Render SVG document to string
 */
export declare function renderSVG(doc: SVGDocument): string;
//# sourceMappingURL=renderer.d.ts.map
