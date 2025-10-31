import { describe, it, expect } from 'vitest';
import { parse } from '@lyric-js/parser';
import { createLayout, astToSchema } from '../src/index.js';

describe('Layout Engine', () => {
  it('should create layout for simple flowchart', () => {
    const code = `
      flowchart TB
        A --> B
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    expect(layout.nodes).toHaveLength(2);
    expect(layout.edges).toHaveLength(1);
    
    // Check nodes have positions
    const nodeA = layout.nodes.find(n => n.id === 'A');
    const nodeB = layout.nodes.find(n => n.id === 'B');
    
    expect(nodeA).toBeDefined();
    expect(nodeB).toBeDefined();
    expect(nodeA?.position).toHaveProperty('x');
    expect(nodeA?.position).toHaveProperty('y');
    expect(nodeB?.position).toHaveProperty('x');
    expect(nodeB?.position).toHaveProperty('y');
    
    // TB direction: B should be below A
    expect(nodeB!.position.y).toBeGreaterThan(nodeA!.position.y);
  });
  
  it('should handle multiple nodes', () => {
    const code = `
      flowchart LR
        A --> B
        B --> C
        C --> D
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    expect(layout.nodes).toHaveLength(4);
    expect(layout.edges).toHaveLength(3);
    
    // LR direction: nodes should progress left to right
    const nodeA = layout.nodes.find(n => n.id === 'A');
    const nodeD = layout.nodes.find(n => n.id === 'D');
    
    expect(nodeD!.position.x).toBeGreaterThan(nodeA!.position.x);
  });
  
  it('should handle branching', () => {
    const code = `
      flowchart TB
        A --> B
        A --> C
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    expect(layout.nodes).toHaveLength(3);
    expect(layout.edges).toHaveLength(2);
    
    const nodeA = layout.nodes.find(n => n.id === 'A');
    const nodeB = layout.nodes.find(n => n.id === 'B');
    const nodeC = layout.nodes.find(n => n.id === 'C');
    
    // A should be above both B and C
    expect(nodeB!.position.y).toBeGreaterThan(nodeA!.position.y);
    expect(nodeC!.position.y).toBeGreaterThan(nodeA!.position.y);
  });
  
  it('should include edge points', () => {
    const code = `
      flowchart TB
        A --> B
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    const edge = layout.edges[0];
    expect(edge.points).toBeDefined();
    expect(edge.points.length).toBeGreaterThanOrEqual(2);
    expect(edge.points[0]).toHaveProperty('x');
    expect(edge.points[0]).toHaveProperty('y');
  });
  
  it('should handle labels', () => {
    const code = `
      flowchart TB
        A[Start] --> B[End]
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    const nodeA = layout.nodes.find(n => n.id === 'A');
    const nodeB = layout.nodes.find(n => n.id === 'B');
    
    expect(nodeA?.label).toBe('Start');
    expect(nodeB?.label).toBe('End');
  });
  
  it('should handle different shapes', () => {
    const code = `
      flowchart TB
        A[Square] --> B{Diamond}
        B --> C((Circle))
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    const nodeA = layout.nodes.find(n => n.id === 'A');
    const nodeB = layout.nodes.find(n => n.id === 'B');
    const nodeC = layout.nodes.find(n => n.id === 'C');
    
    expect(nodeA?.shape).toBe('square');
    expect(nodeB?.shape).toBe('rhombus');
    expect(nodeC?.shape).toBe('circle');
    
    // Different shapes should have different dimensions
    expect(nodeB?.dimensions.width).toBeGreaterThan(nodeA?.dimensions.width);
    expect(nodeC?.dimensions.width).toBeGreaterThan(0);
  });
  
  it('should respect layout options', () => {
    const code = `
      flowchart TB
        A --> B
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    
    const layout1 = createLayout(schema, { rankdir: 'TB', ranksep: 50 });
    const layout2 = createLayout(schema, { rankdir: 'TB', ranksep: 200 });
    
    const dist1 = Math.abs(
      layout1.nodes[0].position.y - layout1.nodes[1].position.y
    );
    const dist2 = Math.abs(
      layout2.nodes[0].position.y - layout2.nodes[1].position.y
    );
    
    // Larger ranksep should result in larger distance
    expect(dist2).toBeGreaterThan(dist1);
  });
  
  it('should calculate bounding box', () => {
    const code = `
      flowchart TB
        A --> B --> C
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    expect(layout.bbox).toBeDefined();
    expect(layout.bbox.width).toBeGreaterThan(0);
    expect(layout.bbox.height).toBeGreaterThan(0);
  });
  
  it('should handle edge labels', () => {
    const code = `
      flowchart TB
        A -->|Yes| B
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    const edge = layout.edges[0];
    expect(edge.label).toBe('Yes');
    expect(edge.edgeType).toBe('arrow');
  });
  
  it('should handle complex diagram', () => {
    const code = `
      flowchart TB
        Start[Start] --> Input{Input?}
        Input -->|Valid| Process[Process]
        Input -->|Invalid| Error[Error]
        Process --> Output[Output]
        Error --> End[End]
        Output --> End
    `;
    
    const ast = parse(code);
    const schema = astToSchema(ast);
    const layout = createLayout(schema);
    
    expect(layout.nodes).toHaveLength(6);
    expect(layout.edges).toHaveLength(6);
    
    // All nodes should have valid positions
    for (const node of layout.nodes) {
      expect(node.position.x).toBeGreaterThanOrEqual(0);
      expect(node.position.y).toBeGreaterThanOrEqual(0);
      expect(node.dimensions.width).toBeGreaterThan(0);
      expect(node.dimensions.height).toBeGreaterThan(0);
    }
  });
});
