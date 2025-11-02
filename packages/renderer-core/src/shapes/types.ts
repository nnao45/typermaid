import type { NodeShape } from '@lyric-js/core';

/**
 * SVG path data for a node shape
 */
export interface ShapePath {
  /**
   * SVG path data string
   */
  path: string;

  /**
   * Width of the shape
   */
  width: number;

  /**
   * Height of the shape
   */
  height: number;

  /**
   * Label position (relative to top-left corner)
   */
  labelPosition: {
    x: number;
    y: number;
  };

  /**
   * Text anchor for the label
   */
  textAnchor: 'start' | 'middle' | 'end';

  /**
   * Vertical alignment baseline
   */
  dominantBaseline: 'auto' | 'middle' | 'hanging' | 'central';
}

/**
 * Options for generating shape paths
 */
export interface ShapeOptions {
  /**
   * Text content (for size calculation)
   */
  text: string;

  /**
   * Padding inside the shape
   */
  padding?: number;

  /**
   * Font size
   */
  fontSize?: number;

  /**
   * Font family
   */
  fontFamily?: string;

  /**
   * Minimum width
   */
  minWidth?: number;

  /**
   * Minimum height
   */
  minHeight?: number;
}

/**
 * Default shape options
 */
export const DEFAULT_SHAPE_OPTIONS: Required<Omit<ShapeOptions, 'text'>> = {
  padding: 16,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  minWidth: 80,
  minHeight: 40,
};

/**
 * Shape generator function
 */
export type ShapeGenerator = (options: ShapeOptions) => ShapePath;

/**
 * Map of all shape generators
 */
export type ShapeGenerators = Record<NodeShape, ShapeGenerator>;
