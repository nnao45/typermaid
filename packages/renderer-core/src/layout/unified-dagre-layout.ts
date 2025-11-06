import dagre from 'dagre';

/**
 * Generic node for layout calculation
 */
export interface UnifiedLayoutNode {
  id: string;
  label: string;
  width?: number;
  height?: number;
}

/**
 * Generic edge for layout calculation
 */
export interface UnifiedLayoutEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Layout options for Dagre
 */
export interface UnifiedLayoutOptions {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  ranksep?: number;
  nodesep?: number;
  edgesep?: number;
  marginx?: number;
  marginy?: number;
}

/**
 * Positioned node result
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Edge with routing points
 */
export interface RoutedEdge {
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
  label?: string;
}

/**
 * Complete layout result
 */
export interface UnifiedLayoutResult {
  nodes: PositionedNode[];
  edges: RoutedEdge[];
  width: number;
  height: number;
}

/**
 * Default layout options
 */
const DEFAULT_OPTIONS: Required<UnifiedLayoutOptions> = {
  rankdir: 'TB',
  ranksep: 50,
  nodesep: 50,
  edgesep: 10,
  marginx: 20,
  marginy: 20,
};

/**
 * Compute Dagre layout for generic nodes and edges
 *
 * This unified layout function can be used by all diagram types
 * (Flowchart, Class, ER, State, etc.) for consistent, professional layouts.
 *
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges between nodes
 * @param options - Layout configuration options
 * @returns Layout result with positioned nodes and routed edges
 */
export function computeUnifiedDagreLayout(
  nodes: UnifiedLayoutNode[],
  edges: UnifiedLayoutEdge[],
  options: UnifiedLayoutOptions = {}
): UnifiedLayoutResult {
  // Merge with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create Dagre graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: opts.rankdir,
    ranksep: opts.ranksep,
    nodesep: opts.nodesep,
    edgesep: opts.edgesep,
    marginx: opts.marginx,
    marginy: opts.marginy,
  });

  // Default edge label
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  for (const node of nodes) {
    g.setNode(node.id, {
      label: node.label,
      width: node.width ?? 100,
      height: node.height ?? 50,
    });
  }

  // Add edges to graph
  for (const edge of edges) {
    g.setEdge(edge.from, edge.to, {
      label: edge.label ?? '',
    });
  }

  // Run Dagre layout algorithm
  dagre.layout(g);

  // Extract positioned nodes
  const positionedNodes: PositionedNode[] = [];
  for (const nodeId of g.nodes()) {
    const dagreNode = g.node(nodeId);
    if (dagreNode) {
      positionedNodes.push({
        id: nodeId,
        x: dagreNode.x,
        y: dagreNode.y,
        width: dagreNode.width,
        height: dagreNode.height,
      });
    }
  }

  // Extract routed edges
  const routedEdges: RoutedEdge[] = [];
  for (const edge of edges) {
    const dagreEdge = g.edge(edge.from, edge.to);
    const points = dagreEdge?.points ?? [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    const routedEdge: RoutedEdge = {
      from: edge.from,
      to: edge.to,
      points,
    };

    if (edge.label !== undefined) {
      routedEdge.label = edge.label;
    }

    routedEdges.push(routedEdge);
  }

  // Get graph dimensions
  const graphInfo = g.graph();
  const width = (graphInfo.width ?? 800) + opts.marginx * 2;
  const height = (graphInfo.height ?? 600) + opts.marginy * 2;

  return {
    nodes: positionedNodes,
    edges: routedEdges,
    width,
    height,
  };
}
