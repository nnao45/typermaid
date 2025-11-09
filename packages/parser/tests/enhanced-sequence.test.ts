import { describe, expect, test } from 'vitest';
import { parseSequence } from '../src/index.js';

describe('Enhanced Sequence AST-Builder API', () => {
  test('should parse and extend with sequence builder methods', () => {
    const source = `sequenceDiagram
      participant Alice
      participant Bob
      Alice->>Bob: Hello Bob
      Bob-->>Alice: Hello Alice`;

    const ast = parseSequence(source);

    // Should have AST properties
    expect(ast.type).toBe('SequenceDiagram');
    expect(ast.diagram).toBeDefined();

    // Builder capabilities - add new participant
    const charlieId = ast.createParticipant('Charlie', 'Charlie Brown');
    ast.addParticipant('David', 'David Smith', true); // Actor

    // Check if participants were added
    const charlieParticipants = ast.findParticipants('Charlie');
    expect(charlieParticipants).toHaveLength(1);
    expect(charlieParticipants[0]?.id).toBe('Charlie');

    const davidParticipants = ast.findParticipants('David');
    expect(davidParticipants).toHaveLength(1);
    expect(davidParticipants[0]?.type).toBe('actor');

    // Add messages with new participants
    const aliceId = ast.createParticipant('AliceExisting', 'Alice'); // Get existing Alice
    ast
      .sendMessage(aliceId, charlieId, 'Hey Charlie!', 'solid_arrow')
      .addNote(charlieId, 'This is a note', 'right');

    // Code generation
    const code = ast.asCode();
    expect(code).toContain('sequenceDiagram');
    expect(code).toContain('Charlie');
    expect(code).toContain('David');
    expect(code).toContain('Hey Charlie!');

    // Build diagram with enhanced methods
    const diagram = ast.build();
    expect(diagram.type).toBe('sequence');
    expect(typeof diagram.asCode).toBe('function');
    expect(diagram.asCode()).toBe(code);
  });

  test('should handle message types and arrows', () => {
    const source = `sequenceDiagram
      participant A
      participant B
      A->>B: Request
      B-->>A: Response`;

    const ast = parseSequence(source);

    // Add different arrow types
    const cId = ast.createParticipant('C', 'Service C');
    const aId = ast.createParticipant('AExisting', 'A'); // Get A

    ast
      .sendMessage(aId, cId, 'Sync call', 'solid_arrow')
      .sendMessage(cId, aId, 'Async response', 'dotted_arrow');

    // Check messages exist in generated code
    const code = ast.asCode();
    expect(code).toContain('Service C');
    expect(code).toContain('Sync call');
    expect(code).toContain('Async response');

    // Count messages and participants
    expect(ast.getMessageCount()).toBeGreaterThan(2);
    expect(ast.getParticipantCount()).toBeGreaterThan(2);
  });

  test('should support participant replacement', () => {
    const source = `sequenceDiagram
      participant Alice
      participant Bob
      Alice->>Bob: Hello
      Bob-->>Alice: Hi there`;

    const ast = parseSequence(source);

    // Replace Alice with Eve
    ast.replaceParticipant('Alice', 'Eve');

    // Check replacement worked
    const eveParticipants = ast.findParticipants('Eve');
    expect(eveParticipants).toHaveLength(1);

    const aliceParticipants = ast.findParticipants('Alice');
    expect(aliceParticipants).toHaveLength(0);

    // Check messages were updated too
    const messages = ast.findMessages('Hello');
    expect(messages).toHaveLength(1);

    // Generate code and verify replacement
    const code = ast.asCode();
    expect(code).toContain('Eve');
    expect(code).not.toContain('Alice');
  });

  test('should support method chaining', () => {
    const ast = parseSequence('sequenceDiagram\n  participant Base');

    // Method chaining should work
    const result = ast
      .addParticipant('User', 'User Interface')
      .addParticipant('API', 'API Server', true);

    expect(result).toBe(ast); // Should return self
    expect(ast.findParticipants('User')).toHaveLength(1);
    expect(ast.findParticipants('API')).toHaveLength(1);
  });

  test('roundtrip: parse → modify → generate → parse', () => {
    const original = `sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello`;

    const ast1 = parseSequence(original);

    // Modify: add new participant and messages
    const charlieId = ast1.createParticipant('Charlie', 'Charlie');
    const bobId = ast1.createParticipant('BobExisting', 'Bob'); // Get existing Bob
    ast1.sendMessage(bobId, charlieId, 'Forward to Charlie', 'solid_arrow');

    // Generate modified code
    const modified = ast1.asCode();
    expect(modified).toContain('Charlie');
    expect(modified).toContain('Forward to Charlie');

    // Parse modified code
    const ast2 = parseSequence(modified);
    expect(ast2.findParticipants('Charlie')).toHaveLength(1);
    expect(ast2.findMessages('Forward to Charlie')).toHaveLength(1);
  });

  test('should preserve original AST properties during modifications', () => {
    const source = `sequenceDiagram
      participant Alice
      participant Bob`;

    const ast = parseSequence(source);

    // Original properties should be preserved
    expect(ast.type).toBe('SequenceDiagram');
    expect(ast.diagram).toBeDefined();

    // Add new elements
    ast.addParticipant('Charlie', 'Charlie Actor', true);

    // Original properties should still be preserved
    expect(ast.type).toBe('SequenceDiagram');
    expect(ast.diagram).toBeDefined();

    // Code generation should maintain sequence diagram structure
    const code = ast.asCode();
    expect(code).toMatch(/^sequenceDiagram/);
  });

  test('should handle notes and complex interactions', () => {
    const source = `sequenceDiagram
      participant Client
      participant Server
      Client->>Server: Request data
      Note right of Server: Processing
      Server-->>Client: Response`;

    const ast = parseSequence(source);

    // Add more notes and interactions
    const dbId = ast.createParticipant('Database', 'Database');
    const serverId = ast.createParticipant('ServerExisting', 'Server');

    ast
      .sendMessage(serverId, dbId, 'Query', 'solid_arrow')
      .addNote(dbId, 'Database lookup', 'left')
      .sendMessage(dbId, serverId, 'Results', 'dotted_arrow');

    // Check complex interactions
    const code = ast.asCode();
    expect(code).toContain('Database');
    expect(code).toContain('Query');
    expect(code).toContain('Database lookup');

    // Should have multiple statements
    expect(ast.getStatementCount()).toBeGreaterThan(5);
  });
});
