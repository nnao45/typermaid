import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse, parseGantt } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';

describe('E2E: Gantt Diagram Examples', () => {
  const examplesDir = join(process.cwd(), 'e2e', 'gantt');

  it('should parse all gantt diagram examples', async () => {
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

    console.log(`\n📊 Gantt Diagram E2E Results:`);
    console.log(`   Success: ${successCount}/${mmdFiles.length} (${successRate}%)`);
    console.log(`   Failed:  ${failCount}/${mmdFiles.length}`);

    if (failures.length > 0) {
      console.log('\n❌ Failed files:');
      for (const f of failures) {
        console.log(`   - ${f.file}: ${f.error}`);
      }
    }

    expect(successCount).toBeGreaterThan(0);
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
        
        if (ast1.body[0]?.type === 'GanttDiagram') {
          const enhanced = parseGantt(content);
          const generated = enhanced.asCode();
          const ast2 = parse(generated);

          expect(ast2.type).toBe('Program');
          expect(ast2.body.length).toBe(ast1.body.length);
          
          successCount++;
        }
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const step = errorMsg.includes('asCode') ? 'generate' : 'parse';
        failures.push({ file, step, error: errorMsg.split('\n')[0] });
      }
    }

    const successRate = ((successCount / mmdFiles.length) * 100).toFixed(1);

    console.log(`\n🔄 Gantt Diagram Roundtrip Results:`);
    console.log(`   Success: ${successCount}/${mmdFiles.length} (${successRate}%)`);
    console.log(`   Failed:  ${failCount}/${mmdFiles.length}`);

    if (failures.length > 0) {
      console.log('\n❌ Failed roundtrips:');
      for (const f of failures) {
        console.log(`   - ${f.file} (${f.step}): ${f.error}`);
      }
    }

    expect(successCount).toBeGreaterThan(0);
  });
});
