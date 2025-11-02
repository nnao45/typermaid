import type { FlowchartDiagram, FlowchartEdge, FlowchartNode } from '@lyric-js/core';
import type { EdgeAST, FlowchartNodeAST, ProgramAST } from '@lyric-js/parser';

/**
 * Convert Parser AST to Schema-compatible format
 */
export function astToSchema(ast: ProgramAST): FlowchartDiagram {
  // Get first flowchart diagram
  const diagram = ast.body.find(
    (node): node is { type: 'FlowchartDiagram'; direction: string; body: unknown[] } =>
      (node as { type: string }).type === 'FlowchartDiagram'
  );

  if (!diagram) {
    throw new Error('No flowchart diagram found in AST');
  }

  const nodeMap = new Map<string, FlowchartNode>();
  const edges: FlowchartEdge[] = [];
  let edgeIdCounter = 0;

  // Process statements recursively to handle subgraphs
  function processStatements(statements: unknown[]) {
    for (const statement of statements) {
      const stmt = statement as { type: string; body?: unknown[] };

      if (stmt.type === 'Node') {
        const node = stmt as FlowchartNodeAST;
        nodeMap.set(node.id, {
          id: node.id,
          shape: node.shape,
          label: node.label || node.id,
        });
      } else if (stmt.type === 'Subgraph' && stmt.body) {
        // Recursively process subgraph contents
        processStatements(stmt.body);
      }
    }
  }

  // First pass: collect explicit nodes (including from subgraphs)
  processStatements(diagram.body);

  // Second pass: collect edges and create implicit nodes
  function processEdges(statements: unknown[]) {
    for (const statement of statements) {
      const stmt = statement as { type: string; body?: unknown[] };

      if (stmt.type === 'Edge') {
        const edge = stmt as EdgeAST;

        // Create implicit nodes if they don't exist
        if (!nodeMap.has(edge.from)) {
          nodeMap.set(edge.from, {
            id: edge.from,
            shape: 'square',
            label: edge.from,
          });
        }

        if (!nodeMap.has(edge.to)) {
          nodeMap.set(edge.to, {
            id: edge.to,
            shape: 'square',
            label: edge.to,
          });
        }

        edges.push({
          id: `edge-${edgeIdCounter++}`,
          from: edge.from,
          to: edge.to,
          type: mapEdgeType(edge.edgeType),
          label: edge.label,
        });
      } else if (stmt.type === 'Subgraph' && stmt.body) {
        // Recursively process subgraph contents
        processEdges(stmt.body);
      }
    }
  }

  processEdges(diagram.body);

  return {
    type: 'flowchart',
    direction: diagram.direction as 'TB' | 'TD' | 'BT' | 'LR' | 'RL',
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

/**
 * Map Parser edge type to Schema edge type
 */
function mapEdgeType(parserType: string): FlowchartEdge['type'] {
  const mapping: Record<string, FlowchartEdge['type']> = {
    '-->': 'arrow',
    '---': 'line',
    '-.->': 'dotted_arrow',
    '-.-': 'dotted_line',
    '==>': 'thick_arrow',
    '===': 'thick_line',
    '~~~': 'invisible',
    '--o': 'circle_arrow',
    'o--': 'circle_arrow',
    '--x': 'cross_arrow',
    'x--': 'cross_arrow',
  };

  return mapping[parserType] || 'arrow';
}
