/**
 * SVG string renderer
 */
import { styleToString } from './primitives.js';
/**
 * Calculate viewBox from layout bounds
 */
export function calculateViewBox(minX, minY, maxX, maxY, margin = 20) {
  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + margin * 2,
    height: maxY - minY + margin * 2,
  };
}
/**
 * Render SVG element to string
 */
function renderElement(element, indent = 0) {
  const spaces = '  '.repeat(indent);
  switch (element.type) {
    case 'path': {
      const { d, style, ...rest } = element.props;
      const attrs = [
        `d="${d}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) => (v !== undefined ? `${k}="${v}"` : null)),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<path ${attrs} />`;
    }
    case 'rect': {
      const { x, y, width, height, rx, ry, style, ...rest } = element.props;
      const attrs = [
        `x="${x}"`,
        `y="${y}"`,
        `width="${width}"`,
        `height="${height}"`,
        rx !== undefined && `rx="${rx}"`,
        ry !== undefined && `ry="${ry}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) => (v !== undefined ? `${k}="${v}"` : null)),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<rect ${attrs} />`;
    }
    case 'circle': {
      const { cx, cy, r, style, ...rest } = element.props;
      const attrs = [
        `cx="${cx}"`,
        `cy="${cy}"`,
        `r="${r}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) => (v !== undefined ? `${k}="${v}"` : null)),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<circle ${attrs} />`;
    }
    case 'ellipse': {
      const { cx, cy, rx, ry, style, ...rest } = element.props;
      const attrs = [
        `cx="${cx}"`,
        `cy="${cy}"`,
        `rx="${rx}"`,
        `ry="${ry}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) => (v !== undefined ? `${k}="${v}"` : null)),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<ellipse ${attrs} />`;
    }
    case 'line': {
      const { x1, y1, x2, y2, style, ...rest } = element.props;
      const attrs = [
        `x1="${x1}"`,
        `y1="${y1}"`,
        `x2="${x2}"`,
        `y2="${y2}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) => (v !== undefined ? `${k}="${v}"` : null)),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<line ${attrs} />`;
    }
    case 'text': {
      const { x, y, text, style, ...rest } = element.props;
      const attrs = [
        `x="${x}"`,
        `y="${y}"`,
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) =>
          v !== undefined && k !== 'text' ? `${k}="${v}"` : null
        ),
      ]
        .filter(Boolean)
        .join(' ');
      return `${spaces}<text ${attrs}>${text}</text>`;
    }
    case 'g': {
      const { children, style, ...rest } = element.props;
      const attrs = [
        style && `style="${styleToString(style)}"`,
        ...Object.entries(rest).map(([k, v]) =>
          v !== undefined && k !== 'children' ? `${k}="${v}"` : null
        ),
      ].filter(Boolean);
      const attrsStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
      const childrenStr = children.map((child) => renderElement(child, indent + 1)).join('\n');
      return `${spaces}<g${attrsStr}>\n${childrenStr}\n${spaces}</g>`;
    }
  }
}
/**
 * Render SVG document to string
 */
export function renderSVG(doc) {
  const { viewBox, width, height, elements, defs } = doc;
  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  const widthAttr = width !== undefined ? ` width="${width}"` : '';
  const heightAttr = height !== undefined ? ` height="${height}"` : '';
  const defsStr =
    defs && defs.length > 0
      ? `\n  <defs>\n${defs.map((d) => renderElement(d, 2)).join('\n')}\n  </defs>`
      : '';
  const elementsStr = elements.map((e) => renderElement(e, 1)).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxStr}"${widthAttr}${heightAttr}>${defsStr}
${elementsStr}
</svg>`;
}
//# sourceMappingURL=renderer.js.map
