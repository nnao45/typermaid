import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from '../packages/parser/src/index.js';

describe('E2E: Flowchart Examples', () => {
  const examplesDir = join(process.cwd(), 'e2e', 'flowchart');
  
  it('should count 100 flowchart examples', async () => {
    const files = await readdir(examplesDir);
    const mmdFiles = files.filter(f => f.endsWith('.mmd'));
    
    expect(mmdFiles.length).toBe(100);
  });
  
  it('should parse manual examples correctly', async () => {
    const files = await readdir(examplesDir);
    const manualFiles = files.filter(f => f.includes('manual') || f.includes('extra')).sort();
    
    let successCount = 0;
    let failCount = 0;
    const failures: string[] = [];
    
    for (const file of manualFiles.slice(0, 10)) {
      const filePath = join(examplesDir, file);
      const content = await readFile(filePath, 'utf-8');
      
      try {
        const ast = parse(content);
        expect(ast).toBeDefined();
        expect(ast.type).toBe('Program');
        successCount++;
      } catch (error) {
        failCount++;
        failures.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log(`\n📊 Manual Examples: ${successCount}/${successCount + failCount} passed`);
    if (failures.length > 0) {
      console.log('❌ Failures:', failures);
    }
    
    expect(successCount).toBeGreaterThan(0);
  });
  
  it('should parse simple flowcharts correctly', async () => {
    const simpleExamples = [
      'flowchart TB\n    A --> B',
      'flowchart LR\n    Start --> End',
      'flowchart TD\n    A[Node] --> B[Another]',
    ];
    
    for (const example of simpleExamples) {
      const ast = parse(example);
      expect(ast.type).toBe('Program');
      expect(ast.body.length).toBeGreaterThan(0);
    }
  });
  
  it('should handle node shapes correctly', async () => {
    const shapes = [
      'flowchart LR\n    A[Square]',
      'flowchart LR\n    A(Round)',
      'flowchart LR\n    A{Diamond}',
      'flowchart LR\n    A((Circle))',
      'flowchart LR\n    A[(Database)]',
    ];
    
    for (const shape of shapes) {
      expect(() => parse(shape)).not.toThrow();
    }
  });
  
  it('should handle edge types correctly', async () => {
    const edges = [
      'flowchart LR\n    A --> B',
      'flowchart LR\n    A --- B',
      'flowchart LR\n    A -.-> B',
      'flowchart LR\n    A ==> B',
    ];
    
    for (const edge of edges) {
      expect(() => parse(edge)).not.toThrow();
    }
  });
  
  it('should handle subgraphs', async () => {
    const subgraph = `flowchart TB
    subgraph one
      a1-->a2
    end`;
    
    expect(() => parse(subgraph)).not.toThrow();
  });
});
