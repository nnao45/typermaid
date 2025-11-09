// TODO: Fix circular dependency - temporarily disabled
// import { cloneAST, findNodes, removeNode, replaceNodeById } from '@typermaid/ast-tools';
// Temporary: avoid circular dependency by not using builders/codegen directly
// import { FlowchartDiagramBuilder } from '@typermaid/builders';
// import { generateFlowchart } from '@typermaid/codegen';
import type {
  Direction,
  EdgeType,
  FlowchartDiagram,
  FlowchartEdge,
  FlowchartNode,
  NodeID,
  NodeShape,
} from '@typermaid/core';
import { createEdgeID, createNodeID } from '@typermaid/core';
import type { EdgeAST, FlowchartDiagramAST, FlowchartNodeAST, SubgraphAST } from './nodes.js';

/**
 * Enhanced FlowchartDiagramAST with integrated Builder, AST tools, and CodeGen capabilities
 * Uses composition instead of inheritance to avoid conflicts
 */
export class EnhancedFlowchartDiagramAST implements FlowchartDiagramAST {
  // AST properties
  type: 'FlowchartDiagram' = 'FlowchartDiagram';
  direction: Direction;
  body: Array<FlowchartNodeAST | EdgeAST | SubgraphAST>;
  loc?:
    | {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    | undefined;

  // Temporary: no builder dependency
  // private builder: FlowchartDiagramBuilder;

  constructor(ast: FlowchartDiagramAST) {
    // Copy AST properties
    this.direction = ast.direction as Direction;
    this.body = [...ast.body];
    this.loc = ast.loc;

    // Create implicit nodes from edges
    this.createImplicitNodes();
  }

  /**
   * AST Tools Integration - Replace node by ID
   */
  replaceNode(oldId: string, newId: string): this {
    return this.replaceNodeById(oldId, newId);
  }

  /**
   * Code Generation Integration - Generate Mermaid code
   * Temporary simple implementation without external dependencies
   */
  asCode(): string {
    const lines: string[] = [`flowchart ${this.direction}`];
    
    for (const item of this.body) {
      if (item.type === 'Node') {
        const symbols = this.getNodeShapeSymbols(item.shape || 'square');
        lines.push(`  ${item.id}${symbols.start}${item.label || item.id}${symbols.end}`);
      } else if (item.type === 'Edge') {
        const arrow = this.getArrowSymbol(item.edgeType || 'arrow');
        const label = item.label ? `|${item.label}|` : '';
        lines.push(`  ${item.from} ${arrow}${label} ${item.to}`);
      }
    }

    return lines.join('\n');
  }

  private getNodeShapeSymbols(shape: string): { start: string; end: string } {
    switch (shape) {
      case 'circle':
        return { start: '((', end: '))' };
      case 'round':
        return { start: '(', end: ')' };
      case 'square':
        return { start: '[', end: ']' };
      case 'diamond':
        return { start: '{', end: '}' };
      case 'hexagon':
        return { start: '{{', end: '}}' };
      case 'stadium':
        return { start: '([', end: '])' };
      default:
        return { start: '[', end: ']' };
    }
  }

  private getArrowSymbol(edgeType: string): string {
    switch (edgeType) {
      case 'arrow':
        return '-->';
      case 'line':
        return '---';
      case 'dotted_arrow':
        return '-..->';
      case 'dotted_line':
        return '-.-';
      case 'thick_arrow':
        return '==>';
      case 'thick_line':
        return '===';
      default:
        return '-->';
    }
  }



  /**
   * Builder Methods - delegated to internal builder
   */

  /**
   * Add a node to the flowchart (returns this for method chaining)
   */
  addNode(id: string, shape: NodeShape, label: string): this {
    // Simple implementation without builder
    const nodeAST: FlowchartNodeAST = {
      type: 'Node',
      id,
      shape,
      label,
      loc: undefined,
    };

    // Check if node already exists and update, otherwise add
    const existingNodeIndex = this.body.findIndex((item) => item.type === 'Node' && item.id === id);
    if (existingNodeIndex >= 0) {
      this.body[existingNodeIndex] = nodeAST;
    } else {
      this.body.push(nodeAST);
    }

    return this;
  }

  /**
   * Add a node and return the NodeID (for when you need the ID)
   */
  createNode(id: string, shape: NodeShape, label: string): NodeID {
    this.addNode(id, shape, label);
    return createNodeID(id);
  }

  /**
   * Add an edge to the flowchart
   */
  addEdge(from: NodeID, to: NodeID, type: EdgeType = 'arrow', label?: string): this {
    // Simple implementation without builder
    const fromStr = from as string;
    const toStr = to as string;

    const edgeAST: EdgeAST = {
      type: 'Edge',
      from: fromStr,
      to: toStr,
      edgeType: type,
      label,
      loc: undefined,
    };

    this.body.push(edgeAST);

    return this;
  }

  /**
   * Enhanced build method that returns diagram with asCode capability
   */
  build(): FlowchartDiagram & { asCode(): string } {
    const nodes: FlowchartNode[] = [];
    const edges: FlowchartEdge[] = [];

    for (const item of this.body) {
      if (item.type === 'Node') {
        nodes.push({
          id: createNodeID(item.id),
          shape: item.shape || 'square',
          label: item.label || item.id,
        });
      } else if (item.type === 'Edge') {
        edges.push({
          id: createEdgeID(`edge-${item.from}-${item.to}`),
          from: createNodeID(item.from),
          to: createNodeID(item.to),
          type: item.edgeType || 'arrow',
          label: item.label,
        });
      }
    }

    const diagram = {
      type: 'flowchart' as const,
      direction: this.direction,
      nodes,
      edges,
      asCode: () => this.asCode(),
    };

    return diagram as FlowchartDiagram & { asCode(): string };
  }

  /**
   * Sync AST body (no-op for simple implementation)
   */
  syncASTWithBuilder(): void {
    // No sync needed - AST is the source of truth
  }

  /**
   * Create implicit nodes for edge endpoints that don't have explicit node definitions
   */
  private createImplicitNodes(): void {
    const explicitNodeIds = new Set<string>();
    const edgeNodes = new Set<string>();

    // Collect existing explicit node IDs
    for (const item of this.body) {
      if (item.type === 'Node') {
        explicitNodeIds.add(item.id);
      }
    }

    // Collect all node IDs referenced in edges
    for (const item of this.body) {
      if (item.type === 'Edge') {
        edgeNodes.add(item.from);
        edgeNodes.add(item.to);
      }
    }

    // Create implicit nodes for any edge nodes that don't have explicit definitions
    for (const nodeId of edgeNodes) {
      if (!explicitNodeIds.has(nodeId)) {
        const implicitNode: FlowchartNodeAST = {
          type: 'Node',
          id: nodeId,
          shape: 'square', // Default shape for implicit nodes
          label: nodeId,   // Use ID as label for implicit nodes
          loc: undefined,
        };
        this.body.push(implicitNode);
      }
    }
  }

  // ===== AST-TOOLS INTEGRATION =====

  /**
   * Find nodes by type using ast-tools
   */
  findNodesByType(): FlowchartNodeAST[] {
    // TODO: Implement without ast-tools dependency
    console.warn('findNodesByType: ast-tools temporarily disabled');
    return this.body.filter((item) => item.type === 'Node') as FlowchartNodeAST[];
  }

  /**
   * Find nodes by pattern (custom implementation)
   */
  findNodes(pattern: string): FlowchartNodeAST[] {
    return this.body.filter(
      (item) => item.type === 'Node' && item.id.includes(pattern)
    ) as FlowchartNodeAST[];
  }

  /**
   * Replace node by ID
   */
  replaceNodeById(oldId: string, newId: string): this {
    // Update nodes
    for (const item of this.body) {
      if (item.type === 'Node' && item.id === oldId) {
        item.id = newId;
      }
    }
    
    // Update edges that reference the old node ID
    for (const item of this.body) {
      if (item.type === 'Edge') {
        if (item.from === oldId) item.from = newId;
        if (item.to === oldId) item.to = newId;
      }
    }
    
    return this;
  }

  /**
   * Remove node (temporary stub - ast-tools disabled)
   */
  removeNode(_nodeId: string): this {
    // TODO: Implement without ast-tools dependency
    console.warn('removeNode: ast-tools temporarily disabled');
    return this;
  }

  /**
   * Clone the AST (temporary stub - ast-tools disabled)
   */
  clone(): EnhancedFlowchartDiagramAST {
    // TODO: Implement without ast-tools dependency
    console.warn('clone: ast-tools temporarily disabled');
    return new EnhancedFlowchartDiagramAST(this);
  }
}
