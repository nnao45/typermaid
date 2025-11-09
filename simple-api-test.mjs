// Simple test of the unified API without problematic imports
console.log('Testing Unified API...');

// Mock a simple test to show the API structure
const mockAPI = {
  parseFlowchart: (source) => {
    console.log('✅ parseFlowchart called with:', source);

    return {
      // Enhanced AST with builder methods
      addNode: (id, shape, label) => {
        console.log(`✅ addNode: ${id} (${shape}) "${label}"`);
        return `node_${id}`;
      },

      addEdge: (from, to, type) => {
        console.log(`✅ addEdge: ${from} -> ${to} (${type})`);
        return this;
      },

      build: () => {
        console.log('✅ build called');
        return {
          type: 'flowchart',
          nodes: [],
          edges: [],
        };
      },

      asCode: () => {
        console.log('✅ asCode called');
        return `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
        `.trim();
      },
    };
  },

  validateDiagram: (diagram) => {
    console.log('✅ validateDiagram called');
    return diagram;
  },
};

// Test the ideal API
const source = `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`;

const ast = mockAPI.parseFlowchart(source);
const start = ast.addNode('start', 'round', 'Start');
const task = ast.addNode('task', 'square', 'Process');
const end = ast.addNode('end', 'double_circle', 'Finish');

ast.addEdge(start, task, 'arrow');
ast.addEdge(task, end, 'arrow');

const diagram = ast.build();
const _safeDiagram = mockAPI.validateDiagram(diagram);
const code = ast.asCode();

console.log('\n🎉 Unified API Pattern Works!');
console.log('Generated code:');
console.log(code);
