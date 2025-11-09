# 🎯 Type-Safety & Unified API改善計画 ✨

## 📋 現状の調査結果

### ✅ すでに実装されてる機能
- 🎉 **Enhanced AST Classes**: Parser結果にbuilder機能が統合済み！
- 🎉 **asCode() Method**: 全diagram typeでdiagram→code変換が実装済み！  
- 🎉 **Unified API Test**: 期待されるAPIの動作テストが書かれてる！
- 🎉 **Code Generation**: `@typermaid/codegen`パッケージで各diagram形式の変換が完了！

### ❌ 現在の問題点
- 💥 **Type-Safety崩壊**: `as any` が78箇所も使われてる
- 💥 **Branded Type未活用**: Zodのbrand機能を使わずに `as T` でキャスト
- 💥 **重複定義**: core/buildersで同じBranded Typeを定義  
- 💥 **Import地獄**: 複数パッケージからimportが必要

## 🔧 修正フェーズ

### Phase 1: Type-Safety基盤の修正 🛠️
*最優先！`as any` を全撲滅するわよ〜💪*

#### 1.1 Zod Branded IDの導入 ✨
```typescript
// packages/core/src/schemas/branded.ts
import { z } from 'zod';

// Zod brandでcompile-time & runtime両方で型安全に！
export const NodeIDSchema = z.string().min(1).brand<'NodeID'>();
export type NodeID = z.infer<typeof NodeIDSchema>;

export const ParticipantIDSchema = z.string().min(1).brand<'ParticipantID'>();  
export type ParticipantID = z.infer<typeof ParticipantIDSchema>;

export const ClassIDSchema = z.string().min(1).brand<'ClassID'>();
export type ClassID = z.infer<typeof ClassIDSchema>;

export const StateIDSchema = z.string().min(1).brand<'StateID'>();
export type StateID = z.infer<typeof StateIDSchema>;

export const EntityIDSchema = z.string().min(1).brand<'EntityID'>();
export type EntityID = z.infer<typeof EntityIDSchema>;

export const TaskIDSchema = z.string().min(1).brand<'TaskID'>();
export type TaskID = z.infer<typeof TaskIDSchema>;
```

#### 1.2 各Schema定義の修正 📝
```typescript
// packages/core/src/schemas/flowchart.ts
import { NodeIDSchema } from './branded.js';

export const FlowchartNodeSchema = z.object({
  id: NodeIDSchema,          // ✅ Branded Type！
  shape: NodeShapeSchema,
  label: z.string(),
  // ...
});

export const FlowchartEdgeSchema = z.object({
  id: z.string().min(1),
  from: NodeIDSchema,        // ✅ Branded Type！  
  to: NodeIDSchema,          // ✅ Branded Type！
  type: EdgeTypeSchema,
  // ...
});
```

#### 1.3 Builderの型定義削除 🗑️
```typescript
// packages/builders/src/types.ts - この内容を削除
// ❌ export type NodeID = string & { readonly __brand: 'NodeID' };
// ❌ export function brandID<T extends string>(id: string): T { return id as T; }

// packages/builders/src/flowchart-builder.ts
import type { NodeID, ClassDefID, SubgraphID } from '@typermaid/core'; // ✅ coreから import
```

### Phase 2: Enhanced AST の型安全化 💪
*`as any` を型安全なtype guardで置き換えるわ〜*

#### 2.1 Proper Type Guards 🛡️
```typescript
// packages/parser/src/ast/enhanced-flowchart.ts

// ❌ Before
const enhanced = ast as EnhancedFlowchartDiagramAST;

// ✅ After  
function isFlowchartNodeAST(item: unknown): item is FlowchartNodeAST {
  return typeof item === 'object' && item !== null && 
         (item as { type: string }).type === 'Node';
}

function isEdgeAST(item: unknown): item is EdgeAST {
  return typeof item === 'object' && item !== null &&
         (item as { type: string }).type === 'Edge';  
}
```

#### 2.2 AST Tools Integration修正 🔧
```typescript
// packages/parser/src/ast/enhanced-*.ts

// ❌ Before  
findNodes(this as any, 'Node')
replaceNodeById(this as any, oldId, { id: newId } as any)
removeNode(this as any, nodeId)
cloneAST(this as any)

// ✅ After - proper typing
findNodes<FlowchartNodeAST>(this, 'Node')  
replaceNodeById<FlowchartDiagramAST>(this, oldId, { id: newId })
removeNode<FlowchartDiagramAST>(this, nodeId) 
cloneAST<FlowchartDiagramAST>(this)
```

### Phase 3: Import問題の解決 📦
*1回のimportで全て完結させるわ〜*

#### 3.1 Core Re-export構成 📤
```typescript
// packages/core/src/index.ts
// Parser functions  
export { parseFlowchart, parseSequence, parseClass, parseState, parseER, parseGantt } from '@typermaid/parser';

// Validation
export { validateDiagram } from './validation.js';

// Types (すでにexportされてる)
export type * from './types/index.js';
export type * from './schemas/branded.js';
```

#### 3.2 理想的なユーザー体験 🌟
```typescript
// ✨ これだけでOK！
import { parseFlowchart, validateDiagram } from '@typermaid/core';

const source = `flowchart TB
  start((Start)) --> task[Process]  
  task --> end((Finish))`;

// Parse + Builder + CodeGen すべてが統合！
const ast = parseFlowchart(source);
const start = ast.addNode('start2', 'round', 'Start2');  
const end = ast.addNode('end2', 'double_circle', 'End2');
ast.addEdge(start, end, 'arrow');

const diagram = ast.build();
const safeDiagram = validateDiagram(diagram);

// Diagram → Code変換  
const code = safeDiagram.asCode();
console.log(code); // Mermaidテキストが出力される！
```

### Phase 4: Backward Compatibility 🔄
*既存コードを壊さないように移行期間を設けるわ〜*

```typescript  
// packages/builders/src/index.ts
/**
 * @deprecated Use parseFlowchart() from @typermaid/core instead.
 * This will be removed in v1.0.0
 */  
export class FlowchartDiagramBuilder {
  // 既存実装は残すけど deprecation warning
}
```

## 📋 実装チェックリスト

### Phase 1: Type-Safety基盤 ✅
- [ ] **1.1**: `packages/core/src/schemas/branded.ts` をZod brand使用に書き換え
- [ ] **1.2**: 各diagramスキーマ (`flowchart.ts`, `sequence.ts`, `class.ts`, `state.ts`, `er.ts`, `gantt.ts`) でBranded IDを使用
- [ ] **1.3**: `packages/builders/src/types.ts` の重複Branded Type定義を削除  
- [ ] **1.4**: 各builder classで `brandID()` 削除、`@typermaid/core` からimport
- [ ] **1.5**: Builderで `as string` 型キャストを削除
- [ ] **1.6**: lint & test 実行

### Phase 2: Enhanced AST型安全化 💪  
- [ ] **2.1**: `packages/parser/src/ast/enhanced-*.ts` でtype guardを実装
- [ ] **2.2**: `as any` をtype guardまたは適切な型定義で置き換え (78箇所)
- [ ] **2.3**: AST Tools integration部分の型定義修正
- [ ] **2.4**: lint & test 実行

### Phase 3: Import構成改善 📦
- [ ] **3.1**: `packages/core/src/index.ts` でparser functionsをre-export
- [ ] **3.2**: ドキュメント・サンプルコードを新しいAPI形式に更新  
- [ ] **3.3**: lint & test 実行

### Phase 4: Legacy対応 🔄
- [ ] **4.1**: 既存API classにdeprecation warningを追加
- [ ] **4.2**: 移行ガイドをREADMEに記載
- [ ] **4.3**: final lint & test 実行

## 🎯 成功指標

### Type-Safety強化 💪  
- ✅ `as any` が0個になる (現在78個 → 0個)
- ✅ Zod brandでruntime validationが有効
- ✅ compile-time型エラーが適切に動作  
- ✅ 異なるdiagram間でIDを混在させるとコンパイルエラー

### API改善 ✨
- ✅ `import { parseFlowchart, validateDiagram } from '@typermaid/core';` だけでOK
- ✅ `ast.build().asCode()` でMermaidテキスト生成
- ✅ 直感的で一貫性のあるAPI設計

### 開発体験 🚀
- ✅ lint & test すべてパス
- ✅ コード補完が効く
- ✅ 分かりやすいエラーメッセージ

---

**よっしゃ〜💕 Phase 1から順番にがちがちに修正していくわよ〜！Type-safeなMermaidライブラリを完成させるわ✨**