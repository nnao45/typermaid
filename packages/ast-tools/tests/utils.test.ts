import type { FlowchartDiagramAST, SequenceDiagramAST, StateDiagramAST } from '@typermaid/parser';
import { parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import {
  cloneAST,
  getAllNodeIds,
  getAllParticipantIds,
  getAllStateIds,
  mergeDiagrams,
  removeNode,
  validateFlowchart,
  validateSequence,
  validateState,
} from '../src/utils.js';

describe('cloneAST', () => {
  it('should create a deep copy of AST', () => {
    const code = `
flowchart LR
  A[Start] --> B[End]
    `.trim();

    const ast = parse(code);
    const clone = cloneAST(ast);

    expect(clone).toEqual(ast);
    expect(clone).not.toBe(ast);
    expect(clone.body).not.toBe(ast.body);
  });

  it('should allow modifications without affecting original', () => {
    const code = `
flowchart LR
  A[Start] --> B[End]
    `.trim();

    const ast = parse(code);
    const clone = cloneAST(ast);

    // Modify clone
    const diagram = clone.body[0] as FlowchartDiagramAST;
    const node = diagram.body.find((item) => item.type === 'Node' && item.id === 'A');
    if (node && 'label' in node) {
      (node as { label: string }).label = 'Modified';
    }

    // Original should be unchanged
    const originalDiagram = ast.body[0] as FlowchartDiagramAST;
    const originalNode = originalDiagram.body.find(
      (item) => item.type === 'Node' && item.id === 'A'
    );
    expect((originalNode as { label: string }).label).toBe('Start');
  });
});

describe('mergeDiagrams', () => {
  it('should merge two flowchart diagrams', () => {
    const code1 = `
flowchart LR
  A[Start] --> B[Middle]
    `.trim();

    const code2 = `
flowchart LR
  B[Middle] --> C[End]
    `.trim();

    const ast1 = parse(code1);
    const ast2 = parse(code2);

    const merged = mergeDiagrams(
      ast1.body[0] as FlowchartDiagramAST,
      ast2.body[0] as FlowchartDiagramAST
    );

    expect(merged.body).toHaveLength(6); // 3 nodes + 2 edges from diagram1 + 1 node + 1 edge from diagram2 (B is duplicated)
  });

  it('should merge two sequence diagrams', () => {
    const code1 = `
sequenceDiagram
  participant A
  A->>B: Hello
    `.trim();

    const code2 = `
sequenceDiagram
  participant C
  B->>C: World
    `.trim();

    const ast1 = parse(code1);
    const ast2 = parse(code2);

    const merged = mergeDiagrams(
      ast1.body[0] as SequenceDiagramAST,
      ast2.body[0] as SequenceDiagramAST
    );

    expect(merged.statements).toHaveLength(4); // 1 participant + 1 message from each
  });

  it('should throw error when merging different diagram types', () => {
    const flowchartCode = `
flowchart LR
  A --> B
    `.trim();

    const sequenceCode = `
sequenceDiagram
  A->>B: Hello
    `.trim();

    const ast1 = parse(flowchartCode);
    const ast2 = parse(sequenceCode);

    expect(() => {
      mergeDiagrams(
        ast1.body[0] as FlowchartDiagramAST,
        ast2.body[0] as unknown as FlowchartDiagramAST
      );
    }).toThrow('Cannot merge diagrams of different types');
  });
});

describe('removeNode', () => {
  it('should remove flowchart node and connected edges', () => {
    const code = `
flowchart LR
  A --> B --> C
    `.trim();

    const ast = parse(code);
    const updated = removeNode(ast, 'B');

    const diagram = updated.body[0] as FlowchartDiagramAST;
    const nodes = diagram.body.filter((item) => item.type === 'Node');
    const edges = diagram.body.filter((item) => item.type === 'Edge');

    expect(nodes).toHaveLength(2); // A and C remain
    expect(edges).toHaveLength(0); // Both edges removed (A->B and B->C)
  });

  it('should remove participant and related messages', () => {
    const code = `
sequenceDiagram
  participant A
  participant B
  participant C
  A->>B: Hello
  B->>C: World
    `.trim();

    const ast = parse(code);
    const updated = removeNode(ast, 'B');

    const diagram = updated.body[0] as SequenceDiagramAST;
    const participants = diagram.statements.filter((item) => item.type === 'Participant');
    const messages = diagram.statements.filter((item) => item.type === 'Message');

    expect(participants).toHaveLength(2); // A and C remain
    expect(messages).toHaveLength(0); // Both messages removed
  });

  it('should remove state and related transitions', () => {
    const code = `
stateDiagram-v2
  [*] --> A
  A --> B
  B --> [*]
    `.trim();

    const ast = parse(code);
    const updated = removeNode(ast, 'A');

    const diagram = updated.body[0] as StateDiagramAST;

    expect(diagram.states.find((s) => s.id === 'A')).toBeUndefined();
    expect(diagram.transitions.find((t) => t.from === 'A' || t.to === 'A')).toBeUndefined();
  });
});

describe('getAllNodeIds', () => {
  it('should get all node IDs from flowchart', () => {
    const code = `
flowchart LR
  A[Start] --> B[Middle] --> C[End]
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as FlowchartDiagramAST;
    const ids = getAllNodeIds(diagram);

    expect(ids).toEqual(['A', 'B', 'C']);
  });

  it('should get node IDs from nested subgraphs', () => {
    const code = `
flowchart LR
  subgraph sub1
    A[Node A]
    B[Node B]
  end
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as FlowchartDiagramAST;
    const ids = getAllNodeIds(diagram);

    expect(ids).toContain('A');
    expect(ids).toContain('B');
  });
});

describe('getAllParticipantIds', () => {
  it('should get all participant IDs from sequence diagram', () => {
    const code = `
sequenceDiagram
  participant Alice
  participant Bob
  participant Server
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as SequenceDiagramAST;
    const ids = getAllParticipantIds(diagram);

    expect(ids).toEqual(['Alice', 'Bob', 'Server']);
  });
});

describe('getAllStateIds', () => {
  it('should get all state IDs from state diagram', () => {
    const code = `
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing
  Processing --> Done
  Done --> [*]
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as StateDiagramAST;
    const ids = getAllStateIds(diagram);

    expect(ids).toContain('[*]');
    expect(ids).toContain('Idle');
    expect(ids).toContain('Processing');
    expect(ids).toContain('Done');
  });
});

describe('validateFlowchart', () => {
  it('should validate correct flowchart', () => {
    const code = `
flowchart LR
  A[Start] --> B[End]
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as FlowchartDiagramAST;
    const result = validateFlowchart(diagram);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect dangling edges', () => {
    const code = `
flowchart LR
  A[Start]
    `.trim();

    // Manually create invalid AST with dangling edge
    const ast = parse(code);
    const diagram = ast.body[0] as FlowchartDiagramAST;

    // Add invalid edge
    diagram.body.push({
      type: 'Edge',
      from: 'A',
      to: 'NonExistent',
      edgeType: 'arrow',
      loc: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } },
    });

    const result = validateFlowchart(diagram);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Edge references non-existent node: NonExistent');
  });

  it('should detect orphan nodes', () => {
    const code = `
flowchart LR
  A[Start]
  B[Orphan]
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as FlowchartDiagramAST;
    const result = validateFlowchart(diagram);

    expect(result.warnings).toContain('Orphan node detected: A');
    expect(result.warnings).toContain('Orphan node detected: B');
  });
});

describe('validateSequence', () => {
  it('should validate correct sequence diagram', () => {
    const code = `
sequenceDiagram
  participant A
  participant B
  A->>B: Hello
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as SequenceDiagramAST;
    const result = validateSequence(diagram);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect undeclared participants', () => {
    const code = `
sequenceDiagram
  participant A
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as SequenceDiagramAST;

    // Add message with undeclared participant
    diagram.statements.push({
      type: 'Message',
      from: 'A',
      to: 'Undeclared',
      message: 'Hello',
      messageType: 'solid_arrow',
      loc: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } },
    });

    const result = validateSequence(diagram);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message references undeclared participant: Undeclared');
  });
});

describe('validateState', () => {
  it('should validate correct state diagram', () => {
    const code = `
stateDiagram-v2
  [*] --> Idle
  Idle --> [*]
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as StateDiagramAST;
    const result = validateState(diagram);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect dangling transitions', () => {
    const code = `
stateDiagram-v2
  [*] --> Idle
    `.trim();

    const ast = parse(code);
    const diagram = ast.body[0] as StateDiagramAST;

    // Add transition with non-existent state
    diagram.transitions.push({
      type: 'Transition',
      from: 'Idle',
      to: 'NonExistent',
      loc: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } },
    });

    const result = validateState(diagram);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Transition references non-existent state: NonExistent');
  });
});
