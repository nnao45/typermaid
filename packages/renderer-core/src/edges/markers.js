/**
 * Generate arrow marker definition
 */
export function createArrowMarker(id, size = 8, fill = 'currentColor') {
  return {
    id,
    path: `M 0,0 L ${size},${size / 2} L 0,${size} Z`,
    width: size,
    height: size,
    refX: size,
    refY: size / 2,
    fill,
  };
}
/**
 * Generate cross marker definition
 */
export function createCrossMarker(id, size = 8, stroke = 'currentColor') {
  const half = size / 2;
  return {
    id,
    path: `M 0,0 L ${size},${size} M ${size},0 L 0,${size}`,
    width: size,
    height: size,
    refX: half,
    refY: half,
    stroke,
  };
}
/**
 * Generate circle marker definition
 */
export function createCircleMarker(id, radius = 4, fill = 'none', stroke = 'currentColor') {
  const size = radius * 2;
  return {
    id,
    path: `M ${radius},${radius} m -${radius},0 a ${radius},${radius} 0 1,0 ${size},0 a ${radius},${radius} 0 1,0 -${size},0`,
    width: size,
    height: size,
    refX: radius,
    refY: radius,
    fill,
    stroke,
  };
}
/**
 * Get marker definition by type
 */
export function getMarkerDefinition(type, id, size = 8) {
  switch (type) {
    case 'arrow':
      return createArrowMarker(id, size);
    case 'cross':
      return createCrossMarker(id, size);
    case 'circle':
      return createCircleMarker(id, size / 2);
    case 'none':
      return null;
    default:
      return null;
  }
}
/**
 * Convert marker definition to SVG string
 */
export function markerToSVG(marker) {
  const { id, path, width, height, refX, refY, fill, stroke } = marker;
  const fillAttr = fill ? `fill="${fill}"` : 'fill="none"';
  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="2"` : '';
  return `<marker
    id="${id}"
    markerWidth="${width}"
    markerHeight="${height}"
    refX="${refX}"
    refY="${refY}"
    orient="auto"
    markerUnits="userSpaceOnUse"
  >
    <path d="${path}" ${fillAttr} ${strokeAttr} />
  </marker>`;
}
//# sourceMappingURL=markers.js.map
