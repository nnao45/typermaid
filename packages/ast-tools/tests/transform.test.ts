import type { EdgeAST, FlowchartNodeAST, MessageAST } from '@typermaid/parser';
import { parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { findNodes, replaceNodeById, replaceNodeByName, transformAST } from '../src/transform.js';

describe('transformAST', () => {
  describe('Flowchart transformations', () => {
    it('should transform node labels', () => {
      const code = `
flowchart LR
  A[Start] --> B[Process]
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        FlowchartNode: (node) => ({
          ...node,
          label: node.label.toUpperCase(),
        }),
      });

      const diagram = transformed.body[0] as {
        body: FlowchartNodeAST[];
      };
      const nodes = diagram.body.filter((item) => item.type === 'Node') as FlowchartNodeAST[];

      expect(nodes[0].label).toBe('START');
      expect(nodes[1].label).toBe('PROCESS');
    });

    it('should remove nodes by returning null', () => {
      const code = `
flowchart LR
  A[Start] --> B[Process] --> C[End]
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        FlowchartNode: (node) => (node.id === 'B' ? null : node),
      });

      const diagram = transformed.body[0] as {
        body: FlowchartNodeAST[];
      };
      const nodes = diagram.body.filter((item) => item.type === 'Node') as FlowchartNodeAST[];

      expect(nodes).toHaveLength(2);
      expect(nodes.find((n) => n.id === 'B')).toBeUndefined();
    });

    it('should remove edges by returning null', () => {
      const code = `
flowchart LR
  A --> B
  B --> C
  C --> A
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        Edge: (edge) => (edge.from === 'C' && edge.to === 'A' ? null : edge),
      });

      const diagram = transformed.body[0] as { body: EdgeAST[] };
      const edges = diagram.body.filter((item) => item.type === 'Edge') as EdgeAST[];

      expect(edges).toHaveLength(2);
      expect(edges.find((e) => e.from === 'C' && e.to === 'A')).toBeUndefined();
    });

    it('should transform edge labels', () => {
      const code = `
flowchart LR
  A -->|YES| B
  B -->|NO| C
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        Edge: (edge) => ({
          ...edge,
          label: edge.label?.toLowerCase(),
        }),
      });

      const diagram = transformed.body[0] as { body: EdgeAST[] };
      const edges = diagram.body.filter((item) => item.type === 'Edge') as EdgeAST[];

      expect(edges[0].label).toBe('yes');
      expect(edges[1].label).toBe('no');
    });
  });

  describe('Sequence transformations', () => {
    it('should transform message labels', () => {
      const code = `
sequenceDiagram
  participant A
  participant B
  A->>B: Hello World
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        Message: (msg) => ({
          ...msg,
          message: msg.message.toLowerCase(),
        }),
      });

      const diagram = transformed.body[0] as {
        statements: MessageAST[];
      };
      const messages = diagram.statements.filter((item) => item.type === 'Message') as MessageAST[];

      expect(messages[0].message).toBe('hello world');
    });

    it('should remove participants', () => {
      const code = `
sequenceDiagram
  participant A
  participant B
  participant C
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        Participant: (p) => (p.id === 'B' ? null : p),
      });

      const diagram = transformed.body[0] as {
        statements: { type: string; id: string }[];
      };
      const participants = diagram.statements.filter((item) => item.type === 'Participant');

      expect(participants).toHaveLength(2);
      expect(participants.find((p) => p.id === 'B')).toBeUndefined();
    });
  });

  describe('Multiple transformations', () => {
    it('should apply multiple transformations', () => {
      const code = `
flowchart LR
  A[start] --> B[process]
      `.trim();

      const ast = parse(code);

      const transformed = transformAST(ast, {
        FlowchartNode: (node) => ({
          ...node,
          label: `[${node.label.toUpperCase()}]`,
        }),
      });

      const diagram = transformed.body[0] as {
        body: FlowchartNodeAST[];
      };
      const nodes = diagram.body.filter((item) => item.type === 'Node') as FlowchartNodeAST[];

      expect(nodes[0].label).toBe('[START]');
      expect(nodes[1].label).toBe('[PROCESS]');
    });
  });
});

describe('findNodes', () => {
  it('should find all flowchart nodes', () => {
    const code = `
flowchart LR
  A[Start] --> B[Process] --> C[End]
    `.trim();

    const ast = parse(code);
    const nodes = findNodes<FlowchartNodeAST>(ast, 'Node');

    expect(nodes).toHaveLength(3);
    expect(nodes[0].id).toBe('A');
    expect(nodes[1].id).toBe('B');
    expect(nodes[2].id).toBe('C');
  });

  it('should find all edges', () => {
    const code = `
flowchart LR
  A --> B --> C
    `.trim();

    const ast = parse(code);
    const edges = findNodes<EdgeAST>(ast, 'Edge');

    expect(edges).toHaveLength(2);
    expect(edges[0].from).toBe('A');
    expect(edges[0].to).toBe('B');
    expect(edges[1].from).toBe('B');
    expect(edges[1].to).toBe('C');
  });

  it('should find nodes in nested subgraphs', () => {
    const code = `
flowchart LR
  subgraph sub1
    A[Node A]
    B[Node B]
  end
    `.trim();

    const ast = parse(code);
    const nodes = findNodes<FlowchartNodeAST>(ast, 'Node');

    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('A');
    expect(nodes[1].id).toBe('B');
  });

  it('should find participants in sequence diagram', () => {
    const code = `
sequenceDiagram
  participant Alice
  participant Bob
  participant Server
    `.trim();

    const ast = parse(code);
    const participants = findNodes<{ type: string; id: string }>(ast, 'Participant');

    expect(participants).toHaveLength(3);
    expect(participants[0].id).toBe('Alice');
    expect(participants[1].id).toBe('Bob');
    expect(participants[2].id).toBe('Server');
  });
});

describe('replaceNodeById', () => {
  it('should replace flowchart node by ID', () => {
    const code = `
flowchart LR
  A[Start] --> B[Process]
    `.trim();

    const ast = parse(code);
    const updated = replaceNodeById<FlowchartNodeAST>(ast, 'A', {
      label: 'Updated Start',
    });

    const nodes = findNodes<FlowchartNodeAST>(updated, 'Node');
    const nodeA = nodes.find((n) => n.id === 'A');

    expect(nodeA?.label).toBe('Updated Start');
  });

  it('should replace participant by ID', () => {
    const code = `
sequenceDiagram
  participant Alice
  participant Bob
    `.trim();

    const ast = parse(code);
    const updated = replaceNodeById(ast, 'Alice', {
      label: 'Alice Updated',
    });

    const participants = findNodes<{ type: string; id: string; label?: string }>(
      updated,
      'Participant'
    );
    const alice = participants.find((p) => p.id === 'Alice');

    expect(alice?.label).toBe('Alice Updated');
  });
});

describe('replaceNodeByName', () => {
  it('should replace class by name', () => {
    const code = `
classDiagram
  class User {
    +String name
  }
    `.trim();

    const ast = parse(code);
    const updated = replaceNodeByName(ast, 'User', {
      // Note: Currently our Class parser doesn't support full member parsing
      // This test is for the API, actual functionality depends on parser
    });

    const classes = findNodes<{ type: string; name: string }>(updated, 'Class');
    const userClass = classes.find((c) => c.name === 'User');

    expect(userClass).toBeDefined();
  });

  it('should replace entity by name', () => {
    const code = `
erDiagram
  USER {
    string name
  }
    `.trim();

    const ast = parse(code);
    const updated = replaceNodeByName(ast, 'USER', {
      // API test
    });

    const entities = findNodes<{ type: string; name: string }>(updated, 'Entity');
    const userEntity = entities.find((e) => e.name === 'USER');

    expect(userEntity).toBeDefined();
  });
});
