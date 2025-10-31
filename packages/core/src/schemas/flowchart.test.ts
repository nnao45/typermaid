import { describe, expect, it } from 'vitest';
import type { EdgeType, FlowchartDiagram, NodeShape } from './flowchart.js';
import {
  EdgeTypeSchema,
  FlowchartDiagramSchema,
  FlowchartEdgeSchema,
  FlowchartNodeSchema,
  NodeShapeSchema,
  SubgraphSchema,
} from './flowchart.js';

describe('NodeShapeSchema', () => {
  it('should validate all node shapes', () => {
    const allShapes: NodeShape[] = [
      'square',
      'round',
      'stadium',
      'subroutine',
      'cylindrical',
      'circle',
      'asymmetric',
      'rhombus',
      'hexagon',
      'parallelogram',
      'parallelogram_alt',
      'trapezoid',
      'trapezoid_alt',
      'double_circle',
    ];

    for (const shape of allShapes) {
      expect(NodeShapeSchema.parse(shape)).toBe(shape);
    }
  });

  it('should reject invalid shapes', () => {
    expect(() => NodeShapeSchema.parse('triangle')).toThrow();
    expect(() => NodeShapeSchema.parse('SQUARE')).toThrow();
  });
});

describe('EdgeTypeSchema', () => {
  it('should validate all edge types', () => {
    const allEdgeTypes: EdgeType[] = [
      'arrow',
      'line',
      'dotted_arrow',
      'dotted_line',
      'thick_arrow',
      'thick_line',
      'invisible',
      'circle_arrow',
      'cross_arrow',
      'multi_arrow',
      'multi_line',
    ];

    for (const edgeType of allEdgeTypes) {
      expect(EdgeTypeSchema.parse(edgeType)).toBe(edgeType);
    }
  });

  it('should reject invalid edge types', () => {
    expect(() => EdgeTypeSchema.parse('dashed')).toThrow();
  });
});

describe('FlowchartNodeSchema', () => {
  it('should validate basic node', () => {
    const node = {
      id: 'A',
      shape: 'square' as const,
      label: 'Start',
    };
    expect(FlowchartNodeSchema.parse(node)).toEqual(node);
  });

  it('should validate node with style', () => {
    const node = {
      id: 'B',
      shape: 'round' as const,
      label: 'Process',
      style: {
        fill: { color: '#ff0000' },
      },
    };
    expect(FlowchartNodeSchema.parse(node)).toEqual(node);
  });

  it('should validate node with classes', () => {
    const node = {
      id: 'C',
      shape: 'rhombus' as const,
      label: 'Decision',
      classes: ['important', 'highlight'],
    };
    expect(FlowchartNodeSchema.parse(node)).toEqual(node);
  });

  it('should reject node with empty id', () => {
    expect(() =>
      FlowchartNodeSchema.parse({
        id: '',
        shape: 'square',
        label: 'Test',
      })
    ).toThrow();
  });
});

describe('FlowchartEdgeSchema', () => {
  it('should validate basic edge', () => {
    const edge = {
      id: 'e1',
      from: 'A',
      to: 'B',
      type: 'arrow' as const,
    };
    expect(FlowchartEdgeSchema.parse(edge)).toEqual(edge);
  });

  it('should validate edge with label', () => {
    const edge = {
      id: 'e2',
      from: 'B',
      to: 'C',
      type: 'dotted_arrow' as const,
      label: 'Yes',
    };
    expect(FlowchartEdgeSchema.parse(edge)).toEqual(edge);
  });

  it('should validate edge with length', () => {
    const edge = {
      id: 'e3',
      from: 'C',
      to: 'D',
      type: 'thick_arrow' as const,
      length: 3,
    };
    expect(FlowchartEdgeSchema.parse(edge)).toEqual(edge);
  });
});

describe('SubgraphSchema', () => {
  it('should validate basic subgraph', () => {
    const subgraph = {
      id: 'sub1',
      nodes: ['A', 'B', 'C'],
    };
    expect(SubgraphSchema.parse(subgraph)).toEqual(subgraph);
  });

  it('should validate subgraph with label and direction', () => {
    const subgraph = {
      id: 'sub2',
      label: 'Processing',
      direction: 'LR' as const,
      nodes: ['D', 'E'],
    };
    expect(SubgraphSchema.parse(subgraph)).toEqual(subgraph);
  });
});

describe('FlowchartDiagramSchema', () => {
  it('should validate minimal flowchart', () => {
    const diagram: FlowchartDiagram = {
      type: 'flowchart',
      direction: 'TB',
      nodes: [
        { id: 'A', shape: 'square', label: 'Start' },
        { id: 'B', shape: 'square', label: 'End' },
      ],
      edges: [{ id: 'e1', from: 'A', to: 'B', type: 'arrow' }],
    };

    expect(FlowchartDiagramSchema.parse(diagram)).toEqual(diagram);
  });

  it('should apply default direction', () => {
    const diagram = {
      type: 'flowchart' as const,
      nodes: [],
      edges: [],
    };

    const result = FlowchartDiagramSchema.parse(diagram);
    expect(result.direction).toBe('TB');
  });

  it('should validate complex flowchart with subgraphs', () => {
    const diagram: FlowchartDiagram = {
      type: 'flowchart',
      direction: 'LR',
      nodes: [
        { id: 'A', shape: 'square', label: 'Start' },
        { id: 'B', shape: 'rhombus', label: 'Check' },
        { id: 'C', shape: 'round', label: 'Process 1' },
        { id: 'D', shape: 'round', label: 'Process 2' },
        { id: 'E', shape: 'square', label: 'End' },
      ],
      edges: [
        { id: 'e1', from: 'A', to: 'B', type: 'arrow' },
        { id: 'e2', from: 'B', to: 'C', type: 'arrow', label: 'Yes' },
        { id: 'e3', from: 'B', to: 'D', type: 'arrow', label: 'No' },
        { id: 'e4', from: 'C', to: 'E', type: 'arrow' },
        { id: 'e5', from: 'D', to: 'E', type: 'arrow' },
      ],
      subgraphs: [
        {
          id: 'processing',
          label: 'Processing',
          nodes: ['C', 'D'],
        },
      ],
    };

    expect(FlowchartDiagramSchema.parse(diagram)).toEqual(diagram);
  });

  it('should reject diagram with wrong type', () => {
    expect(() =>
      FlowchartDiagramSchema.parse({
        type: 'sequence',
        nodes: [],
        edges: [],
      })
    ).toThrow();
  });
});
