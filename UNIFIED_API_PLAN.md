# 🚀 Unified API Implementation Plan

## 📋 Overview

Transform typermaid from a complex multi-package architecture to a simple, unified AST-Builder hybrid API.

### Current Problem: Too Complex 😵‍💫
```typescript
// 4 different packages, 4 different concepts
import { FlowchartDiagramBuilder } from '@typermaid/builders';
import { validateDiagram } from '@typermaid/core';
import { generateFlowchart } from '@typermaid/codegen';  // ← exists!
import { transformAST } from '@typermaid/ast-tools';      // ← exists!
import { parseFlowchart } from '@typermaid/parser';

// Multi-step process
const ast = parseFlowchart(source);
const schema = astToSchema(ast);
const builder = new FlowchartDiagramBuilder();
// ... manual copying
const diagram = builder.build();
```

### Target Solution: Simple & Unified ✨
```typescript
import { parseFlowchart } from '@typermaid/parser';

const ast = parseFlowchart(source);

// AST manipulation (ast-tools integrated)
ast.findNodes('start');
ast.replaceNode('oldId', 'newId');

// Builder capabilities (builders integrated)  
ast.addNode('newNode', 'square', 'New Task');
ast.addEdge('start', 'newNode', 'arrow');

// Code generation (codegen integrated)
const diagram = ast.build();
const code = diagram.asCode();  // ← uses generateFlowchart() internally
```

## 📊 Existing Implementation Status

| Package | Function | Status | Integration Strategy |
|---------|----------|--------|---------------------|
| **@typermaid/codegen** | AST → Mermaid code | ✅ Complete | Integrate into `.asCode()` |
| **@typermaid/ast-tools** | AST manipulation | ✅ Complete | Extend AST classes |
| **@typermaid/parser** | Mermaid → AST | ✅ Complete | Add builder methods |
| **@typermaid/builders** | Manual construction | ✅ Just fixed | Merge into AST |

## 🎯 Phase 1: Enhanced AST (HIGH PRIORITY)

### Objective
Make Parser results directly buildable with integrated capabilities.

### Implementation Tasks

#### 1.1 Extend FlowchartDiagramAST 
**File**: `packages/parser/src/ast/flowchart.ts`

```typescript
import { FlowchartDiagramBuilder } from '@typermaid/builders';
import { generateFlowchart } from '@typermaid/codegen';
import { findNodes, replaceNodeById } from '@typermaid/ast-tools';

export class FlowchartDiagramAST extends FlowchartDiagramBuilder {
  // Existing AST properties
  type: 'FlowchartDiagram';
  direction: string;
  body: Array<FlowchartNodeAST | EdgeAST | SubgraphAST>;

  // Builder methods (from @typermaid/builders)
  addNode(id: string, shape: NodeShape, label: string): NodeID {
    // Implementation using existing builder logic
  }
  
  addEdge(from: NodeID, to: NodeID, type: EdgeType, label?: string): this {
    // Implementation using existing builder logic
  }

  // AST tools methods (from @typermaid/ast-tools)  
  findNodes(pattern: string): FlowchartNodeAST[] {
    return findNodes(this, pattern);
  }

  replaceNode(oldId: string, newId: string): this {
    return replaceNodeById(this, oldId, newId);
  }

  // Code generation (from @typermaid/codegen)
  asCode(): string {
    return generateFlowchart(this);
  }

  // Enhanced build method
  build(): FlowchartDiagram & { asCode(): string } {
    const diagram = super.build();
    return {
      ...diagram,
      asCode: () => generateFlowchart(this)
    };
  }
}
```

#### 1.2 Update Parser to Return Enhanced AST
**File**: `packages/parser/src/flowchart.ts`

```typescript
export function parseFlowchart(source: string): FlowchartDiagramAST {
  // Existing parsing logic
  const ast = existingParseLogic(source);
  
  // Return enhanced AST with builder capabilities
  return new FlowchartDiagramAST(ast);
}
```

#### 1.3 Add Dependencies
**File**: `packages/parser/package.json`

```json
{
  "dependencies": {
    "@typermaid/core": "workspace:*",
    "@typermaid/builders": "workspace:*",
    "@typermaid/codegen": "workspace:*", 
    "@typermaid/ast-tools": "workspace:*"
  }
}
```

#### 1.4 Create Tests
**File**: `packages/parser/tests/unified-api.test.ts`

```typescript
import { parseFlowchart } from '@typermaid/parser';

describe('Unified AST-Builder API', () => {
  test('should parse and extend with builder methods', () => {
    const ast = parseFlowchart(`
      flowchart TB
        start --> end
    `);
    
    // Builder capabilities
    const taskId = ast.addNode('task', 'square', 'Process');
    ast.addEdge('start', taskId, 'arrow');
    
    // AST manipulation
    const startNodes = ast.findNodes('start');
    expect(startNodes).toHaveLength(1);
    
    // Code generation
    const code = ast.asCode();
    expect(code).toContain('flowchart TB');
    expect(code).toContain('task[Process]');
    
    // Build diagram
    const diagram = ast.build();
    expect(diagram.asCode()).toBe(code);
  });
  
  test('roundtrip: parse → modify → generate → parse', () => {
    const original = `flowchart TB\n  A --> B`;
    const ast1 = parseFlowchart(original);
    
    ast1.addNode('C', 'square', 'New Node');
    ast1.addEdge('B', 'C', 'arrow');
    
    const modified = ast1.asCode();
    const ast2 = parseFlowchart(modified);
    
    expect(ast2.findNodes('C')).toHaveLength(1);
  });
});
```

## 🎯 Phase 2: Extend to All Diagram Types

### 2.1 Class Diagrams
- Extend `ClassDiagramAST` with builder methods from `ClassDiagramBuilder`
- Add `generateClass()` integration for `.asCode()`

### 2.2 Sequence Diagrams  
- Extend `SequenceDiagramAST` with builder methods from `SequenceDiagramBuilder`
- Add `generateSequence()` integration for `.asCode()`

### 2.3 State Diagrams
- Extend `StateDiagramAST` with builder methods from `StateDiagramBuilder`  
- Add `generateState()` integration for `.asCode()`

### 2.4 ER Diagrams
- Extend `ERDiagramAST` with builder methods from `ERDiagramBuilder`
- Add `generateER()` integration for `.asCode()`

### 2.5 Gantt Charts
- Extend `GanttDiagramAST` with builder methods from `GanttDiagramBuilder`
- Add `generateGantt()` integration for `.asCode()`

## 🎯 Phase 3: API Unification & Documentation

### 3.1 Update Main Entry Points
**File**: `packages/parser/src/index.ts`

```typescript
// Unified exports
export { parseFlowchart } from './flowchart.js';
export { parseClass } from './class.js';  
export { parseSequence } from './sequence.js';
export { parseState } from './state.js';
export { parseER } from './er.js';
export { parseGantt } from './gantt.js';

// Legacy exports (deprecated)
/** @deprecated Use parseFlowchart().build() instead */
export { FlowchartDiagramBuilder } from '@typermaid/builders';
```

### 3.2 Create Migration Guide
**File**: `MIGRATION.md`

### 3.3 Update README Examples

## 🎯 Phase 4: Advanced Features (Future)

### 4.1 Template Literal Support
```typescript
const ast = parseFlowchart`
  flowchart TB
    start --> ${condition} --> end
`;
```

### 4.2 IDE Integration Enhancement
- Auto-completion for existing node IDs
- Type inference for chained operations

### 4.3 Performance Optimization
- Lazy loading of heavy dependencies
- Builder method caching

## 🚧 Implementation Notes

### Breaking Changes
- ⚠️ This is a major API change
- Need careful migration strategy
- Consider semver major bump

### Compatibility Strategy
1. **Parallel APIs**: Keep old builders available
2. **Deprecation Warnings**: Add to old APIs  
3. **Migration Period**: 6 months before removal
4. **Documentation**: Clear migration examples

### Testing Strategy
1. **Unit Tests**: Each enhanced AST class
2. **Integration Tests**: Full workflow tests
3. **Roundtrip Tests**: parse → modify → generate → parse
4. **Performance Tests**: Ensure no regression

## 📅 Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 1** | 2-3 days | Enhanced FlowchartAST only |
| **Phase 2** | 1 week | All diagram types |  
| **Phase 3** | 2-3 days | Documentation & cleanup |
| **Phase 4** | Future | Advanced features |

**Total: ~2 weeks for core implementation**

---

Let's start with Phase 1! 🚀