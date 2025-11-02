import type { EdgeType } from '@lyric-js/core';
import type { EdgeGenerators, EdgeOptions, EdgePath } from './types.js';
/**
 * Map of all edge generators
 */
export declare const edgeGenerators: EdgeGenerators;
/**
 * Generate SVG path for an edge
 */
export declare function generateEdgePath(type: EdgeType, options: EdgeOptions): EdgePath;
export {
  createArrowMarker,
  createCircleMarker,
  createCrossMarker,
  getMarkerDefinition,
  markerToSVG,
} from './markers.js';
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
export type {
  EdgeGenerator,
  EdgeGenerators,
  EdgeOptions,
  EdgePath,
  MarkerDefinition,
  MarkerType,
} from './types.js';
export { DEFAULT_EDGE_OPTIONS } from './types.js';
//# sourceMappingURL=index.d.ts.map
