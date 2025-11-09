import { describe, expect, test } from 'vitest';
import { parseState } from '../src/index.js';

describe('Enhanced State AST-Builder API', () => {
  test('should parse and extend with state builder methods', () => {
    const source = `stateDiagram-v2
      [*] --> Still
      Still --> [*]
      Still --> Moving
      Moving --> Still`;

    const ast = parseState(source);

    // Should have AST properties
    expect(ast.type).toBe('StateDiagram');
    expect(ast.diagram).toBeDefined();

    // Builder capabilities - add new state
    const waitingId = ast.addState('Waiting', 'Waiting State');
    ast.addState('Processing', 'Processing Data');

    // Check if states were added
    const waitingStates = ast.findStates('Waiting');
    expect(waitingStates).toHaveLength(1);
    expect(waitingStates[0]?.id).toBe('Waiting');

    const processingStates = ast.findStates('Processing');
    expect(processingStates).toHaveLength(1);
    expect(processingStates[0]?.label).toBe('Processing Data');

    // Add transitions with new states
    const stillId = ast.addState('StillExisting', 'Still'); // Get existing Still
    ast.addTransition(stillId, waitingId, 'wait').addTransition(waitingId, stillId, 'done');

    // Code generation
    const code = ast.asCode();
    expect(code).toContain('stateDiagram-v2');
    expect(code).toContain('Waiting');
    expect(code).toContain('Processing');

    // Build diagram with enhanced methods
    const diagram = ast.build();
    expect(diagram.type).toBe('state');
    expect(typeof diagram.asCode).toBe('function');
    expect(diagram.asCode()).toBe(code);
  });

  test('should handle composite states and special states', () => {
    const source = `stateDiagram-v2
      [*] --> Active
      Active --> [*]`;

    const ast = parseState(source);

    // Add composite state
    const compositeId = ast.addCompositeState('Composite', 'Composite State');

    // Add fork and join states
    const forkId = ast.addFork('fork1');
    const joinId = ast.addJoin('join1');

    // Add transitions with special states
    const activeId = ast.addState('ActiveExisting', 'Active');
    ast
      .addTransition(activeId, forkId)
      .addTransition(forkId, compositeId)
      .addTransition(compositeId, joinId);

    // Check states exist in generated code
    const code = ast.asCode();
    expect(code).toContain('Composite');
    expect(code).toContain('fork1');
    expect(code).toContain('join1');

    // Count states and transitions
    expect(ast.getStateCount()).toBeGreaterThan(3);
    expect(ast.getTransitionCount()).toBeGreaterThan(2);
  });

  test('should support state replacement', () => {
    const source = `stateDiagram-v2
      [*] --> Idle
      Idle --> Running
      Running --> Idle
      Idle --> [*]`;

    const ast = parseState(source);

    // Replace Idle with Ready
    ast.replaceState('Idle', 'Ready');

    // Check replacement worked
    const readyStates = ast.findStates('Ready');
    expect(readyStates).toHaveLength(1);

    const idleStates = ast.findStates('Idle');
    expect(idleStates).toHaveLength(0);

    // Check transitions were updated too
    const transitions = ast.findTransitions('Ready');
    expect(transitions.length).toBeGreaterThan(0);

    // Generate code and verify replacement
    const code = ast.asCode();
    expect(code).toContain('Ready');
    expect(code).not.toContain('Idle');
  });

  test('should support method chaining', () => {
    const ast = parseState('stateDiagram-v2\n  [*] --> Base');

    // addState returns StateID, but addTransition supports chaining
    const state1 = ast.addState('State1', 'First State');
    const state2 = ast.addState('State2', 'Second State');

    // addTransition supports method chaining
    const result = ast.addTransition(state1, state2, 'transition');

    expect(result).toBe(ast); // Should return self
    expect(ast.findStates('State1')).toHaveLength(1);
    expect(ast.findStates('State2')).toHaveLength(1);
  });

  test.todo('roundtrip: parse → modify → generate → parse', () => {
    // TODO: Generator output format needs parser support
    // Currently generates: `StateId : description` which parser doesn't support without {}
    const original = `stateDiagram-v2
  [*] --> Idle
  Idle --> Running
  Running --> [*]`;

    const ast1 = parseState(original);

    // Modify: add new state and transitions
    const pausedId = ast1.addState('Paused', 'Paused State');
    const runningId = ast1.addState('RunningExisting', 'Running');
    ast1.addTransition(runningId, pausedId, 'pause').addTransition(pausedId, runningId, 'resume');

    // Generate modified code
    const modified = ast1.asCode();
    expect(modified).toContain('Paused');
    expect(modified).toContain('pause');
    expect(modified).toContain('resume');

    // Parse modified code
    const ast2 = parseState(modified);
    expect(ast2.findStates('Paused')).toHaveLength(1);
    expect(ast2.findTransitions('pause')).toHaveLength(1);
  });

  test('should preserve original AST properties during modifications', () => {
    const source = `stateDiagram-v2
      [*] --> Start
      Start --> End
      End --> [*]`;

    const ast = parseState(source);

    // Original properties should be preserved
    expect(ast.type).toBe('StateDiagram');
    expect(ast.diagram).toBeDefined();

    // Add new elements
    ast.addState('Middle', 'Middle State');

    // Original properties should still be preserved
    expect(ast.type).toBe('StateDiagram');
    expect(ast.diagram).toBeDefined();

    // Code generation should maintain state diagram structure
    const code = ast.asCode();
    expect(code).toMatch(/^stateDiagram-v2/);
  });

  test('should handle complex state transitions and labels', () => {
    const source = `stateDiagram-v2
      [*] --> Login
      Login --> Dashboard : success
      Login --> Error : failure
      Dashboard --> [*]`;

    const ast = parseState(source);

    // Add more states and labeled transitions
    const logoutId = ast.addState('Logout', 'Logout Process');
    const dashboardId = ast.addState('DashboardExisting', 'Dashboard');

    ast
      .addTransition(dashboardId, logoutId, 'logout clicked')
      .addTransition(logoutId, dashboardId, 'cancel')
      .addState('Loading', 'Loading Screen');

    // Check complex interactions
    const code = ast.asCode();
    expect(code).toContain('Logout');
    expect(code).toContain('logout clicked');
    expect(code).toContain('Loading');

    // Should have multiple states and transitions
    expect(ast.getStateCount()).toBeGreaterThan(5);
    expect(ast.getTransitionCount()).toBeGreaterThan(4);
  });

  test('should handle start and end states correctly', () => {
    const source = `stateDiagram-v2
      [*] --> Initial
      Initial --> Final
      Final --> [*]`;

    const ast = parseState(source);

    // Get start state
    const startState = ast.getStartState();
    expect(startState).toBeDefined();

    // Add additional transitions from/to start/end states
    const initialId = ast.addState('InitialExisting', 'Initial');
    const newStartId = ast.addState('NewStart', 'New Start');

    // Should be able to reference start state
    ast.addTransition(newStartId, initialId, 'begin');

    // Check in generated code
    const code = ast.asCode();
    expect(code).toContain('NewStart');
    expect(code).toContain('begin');
  });
});
