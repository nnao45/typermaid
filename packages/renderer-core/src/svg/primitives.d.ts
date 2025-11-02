/**
 * SVG primitive element creators
 */
import type {
  SVGCircleElement,
  SVGElement,
  SVGEllipseElement,
  SVGGroupElement,
  SVGLineElement,
  SVGPathElement,
  SVGRectElement,
  SVGStyle,
  SVGTextElement,
} from './types.js';
/**
 * Convert style object to CSS string
 */
export declare function styleToString(style: SVGStyle | undefined): string | undefined;
/**
 * Create a path element
 */
export declare function path(d: string, props?: Partial<SVGPathElement>): SVGElement;
/**
 * Create a rect element
 */
export declare function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  props?: Partial<SVGRectElement>
): SVGElement;
/**
 * Create a circle element
 */
export declare function circle(
  cx: number,
  cy: number,
  r: number,
  props?: Partial<SVGCircleElement>
): SVGElement;
/**
 * Create an ellipse element
 */
export declare function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  props?: Partial<SVGEllipseElement>
): SVGElement;
/**
 * Create a line element
 */
export declare function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  props?: Partial<SVGLineElement>
): SVGElement;
/**
 * Create a text element
 */
export declare function text(
  x: number,
  y: number,
  content: string,
  props?: Partial<SVGTextElement>
): SVGElement;
/**
 * Create a group element
 */
export declare function group(children: SVGElement[], props?: Partial<SVGGroupElement>): SVGElement;
//# sourceMappingURL=primitives.d.ts.map
