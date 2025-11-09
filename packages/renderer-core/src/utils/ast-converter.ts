import type { FlowchartDiagram, FlowchartEdge, FlowchartNode } from '@typermaid/core';
import { createNodeID, createEdgeID } from '@typermaid/core';
import type { 
  EdgeAST, 
  FlowchartDiagramAST, 
  FlowchartNodeAST,
  ProgramAST,
  SubgraphAST 
} from '@typermaid/parser';

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

  // Type guards for safe type checking
  function isNodeStatement(stmt: unknown): stmt is FlowchartNodeAST {
    return typeof stmt === 'object' && 
           stmt !== null && 
           'type' in stmt && 
           stmt.type === 'Node';
  }

  function isSubgraphStatement(stmt: unknown): stmt is SubgraphAST {
    return typeof stmt === 'object' && 
           stmt !== null && 
           'type' in stmt && 
           stmt.type === 'Subgraph';
  }

  // Process statements recursively to handle subgraphs
  function processStatements(statements: unknown[]): void {
    for (const stmt of statements) {
      if (isNodeStatement(stmt)) {
        nodeMap.set(stmt.id, {
          id: createNodeID(stmt.id),
          shape: stmt.shape as FlowchartNode['shape'],
          label: stmt.label || stmt.id,
        });
      } else if (isSubgraphStatement(stmt)) {
        // Recursively process subgraph contents
        processStatements(stmt.body);
      }
    }
  }

  // First pass: collect explicit nodes (including from subgraphs)
  processStatements(diagram.body);

  function isEdgeStatement(stmt: unknown): stmt is EdgeAST {
    return typeof stmt === 'object' && 
           stmt !== null && 
           'type' in stmt && 
           stmt.type === 'Edge';
  }

  // Second pass: collect edges and create implicit nodes
  function processEdges(statements: unknown[]): void {
    for (const stmt of statements) {
      if (isEdgeStatement(stmt)) {
        // Create implicit nodes if they don't exist
        if (!nodeMap.has(stmt.from)) {
          nodeMap.set(stmt.from, {
            id: createNodeID(stmt.from),
            shape: 'square',
            label: stmt.from,
          });
        }

        if (!nodeMap.has(stmt.to)) {
          nodeMap.set(stmt.to, {
            id: createNodeID(stmt.to),
            shape: 'square',
            label: stmt.to,
          });
        }

        edges.push({
          id: createEdgeID(`edge-${edgeIdCounter++}`),
          from: createNodeID(stmt.from),
          to: createNodeID(stmt.to),
          type: mapEdgeType(stmt.edgeType),
          label: stmt.label,
        });
      } else if (isSubgraphStatement(stmt)) {
        // Recursively process subgraph contents
        processEdges(stmt.body);
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
