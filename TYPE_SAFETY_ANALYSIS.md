# 🔍 Type-Safety問題の調査と修正計画

## 📋 調査結果サマリー

type-safeを謳っているのに、実際にはいくつかの重大な型安全性の問題が発見されたわ💦

## 🚨 発見された問題点

### 1. **Branded TypeとZod Schemaの二重定義と不一致** ⚠️⚠️⚠️

#### 問題箇所A: `packages/core/src/schemas/branded.ts`
```typescript
export type NodeID = string & { readonly __brand: 'NodeID' };
export type ParticipantID = string & { readonly __brand: 'ParticipantID' };
// ... 他にも多数

export function nodeId(id: string): NodeID {
  return id as NodeID;  // ❌ 単なる型アサーション！
}
```

#### 問題箇所B: `packages/builders/src/types.ts`
```typescript
export type NodeID = string & { readonly __brand: 'NodeID' };
export type ParticipantID = string & { readonly __brand: 'ParticipantID' };
// ... 同じ定義が重複！

export function brandID<T extends string>(id: string): T {
  return id as T;  // ❌ 単なる型アサーション！
}
```

**問題点:**
- Branded Typeの定義が2箇所にある（coreとbuilders）
- どちらも実行時のバリデーションが一切ない
- `as` でキャストしているだけで型安全性は compile-time のみ

### 2. **Zod SchemaでBranded Typeを使っていない** ⚠️⚠️⚠️

#### `packages/core/src/schemas/flowchart.ts`
```typescript
export const FlowchartNodeSchema = z.object({
  id: z.string().min(1),  // ❌ 普通のstringのまま！NodeIDじゃない
  shape: NodeShapeSchema,
  label: z.string(),
  // ...
});

export const FlowchartEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),  // ❌ NodeIDであるべき
  to: z.string().min(1),    // ❌ NodeIDであるべき
  type: EdgeTypeSchema,
  // ...
});
```

#### `packages/core/src/schemas/sequence.ts`
```typescript
export const Message = z.object({
  type: z.literal('message'),
  from: z.string().min(1),  // ❌ ParticipantIDであるべき
  to: z.string().min(1),    // ❌ ParticipantIDであるべき
  arrowType: ArrowType,
  // ...
});
```

#### `packages/core/src/schemas/class.ts`
```typescript
export const ClassDefinition = z.object({
  id: z.string(),  // ❌ ClassIDであるべき
  // ...
});

export const ClassRelation = z.object({
  from: z.string(),  // ❌ ClassIDであるべき
  to: z.string(),    // ❌ ClassIDであるべき
  // ...
});
```

#### `packages/core/src/schemas/state.ts`
```typescript
export const StateSchema: z.ZodType<State> = z.object({
  id: z.string(),  // ❌ StateIDであるべき
  // ...
});

export const StateTransitionSchema = z.object({
  from: z.string(),  // ❌ StateIDであるべき
  to: z.string(),    // ❌ StateIDであるべき
  // ...
});
```

#### `packages/core/src/schemas/er.ts`
```typescript
export const EREntity = z.object({
  name: z.string(),  // ❌ EntityIDであるべき？
  // ...
});

export const ERRelationship = z.object({
  from: z.string(),  // ❌ EntityIDであるべき
  to: z.string(),    // ❌ EntityIDであるべき
  // ...
});
```

**問題点:**
- Zodスキーマでは全部 `z.string()` を使っている
- Branded Typeは型定義にしか存在しない
- 実行時にはただのstringとして扱われる
- IDの相互参照チェックがZodレベルで行われていない

### 3. **BuilderとSchemaの型の断絶** ⚠️⚠️

#### `packages/builders/src/flowchart-builder.ts`
```typescript
addEdge(from: NodeID, to: NodeID, type: EdgeType, label?: string): this {
  // ...
  const edge: FlowchartEdge = {
    id: `edge-${this.edgeCount++}`,
    from: from as string,  // ❌ Branded TypeをstringにキャストしてSchemaに渡す
    to: to as string,      // ❌ せっかくのBranded Typeが台無し
    type,
    label,
  };
  // ...
}
```

**問題点:**
- Builderでは `NodeID` (Branded Type)
- Schemaでは `z.string()`
- 間で `as string` キャストして型安全性を捨てている

### 4. **AST Converterでの型安全性の欠如** ⚠️

#### `packages/renderer-core/src/utils/ast-converter.ts`
```typescript
const node = stmt as unknown as { id: string; shape: string; label: string };
// ❌ unknown経由の強制キャスト

processStatements((stmt as unknown as { body: unknown[] }).body);
// ❌ unknown経由の強制キャスト
```

**問題点:**
- ASTからSchemaへの変換で `as unknown as` を多用
- 型安全性が完全に失われている

### 5. **schema.ts の存在意義が不明** ⚠️

#### `packages/core/src/schema.ts`
```typescript
export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['start', 'end', 'process', 'decision', 'input', 'output']),
  label: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const DiagramSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['flowchart', 'sequence', 'class', 'er', 'gantt']),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  // ...
});
```

**問題点:**
- `schema.ts` と `schemas/flowchart.ts` で定義が重複
- どちらを使うべきか不明
- 実際には `schemas/flowchart.ts` が使われている模様
- `schema.ts` は legacy コード？

## 🎯 修正計画

### Phase 1: Branded Type と Zod の統合 🔧

#### 1.1 Zod Brand機能を使った型定義の修正
```typescript
// packages/core/src/schemas/branded.ts
import { z } from 'zod';

// Zodのbrand機能を使う
export const NodeIDSchema = z.string().min(1).brand<'NodeID'>();
export type NodeID = z.infer<typeof NodeIDSchema>;

export const ParticipantIDSchema = z.string().min(1).brand<'ParticipantID'>();
export type ParticipantID = z.infer<typeof ParticipantIDSchema>;

export const StateIDSchema = z.string().min(1).brand<'StateID'>();
export type StateID = z.infer<typeof StateIDSchema>;

export const EntityIDSchema = z.string().min(1).brand<'EntityID'>();
export type EntityID = z.infer<typeof EntityIDSchema>;

export const ClassIDSchema = z.string().min(1).brand<'ClassID'>();
export type ClassID = z.infer<typeof ClassIDSchema>;

export const TaskIDSchema = z.string().min(1).brand<'TaskID'>();
export type TaskID = z.infer<typeof TaskIDSchema>;
```

#### 1.2 各Diagramスキーマでの使用
```typescript
// packages/core/src/schemas/flowchart.ts
import { NodeIDSchema } from './branded.js';

export const FlowchartNodeSchema = z.object({
  id: NodeIDSchema,  // ✅ Branded Type
  shape: NodeShapeSchema,
  label: z.string(),
  style: StyleSchema.optional(),
  classes: z.array(z.string()).optional(),
});

export const FlowchartEdgeSchema = z.object({
  id: z.string().min(1),
  from: NodeIDSchema,  // ✅ Branded Type
  to: NodeIDSchema,    // ✅ Branded Type
  type: EdgeTypeSchema,
  label: z.string().optional(),
  style: StyleSchema.optional(),
  length: z.number().int().positive().optional(),
});
```

### Phase 2: Builderの型定義を一元化 🔧

#### 2.1 builders/src/types.ts の削除
- Branded Typeの定義を削除
- `@typermaid/core` からインポートするように変更

```typescript
// packages/builders/src/flowchart-builder.ts
import type { NodeID, ClassDefID, SubgraphID } from '@typermaid/core';
```

#### 2.2 brandID関数の削除
- `brandID<T>()` 関数を削除
- Zodのparse/safeParseを使うように変更

```typescript
// Before ❌
const nodeId = brandID<NodeID>(id);

// After ✅
const nodeId = NodeIDSchema.parse(id);
```

### Phase 3: Builder build()メソッドの修正 🔧

#### 3.1 型キャストの削除
```typescript
// Before ❌
const edge: FlowchartEdge = {
  id: `edge-${this.edgeCount++}`,
  from: from as string,
  to: to as string,
  type,
  label,
};

// After ✅
const edge: FlowchartEdge = {
  id: `edge-${this.edgeCount++}`,
  from,  // そのままNodeIDとして使える
  to,
  type,
  label,
};
```

### Phase 4: AST Converterの型安全化 🔧

#### 4.1 unknown型キャストの排除
```typescript
// Before ❌
const node = stmt as unknown as { id: string; shape: string; label: string };

// After ✅
import type { FlowchartNodeAST } from '@typermaid/parser';

function isFlowchartNodeAST(stmt: unknown): stmt is FlowchartNodeAST {
  return (stmt as { type: string }).type === 'Node';
}

if (isFlowchartNodeAST(stmt)) {
  nodeMap.set(stmt.id, {
    id: NodeIDSchema.parse(stmt.id),
    shape: stmt.shape,
    label: stmt.label || stmt.id,
  });
}
```

### Phase 5: schema.ts の整理 🔧

#### 5.1 重複定義の削除
- `packages/core/src/schema.ts` の削除または deprecate
- 全てのコードを `schemas/` 以下の個別スキーマに移行

### Phase 6: テストの追加 ✅

#### 6.1 Branded Typeの型安全性テスト
```typescript
it('should not allow mixing different branded IDs', () => {
  const builder = new FlowchartDiagramBuilder();
  const nodeId = builder.addNode('A', 'square', 'Node');
  
  const seqBuilder = new SequenceDiagramBuilder();
  const participantId = seqBuilder.addParticipant('Alice');
  
  // @ts-expect-error - 異なるBranded Typeは混在できない
  builder.addEdge(nodeId, participantId, 'arrow');
});
```

#### 6.2 実行時バリデーションのテスト
```typescript
it('should validate ID format at runtime', () => {
  expect(() => {
    NodeIDSchema.parse('123invalid');
  }).toThrow();
  
  expect(() => {
    NodeIDSchema.parse('valid_id');
  }).not.toThrow();
});
```

## 📊 影響範囲

### 修正が必要なファイル

#### Core Package
- ✅ `packages/core/src/schemas/branded.ts` - Zod brand使用に書き換え
- ✅ `packages/core/src/schemas/flowchart.ts` - IDフィールドをBranded Typeに
- ✅ `packages/core/src/schemas/sequence.ts` - IDフィールドをBranded Typeに
- ✅ `packages/core/src/schemas/class.ts` - IDフィールドをBranded Typeに
- ✅ `packages/core/src/schemas/state.ts` - IDフィールドをBranded Typeに
- ✅ `packages/core/src/schemas/er.ts` - IDフィールドをBranded Typeに
- ✅ `packages/core/src/schemas/gantt.ts` - IDフィールドをBranded Typeに
- ⚠️ `packages/core/src/schema.ts` - 削除または deprecate
- ✅ `packages/core/src/index.ts` - エクスポートの整理

#### Builders Package
- ✅ `packages/builders/src/types.ts` - Branded Type定義を削除、coreから import
- ✅ `packages/builders/src/flowchart-builder.ts` - brandID削除、型キャスト削除
- ✅ `packages/builders/src/sequence-builder.ts` - brandID削除、型キャスト削除
- ✅ `packages/builders/src/class-builder.ts` - brandID削除、型キャスト削除
- ✅ `packages/builders/src/state-builder.ts` - brandID削除、型キャスト削除
- ✅ `packages/builders/src/er-builder.ts` - brandID削除、型キャスト削除
- ✅ `packages/builders/src/gantt-builder.ts` - brandID削除、型キャスト削除

#### Renderer-Core Package
- ✅ `packages/renderer-core/src/utils/ast-converter.ts` - unknown型キャストの削除

#### Tests
- ✅ 全てのテストファイル - 型の変更に対応

## ⚡ 実装順序

1. **Step 1**: `packages/core/src/schemas/branded.ts` の書き換え
2. **Step 2**: 各diagramスキーマ (`flowchart.ts`, `sequence.ts`など) の修正
3. **Step 3**: `packages/builders/src/types.ts` の整理
4. **Step 4**: 各builder classの修正
5. **Step 5**: AST converterの修正
6. **Step 6**: テストの修正と追加
7. **Step 7**: ビルド & テスト実行
8. **Step 8**: `schema.ts` の削除

## 🎬 結論

現状、type-safeを謳っているものの、実際には：
- ❌ Branded Typeは compile-time のみで runtime validation なし
- ❌ Zodスキーマは普通の `z.string()` を使っている
- ❌ BuilderとSchemaの間で型キャストが発生
- ❌ AST変換で `as unknown as` を多用

**真の型安全性を実現するには、Zodのbrand機能を活用して compile-time と runtime 両方で型を保証する必要があるわ💪✨**
