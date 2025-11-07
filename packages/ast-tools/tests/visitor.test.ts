import type {
  EdgeAST,
  FlowchartNodeAST,
  MessageAST,
  ParticipantAST,
  StateAST,
} from '@typermaid/parser';
import { parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { ASTTransformer, type ASTVisitor } from '../src/visitor.js';

describe('ASTTransformer', () => {
  describe('Flowchart transformations', () => {
    it('should transform all node labels to uppercase', () => {
      const code = `
flowchart LR
  A[Start] --> B[Process]
  B --> C[End]
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class UppercaseLabelsVisitor implements ASTVisitor {
        visitFlowchartNode(node: FlowchartNodeAST): FlowchartNodeAST {
          return {
            ...node,
            label: node.label.toUpperCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new UppercaseLabelsVisitor());

      const transformed = transformer.transform(diagram);

      const nodes = (transformed as { body: FlowchartNodeAST[] }).body.filter(
        (item) => item.type === 'Node'
      ) as FlowchartNodeAST[];

      expect(nodes[0].label).toBe('START');
      expect(nodes[1].label).toBe('PROCESS');
      expect(nodes[2].label).toBe('END');
    });

    it('should transform edge labels to lowercase', () => {
      const code = `
flowchart LR
  A[Start] -->|YES| B[Process]
  B -->|NO| C[End]
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class LowercaseEdgeLabelsVisitor implements ASTVisitor {
        visitEdge(node: EdgeAST): EdgeAST {
          return {
            ...node,
            label: node.label?.toLowerCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new LowercaseEdgeLabelsVisitor());

      const transformed = transformer.transform(diagram);

      const edges = (transformed as { body: EdgeAST[] }).body.filter(
        (item) => item.type === 'Edge'
      ) as EdgeAST[];

      expect(edges[0].label).toBe('yes');
      expect(edges[1].label).toBe('no');
    });

    it('should work with multiple visitors', () => {
      const code = `
flowchart LR
  A[start] --> B[process]
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class UppercaseVisitor implements ASTVisitor {
        visitFlowchartNode(node: FlowchartNodeAST): FlowchartNodeAST {
          return {
            ...node,
            label: node.label.toUpperCase(),
          };
        }
      }

      class PrefixVisitor implements ASTVisitor {
        visitFlowchartNode(node: FlowchartNodeAST): FlowchartNodeAST {
          return {
            ...node,
            label: `[${node.label}]`,
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new UppercaseVisitor());
      transformer.addVisitor(new PrefixVisitor());

      const transformed = transformer.transform(diagram);

      const nodes = (transformed as { body: FlowchartNodeAST[] }).body.filter(
        (item) => item.type === 'Node'
      ) as FlowchartNodeAST[];

      expect(nodes[0].label).toBe('[START]');
      expect(nodes[1].label).toBe('[PROCESS]');
    });
  });

  describe('Sequence transformations', () => {
    it('should transform participant labels', () => {
      const code = `
sequenceDiagram
  participant A as alice
  participant B as bob
  A->>B: Hello
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class UppercaseParticipantVisitor implements ASTVisitor {
        visitParticipant(node: ParticipantAST): ParticipantAST {
          return {
            ...node,
            label: node.label?.toUpperCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new UppercaseParticipantVisitor());

      const transformed = transformer.transform(diagram);

      const participants = (transformed as { statements: ParticipantAST[] }).statements.filter(
        (item) => item.type === 'Participant'
      ) as ParticipantAST[];

      expect(participants[0].label).toBe('ALICE');
      expect(participants[1].label).toBe('BOB');
    });

    it('should transform message labels', () => {
      const code = `
sequenceDiagram
  participant A
  participant B
  A->>B: Hello World
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class LowercaseMessageVisitor implements ASTVisitor {
        visitMessage(node: MessageAST): MessageAST {
          return {
            ...node,
            message: node.message.toLowerCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new LowercaseMessageVisitor());

      const transformed = transformer.transform(diagram);

      const messages = (transformed as { statements: MessageAST[] }).statements.filter(
        (item) => item.type === 'Message'
      ) as MessageAST[];

      expect(messages[0].message).toBe('hello world');
    });
  });

  describe('State transformations', () => {
    it('should transform state labels', () => {
      const code = `
stateDiagram-v2
  [*] --> idle
  idle --> processing
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class UppercaseStateVisitor implements ASTVisitor {
        visitState(node: StateAST): StateAST {
          // Don't transform [*] (start/end state)
          if (node.id === '[*]') return node;

          return {
            ...node,
            label: node.label?.toUpperCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new UppercaseStateVisitor());

      const transformed = transformer.transform(diagram);

      const states = (transformed as { states: StateAST[] }).states;

      const idleState = states.find((s) => s.id === 'idle');
      const processingState = states.find((s) => s.id === 'processing');

      expect(idleState?.label).toBe('IDLE');
      expect(processingState?.label).toBe('PROCESSING');
    });
  });

  describe('Nested transformations', () => {
    it('should transform nodes inside subgraphs', () => {
      const code = `
flowchart LR
  subgraph sub1
    A[start]
    B[end]
  end
      `.trim();

      const ast = parse(code);
      const diagram = ast.body[0];

      class UppercaseVisitor implements ASTVisitor {
        visitFlowchartNode(node: FlowchartNodeAST): FlowchartNodeAST {
          return {
            ...node,
            label: node.label.toUpperCase(),
          };
        }
      }

      const transformer = new ASTTransformer();
      transformer.addVisitor(new UppercaseVisitor());

      const transformed = transformer.transform(diagram);

      const subgraph = (
        transformed as { body: { type: string; body: FlowchartNodeAST[] }[] }
      ).body.find((item) => item.type === 'Subgraph');

      const nodes = subgraph?.body.filter((item) => item.type === 'Node') as FlowchartNodeAST[];

      expect(nodes[0].label).toBe('START');
      expect(nodes[1].label).toBe('END');
    });
  });
});
