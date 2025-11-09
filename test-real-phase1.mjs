// Phase 1 REAL test: Real Enhanced Flowchart API test
console.log('🚀 Phase 1: Testing REAL Enhanced Flowchart API...\n');

// Try to use the real implementation
try {
  console.log('🔍 Trying to import real parseFlowchart...');
  
  // First check if we can import without errors
  const fs = await import('fs');
  const path = await import('path');
  
  // Check if the dist file exists
  const distPath = './packages/parser/dist/index.js';
  if (fs.existsSync(distPath)) {
    console.log('✅ Found dist file, attempting import...');
    
    try {
      const { parseFlowchart } = await import('./packages/parser/dist/index.js');
      console.log('✅ Successfully imported parseFlowchart!');
      
      const source = `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`;

      console.log('\n🔧 Testing real parseFlowchart...');
      const ast = parseFlowchart(source);
      
      console.log('✅ parseFlowchart returned:', typeof ast);
      console.log('🔍 AST type:', ast.type);
      console.log('🔍 Direction:', ast.direction);
      console.log('🔍 Body length:', ast.body.length);
      
      // Test if it has builder methods
      if (typeof ast.addNode === 'function') {
        console.log('✅ addNode method exists!');
        
        // Try adding a node
        ast.addNode('newNode', 'circle', 'New Node');
        console.log('✅ addNode worked!');
      } else {
        console.log('❌ addNode method missing');
      }
      
      // Test if it has asCode method
      if (typeof ast.asCode === 'function') {
        console.log('✅ asCode method exists!');
        
        const code = ast.asCode();
        console.log('✅ Generated code:');
        console.log(code);
        console.log('\n🎉 Phase 1 SUCCESS: Real API works!');
      } else {
        console.log('❌ asCode method missing');
      }
      
    } catch (importError) {
      console.log('❌ Import failed:', importError.message);
      console.log('📋 Need to build packages first');
    }
  } else {
    console.log('❌ Dist file not found at:', distPath);
    console.log('📋 Need to build parser package first');
  }
  
} catch (error) {
  console.error('❌ Phase 1 Real Test Error:', error.message);
}

console.log('\n💡 Next steps:');
console.log('  1. Build parser package: cd packages/parser && npm run build');
console.log('  2. Fix any remaining type issues');
console.log('  3. Test the unified API again');