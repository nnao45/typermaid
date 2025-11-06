# @lyric-js/codegen

AST to Mermaid code generator. Converts parsed or transformed ASTs back to Mermaid diagram syntax.

## Features

✨ **Round-trip Support** - Parse → Transform → Generate → Mermaid code  
🔄 **All Diagram Types** - Flowchart, Sequence, State, Class, ER, Gantt  
🎯 **Type-safe** - Full TypeScript support with strict typing  
📝 **Readable Output** - Properly formatted and indented code  

## Installation

```bash
npm install @lyric-js/codegen
```

## Usage

### Basic Usage

```typescript
import { parse } from '@lyric-js/parser';
import { generateCode } from '@lyric-js/codegen';

// Parse Mermaid code
const ast = parse(`
flowchart LR
  A[Start] --> B[Process]
  B --> C[End]
`);

// Generate code from AST
const code = generateCode(ast);
console.log(code);
// Output:
// flowchart LR
//   A[Start] --> B[Process]
//   B --> C[End]
```

### Round-trip Transformation

Perfect for AST manipulation workflows:

```typescript
import { parse } from '@lyric-js/parser';
import { transformAST } from '@lyric-js/ast-tools';
import { generateCode } from '@lyric-js/codegen';

// 1. Parse
const ast = parse('flowchart LR\n  A --> B --> C');

// 2. Transform (uppercase all labels)
const transformed = transformAST(ast, {
  FlowchartNode: (node) => ({
    ...node,
    label: node.label.toUpperCase(),
  }),
});

// 3. Generate
const code = generateCode(transformed);
console.log(code);
// Output: flowchart LR
//   A[A] --> B[B] --> C[C]
```

### Individual Diagram Generators

For fine-grained control:

```typescript
import {
  generateFlowchart,
  generateSequence,
  generateState,
  generateClass,
  generateER,
  generateGantt,
} from '@lyric-js/codegen';

const flowchartCode = generateFlowchart(flowchartAST);
const sequenceCode = generateSequence(sequenceAST);
// etc.
```

## Complete Workflow Example

### Parse → Edit → Generate

```typescript
import { parse } from '@lyric-js/parser';
import { findNodes, transformAST } from '@lyric-js/ast-tools';
import { generateCode } from '@lyric-js/codegen';

const original = `
flowchart TD
  A[User Login] --> B{Auth?}
  B -->|Yes| C[Dashboard]
  B -->|No| D[Error]
`;

// Parse
const ast = parse(original);

// Find and modify specific node
const transformed = transformAST(ast, {
  FlowchartNode: (node) => {
    if (node.id === 'C') {
      return { ...node, label: 'Home Page' };
    }
    return node;
  },
});

// Generate updated code
const updated = generateCode(transformed);
console.log(updated);
// Output shows "Home Page" instead of "Dashboard"
```

### Merge Multiple Diagrams

```typescript
import { parse } from '@lyric-js/parser';
import { mergeDiagrams } from '@lyric-js/ast-tools';
import { generateCode } from '@lyric-js/codegen';

const diagram1 = parse('flowchart LR\n  A --> B').body[0];
const diagram2 = parse('flowchart LR\n  B --> C').body[0];

const merged = mergeDiagrams(diagram1, diagram2);
const code = generateCode({ type: 'Program', body: [merged] });

console.log(code);
// Output: flowchart LR
//   A --> B
//   B --> C
```

### Programmatic Diagram Modification

```typescript
import { parse } from '@lyric-js/parser';
import { cloneAST } from '@lyric-js/ast-tools';
import { generateCode } from '@lyric-js/codegen';

const ast = parse('sequenceDiagram\n  Alice->>Bob: Hello');
const clone = cloneAST(ast);

// Safely modify clone
const diagram = clone.body[0];
if (diagram.type === 'SequenceDiagram') {
  diagram.diagram.statements.push({
    type: 'message',
    from: 'Bob',
    to: 'Alice',
    message: 'Hi!',
    messageType: 'solid_arrow',
  });
}

const code = generateCode(clone);
console.log(code);
// Output includes both messages
```

## Supported Diagrams

### Flowchart

```typescript
const code = generateFlowchart({
  type: 'FlowchartDiagram',
  diagram: {
    direction: 'LR',
    body: [
      { type: 'node', id: 'A', shape: 'rectangle', label: 'Start' },
      { type: 'edge', from: 'A', to: 'B', edgeType: 'arrow' },
      { type: 'node', id: 'B', shape: 'rhombus', label: 'Decision' },
    ],
  },
});
// Output: flowchart LR
//   A[Start]
//   A --> B
//   B{Decision}
```

### Sequence Diagram

```typescript
const code = generateSequence({
  type: 'SequenceDiagram',
  diagram: {
    type: 'sequence',
    statements: [
      { type: 'participant', id: 'Alice', alias: 'A' },
      { type: 'participant', id: 'Bob', alias: 'B' },
      {
        type: 'message',
        from: 'Alice',
        to: 'Bob',
        message: 'Hello',
        messageType: 'solid_arrow',
      },
    ],
  },
});
// Output: sequenceDiagram
//   participant Alice as A
//   participant Bob as B
//   Alice->>Bob: Hello
```

### State Diagram

```typescript
const code = generateState({
  type: 'StateDiagram',
  diagram: {
    version: 'v2',
    states: [
      { id: '[*]' },
      { id: 'Idle', description: 'Waiting for input' },
      { id: 'Active', description: 'Processing' },
    ],
    transitions: [
      { from: '[*]', to: 'Idle' },
      { from: 'Idle', to: 'Active', label: 'start' },
    ],
  },
});
```

### Class Diagram

```typescript
const code = generateClass({
  type: 'ClassDiagram',
  diagram: {
    type: 'class',
    classes: [
      {
        id: 'User',
        name: 'User',
        members: [
          {
            type: 'attribute',
            name: 'name',
            returnType: 'String',
            visibility: '+',
          },
        ],
      },
    ],
    relations: [],
  },
});
```

### ER Diagram

```typescript
const code = generateER({
  type: 'ERDiagram',
  diagram: {
    type: 'er',
    entities: [
      {
        name: 'CUSTOMER',
        attributes: [
          { type: 'string', name: 'id', key: 'PK' },
          { type: 'string', name: 'name' },
        ],
      },
    ],
    relationships: [
      {
        from: 'CUSTOMER',
        to: 'ORDER',
        fromCardinality: 'EXACTLY_ONE',
        toCardinality: 'ZERO_OR_MORE',
        identification: 'IDENTIFYING',
        label: 'places',
      },
    ],
  },
});
```

### Gantt Chart

```typescript
const code = generateGantt({
  type: 'GanttDiagram',
  diagram: {
    type: 'gantt',
    title: 'Project Timeline',
    dateFormat: 'YYYY-MM-DD',
    sections: [
      {
        name: 'Development',
        tasks: [
          {
            name: 'Design',
            startDate: '2024-01-01',
            duration: '5d',
            status: 'done',
          },
        ],
      },
    ],
  },
});
```

## API Reference

### `generateCode(ast: ProgramAST): string`

Main function to generate Mermaid code from a complete AST.

### Individual Generators

- `generateFlowchart(ast: FlowchartDiagramAST): string`
- `generateSequence(ast: SequenceDiagramAST): string`
- `generateState(ast: StateDiagramAST): string`
- `generateClass(ast: ClassDiagramAST): string`
- `generateER(ast: ERDiagramAST): string`
- `generateGantt(ast: GanttDiagramAST): string`

## Use Cases

### 1. Diagram Transformation Pipeline

```typescript
// Parse → Transform → Generate
const pipeline = (code: string, transforms: TransformFunctions) => {
  const ast = parse(code);
  const transformed = transformAST(ast, transforms);
  return generateCode(transformed);
};

const result = pipeline('flowchart LR\n  a --> b', {
  FlowchartNode: (node) => ({ ...node, id: node.id.toUpperCase() }),
});
// Output: flowchart LR
//   A --> B
```

### 2. Diagram Validation & Formatting

```typescript
import { validateFlowchart } from '@lyric-js/ast-tools';

const validate = (code: string) => {
  const ast = parse(code);
  const diagram = ast.body[0];

  if (diagram.type === 'FlowchartDiagram') {
    const result = validateFlowchart(diagram);
    if (!result.valid) {
      throw new Error(`Invalid diagram: ${result.errors.join(', ')}`);
    }
  }

  // Re-generate for consistent formatting
  return generateCode(ast);
};
```

### 3. Diagram Migration

```typescript
// Convert v1 state diagrams to v2
const migrateStateV1toV2 = (code: string) => {
  const ast = parse(code);

  const migrated = transformAST(ast, {
    // Custom migration logic here
  });

  return generateCode(migrated);
};
```

## Type Safety

All generators are fully type-safe:

```typescript
import type { FlowchartDiagramAST } from '@lyric-js/parser';

const ast: FlowchartDiagramAST = {
  type: 'FlowchartDiagram',
  diagram: {
    direction: 'LR',
    body: [], // Type-checked!
  },
};

const code = generateFlowchart(ast); // ✅ Type-safe
```

## License

MIT

## Related Packages

- `@lyric-js/parser` - Mermaid parser (Code → AST)
- `@lyric-js/ast-tools` - AST manipulation tools
- `@lyric-js/builders` - Programmatic diagram builders
