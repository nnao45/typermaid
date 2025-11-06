import type { FlowchartEdge, FlowchartNode } from '@typermaid/core';

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Bounding box
 */
export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Layout node with position and dimensions
 */
export interface LayoutNode {
  id: string;
  label: string;
  shape: FlowchartNode['shape'];
  position: Position;
  dimensions: Dimensions;
}

/**
 * Layout edge with path
 */
export interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  edgeType: FlowchartEdge['type'];
  points: Position[];
}

/**
 * Complete layout result
 */
export interface Layout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bbox: BBox;
}

/**
 * Layout options
 */
export interface LayoutOptions {
  /** Direction of the graph */
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  /** Horizontal separation between nodes */
  nodesep?: number;
  /** Vertical separation between ranks */
  ranksep?: number;
  /** Edge separation */
  edgesep?: number;
  /** Margin around the graph */
  marginx?: number;
  marginy?: number;
}

/**
 * Default layout options
 */
export const DEFAULT_LAYOUT_OPTIONS: Required<LayoutOptions> = {
  rankdir: 'TB',
  nodesep: 50,
  ranksep: 50,
  edgesep: 10,
  marginx: 20,
  marginy: 20,
};
