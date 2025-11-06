import { parse, type StateDiagramAST } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { stateASTToBuilder } from '../src/converters/state-ast-to-builder.js';
import { brandID } from '../src/types.js';

describe('stateASTToBuilder', () => {
  it('should convert basic state diagram AST to builder', () => {
    const code = `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  State2 --> [*]`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as StateDiagramAST;
    const builder = stateASTToBuilder(diagramAST);

    const diagram = builder.build();

    // [*] --> State1 sets State1 as start state (no transition added)
    // State1 --> State2 adds 1 transition
    // State2 --> [*] sets State2 as end state (no transition added)
    expect(diagram.states.length).toBeGreaterThanOrEqual(2); // State1, State2
    expect(diagram.transitions.length).toBeGreaterThanOrEqual(1); // State1 --> State2
  });

  it('should allow manipulation after conversion', () => {
    const code = `stateDiagram-v2
  [*] --> State1
  State1 --> State2`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as StateDiagramAST;
    const builder = stateASTToBuilder(diagramAST);

    // Add new state and transition
    const state3 = builder.addState('State3', 'Processing');
    const state2 = brandID('State2');
    builder.addTransition(state2, state3, 'Next');

    const diagram = builder.build();

    expect(diagram.states.length).toBeGreaterThanOrEqual(3);
    expect(diagram.transitions.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle state with label', () => {
    const code = `stateDiagram-v2
  state "This is a label" as s1
  [*] --> s1
  s1 --> [*]`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as StateDiagramAST;
    const builder = stateASTToBuilder(diagramAST);

    const diagram = builder.build();

    const state = diagram.states.find((s) => s.id === 's1');
    expect(state).toBeDefined();
    expect(state?.label).toBe('This is a label');
  });

  it('should handle transitions with labels', () => {
    const code = `stateDiagram-v2
  [*] --> Idle
  Idle --> Active : start
  Active --> Idle : stop`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as StateDiagramAST;
    const builder = stateASTToBuilder(diagramAST);

    const diagram = builder.build();

    const transitions = diagram.transitions.filter((t) => t.label !== undefined);
    expect(transitions.length).toBeGreaterThanOrEqual(2);
  });

  it('should auto-add states from transitions', () => {
    const code = `stateDiagram-v2
  [*] --> S1
  S1 --> S2
  S2 --> S3`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as StateDiagramAST;
    const builder = stateASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.states.length).toBeGreaterThanOrEqual(3); // S1, S2, S3
    expect(diagram.transitions.length).toBe(2); // S1 --> S2, S2 --> S3
  });
});
