import type { FlowchartDiagram, FlowchartEdge, FlowchartNode } from '@typermaid/core';
import { createNodeID } from '@typermaid/core';
import type { EdgeAST, FlowchartDiagramAST, ProgramAST } from '@typermaid/parser';

/**
 * Convert Parser AST to Schema-compatible format
 */
export function astToSchema(ast: ProgramAST): FlowchartDiagram {
  // Get first flowchart diagram
  const diagram = ast.body.find(
    (node: unknown): node is FlowchartDiagramAST =>
      (node as { type: string }).type === 'FlowchartDiagram'
  );

  if (!diagram) {
    throw new Error('No flowchart diagram found in AST');
  }

  const nodeMap = new Map<string, FlowchartNode>();
  const edges: FlowchartEdge[] = [];
  let edgeIdCounter = 0;

  // Process statements recursively to handle subgraphs
  function processStatements(statements: unknown[]): void {
    for (const stmt of statements) {
      const s = stmt as { type: string };
      if (s.type === 'Node') {
        const node = stmt as unknown as { id: string; shape: string; label: string };
        nodeMap.set(node.id, {
          id: createNodeID(node.id),
          shape: node.shape as FlowchartNode['shape'],
          label: node.label || node.id,
        });
      } else if (s.type === 'Subgraph') {
        // Recursively process subgraph contents
        processStatements((stmt as unknown as { body: unknown[] }).body);
      }
    }
  }

  // First pass: collect explicit nodes (including from subgraphs)
  processStatements(diagram.body);

  // Second pass: collect edges and create implicit nodes
  function processEdges(statements: unknown[]): void {
    for (const stmt of statements) {
      const s = stmt as { type: string };
      if (s.type === 'Edge') {
        const edge = s as EdgeAST;

        // Create implicit nodes if they don't exist
        if (!nodeMap.has(edge.from)) {
          nodeMap.set(edge.from, {
            id: createNodeID(edge.from),
            shape: 'square',
            label: edge.from,
          });
        }

        if (!nodeMap.has(edge.to)) {
          nodeMap.set(edge.to, {
            id: createNodeID(edge.to),
            shape: 'square',
            label: edge.to,
          });
        }

        edges.push({
          id: `edge-${edgeIdCounter++}`,
          from: createNodeID(edge.from),
          to: createNodeID(edge.to),
          type: mapEdgeType(edge.edgeType),
          label: edge.label,
        });
      } else if (s.type === 'Subgraph') {
        // Recursively process subgraph contents
        processEdges((stmt as unknown as { body: unknown[] }).body);
      }
    }
  }

  processEdges(diagram.body);

  return {
    type: 'flowchart',
    direction: diagram.direction,
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

/**
 * Map Parser edge type to Schema edge type
 */
function mapEdgeType(parserType: EdgeAST['edgeType']): FlowchartEdge['type'] {
  // EdgeType enum values are already in the correct format
  return parserType;
}
