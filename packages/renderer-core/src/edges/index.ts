import type { EdgeType } from '@lyric-js/core';
import type { EdgeGenerators, EdgeOptions, EdgePath } from './types.js';
import * as generators from './generators.js';

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
  multi_line: generators.normal,  // TODO: implement multi_line
};

/**
 * Generate SVG path for an edge
 */
export function generateEdgePath(
  type: EdgeType,
  options: EdgeOptions,
): EdgePath {
  const generator = edgeGenerators[type];
  
  if (!generator) {
    throw new Error(`Unknown edge type: ${type}`);
  }
  
  return generator(options);
}

// Re-export types
export type {
  EdgeOptions,
  EdgePath,
  EdgeGenerator,
  EdgeGenerators,
  MarkerType,
  MarkerDefinition,
} from './types.js';

export { DEFAULT_EDGE_OPTIONS } from './types.js';

// Re-export utilities
export {
  distance,
  angle,
  midpoint,
  pointAtDistance,
  smoothCurve,
  straightLine,
  roundedPath,
  calculateLabelPosition,
} from './path-utils.js';

export {
  createArrowMarker,
  createCircleMarker,
  createCrossMarker,
  getMarkerDefinition,
  markerToSVG,
} from './markers.js';
