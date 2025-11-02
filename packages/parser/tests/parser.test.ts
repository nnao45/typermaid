import { describe, expect, it } from 'vitest';
import { parse, parseFlowchart } from '../src/parser.js';

describe('Flowchart Parser', () => {
  describe('Basic flowchart', () => {
    it('should parse simple flowchart with direction', () => {
      const input = 'flowchart LR';
      const ast = parseFlowchart(input);

      expect(ast.type).toBe('Program');
      expect(ast.body).toHaveLength(1);

      const diagram = ast.body[0];
      expect(diagram?.type).toBe('FlowchartDiagram');
      if (diagram?.type === 'FlowchartDiagram') {
        expect(diagram.direction).toBe('LR');
      }
    });

    it('should parse flowchart with single node', () => {
      const input = `flowchart TB
        A[Start]`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        expect(diagram.body).toHaveLength(1);

        const node = diagram.body[0];
        if (node?.type === 'Node') {
          expect(node.id).toBe('A');
          expect(node.shape).toBe('square');
          expect(node.label).toBe('Start');
        }
      }
    });

    it('should parse different node shapes', () => {
      const input = `flowchart TB
        A[Square]
        B(Round)
        C{Rhombus}
        D((Circle))`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        expect(diagram.body).toHaveLength(4);

        const nodes = diagram.body;
        expect(nodes[0]?.type).toBe('Node');
        expect(nodes[1]?.type).toBe('Node');
        expect(nodes[2]?.type).toBe('Node');
        expect(nodes[3]?.type).toBe('Node');

        if (
          nodes[0]?.type === 'Node' &&
          nodes[1]?.type === 'Node' &&
          nodes[2]?.type === 'Node' &&
          nodes[3]?.type === 'Node'
        ) {
          expect(nodes[0].shape).toBe('square');
          expect(nodes[1].shape).toBe('round');
          expect(nodes[2].shape).toBe('rhombus');
          expect(nodes[3].shape).toBe('circle');
        }
      }
    });
  });

  describe('Edges', () => {
    it('should parse simple edge', () => {
      const input = `flowchart LR
        A[Start] --> B[End]`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        expect(diagram.body).toHaveLength(3); // A node, edge, B node

        const node1 = diagram.body[0];
        const edge = diagram.body[1];
        const node2 = diagram.body[2];

        expect(node1?.type).toBe('Node');
        expect(edge?.type).toBe('Edge');
        expect(node2?.type).toBe('Node');

        if (edge?.type === 'Edge') {
          expect(edge.from).toBe('A');
          expect(edge.to).toBe('B');
          expect(edge.edgeType).toBe('-->');
        }

        if (node2?.type === 'Node') {
          expect(node2.id).toBe('B');
          expect(node2.label).toBe('End');
          expect(node2.shape).toBe('square');
        }
      }
    });

    it('should parse edge with label', () => {
      const input = `flowchart LR
        A --> |Yes| B`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        const edge = diagram.body[0];

        if (edge?.type === 'Edge') {
          expect(edge.from).toBe('A');
          expect(edge.to).toBe('B');
          expect(edge.label).toBe('Yes');
        }
      }
    });

    it('should parse different edge types', () => {
      const input = `flowchart TB
        A --> B
        C --- D
        E -.-> F
        G ==> H`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        const edges = diagram.body.filter((n) => n.type === 'Edge');
        expect(edges).toHaveLength(4);

        if (
          edges[0]?.type === 'Edge' &&
          edges[1]?.type === 'Edge' &&
          edges[2]?.type === 'Edge' &&
          edges[3]?.type === 'Edge'
        ) {
          expect(edges[0].edgeType).toBe('-->');
          expect(edges[1].edgeType).toBe('---');
          expect(edges[2].edgeType).toBe('-.->');
          expect(edges[3].edgeType).toBe('==>');
        }
      }
    });
  });

  describe('Complex flowchart', () => {
    it('should parse complete flowchart', () => {
      const input = `flowchart LR
        A[Start] --> B{Decision}
        B -->|Yes| C[Process 1]
        B -->|No| D[Process 2]
        C --> E[End]
        D --> E`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      expect(diagram?.type).toBe('FlowchartDiagram');

      if (diagram?.type === 'FlowchartDiagram') {
        const nodes = diagram.body.filter((n) => n.type === 'Node');
        const edges = diagram.body.filter((n) => n.type === 'Edge');

        expect(nodes.length).toBeGreaterThan(0);
        expect(edges.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Subgraph', () => {
    it('should parse subgraph', () => {
      const input = `flowchart TB
        subgraph sub1
          A --> B
        end`;

      const ast = parseFlowchart(input);
      const diagram = ast.body[0];

      if (diagram?.type === 'FlowchartDiagram') {
        expect(diagram.body).toHaveLength(1);

        const subgraph = diagram.body[0];
        expect(subgraph?.type).toBe('Subgraph');

        if (subgraph?.type === 'Subgraph') {
          expect(subgraph.id).toBe('sub1');
          expect(subgraph.body.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('parse function', () => {
    it('should auto-detect flowchart', () => {
      const input = 'flowchart LR';
      const ast = parse(input);

      expect(ast.type).toBe('Program');
      expect(ast.body).toHaveLength(1);
    });
  });
});
