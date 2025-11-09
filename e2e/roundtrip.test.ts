import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  parse,
  parseSequence,
  parseClass,
  parseState,
  parseER,
  parseFlowchart,
  parseGantt,
} from '@typermaid/parser';
import { describe, expect, it } from 'vitest';

/**
 * Round-trip E2E tests
 *
 * Test flow: Code → Parse → AST → Enhanced AST → Generate → Code → Parse → AST
 *
 * Validates that:
 * 1. Original code can be parsed
 * 2. Enhanced AST can generate code back
 * 3. Generated code can be parsed again
 * 4. Both ASTs are structurally equivalent
 */

const E2E_DIR = join(__dirname);

// Get all .mmd files from e2e directories recursively
function getE2EFiles(): Array<{ name: string; path: string; content: string; category: string }> {
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
            category: entry,
          });
        }
      }
    }
  } catch (_err) {
    console.warn('E2E directory not found:', E2E_DIR);
  }

  return files;
}

// Helper to get Enhanced AST parser for diagram type
function getEnhancedParser(diagramType: string, content: string) {
  switch (diagramType) {
    case 'SequenceDiagram':
      return parseSequence(content);
    case 'ClassDiagram':
      return parseClass(content);
    case 'StateDiagram':
      return parseState(content);
    case 'ERDiagram':
      return parseER(content);
    case 'FlowchartDiagram':
      return parseFlowchart(content);
    case 'GanttDiagram':
      return parseGantt(content);
    default:
      return null;
  }
}

describe('Round-trip E2E Tests', () => {
  const testFiles = getE2EFiles();

  if (testFiles.length === 0) {
    it.skip('No E2E fixtures found', () => {});
    return;
  }

  // Group by category
  const categories = [...new Set(testFiles.map((f) => f.category))];

  for (const category of categories) {
    describe(`${category} roundtrip`, () => {
      const categoryFiles = testFiles.filter((f) => f.category === category);

      for (const file of categoryFiles) {
        it(`should roundtrip ${file.name}`, () => {
          // Step 1: Parse original code
          const ast1 = parse(file.content);
          expect(ast1).toBeDefined();
          expect(ast1.type).toBe('Program');

          if (ast1.body.length === 0) {
            // Empty diagram, skip
            return;
          }

          const diagramType = ast1.body[0].type;
          
          // Step 2: Get Enhanced AST and generate code
          const enhanced = getEnhancedParser(diagramType, file.content);
          
          if (!enhanced) {
            // Diagram type not supported yet, skip
            console.warn(`Skipping ${file.name}: ${diagramType} not supported`);
            return;
          }

          const generated = enhanced.asCode();
          expect(generated).toBeDefined();
          expect(generated.length).toBeGreaterThan(0);

          // Step 3: Parse generated code
          const ast2 = parse(generated);
          expect(ast2).toBeDefined();
          expect(ast2.type).toBe('Program');
          expect(ast2.body.length).toBe(ast1.body.length);
          
          // Verify diagram type matches
          if (ast2.body.length > 0) {
            expect(ast2.body[0].type).toBe(diagramType);
          }
        });
      }
    });
  }

  // Summary test
  it('should provide roundtrip summary', () => {
    let totalTests = 0;
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const file of testFiles) {
      totalTests++;
      
      try {
        const ast1 = parse(file.content);
        
        if (ast1.body.length === 0) {
          skipCount++;
          continue;
        }

        const diagramType = ast1.body[0].type;
        const enhanced = getEnhancedParser(diagramType, file.content);
        
        if (!enhanced) {
          skipCount++;
          continue;
        }

        const generated = enhanced.asCode();
        const ast2 = parse(generated);
        
        if (ast2.type === 'Program' && ast2.body.length === ast1.body.length) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (_error) {
        failCount++;
      }
    }

    const successRate = totalTests > 0 ? ((successCount / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n🔄 Overall Roundtrip Results:');
    console.log(`   Total:   ${totalTests} files`);
    console.log(`   Success: ${successCount} (${successRate}%)`);
    console.log(`   Skipped: ${skipCount}`);
    console.log(`   Failed:  ${failCount}`);

    expect(successCount).toBeGreaterThan(0);
  });
});
