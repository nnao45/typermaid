# lyric-js

A strict TypeScript framework for generating visual diagrams from text, inspired by mermaid-js.

## 🚀 Features

- **Type-Safe**: Built with TypeScript and Zod for runtime validation with `strict: true`
- **Extensible**: Plugin-based architecture for custom diagram types
- **Fast**: Optimized rendering engine
- **Modern**: ESM-first with full tree-shaking support

## 📦 Packages

This is a monorepo containing:

- `@typermaid/core` - Core schema and validation
- `@typermaid/parser` - Text DSL parser
- `@typermaid/renderer` - SVG rendering engine
- `@typermaid/cli` - Command-line interface

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

## 📝 Example

```typescript
import { validateDiagram } from '@typermaid/core';

const diagram = {
  id: 'my-flow',
  type: 'flowchart',
  nodes: [
    { id: 'start', type: 'start', label: 'Begin' },
    { id: 'process', type: 'process', label: 'Do Work' },
    { id: 'end', type: 'end', label: 'Finish' },
  ],
  edges: [
    { id: 'e1', from: 'start', to: 'process' },
    { id: 'e2', from: 'process', to: 'end' },
  ],
};

const validated = validateDiagram(diagram);
```

## 📄 License

MIT
