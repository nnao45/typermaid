import type { FlowchartDiagram, FlowchartNode } from '@typermaid/core';
import dagre from 'dagre';
import { measureTextCanvas } from '../shapes/canvas-text-measure.js';
import type {
  Dimensions,
  Layout,
  LayoutEdge,
  LayoutNode,
  LayoutOptions,
  Position,
} from '../types/layout.js';
import { DEFAULT_LAYOUT_OPTIONS } from '../types/layout.js';

/**
 * Extract string value from Content type
 */
function contentToString(
  content: string | { type: string; raw: string } | undefined
): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

/**
 * Default font settings for text measurement
 */
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_FONT_FAMILY = 'Arial, sans-serif';
const DEFAULT_FONT_WEIGHT = 'normal';
const DEFAULT_PADDING = 20;

/**
 * Calculate node dimensions based on label and shape
 * Now using accurate Canvas-based text measurement
 */
function calculateNodeDimensions(label: string, shape: FlowchartNode['shape']): Dimensions {
  // Measure text accurately using Canvas API
  const textMetrics = measureTextCanvas(
    label,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_FAMILY,
    DEFAULT_FONT_WEIGHT
  );

  // Add padding
  const baseWidth = Math.max(textMetrics.width + DEFAULT_PADDING * 2, 80);
  const baseHeight = Math.max(textMetrics.height + DEFAULT_PADDING, 40);

  // Adjust for shape
  switch (shape) {
    case 'circle':
    case 'double_circle': {
      // Circular shapes need more space
      const diameter = Math.max(baseWidth, baseHeight) * 1.2;
      return { width: diameter, height: diameter };
    }

    case 'rhombus':
      // Diamond shapes are wider
      return {
        width: baseWidth * 1.5,
        height: baseHeight * 1.5,
      };

    case 'hexagon':
      return {
        width: baseWidth * 1.3,
        height: baseHeight * 1.2,
      };

    default:
      return { width: baseWidth, height: baseHeight };
  }
}

/**
 * Create layout from Flowchart AST
 */
export function createLayout(diagram: FlowchartDiagram, options: LayoutOptions = {}): Layout {
  // Use diagram direction if not overridden by options
  const rankdir = options.rankdir || diagram.direction || 'TB';
  const opts = { ...DEFAULT_LAYOUT_OPTIONS, ...options, rankdir };

  // Create Dagre graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: opts.rankdir,
    nodesep: opts.nodesep,
    ranksep: opts.ranksep,
    edgesep: opts.edgesep,
    marginx: opts.marginx,
    marginy: opts.marginy,
  });

  // Default edge config
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  const nodeMap = new Map<string, LayoutNode>();

  for (const node of diagram.nodes) {
    const labelStr = contentToString(node.label) || node.id;
    const dimensions = calculateNodeDimensions(labelStr, node.shape);

    g.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });

    nodeMap.set(node.id, {
      id: node.id,
      label: labelStr,
      shape: node.shape,
      position: { x: 0, y: 0 }, // Will be set by dagre
      dimensions,
    });
  }

  // Add edges
  for (const edge of diagram.edges) {
    g.setEdge(edge.from, edge.to);
  }

  // Run layout algorithm
  dagre.layout(g);

  // Extract positioned nodes
  const layoutNodes: LayoutNode[] = [];
  const nodeIds = g.nodes();

  for (const nodeId of nodeIds) {
    const dagreNode = g.node(nodeId);
    const layoutNode = nodeMap.get(nodeId);

    if (layoutNode && dagreNode) {
      layoutNode.position = {
        x: dagreNode.x,
        y: dagreNode.y,
      };
      layoutNodes.push(layoutNode);
    }
  }

  // Extract edges with points
  const layoutEdges: LayoutEdge[] = [];

  for (const edge of diagram.edges) {
    const dagreEdge = g.edge(edge.from, edge.to);
    const points: Position[] = dagreEdge?.points || [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    const labelStr = contentToString(edge.label);
    if (labelStr) {
      layoutEdges.push({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: labelStr,
        edgeType: edge.type,
        points,
      });
    } else {
      layoutEdges.push({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        edgeType: edge.type,
        points,
      });
    }
  }

  // Calculate bounding box
  const graphInfo = g.graph();
  const bbox = {
    x: 0,
    y: 0,
    width: graphInfo.width || 800,
    height: graphInfo.height || 600,
  };

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    bbox,
  };
}
