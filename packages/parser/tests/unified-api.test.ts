import { describe, expect, test } from 'vitest';
import { parseFlowchart } from '../src/index.js';

describe('Unified AST-Builder API', () => {
  test('should parse and extend with builder methods', () => {
    const source = `
      flowchart TB
        start --> end
    `;

    const ast = parseFlowchart(source);

    // Should have AST properties
    expect(ast.type).toBe('FlowchartDiagram');
    expect(ast.direction).toBe('TB');
    expect(ast.body.length).toBeGreaterThanOrEqual(2); // At least edge and some nodes

    // Builder capabilities - add new node
    ast.addNode('task', 'square', 'Process'); // Returns 'this' for chaining

    // AST should be updated
    const taskNode = ast.body.find((item) => item.type === 'Node' && item.id === 'task');
    expect(taskNode).toBeDefined();
    expect(taskNode?.label).toBe('Process');

    // Add edge using createNode to get branded ID
    const taskId = ast.createNode('task2', 'circle', 'Task 2');
    ast.addEdge(taskId, taskId, 'arrow', 'Self loop');

    // AST manipulation
    const startNodes = ast.findNodes('start');
    expect(startNodes).toHaveLength(1);
    expect(startNodes[0]?.id).toBe('start');

    // Code generation
    const code = ast.asCode();
    expect(code).toContain('flowchart TB');
    expect(code).toContain('task[Process]');

    // Build diagram with enhanced methods
    const diagram = ast.build();
    expect(diagram.type).toBe('flowchart');
    expect(typeof diagram.asCode).toBe('function');
    expect(diagram.asCode()).toBe(code);
  });

  test('should handle node replacement', () => {
    const source = `
      flowchart LR
        A --> B
        B --> C
    `;

    const ast = parseFlowchart(source);

    // Replace node B with newB
    ast.replaceNode('B', 'newB');

    // Check AST was updated
    const newBNode = ast.body.find((item) => item.type === 'Node' && item.id === 'newB');
    expect(newBNode).toBeDefined();

    const oldBNode = ast.body.find((item) => item.type === 'Node' && item.id === 'B');
    expect(oldBNode).toBeUndefined();

    // Check edges were updated
    const edges = ast.body.filter((item) => item.type === 'Edge');
    const edgeWithNewB = edges.some((edge) => edge.from === 'newB' || edge.to === 'newB');
    expect(edgeWithNewB).toBeTruthy();
  });

  test('roundtrip: parse → modify → generate → parse', () => {
    const original = `flowchart TB
  A --> B`;

    const ast1 = parseFlowchart(original);

    // Modify: add new node and edge
    ast1.addNode('C', 'square', 'New Node');
    // Find existing B node (should exist from parsing)
    const bNodes = ast1.findNodes('B');
    expect(bNodes).toHaveLength(1);

    // Generate modified code
    const modified = ast1.asCode();
    expect(modified).toMatch(/C\[.*New Node.*\]/); // Match C[...] with quotes or without

    // Parse modified code
    const ast2 = parseFlowchart(modified);
    expect(ast2.findNodes('C')).toHaveLength(1);
  });

  test('should preserve original AST properties during modifications', () => {
    const source = `
      flowchart LR
        start((Start)) --> process[Process]
    `;

    const ast = parseFlowchart(source);

    // Original properties should be preserved
    expect(ast.direction).toBe('LR');
    expect(ast.type).toBe('FlowchartDiagram');

    // Add new elements
    ast.addNode('finish', 'double_circle', 'Finish'); // 'end' is reserved

    // Original properties should still be preserved
    expect(ast.direction).toBe('LR');
    expect(ast.type).toBe('FlowchartDiagram');

    // Code generation should maintain direction
    const code = ast.asCode();
    expect(code).toMatch(/^flowchart LR/);
  });

  test('should support method chaining', () => {
    const ast = parseFlowchart('flowchart TD\n  A --> B');

    // Method chaining should work
    const result = ast.addNode('C', 'square', 'Step C').addNode('D', 'rhombus', 'Decision');

    expect(result).toBe(ast); // Should return self
    expect(ast.findNodes('C')).toHaveLength(1);
    expect(ast.findNodes('D')).toHaveLength(1);
  });
});
