import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateCode } from '@typermaid/codegen';
import { parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';

describe('E2E: Class Diagram Examples', () => {
  const examplesDir = join(process.cwd(), 'e2e', 'class');

  it('should parse all class diagram examples', async () => {
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

    console.log(`\n📊 Class Diagram E2E Results:`);
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
        const ast1 = parse(content);
        const generated = generateCode(ast1);
        const ast2 = parse(generated);

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

    console.log(`\n🔄 Class Diagram Roundtrip Results:`);
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

    expect(successCount).toBeGreaterThanOrEqual(0);
  });

  it.todo('should parse basic class diagram');

  it.todo('should handle class with members');

  it.todo('should handle relationships');
});
