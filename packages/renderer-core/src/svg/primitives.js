/**
 * SVG primitive element creators
 */
/**
 * Convert style object to CSS string
 */
export function styleToString(style) {
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
export function path(d, props) {
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
export function rect(x, y, width, height, props) {
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
export function circle(cx, cy, r, props) {
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
export function ellipse(cx, cy, rx, ry, props) {
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
export function line(x1, y1, x2, y2, props) {
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
export function text(x, y, content, props) {
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
export function group(children, props) {
  return {
    type: 'g',
    props: {
      children,
      ...props,
    },
  };
}
//# sourceMappingURL=primitives.js.map
