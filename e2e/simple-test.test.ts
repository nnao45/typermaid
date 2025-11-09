import { describe, expect, it } from 'vitest';
import { parse } from '@typermaid/parser';

describe('Simple E2E Smoke Test', () => {
  it('should parse a simple sequence diagram', () => {
    const content = `sequenceDiagram
    Alice->>Bob: Hello`;
    
    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');
    expect(ast.body.length).toBe(1);
    expect(ast.body[0].type).toBe('SequenceDiagram');
  });

  it('should parse a simple class diagram', () => {
    const content = `classDiagram
    class Animal`;
    
    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');
  });

  it('should parse a simple state diagram', () => {
    const content = `stateDiagram-v2
    [*] --> Still`;
    
    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');
  });
});
