import type {
  ClassDef,
  EdgeType,
  FlowchartDiagram,
  FlowchartEdge,
  FlowchartNode,
  NodeShape,
  Style,
  Subgraph,
} from '@typermaid/core';
import {
  brandID,
  type ClassDefID,
  isValidIDFormat,
  type NodeID,
  type SubgraphID,
  ValidationError,
  ValidationErrorCode,
} from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * Flowchart Diagram Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Only registered nodes can be referenced in edges
 * - Only defined ClassDefs can be applied
 * - Subgraphs only contain valid nodes
 */
export class FlowchartDiagramBuilder {
  private nodes = new Map<NodeID, FlowchartNode>();
  private edges: FlowchartEdge[] = [];
  private subgraphs = new Map<SubgraphID, Subgraph>();
  private classDefs = new Map<ClassDefID, ClassDef>();
  private direction: 'TB' | 'TD' | 'BT' | 'LR' | 'RL' = 'TB';
  private nodeCount = 0;
  private edgeCount = 0;

  /**
   * Set diagram direction
   */
  setDirection(dir: 'TB' | 'TD' | 'BT' | 'LR' | 'RL'): this {
    this.direction = dir;
    return this;
  }

  /**
   * Add a node to the flowchart
   * @returns Branded NodeID that can only be used with this builder
   */
  addNode(id: string, shape: NodeShape, label: string): NodeID {
    // Validate ID format
    if (!isValidIDFormat(id)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id }
      );
    }

    // Check reserved words
    validateNotReservedWord(id);

    // Check for duplicates
    const nodeId = brandID<NodeID>(id);
    if (this.nodes.has(nodeId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Node with ID "${id}" already exists`,
        { id }
      );
    }

    // Validate label not empty
    if (!label || label.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, `Node label cannot be empty`, {
        id,
      });
    }

    const node: FlowchartNode = {
      id,
      shape,
      label,
    };

    this.nodes.set(nodeId, node);
    this.nodeCount++;

    return nodeId;
  }

  /**
   * Add an edge between two nodes
   * @throws {ValidationError} If either node doesn't exist
   */
  addEdge(from: NodeID, to: NodeID, type: EdgeType, label?: string): this {
    // Validate nodes exist
    if (!this.nodes.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.NODE_NOT_FOUND,
        `Source node "${from}" not found. You must add the node before creating an edge.`,
        { from, to }
      );
    }

    if (!this.nodes.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.NODE_NOT_FOUND,
        `Target node "${to}" not found. You must add the node before creating an edge.`,
        { from, to }
      );
    }

    const edge: FlowchartEdge = {
      id: `edge-${this.edgeCount++}`,
      from: from as string,
      to: to as string,
      type,
      label,
    };

    this.edges.push(edge);
    return this;
  }

  /**
   * Define a CSS class for styling nodes
   */
  defineClass(name: string, style: Style): ClassDefID {
    // Validate ID
    if (!isValidIDFormat(name)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ClassDef ID format: "${name}"`,
        { id: name }
      );
    }

    validateNotReservedWord(name);

    const classDefId = brandID<ClassDefID>(name);

    if (this.classDefs.has(classDefId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `ClassDef with ID "${name}" already exists`,
        { id: name }
      );
    }

    const classDef: ClassDef = {
      name,
      style,
    };

    this.classDefs.set(classDefId, classDef);
    return classDefId;
  }

  /**
   * Apply a ClassDef to a node
   * @throws {ValidationError} If node or ClassDef doesn't exist
   */
  applyClass(nodeId: NodeID, classDefId: ClassDefID): this {
    if (!this.nodes.has(nodeId)) {
      throw new ValidationError(ValidationErrorCode.NODE_NOT_FOUND, `Node "${nodeId}" not found`, {
        nodeId,
      });
    }

    if (!this.classDefs.has(classDefId)) {
      throw new ValidationError(
        ValidationErrorCode.CLASSDEF_NOT_FOUND,
        `ClassDef "${classDefId}" not found. You must define the class before applying it.`,
        { classDefId }
      );
    }

    const node = this.nodes.get(nodeId);
    if (node) {
      if (!node.classes) {
        node.classes = [];
      }
      node.classes.push(classDefId as string);
    }

    return this;
  }

  /**
   * Create a subgraph
   */
  addSubgraph(id: string, label: string, nodeIds: NodeID[]): SubgraphID {
    // Validate ID
    if (!isValidIDFormat(id)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid Subgraph ID format: "${id}"`,
        { id }
      );
    }

    validateNotReservedWord(id);

    const subgraphId = brandID<SubgraphID>(id);

    if (this.subgraphs.has(subgraphId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Subgraph with ID "${id}" already exists`,
        { id }
      );
    }

    // Validate all nodes exist
    for (const nodeId of nodeIds) {
      if (!this.nodes.has(nodeId)) {
        throw new ValidationError(
          ValidationErrorCode.NODE_NOT_FOUND,
          `Node "${nodeId}" not found in subgraph "${id}"`,
          { subgraphId: id, nodeId }
        );
      }
    }

    const subgraph: Subgraph = {
      id,
      label,
      nodes: nodeIds.map((nid) => nid as string),
    };

    this.subgraphs.set(subgraphId, subgraph);
    return subgraphId;
  }

  /**
   * Build and validate the complete flowchart diagram
   */
  build(): FlowchartDiagram {
    if (this.nodes.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Flowchart must have at least one node',
        {}
      );
    }

    const diagram: FlowchartDiagram = {
      type: 'flowchart',
      direction: this.direction,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      subgraphs: this.subgraphs.size > 0 ? Array.from(this.subgraphs.values()) : undefined,
      classDefs: this.classDefs.size > 0 ? Array.from(this.classDefs.values()) : undefined,
    };

    return diagram;
  }

  /**
   * Get current node count
   */
  getNodeCount(): number {
    return this.nodeCount;
  }

  /**
   * Get current edge count
   */
  getEdgeCount(): number {
    return this.edges.length;
  }

  /**
   * Check if a node exists
   */
  hasNode(nodeId: NodeID): boolean {
    return this.nodes.has(nodeId);
  }
}
