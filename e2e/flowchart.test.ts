import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from '@typermaid/parser';
import { generateCode } from '@typermaid/codegen';

describe('E2E: Flowchart Examples', () => {
  const examplesDir = join(process.cwd(), 'e2e', 'flowchart');

  it('should count 100 flowchart examples', async () => {
    const files = await readdir(examplesDir);
    const mmdFiles = files.filter((f) => f.endsWith('.mmd'));

    expect(mmdFiles.length).toBe(100);
  });

  it('should parse all 100 examples and report success rate', async () => {
    const files = await readdir(examplesDir);
    const mmdFiles = files.filter((f) => f.endsWith('.mmd')).sort();

    let successCount = 0;
    let failCount = 0;
    const failures: Array<{ file: string; error: string }> = [];

    for (const file of mmdFiles) {
      const filePath = join(examplesDir, file);
      const content = await readFile(filePath, 'utf-8');

      try {
        const ast = parse(content);
        expect(ast).toBeDefined();
        expect(ast.type).toBe('Program');
        successCount++;
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        failures.push({ file, error: errorMsg.split('\n')[0] });
      }
    }

    const successRate = ((successCount / mmdFiles.length) * 100).toFixed(1);

    console.log(`\n📊 E2E Test Results:`);
    console.log(`   Success: ${successCount}/${mmdFiles.length} (${successRate}%)`);
    console.log(`   Failed:  ${failCount}/${mmdFiles.length}`);

    if (failures.length > 0 && failures.length <= 20) {
      console.log(`\n❌ Failed examples:`);
      for (const failure of failures.slice(0, 10)) {
        console.log(`   ${failure.file}: ${failure.error}`);
      }
      if (failures.length > 10) {
        console.log(`   ... and ${failures.length - 10} more`);
      }
    }

    // At least 50% should pass
    expect(successCount).toBeGreaterThanOrEqual(mmdFiles.length * 0.5);
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

  it('should roundtrip all parseable examples', async () => {
    const files = await readdir(examplesDir);
    const mmdFiles = files.filter((f) => f.endsWith('.mmd')).sort();

    let successCount = 0;
    let failCount = 0;
    const failures: Array<{ file: string; step: string; error: string }> = [];

    for (const file of mmdFiles) {
      const filePath = join(examplesDir, file);
      const content = await readFile(filePath, 'utf-8');

      try {
        // Step 1: Parse original
        const ast1 = parse(content);
        
        // Step 2: Generate code
        const generated = generateCode(ast1);
        
        // Step 3: Parse generated
        const ast2 = parse(generated);
        
        // Step 4: Verify structure
        expect(ast2.type).toBe('Program');
        expect(ast2.body.length).toBe(ast1.body.length);
        
        successCount++;
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const step = errorMsg.includes('generate') ? 'generate' : 'parse';
        failures.push({ file, step, error: errorMsg.split('\n')[0] });
      }
    }

    const successRate = ((successCount / mmdFiles.length) * 100).toFixed(1);

    console.log(`\n🔄 Flowchart Roundtrip Results:`);
    console.log(`   Success: ${successCount}/${mmdFiles.length} (${successRate}%)`);
    console.log(`   Failed:  ${failCount}/${mmdFiles.length}`);

    if (failures.length > 0 && failures.length <= 20) {
      console.log(`\n❌ Failed roundtrips:`);
      for (const failure of failures.slice(0, 10)) {
        console.log(`   ${failure.file} [${failure.step}]: ${failure.error}`);
      }
      if (failures.length > 10) {
        console.log(`   ... and ${failures.length - 10} more`);
      }
    }

    // At least 50% should roundtrip successfully
    expect(successCount).toBeGreaterThanOrEqual(mmdFiles.length * 0.5);
  });
});
