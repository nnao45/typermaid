import { type FlowchartDiagramAST, parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { flowchartASTToBuilder } from '../src/converters/flowchart-ast-to-builder.js';
import { brandID } from '../src/types.js';

describe('flowchartASTToBuilder', () => {
  it('should convert basic flowchart AST to builder', () => {
    const code = `flowchart TB
  A[Start] --> B[Process]
  B --> C[End]`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.direction).toBe('TB');
    expect(diagram.nodes).toHaveLength(3);
    expect(diagram.edges).toHaveLength(2);

    // Check nodes
    expect(diagram.nodes.find((n) => n.id === 'A')).toMatchObject({
      id: 'A',
      shape: 'square',
      label: 'Start',
    });

    // Check edges
    expect(diagram.edges.find((e) => e.from === 'A' && e.to === 'B')).toBeDefined();
  });

  it('should allow manipulation after conversion', () => {
    const code = `flowchart TB
  A[Start] --> B[Process]`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    // Add new node and edge
    const c = builder.addNode('C', 'rhombus', 'Decision?');
    const b = brandID('B');
    builder.addEdge(b, c, 'arrow', 'Yes');

    const diagram = builder.build();

    expect(diagram.nodes).toHaveLength(3);
    expect(diagram.edges).toHaveLength(2);
    expect(diagram.nodes.find((n) => n.id === 'C')).toMatchObject({
      id: 'C',
      shape: 'rhombus',
      label: 'Decision?',
    });
  });

  it('should convert flowchart with subgraphs', () => {
    const code = `flowchart TB
  A[Start]
  B[Process]
  subgraph sub1
    C[Step1]
    D[Step2]
  end
  A --> C
  D --> B`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.nodes).toHaveLength(4);
    expect(diagram.subgraphs).toHaveLength(1);
    expect(diagram.subgraphs?.[0]?.id).toBe('sub1');
    expect(diagram.subgraphs?.[0]?.nodes).toContain('C');
    expect(diagram.subgraphs?.[0]?.nodes).toContain('D');
  });

  it.skip('should convert flowchart with ClassDefs (TODO: parser support needed)', () => {
    const code = `flowchart TB
  A[Start]
  B[Process]
  classDef myClass fill:#f9f,stroke:#333
  class A,B myClass`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.classDefs).toHaveLength(1);
    expect(diagram.classDefs?.[0]?.name).toBe('myClass');
    expect(diagram.nodes.find((n) => n.id === 'A')?.classes).toContain('myClass');
  });

  it('should preserve direction LR', () => {
    const code = `flowchart LR
  A --> B`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.direction).toBe('LR');
  });

  it('should handle empty subgraphs gracefully', () => {
    const code = `flowchart TB
  A[Start]`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as FlowchartDiagramAST;
    const builder = flowchartASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.nodes).toHaveLength(1);
    expect(diagram.subgraphs).toBeUndefined();
  });
});
