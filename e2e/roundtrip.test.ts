import { describe, it, expect } from 'vitest';
import { parse } from '@typermaid/parser';
import { generateCode } from '@typermaid/codegen';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Round-trip E2E tests
 * 
 * Test flow: Code → Parse → AST → Generate → Code → Parse → AST
 * 
 * Validates that:
 * 1. Original code can be parsed
 * 2. AST can be generated back to code
 * 3. Generated code can be parsed again
 * 4. Both ASTs are structurally equivalent
 */

const E2E_DIR = join(__dirname);

// Memoized cache for E2E files
let cachedFiles: Array<{ name: string; path: string; content: string; category: string }> | null = null;

// Get all .mmd files from e2e directories recursively (cached)
function getE2EFiles(): Array<{ name: string; path: string; content: string; category: string }> {
  if (cachedFiles !== null) {
    return cachedFiles;
  }
  
  const files: Array<{ name: string; path: string; content: string; category: string }> = [];
  
  try {
    const entries = readdirSync(E2E_DIR);
    
    for (const entry of entries) {
      const fullPath = join(E2E_DIR, entry);
      const stat = statSync(fullPath);
      
      // Skip test files and non-directories
      if (!stat.isDirectory() || entry === 'fixtures') {
        continue;
      }
      
      // Read all .mmd files in subdirectory
      const subEntries = readdirSync(fullPath);
      for (const subEntry of subEntries) {
        if (subEntry.endsWith('.mmd')) {
          const mmdPath = join(fullPath, subEntry);
          const content = readFileSync(mmdPath, 'utf-8');
          files.push({ 
            name: subEntry, 
            path: mmdPath, 
            content,
            category: entry 
          });
        }
      }
    }
  } catch (err) {
    console.warn('E2E directory not found:', E2E_DIR);
  }
  
  cachedFiles = files;
  return files;
}

describe('Round-trip E2E Tests', () => {
  const testFiles = getE2EFiles();
  
  if (testFiles.length === 0) {
    it.skip('No E2E fixtures found', () => {});
    return;
  }

  // Group by category
  const categories = [...new Set(testFiles.map(f => f.category))];
  
  for (const category of categories) {
    describe(category, () => {
      const categoryFiles = testFiles.filter(f => f.category === category);
      
      for (const file of categoryFiles) {
        it(`${file.name}`, () => {
          // Step 1: Parse original code
          const ast1 = parse(file.content);
          expect(ast1).toBeDefined();
          expect(ast1.type).toBe('Program');
          
          // Step 2: Generate code from AST
          const generated = generateCode(ast1);
          expect(generated).toBeDefined();
          expect(generated.length).toBeGreaterThan(0);
          
          // Step 3: Parse generated code
          const ast2 = parse(generated);
          expect(ast2).toBeDefined();
          expect(ast2.type).toBe('Program');
          
          // Step 4: Validate structure equivalence
          expect(ast2.body.length).toBe(ast1.body.length);
          
          // Check diagram types match
          for (let i = 0; i < ast1.body.length; i++) {
            expect(ast2.body[i].type).toBe(ast1.body[i].type);
          }
        });
      }
    });
  }
});

describe('Round-trip with Transform', () => {
  const testFiles = getE2EFiles();
  
  if (testFiles.length === 0) {
    it.skip('No E2E fixtures found', () => {});
    return;
  }

  // Group by category  
  const categories = [...new Set(testFiles.map(f => f.category))];
  
  for (const category of categories) {
    describe(category, () => {
      const categoryFiles = testFiles.filter(f => f.category === category);
      
      // Test identity transform (no changes)
      for (const file of categoryFiles) {
        it(`identity transform - ${file.name}`, () => {
          const ast1 = parse(file.content);
          
          // Identity transform (just clone)
          const transformed = JSON.parse(JSON.stringify(ast1));
          
          const generated = generateCode(transformed);
          const ast2 = parse(generated);
          
          expect(ast2.body.length).toBe(ast1.body.length);
          expect(ast2.body[0].type).toBe(ast1.body[0].type);
        });
      }
    });
  }
});

describe('Specific Diagram Type Round-trips', () => {
  it('should handle flowchart round-trip', () => {
    const code = `flowchart LR
  A[Start] --> B[Process]
  B --> C{Decision}
  C -->|Yes| D[End]
  C -->|No| A`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('FlowchartDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
  
  it('should handle sequence round-trip', () => {
    const code = `sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello Bob
  Bob->>Alice: Hi Alice
  loop Every minute
    Alice->>Bob: Ping
  end`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('SequenceDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
  
  it('should handle state round-trip', () => {
    const code = `stateDiagram-v2
  [*] --> Idle
  Idle --> Processing
  Processing --> Done
  Done --> [*]`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('StateDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
  
  it('should handle class round-trip', () => {
    const code = `classDiagram
  class Animal {
    +String name
    +void makeSound()
  }
  class Dog {
    +void bark()
  }
  Animal <|-- Dog`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('ClassDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
  
  it('should handle ER round-trip', () => {
    const code = `erDiagram
  CUSTOMER {
    string name
    int age
  }
  ORDER {
    int id
    string item
  }
  CUSTOMER ||--o{ ORDER : places`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('ERDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
  
  it('should handle gantt round-trip', () => {
    const code = `gantt
  title Project Timeline
  dateFormat YYYY-MM-DD
  section Development
  Design :2024-01-01, 5d
  Code :2024-01-06, 10d`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('GanttDiagram');
    expect(ast1.body[0].type).toBe(ast2.body[0].type);
  });
});

describe('Round-trip Edge Cases', () => {
  it('should handle empty diagrams', () => {
    const code = 'flowchart LR';
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body[0].type).toBe('FlowchartDiagram');
  });
  
  it('should handle multiple diagrams', () => {
    const code = `flowchart LR
  A --> B

sequenceDiagram
  Alice->>Bob: Hello`;
    
    const ast1 = parse(code);
    const generated = generateCode(ast1);
    const ast2 = parse(generated);
    
    expect(ast2.body.length).toBe(2);
    expect(ast2.body[0].type).toBe('FlowchartDiagram');
    expect(ast2.body[1].type).toBe('SequenceDiagram');
  });
});
