import type { EdgeType } from '@typermaid/core';

/**
 * Edge path generator options
 */
export interface EdgeOptions {
  /** Start point coordinates */
  from: { x: number; y: number };

  /** End point coordinates */
  to: { x: number; y: number };

  /** Edge label text (optional) */
  label?: string;

  /** Path points from layout engine (optional) */
  points?: Array<{ x: number; y: number }>;

  /** Curve tension (0 = straight, 1 = very curved) */
  tension?: number;

  /** Arrow size */
  arrowSize?: number;

  /** Line thickness */
  thickness?: number;
}

/**
 * Generated edge path result
 */
export interface EdgePath {
  /** SVG path data */
  path: string;

  /** Marker ID for arrow/decoration */
  markerId?: string;

  /** Marker SVG definition */
  markerDef?: string;

  /** Label position (midpoint) */
  labelPosition?: { x: number; y: number };

  /** Stroke dash array for dotted/dashed lines */
  strokeDasharray?: string;

  /** Stroke width */
  strokeWidth: number;
}

/**
 * Edge generator function type
 */
export type EdgeGenerator = (options: EdgeOptions) => EdgePath;

/**
 * Map of edge type to generator function
 */
export type EdgeGenerators = Record<EdgeType, EdgeGenerator>;

/**
 * Default edge options
 */
export const DEFAULT_EDGE_OPTIONS: Partial<EdgeOptions> = {
  tension: 0.5,
  arrowSize: 8,
  thickness: 2,
};

/**
 * Marker (arrow) types
 */
export type MarkerType =
  | 'arrow' // Normal arrow >
  | 'cross' // Cross x
  | 'circle' // Circle o
  | 'none'; // No marker

/**
 * Arrow/marker definition
 */
export interface MarkerDefinition {
  id: string;
  path: string;
  width: number;
  height: number;
  refX: number;
  refY: number;
  fill?: string;
  stroke?: string;
}
