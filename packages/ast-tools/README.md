# @typermaid/ast-tools

AST manipulation and transformation tools for Lyric.js. Provides powerful APIs for transforming, querying, and validating Mermaid diagram ASTs.

## Features

✨ **Visitor Pattern** - Transform ASTs with clean, composable visitors  
🔄 **Functional Transforms** - Immutable AST transformations with simple functions  
🔍 **Query API** - Find, filter, and search AST nodes  
✅ **Validation** - Detect dangling edges, undeclared participants, and more  
🛠️ **Utilities** - Clone, merge, and manipulate diagrams  

## Installation

```bash
npm install @typermaid/ast-tools
```

## Usage

### Visitor Pattern

Transform ASTs using the visitor pattern for complex transformations:

```typescript
import { parse } from '@typermaid/parser';
import { ASTTransformer, ASTVisitor } from '@typermaid/ast-tools';

const code = `
flowchart LR
  A[Start] --> B[Process] --> C[End]
`;

const ast = parse(code);

// Create a visitor
class UppercaseLabelsVisitor implements ASTVisitor {
  visitFlowchartNode(node) {
    return {
      ...node,
      label: node.label.toUpperCase(),
    };
  }
}

// Apply transformation
const transformer = new ASTTransformer();
transformer.addVisitor(new UppercaseLabelsVisitor());

const transformed = transformer.transform(ast.body[0]);
// All node labels are now uppercase: START, PROCESS, END
```

### Functional Transforms

Simple, functional API for quick transformations:

```typescript
import { transformAST } from '@typermaid/ast-tools';

const transformed = transformAST(ast, {
  FlowchartNode: (node) => ({
    ...node,
    label: node.label.toUpperCase(),
  }),
  Edge: (edge) => ({
    ...edge,
    label: edge.label?.toLowerCase(),
  }),
});
```

### Remove Nodes

Remove nodes and connected edges:

```typescript
import { removeNode } from '@typermaid/ast-tools';

const updated = removeNode(ast, 'B');
// Node 'B' and all edges connected to it are removed
```

### Find Nodes

Query AST for specific node types:

```typescript
import { findNodes } from '@typermaid/ast-tools';

const nodes = findNodes(ast, 'Node');
console.log(nodes); // All FlowchartNode nodes

const edges = findNodes(ast, 'Edge');
console.log(edges); // All Edge nodes
```

### Replace Nodes

Update nodes by ID or name:

```typescript
import { replaceNodeById, replaceNodeByName } from '@typermaid/ast-tools';

// Replace by ID (for flowchart nodes, participants, states)
const updated = replaceNodeById(ast, 'A', {
  label: 'Updated Label',
});

// Replace by name (for classes, entities)
const updated2 = replaceNodeByName(ast, 'User', {
  members: [...newMembers],
});
```

### Clone & Merge

Clone and merge diagrams:

```typescript
import { cloneAST, mergeDiagrams } from '@typermaid/ast-tools';

// Deep clone
const clone = cloneAST(ast);

// Merge two diagrams of the same type
const diagram1 = parse('flowchart LR\n  A --> B').body[0];
const diagram2 = parse('flowchart LR\n  B --> C').body[0];
const merged = mergeDiagrams(diagram1, diagram2);
// Result: A --> B --> C (with duplicate B nodes)
```

### Validation

Validate diagrams for common errors:

```typescript
import {
  validateFlowchart,
  validateSequence,
  validateState,
} from '@typermaid/ast-tools';

const result = validateFlowchart(diagram);

if (!result.valid) {
  console.error('Errors:', result.errors);
  // e.g., "Edge references non-existent node: X"
}

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
  // e.g., "Orphan node detected: Y"
}
```

## API Reference

### Visitor Pattern

#### `ASTVisitor`

Interface for implementing AST visitors. Implement any or all methods:

```typescript
interface ASTVisitor {
  // Flowchart
  visitFlowchartDiagram?(node: FlowchartDiagramAST): FlowchartDiagramAST;
  visitFlowchartNode?(node: FlowchartNodeAST): FlowchartNodeAST;
  visitEdge?(node: EdgeAST): EdgeAST;
  visitSubgraph?(node: SubgraphAST): SubgraphAST;

  // Sequence
  visitSequenceDiagram?(node: SequenceDiagramAST): SequenceDiagramAST;
  visitParticipant?(node: ParticipantAST): ParticipantAST;
  visitMessage?(node: MessageAST): MessageAST;
  visitNote?(node: NoteAST): NoteAST;

  // State
  visitStateDiagram?(node: StateDiagramAST): StateDiagramAST;
  visitState?(node: StateAST): StateAST;
  visitTransition?(node: TransitionAST): TransitionAST;

  // Class
  visitClassDiagram?(node: ClassDiagramAST): ClassDiagramAST;
  visitClass?(node: ClassAST): ClassAST;
  visitRelationship?(node: RelationshipAST): RelationshipAST;

  // ER
  visitERDiagram?(node: ERDiagramAST): ERDiagramAST;
  visitEntity?(node: EntityAST): EntityAST;
  visitERRelationship?(node: ERRelationshipAST): ERRelationshipAST;

  // Gantt
  visitGanttDiagram?(node: GanttDiagramAST): GanttDiagramAST;
  visitGanttTask?(node: GanttTaskAST): GanttTaskAST;
}
```

#### `ASTTransformer`

```typescript
class ASTTransformer {
  addVisitor(visitor: ASTVisitor): this;
  transform<T>(ast: T): T;
}
```

### Functional Transforms

#### `transformAST(ast, transforms)`

Transform AST with function-based API. Return `null` to remove nodes.

```typescript
transformAST(ast, {
  FlowchartNode: (node) => ({ ...node, label: 'New Label' }),
  Edge: (edge) => (edge.label ? edge : null), // Remove edges without labels
});
```

#### `findNodes(ast, type)`

Find all nodes of a specific type.

#### `replaceNodeById(ast, id, newNode)`

Replace node by ID (for nodes with `id` property).

#### `replaceNodeByName(ast, name, newNode)`

Replace node by name (for nodes with `name` property).

### Utilities

#### `cloneAST(ast)`

Deep clone an AST (no shared references).

#### `mergeDiagrams(diagram1, diagram2)`

Merge two diagrams of the same type.

#### `removeNode(ast, nodeId)`

Remove node by ID and all connected edges/messages/transitions.

#### `getAllNodeIds(diagram)`

Get all node IDs from a flowchart diagram.

#### `getAllParticipantIds(diagram)`

Get all participant IDs from a sequence diagram.

#### `getAllStateIds(diagram)`

Get all state IDs from a state diagram.

#### `validateFlowchart(diagram)`

Validate flowchart diagram. Returns:

```typescript
{
  valid: boolean;
  errors: string[];    // Dangling edges, etc.
  warnings: string[];  // Orphan nodes, etc.
}
```

#### `validateSequence(diagram)`

Validate sequence diagram (undeclared participants, etc.).

#### `validateState(diagram)`

Validate state diagram (dangling transitions, etc.).

## Examples

### Complex Transformation with Multiple Visitors

```typescript
import { ASTTransformer, ASTVisitor } from '@typermaid/ast-tools';

class UppercaseVisitor implements ASTVisitor {
  visitFlowchartNode(node) {
    return { ...node, label: node.label.toUpperCase() };
  }
}

class PrefixVisitor implements ASTVisitor {
  visitFlowchartNode(node) {
    return { ...node, label: `[${node.label}]` };
  }
}

const transformer = new ASTTransformer();
transformer
  .addVisitor(new UppercaseVisitor())
  .addVisitor(new PrefixVisitor());

const transformed = transformer.transform(ast);
// Labels: [START], [PROCESS], [END]
```

### Static Analysis - Find All Orphan Nodes

```typescript
import { getAllNodeIds, findNodes } from '@typermaid/ast-tools';

const nodeIds = new Set(getAllNodeIds(diagram));
const edges = findNodes(diagram, 'Edge');

const connectedNodes = new Set();
for (const edge of edges) {
  connectedNodes.add(edge.from);
  connectedNodes.add(edge.to);
}

const orphanNodes = [...nodeIds].filter((id) => !connectedNodes.has(id));
console.log('Orphan nodes:', orphanNodes);
```

### Remove All Edges Without Labels

```typescript
import { transformAST } from '@typermaid/ast-tools';

const cleaned = transformAST(ast, {
  Edge: (edge) => (edge.label ? edge : null),
});
```

## Type Safety

All APIs are fully type-safe with TypeScript strict mode:

- ✅ No `any` types
- ✅ Strict null checks
- ✅ Discriminated unions for AST node types
- ✅ Full IDE autocomplete

## License

MIT

## Related Packages

- `@typermaid/parser` - Mermaid parser
- `@typermaid/builders` - Type-safe diagram builders
- `@typermaid/react-renderer` - React renderer
- `@typermaid/angular-renderer` - Angular renderer
