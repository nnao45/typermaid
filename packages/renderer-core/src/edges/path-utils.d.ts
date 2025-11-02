/**
 * Calculate distance between two points
 */
export declare function distance(
  p1: {
    x: number;
    y: number;
  },
  p2: {
    x: number;
    y: number;
  }
): number;
/**
 * Calculate angle between two points (in degrees)
 */
export declare function angle(
  from: {
    x: number;
    y: number;
  },
  to: {
    x: number;
    y: number;
  }
): number;
/**
 * Calculate midpoint between two points
 */
export declare function midpoint(
  p1: {
    x: number;
    y: number;
  },
  p2: {
    x: number;
    y: number;
  }
): {
  x: number;
  y: number;
};
/**
 * Calculate point along a line at given distance from start
 */
export declare function pointAtDistance(
  from: {
    x: number;
    y: number;
  },
  to: {
    x: number;
    y: number;
  },
  dist: number
): {
  x: number;
  y: number;
};
/**
 * Generate smooth curve through points using Catmull-Rom spline
 */
export declare function smoothCurve(
  points: Array<{
    x: number;
    y: number;
  }>,
  tension?: number
): string;
/**
 * Generate straight line path
 */
export declare function straightLine(
  from: {
    x: number;
    y: number;
  },
  to: {
    x: number;
    y: number;
  }
): string;
/**
 * Generate path with rounded corners
 */
export declare function roundedPath(
  points: Array<{
    x: number;
    y: number;
  }>,
  radius?: number
): string;
/**
 * Calculate label position along path
 */
export declare function calculateLabelPosition(
  points: Array<{
    x: number;
    y: number;
  }>
): {
  x: number;
  y: number;
};
//# sourceMappingURL=path-utils.d.ts.map
