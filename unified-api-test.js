// Test the unified API as described by the user

import { validateDiagram } from './packages/core/dist/validator.js';
import { parseFlowchart } from './packages/parser/dist/parser.js';

const source = `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`;

console.log('Testing unified API...');

try {
  // Parse Mermaid text into enhanced AST
  const ast = parseFlowchart(source);
  console.log('✅ parseFlowchart works');

  // Test builder methods on AST
  const start = ast.addNode('start', 'round', 'Start');
  const task = ast.addNode('task', 'square', 'Process');
  const end = ast.addNode('end', 'double_circle', 'Finish');
  console.log('✅ addNode methods work');

  ast.addEdge(start, task, 'arrow');
  ast.addEdge(task, end, 'arrow');
  console.log('✅ addEdge methods work');

  const diagram = ast.build();
  console.log('✅ build method works');

  // Test validation
  const _safeDiagram = validateDiagram(diagram);
  console.log('✅ validateDiagram works');

  // Test code generation
  const code = ast.asCode();
  console.log('✅ asCode works');
  console.log('Generated code:', code);

  console.log('\n🎉 Unified API working perfectly!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
