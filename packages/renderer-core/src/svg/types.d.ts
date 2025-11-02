/**
 * SVG element types and style definitions
 */
export interface SVGStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central';
}
export interface SVGAttributes {
  id?: string;
  class?: string;
  style?: SVGStyle;
  [key: string]: unknown;
}
export interface SVGPathElement extends SVGAttributes {
  d: string;
}
export interface SVGRectElement extends SVGAttributes {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}
export interface SVGCircleElement extends SVGAttributes {
  cx: number;
  cy: number;
  r: number;
}
export interface SVGEllipseElement extends SVGAttributes {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}
export interface SVGLineElement extends SVGAttributes {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface SVGTextElement extends SVGAttributes {
  x: number;
  y: number;
  text: string;
}
export interface SVGGroupElement extends SVGAttributes {
  children: SVGElement[];
}
export type SVGElement =
  | {
      type: 'path';
      props: SVGPathElement;
    }
  | {
      type: 'rect';
      props: SVGRectElement;
    }
  | {
      type: 'circle';
      props: SVGCircleElement;
    }
  | {
      type: 'ellipse';
      props: SVGEllipseElement;
    }
  | {
      type: 'line';
      props: SVGLineElement;
    }
  | {
      type: 'text';
      props: SVGTextElement;
    }
  | {
      type: 'g';
      props: SVGGroupElement;
    };
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface SVGDocument {
  viewBox: ViewBox;
  width?: number;
  height?: number;
  elements: SVGElement[];
  defs?: SVGElement[];
}
//# sourceMappingURL=types.d.ts.map
