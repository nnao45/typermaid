import { describe, expect, it } from 'vitest';
import { FlowchartDiagramBuilder, ValidationError, ValidationErrorCode } from '../src/index.js';

describe('FlowchartDiagramBuilder', () => {
  describe('Basic Node Operations', () => {
    it('should create a node and return branded NodeID', () => {
      const builder = new FlowchartDiagramBuilder();
      const nodeId = builder.addNode('A', 'square', 'Start');

      expect(builder.hasNode(nodeId)).toBe(true);
      expect(builder.getNodeCount()).toBe(1);
    });

    it('should throw on duplicate node ID', () => {
      const builder = new FlowchartDiagramBuilder();
      builder.addNode('A', 'square', 'Start');

      expect(() => {
        builder.addNode('A', 'round', 'Duplicate');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addNode('A', 'round', 'Duplicate');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid ID format', () => {
      const builder = new FlowchartDiagramBuilder();

      expect(() => {
        builder.addNode('123', 'square', 'Invalid');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addNode('123', 'square', 'Invalid');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new FlowchartDiagramBuilder();

      expect(() => {
        builder.addNode('graph', 'square', 'Reserved');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addNode('end', 'square', 'Reserved');
      }).toThrow(ValidationError);
    });

    it('should throw on empty label', () => {
      const builder = new FlowchartDiagramBuilder();

      expect(() => {
        builder.addNode('A', 'square', '');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addNode('B', 'square', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('Edge Operations', () => {
    it('should create an edge between two nodes', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');
      const b = builder.addNode('B', 'round', 'End');

      builder.addEdge(a, b, 'arrow');

      expect(builder.getEdgeCount()).toBe(1);
    });

    it('should throw when source node does not exist', () => {
      const builder = new FlowchartDiagramBuilder();
      const b = builder.addNode('B', 'round', 'End');

      expect(() => {
        // @ts-expect-error - Testing invalid NodeID
        builder.addEdge('A' as NodeID, b, 'arrow');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid NodeID
        builder.addEdge('A' as NodeID, b, 'arrow');
      }).toThrow(/not found/);
    });

    it('should throw when target node does not exist', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');

      expect(() => {
        // @ts-expect-error - Testing invalid NodeID
        builder.addEdge(a, 'B' as NodeID, 'arrow');
      }).toThrow(ValidationError);
    });

    it('should allow edge with label', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');
      const b = builder.addNode('B', 'round', 'End');

      builder.addEdge(a, b, 'arrow', 'Go to end');

      const diagram = builder.build();
      expect(diagram.edges[0]?.label).toBe('Go to end');
    });

    it('should allow multiple edges from same node', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');
      const b = builder.addNode('B', 'round', 'Option 1');
      const c = builder.addNode('C', 'round', 'Option 2');

      builder.addEdge(a, b, 'arrow');
      builder.addEdge(a, c, 'arrow');

      expect(builder.getEdgeCount()).toBe(2);
    });
  });

  describe('ClassDef Operations', () => {
    it('should define a class', () => {
      const builder = new FlowchartDiagramBuilder();
      const classId = builder.defineClass('myClass', {
        fill: { color: '#f9f' },
        stroke: { color: '#333' },
      });

      const a = builder.addNode('A', 'square', 'Styled Node');
      builder.applyClass(a, classId);

      const diagram = builder.build();
      expect(diagram.classDefs).toHaveLength(1);
      expect(diagram.nodes[0]?.classes).toContain('myClass');
    });

    it('should throw when applying non-existent ClassDef', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Node');

      expect(() => {
        // @ts-expect-error - Testing invalid ClassDefID
        builder.applyClass(a, 'nonExistent' as ClassDefID);
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid ClassDefID
        builder.applyClass(a, 'nonExistent' as ClassDefID);
      }).toThrow(/not found/);
    });

    it('should throw on duplicate ClassDef ID', () => {
      const builder = new FlowchartDiagramBuilder();
      builder.defineClass('myClass', { fill: { color: '#f9f' } });

      expect(() => {
        builder.defineClass('myClass', { fill: { color: '#999' } });
      }).toThrow(ValidationError);
    });
  });

  describe('Subgraph Operations', () => {
    it('should create a subgraph with valid nodes', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Node A');
      const b = builder.addNode('B', 'round', 'Node B');

      const _subgraphId = builder.addSubgraph('sub1', 'My Subgraph', [a, b]);

      const diagram = builder.build();
      expect(diagram.subgraphs).toHaveLength(1);
      expect(diagram.subgraphs?.[0]?.nodes).toEqual(['A', 'B']);
    });

    it('should throw when subgraph contains non-existent node', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Node A');

      expect(() => {
        // @ts-expect-error - Testing invalid NodeID
        builder.addSubgraph('sub1', 'Subgraph', [a, 'B' as NodeID]);
      }).toThrow(ValidationError);
    });

    it('should throw on duplicate Subgraph ID', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Node A');

      builder.addSubgraph('sub1', 'Subgraph 1', [a]);

      expect(() => {
        builder.addSubgraph('sub1', 'Subgraph 2', [a]);
      }).toThrow(ValidationError);
    });
  });

  describe('Direction', () => {
    it('should set diagram direction', () => {
      const builder = new FlowchartDiagramBuilder();
      builder.setDirection('LR');
      builder.addNode('A', 'square', 'Start');

      const diagram = builder.build();
      expect(diagram.direction).toBe('LR');
    });

    it('should default to TB direction', () => {
      const builder = new FlowchartDiagramBuilder();
      builder.addNode('A', 'square', 'Start');

      const diagram = builder.build();
      expect(diagram.direction).toBe('TB');
    });
  });

  describe('Build', () => {
    it('should build a valid flowchart diagram', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');
      const b = builder.addNode('B', 'rhombus', 'Decision');
      const c = builder.addNode('C', 'round', 'End');

      builder.addEdge(a, b, 'arrow', 'Begin');
      builder.addEdge(b, c, 'arrow', 'Yes');

      const diagram = builder.build();

      expect(diagram.type).toBe('flowchart');
      expect(diagram.nodes).toHaveLength(3);
      expect(diagram.edges).toHaveLength(2);
    });

    it('should throw when building empty diagram', () => {
      const builder = new FlowchartDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one node/);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');
      const b = builder.addNode('B', 'round', 'End');

      const diagram = builder.setDirection('LR').addEdge(a, b, 'arrow').build();

      expect(diagram.direction).toBe('LR');
      expect(diagram.edges).toHaveLength(1);
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new FlowchartDiagramBuilder();
      const a = builder.addNode('A', 'square', 'Start');

      try {
        // @ts-expect-error - Testing invalid NodeID
        builder.addEdge(a, 'NonExistent' as NodeID, 'arrow');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.NODE_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          from: 'A',
          to: 'NonExistent',
        });
      }
    });
  });
});
