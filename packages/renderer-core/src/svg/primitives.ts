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
export function styleToString(style: SVGStyle | undefined): string | undefined {
  if (!style) return undefined;

  const entries = Object.entries(style).map(([key, value]) => {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${kebabKey}:${value}`;
  });

  return entries.length > 0 ? entries.join(';') : undefined;
}

/**
 * Create a path element
 */
export function path(d: string, props?: Partial<SVGPathElement>): SVGElement {
  return {
    type: 'path',
    props: {
      d,
      ...props,
    },
  };
}

/**
 * Create a rect element
 */
export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  props?: Partial<SVGRectElement>
): SVGElement {
  return {
    type: 'rect',
    props: {
      x,
      y,
      width,
      height,
      ...props,
    },
  };
}

/**
 * Create a circle element
 */
export function circle(
  cx: number,
  cy: number,
  r: number,
  props?: Partial<SVGCircleElement>
): SVGElement {
  return {
    type: 'circle',
    props: {
      cx,
      cy,
      r,
      ...props,
    },
  };
}

/**
 * Create an ellipse element
 */
export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  props?: Partial<SVGEllipseElement>
): SVGElement {
  return {
    type: 'ellipse',
    props: {
      cx,
      cy,
      rx,
      ry,
      ...props,
    },
  };
}

/**
 * Create a line element
 */
export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  props?: Partial<SVGLineElement>
): SVGElement {
  return {
    type: 'line',
    props: {
      x1,
      y1,
      x2,
      y2,
      ...props,
    },
  };
}

/**
 * Create a text element
 */
export function text(
  x: number,
  y: number,
  content: string,
  props?: Partial<SVGTextElement>
): SVGElement {
  return {
    type: 'text',
    props: {
      x,
      y,
      text: content,
      ...props,
    },
  };
}

/**
 * Create a group element
 */
export function group(children: SVGElement[], props?: Partial<SVGGroupElement>): SVGElement {
  return {
    type: 'g',
    props: {
      children,
      ...props,
    },
  };
}
