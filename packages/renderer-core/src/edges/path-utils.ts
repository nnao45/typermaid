/**
 * Calculate distance between two points
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points (in degrees)
 */
export function angle(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Calculate midpoint between two points
 */
export function midpoint(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Calculate point along a line at given distance from start
 */
export function pointAtDistance(
  from: { x: number; y: number },
  to: { x: number; y: number },
  dist: number,
): { x: number; y: number } {
  const totalDist = distance(from, to);
  if (totalDist === 0) return { ...from };
  
  const ratio = dist / totalDist;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

/**
 * Generate smooth curve through points using Catmull-Rom spline
 */
export function smoothCurve(
  points: Array<{ x: number; y: number }>,
  tension: number = 0.5,
): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    const [p0, p1] = points;
    if (!p0 || !p1) return '';
    return `M ${p0.x},${p0.y} L ${p1.x},${p1.y}`;
  }

  const first = points[0];
  if (!first) return '';
  let path = `M ${first.x},${first.y}`;
  
  // Use quadratic bezier curves for smoothness
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    if (!p0 || !p1) continue;
    
    if (i === points.length - 2) {
      // Last segment - straight line
      path += ` L ${p1.x},${p1.y}`;
    } else {
      const p2 = points[i + 2];
      if (!p2) continue;
      
      // Control point between p0 and p1
      const cp1x = p0.x + (p1.x - p0.x) * (1 - tension);
      const cp1y = p0.y + (p1.y - p0.y) * (1 - tension);
      
      // Quadratic curve to p1
      path += ` Q ${cp1x},${cp1y} ${p1.x},${p1.y}`;
    }
  }
  
  return path;
}

/**
 * Generate straight line path
 */
export function straightLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  return `M ${from.x},${from.y} L ${to.x},${to.y}`;
}

/**
 * Generate path with rounded corners
 */
export function roundedPath(
  points: Array<{ x: number; y: number }>,
  radius: number = 5,
): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    const [p0, p1] = points;
    if (!p0 || !p1) return '';
    return straightLine(p0, p1);
  }

  const first = points[0];
  if (!first) return '';
  let path = `M ${first.x},${first.y}`;
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    if (!prev || !curr || !next) continue;
    
    // Calculate distances
    const d1 = distance(prev, curr);
    const d2 = distance(curr, next);
    
    // Limit radius to half of shortest segment
    const r = Math.min(radius, d1 / 2, d2 / 2);
    
    // Calculate points before and after corner
    const p1 = pointAtDistance(curr, prev, r);
    const p2 = pointAtDistance(curr, next, r);
    
    // Line to corner start, arc to corner end
    path += ` L ${p1.x},${p1.y}`;
    path += ` Q ${curr.x},${curr.y} ${p2.x},${p2.y}`;
  }
  
  // Line to final point
  const last = points[points.length - 1];
  if (last) {
    path += ` L ${last.x},${last.y}`;
  }
  
  return path;
}

/**
 * Calculate label position along path
 */
export function calculateLabelPosition(
  points: Array<{ x: number; y: number }>,
): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  
  const first = points[0];
  if (!first) return { x: 0, y: 0 };
  if (points.length === 1) return { x: first.x, y: first.y };
  
  // Find middle point
  const midIndex = Math.floor(points.length / 2);
  
  if (points.length % 2 === 1) {
    const mid = points[midIndex];
    if (!mid) return { x: 0, y: 0 };
    return { x: mid.x, y: mid.y };
  }
  
  const p1 = points[midIndex - 1];
  const p2 = points[midIndex];
  if (!p1 || !p2) return { x: 0, y: 0 };
  
  return midpoint(p1, p2);
}
