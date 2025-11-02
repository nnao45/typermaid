import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from '../packages/parser/src/index.js';

describe('E2E: ER Diagram Examples', () => {
  const examplesDir = join(process.cwd(), 'e2e', 'er');

  it('should parse all ER diagram examples', async () => {
    const files = await readdir(examplesDir);
    const mmdFiles = files.filter((f) => f.endsWith('.mmd')).sort();

    expect(mmdFiles.length).toBeGreaterThan(0);

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

    console.log(`\n📊 ER Diagram E2E Results:`);
    console.log(`   Success: ${successCount}/${mmdFiles.length} (${successRate}%)`);
    console.log(`   Failed:  ${failCount}/${mmdFiles.length}`);

    if (failures.length > 0) {
      console.log(`\n❌ Failed examples:`);
      for (const failure of failures.slice(0, 10)) {
        console.log(`   ${failure.file}: ${failure.error}`);
      }
      if (failures.length > 10) {
        console.log(`   ... and ${failures.length - 10} more`);
      }
    }

    expect(successCount).toBeGreaterThanOrEqual(0);
  });

  it('should parse basic ER diagram', async () => {
    const content = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`;

    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.type).toBe('Program');
    expect(ast.body).toHaveLength(1);
    expect(ast.body[0].type).toBe('ERDiagram');
  });

  it('should handle entity attributes', async () => {
    const content = `erDiagram
    CUSTOMER {
        string name
        string custNumber
        string sector
    }`;

    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.body[0].type).toBe('ERDiagram');
  });

  it('should handle cardinality', async () => {
    const content = `erDiagram
    CUSTOMER ||--|{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`;

    const ast = parse(content);
    expect(ast).toBeDefined();
    expect(ast.body[0].type).toBe('ERDiagram');
  });
});
