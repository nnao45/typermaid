import { parse, type SequenceDiagramAST } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { sequenceASTToBuilder } from '../src/converters/sequence-ast-to-builder.js';
import { brandID } from '../src/types.js';

describe('sequenceASTToBuilder', () => {
  it('should convert basic sequence diagram AST to builder', () => {
    const code = `sequenceDiagram
  participant A
  participant B
  A->>B: Hello
  B-->>A: Hi there!`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.statements).toHaveLength(4); // 2 participants + 2 messages
    expect(builder.getParticipantCount()).toBe(2);
    expect(builder.getMessageCount()).toBe(2);
  });

  it('should allow manipulation after conversion', () => {
    const code = `sequenceDiagram
  participant A
  participant B
  A->>B: Hello`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    // Add new participant and message
    const c = builder.addParticipant('C', 'Charlie');
    const b = brandID('B');
    builder.sendMessage(b, c, 'Hi Charlie!');

    const _diagram = builder.build();

    expect(builder.getParticipantCount()).toBe(3);
    expect(builder.getMessageCount()).toBe(2);
  });

  it('should handle actor type', () => {
    const code = `sequenceDiagram
  actor A
  participant B
  A->>B: Request`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const diagram = builder.build();

    const participants = diagram.statements.filter(
      (s) => s.type === 'actor' || s.type === 'participant'
    );
    expect(participants).toHaveLength(2);
    expect(participants[0]?.type).toBe('actor');
    expect(participants[1]?.type).toBe('participant');
  });

  it('should handle notes', () => {
    const code = `sequenceDiagram
  participant A
  participant B
  A->>B: Hello
  note right of A: This is a note`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const diagram = builder.build();

    const notes = diagram.statements.filter((s) => s.type === 'note');
    expect(notes).toHaveLength(1);
  });

  it('should auto-add participants from messages', () => {
    const code = `sequenceDiagram
  A->>B: Hello
  B-->>C: Forward`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const _diagram = builder.build();

    expect(builder.getParticipantCount()).toBe(3);
    expect(builder.getMessageCount()).toBe(2);
  });

  it('should handle participant aliases', () => {
    const code = `sequenceDiagram
  participant A as Alice
  participant B as Bob
  A->>B: Hello Bob!`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const diagram = builder.build();

    const participants = diagram.statements.filter((s) => s.type === 'participant');
    expect(participants[0]).toMatchObject({
      id: 'A',
      alias: 'Alice',
    });
    expect(participants[1]).toMatchObject({
      id: 'B',
      alias: 'Bob',
    });
  });

  it('should preserve arrow types', () => {
    const code = `sequenceDiagram
  A->>B: Solid arrow
  A-->>B: Dotted arrow
  A-xB: Cross
  A-)B: Open`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as SequenceDiagramAST;
    const builder = sequenceASTToBuilder(diagramAST);

    const diagram = builder.build();

    const messages = diagram.statements.filter((s) => s.type === 'message');
    expect(messages).toHaveLength(4);
    expect(messages[0]?.arrowType).toBe('solid_arrow');
    expect(messages[1]?.arrowType).toBe('dotted_arrow');
    expect(messages[2]?.arrowType).toBe('solid_cross');
    expect(messages[3]?.arrowType).toBe('solid_open');
  });
});
