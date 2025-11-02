#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const TEST_URLS = [
  'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/flowchart/parser/flow-arrows.spec.js',
  'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/flowchart/parser/flow-edges.spec.js',
  'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/flowchart/parser/flow-text.spec.js',
  'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/flowchart/parser/subgraph.spec.js',
  'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/flowchart/parser/flow-vertice-chaining.spec.js',
];

async function extractMermaidCode(content) {
  const examples = [];

  // Match flowchart/graph code in backticks
  const regex = /`([^`]*(?:flowchart|graph)[^`]*)`/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const code = match[1].trim();
    if (code.includes('flowchart') || code.includes('graph')) {
      examples.push(code);
    }
  }

  return examples;
}

async function main() {
  let counter = 0;

  console.log('📥 Fetching Mermaid examples from official repository...\n');

  for (const url of TEST_URLS) {
    const filename = url.split('/').pop() || 'unknown';
    console.log(`📄 Processing ${filename}...`);

    try {
      const response = await fetch(url);
      const content = await response.text();

      const examples = await extractMermaidCode(content);

      for (const code of examples) {
        counter++;
        const outputFile = path.join(
          'e2e',
          'flowchart',
          `${String(counter).padStart(3, '0')}_example.mmd`
        );
        await fs.writeFile(outputFile, code);
        console.log(`  ✅ Saved: ${outputFile}`);

        if (counter >= 100) break;
      }

      if (counter >= 100) break;
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
    }
  }

  console.log(`\n🎉 Total examples collected: ${counter}`);
}

main().catch(console.error);
