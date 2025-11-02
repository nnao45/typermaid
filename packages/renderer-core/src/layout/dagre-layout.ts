import type { FlowchartDiagram, FlowchartNode } from '@lyric-js/core';
import dagre from 'dagre';
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
 * Calculate node dimensions based on label and shape
 */
function calculateNodeDimensions(label: string, shape: FlowchartNode['shape']): Dimensions {
  // Base dimensions - will be improved with actual text measurement
  const baseWidth = 100;
  const baseHeight = 40;

  // Rough estimate based on label length
  const labelWidth = Math.max(label.length * 8, baseWidth);
  const labelHeight = baseHeight;

  // Adjust for shape
  switch (shape) {
    case 'circle':
    case 'double_circle': {
      // Circular shapes need more space
      const diameter = Math.max(labelWidth, labelHeight) * 1.2;
      return { width: diameter, height: diameter };
    }

    case 'rhombus':
      // Diamond shapes are wider
      return {
        width: labelWidth * 1.5,
        height: labelHeight * 1.5,
      };

    case 'hexagon':
      return {
        width: labelWidth * 1.3,
        height: labelHeight * 1.2,
      };

    default:
      return { width: labelWidth, height: labelHeight };
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
    const dimensions = calculateNodeDimensions(node.label || node.id, node.shape);

    g.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });

    nodeMap.set(node.id, {
      id: node.id,
      label: node.label || node.id,
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

    if (edge.label) {
      layoutEdges.push({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label,
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
