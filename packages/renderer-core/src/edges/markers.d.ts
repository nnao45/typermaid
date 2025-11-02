import type { MarkerDefinition, MarkerType } from './types.js';
/**
 * Generate arrow marker definition
 */
export declare function createArrowMarker(
  id: string,
  size?: number,
  fill?: string
): MarkerDefinition;
/**
 * Generate cross marker definition
 */
export declare function createCrossMarker(
  id: string,
  size?: number,
  stroke?: string
): MarkerDefinition;
/**
 * Generate circle marker definition
 */
export declare function createCircleMarker(
  id: string,
  radius?: number,
  fill?: string,
  stroke?: string
): MarkerDefinition;
/**
 * Get marker definition by type
 */
export declare function getMarkerDefinition(
  type: MarkerType,
  id: string,
  size?: number
): MarkerDefinition | null;
/**
 * Convert marker definition to SVG string
 */
export declare function markerToSVG(marker: MarkerDefinition): string;
//# sourceMappingURL=markers.d.ts.map
