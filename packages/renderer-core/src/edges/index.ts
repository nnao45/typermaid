import type { EdgeType } from '@lyric-js/core';
import * as generators from './generators.js';
import type { EdgeGenerators, EdgeOptions, EdgePath } from './types.js';

/**
 * Map of all edge generators
 */
export const edgeGenerators: EdgeGenerators = {
  arrow: generators.arrow,
  line: generators.normal,
  circle_arrow: generators.open,
  cross_arrow: generators.cross,
  dotted_arrow: generators.dotted_arrow,
  dotted_line: generators.dotted_open,
  thick_arrow: generators.thick_arrow,
  thick_line: generators.thick_open,
  invisible: generators.invisible,
  multi_arrow: generators.arrow, // TODO: implement multi_arrow
  multi_line: generators.normal, // TODO: implement multi_line
};

/**
 * Generate SVG path for an edge
 */
export function generateEdgePath(type: EdgeType, options: EdgeOptions): EdgePath {
  const generator = edgeGenerators[type];

  if (!generator) {
    throw new Error(`Unknown edge type: ${type}`);
  }

  return generator(options);
}

export {
  createArrowMarker,
  createCircleMarker,
  createCrossMarker,
  getMarkerDefinition,
  markerToSVG,
} from './markers.js';
// Re-export utilities
export {
  angle,
  calculateLabelPosition,
  distance,
  midpoint,
  pointAtDistance,
  roundedPath,
  smoothCurve,
  straightLine,
} from './path-utils.js';
// Re-export types
export type {
  EdgeGenerator,
  EdgeGenerators,
  EdgeOptions,
  EdgePath,
  MarkerDefinition,
  MarkerType,
} from './types.js';
export { DEFAULT_EDGE_OPTIONS } from './types.js';
