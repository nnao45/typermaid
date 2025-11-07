import type {
  EdgeAST,
  FlowchartDiagramAST,
  FlowchartNodeAST,
  SubgraphAST,
} from '@typermaid/parser';
import { FlowchartDiagramBuilder } from '../flowchart-builder.js';
import type { NodeID, SubgraphID } from '../types.js';

/**
 * Convert parsed Flowchart AST to Builder for manipulation
 *
 * @param ast - Parsed FlowchartDiagramAST
 * @returns FlowchartDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@typermaid/parser';
 * import { flowchartASTToBuilder } from '@typermaid/builders/converters';
 *
 * const code = `
 *   flowchart TB
 *     A[Start] --> B[Process]
 *     B --> C[End]
 * `;
 * const ast = parse(code);
 * const builder = flowchartASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const d = builder.addNode('D', 'diamond', 'Decision?');
 * builder.addEdge(brandID('B'), d, 'arrow');
 * ```
 */
export function flowchartASTToBuilder(ast: FlowchartDiagramAST): FlowchartDiagramBuilder {
  const builder = new FlowchartDiagramBuilder();

  // Set direction
  if (ast.direction) {
    builder.setDirection(ast.direction);
  }

  // Collect nodes, edges, and subgraphs from body
  const nodes: FlowchartNodeAST[] = [];
  const edges: EdgeAST[] = [];
  const subgraphs: SubgraphAST[] = [];

  for (const item of ast.body) {
    if (item.type === 'Node') {
      nodes.push(item as FlowchartNodeAST);
    } else if (item.type === 'Edge') {
      edges.push(item as EdgeAST);
    } else if (item.type === 'Subgraph') {
      subgraphs.push(item as SubgraphAST);
    }
  }

  // Track implicit nodes (nodes without explicit labels that appear only in edges)
  const implicitNodeIds = new Set<string>();
  for (const edge of edges) {
    if (!nodes.some((n) => n.id === edge.from)) {
      implicitNodeIds.add(edge.from);
    }
    if (!nodes.some((n) => n.id === edge.to)) {
      implicitNodeIds.add(edge.to);
    }
  }

  // Add all nodes first (including implicit ones)
  const nodeIdMap = new Map<string, NodeID>();

  // Add explicit nodes
  for (const node of nodes) {
    const nodeId = builder.addNode(node.id, node.shape, node.label);
    nodeIdMap.set(node.id, nodeId);
  }

  // Add implicit nodes (with their ID as label and square shape)
  for (const id of implicitNodeIds) {
    const nodeId = builder.addNode(id, 'square', id);
    nodeIdMap.set(id, nodeId);
  }

  // Add all edges (using branded IDs from map)
  for (const edge of edges) {
    const fromId = nodeIdMap.get(edge.from);
    const toId = nodeIdMap.get(edge.to);

    if (!fromId || !toId) {
      // Skip edges referencing non-existent nodes
      // (shouldn't happen with valid AST, but defensive programming)
      continue;
    }

    builder.addEdge(fromId, toId, edge.edgeType, edge.label);
  }

  // Add subgraphs
  // Note: subgraphs in AST body contain nested nodes/edges
  // We need to process subgraphs recursively
  const subgraphIdMap = new Map<string, SubgraphID>();
  for (const subgraph of subgraphs) {
    const subgraphNodeIds: NodeID[] = [];

    // Process subgraph body to collect nodes
    for (const item of subgraph.body) {
      if (item.type === 'Node') {
        const node = item as FlowchartNodeAST;
        let nodeId = nodeIdMap.get(node.id);

        // Add node if it doesn't exist yet
        if (!nodeId) {
          nodeId = builder.addNode(node.id, node.shape, node.label);
          nodeIdMap.set(node.id, nodeId);
        }

        subgraphNodeIds.push(nodeId);
      } else if (item.type === 'Edge') {
        // Add edge (nodes might be declared in subgraph)
        const edge = item as EdgeAST;
        const fromId = nodeIdMap.get(edge.from);
        const toId = nodeIdMap.get(edge.to);

        // Note: edges in subgraph might reference nodes outside
        // Skip if nodes don't exist
        if (fromId && toId) {
          builder.addEdge(fromId, toId, edge.edgeType, edge.label);
        }
      }
    }

    const sgId = builder.addSubgraph(subgraph.id, subgraph.label ?? '', subgraphNodeIds);
    subgraphIdMap.set(subgraph.id, sgId);
  }

  // ClassDefs and class application are not in the current AST structure
  // They would need to be added to the parser first

  return builder;
}
