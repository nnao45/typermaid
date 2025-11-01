import type { EdgeOptions, EdgePath } from './types.js';
import { DEFAULT_EDGE_OPTIONS } from './types.js';
import { createArrowMarker, createCircleMarker, createCrossMarker, markerToSVG } from './markers.js';
import { straightLine, smoothCurve, calculateLabelPosition } from './path-utils.js';

/**
 * Normal arrow edge: A --> B
 */
export function arrow(options: EdgeOptions): EdgePath {
  const opts = { ...DEFAULT_EDGE_OPTIONS, ...options };
  const { from, to, points, tension = 0.5, arrowSize = 8, thickness = 2 } = opts;
  
  const pathPoints = points && points.length > 0 ? points : [from, to];
  const firstPoint = pathPoints[0];
  const lastPoint = pathPoints[pathPoints.length - 1];
  
  const path = pathPoints.length === 2 && firstPoint && lastPoint
    ? straightLine(firstPoint, lastPoint)
    : smoothCurve(pathPoints, tension);
  
  const marker = createArrowMarker('arrow-end', arrowSize);
  
  return {
    path,
    markerId: marker.id,
    markerDef: markerToSVG(marker),
    labelPosition: calculateLabelPosition(pathPoints),
    strokeWidth: thickness,
  };
}

/**
 * Open arrow edge: A --o B
 */
export function open(options: EdgeOptions): EdgePath {
  const opts = { ...DEFAULT_EDGE_OPTIONS, ...options };
  const { from, to, points, tension = 0.5, arrowSize = 8, thickness = 2 } = opts;
  
  const pathPoints = points && points.length > 0 ? points : [from, to];
  const firstPoint = pathPoints[0];
  const lastPoint = pathPoints[pathPoints.length - 1];
  
  const path = pathPoints.length === 2 && firstPoint && lastPoint
    ? straightLine(firstPoint, lastPoint)
    : smoothCurve(pathPoints, tension);
  
  const marker = createCircleMarker('circle-end', arrowSize / 2);
  
  return {
    path,
    markerId: marker.id,
    markerDef: markerToSVG(marker),
    labelPosition: calculateLabelPosition(pathPoints),
    strokeWidth: thickness,
  };
}

/**
 * Cross arrow edge: A --x B
 */
export function cross(options: EdgeOptions): EdgePath {
  const opts = { ...DEFAULT_EDGE_OPTIONS, ...options };
  const { from, to, points, tension = 0.5, arrowSize = 8, thickness = 2 } = opts;
  
  const pathPoints = points && points.length > 0 ? points : [from, to];
  const firstPoint = pathPoints[0];
  const lastPoint = pathPoints[pathPoints.length - 1];
  
  const path = pathPoints.length === 2 && firstPoint && lastPoint
    ? straightLine(firstPoint, lastPoint)
    : smoothCurve(pathPoints, tension);
  
  const marker = createCrossMarker('cross-end', arrowSize);
  
  return {
    path,
    markerId: marker.id,
    markerDef: markerToSVG(marker),
    labelPosition: calculateLabelPosition(pathPoints),
    strokeWidth: thickness,
  };
}

/**
 * Dotted arrow edge: A -.-> B
 */
export function dotted_arrow(options: EdgeOptions): EdgePath {
  const result = arrow(options);
  return {
    ...result,
    strokeDasharray: '5,5',
  };
}

/**
 * Dotted open edge: A -.-o B
 */
export function dotted_open(options: EdgeOptions): EdgePath {
  const result = open(options);
  return {
    ...result,
    strokeDasharray: '5,5',
  };
}

/**
 * Dotted cross edge: A -.-x B
 */
export function dotted_cross(options: EdgeOptions): EdgePath {
  const result = cross(options);
  return {
    ...result,
    strokeDasharray: '5,5',
  };
}

/**
 * Thick arrow edge: A ==> B
 */
export function thick_arrow(options: EdgeOptions): EdgePath {
  const opts = { ...options, thickness: (options.thickness || 2) * 2 };
  return arrow(opts);
}

/**
 * Thick open edge: A ==o B
 */
export function thick_open(options: EdgeOptions): EdgePath {
  const opts = { ...options, thickness: (options.thickness || 2) * 2 };
  return open(opts);
}

/**
 * Thick cross edge: A ==x B
 */
export function thick_cross(options: EdgeOptions): EdgePath {
  const opts = { ...options, thickness: (options.thickness || 2) * 2 };
  return cross(opts);
}

/**
 * Invisible edge: A ~~~ B
 */
export function invisible(options: EdgeOptions): EdgePath {
  const opts = { ...DEFAULT_EDGE_OPTIONS, ...options };
  const { from, to, points } = opts;
  
  const pathPoints = points && points.length > 0 ? points : [from, to];
  const firstPoint = pathPoints[0] || from;
  const lastPoint = pathPoints[pathPoints.length - 1] || to;
  const path = straightLine(firstPoint, lastPoint);
  
  return {
    path,
    labelPosition: calculateLabelPosition(pathPoints),
    strokeWidth: 0,
  };
}

/**
 * Normal line (no arrow): A --- B
 */
export function normal(options: EdgeOptions): EdgePath {
  const opts = { ...DEFAULT_EDGE_OPTIONS, ...options };
  const { from, to, points, tension = 0.5, thickness = 2 } = opts;
  
  const pathPoints = points && points.length > 0 ? points : [from, to];
  const firstPoint = pathPoints[0];
  const lastPoint = pathPoints[pathPoints.length - 1];
  
  const path = pathPoints.length === 2 && firstPoint && lastPoint
    ? straightLine(firstPoint, lastPoint)
    : smoothCurve(pathPoints, tension);
  
  return {
    path,
    labelPosition: calculateLabelPosition(pathPoints),
    strokeWidth: thickness,
  };
}
