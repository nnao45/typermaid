# 🎯 TypermaidのUnified API改善計画 (Updated: 2024-11-08)

**🚨 現在の緊急事態:** テストが26個も失敗してるわよ！まず基本動作を回復させましょう💥

## 💡 現在のAPIの問題点と改善案

### ❌ 現在のAPI (複雑すぎるわ...)
```typescript
import { FlowchartDiagramBuilder } from '@typermaid/builders';
import { validateDiagram } from '@typermaid/core';
import { astToSchema } from '@typermaid/renderer-core';
import { parseFlowchart } from '@typermaid/parser';

const source = `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`;

// Parse Mermaid text into a typed AST
const ast = parseFlowchart(source);

// Convert AST into a builder-friendly schema object
const diagramFromText = astToSchema(ast);

// Or build diagrams by hand with branded IDs
const builder = new FlowchartDiagramBuilder();
const start = builder.addNode('start', 'round', 'Start');
const task = builder.addNode('task', 'square', 'Process');
const end = builder.addNode('end', 'double_circle', 'Finish');

builder.addEdge(start, task, 'arrow');
builder.addEdge(task, end, 'arrow');

const diagramFromBuilder = builder.build();

// Final validation before rendering
const safeDiagram = validateDiagram(diagramFromBuilder);
```

### ✅ 提案されたAPI (シンプル & 直感的！)
```typescript
import { validateDiagram } from '@typermaid/core';
import { parseFlowchart } from '@typermaid/parser';

const source = `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`;

// Parse Mermaid text into a typed AST (that has builder capabilities!)
const ast = parseFlowchart(source);
const start = ast.addNode('start', 'round', 'Start');
const task = ast.addNode('task', 'square', 'Process');
const end = ast.addNode('end', 'double_circle', 'Finish');

ast.addEdge(start, task, 'arrow');
ast.addEdge(task, end, 'arrow');

// 🔥 IMPROVED: 不要なbuild()を削除！
// const diagramFromBuilder = ast.build(); // ❌ これいらん！

// 🚀 DIRECT: ASTを直接code生成 → validation
const code = ast.asCode(); // 直接コード生成！
const safeDiagram = validateDiagram(ast); // AST直接受け入れ！

/**
 * Generated code:
 * `
flowchart TB
  start((Start)) --> task[Process]
  task --> end((Finish))
`
 */
```

## 🔧 実装フェーズ

### 🚨 Phase 0: 緊急インフラ修復 
*今すぐ修正が必要！*

#### 0.1 重大なImport問題
**問題:** `Cannot find module './class-builder.js'`
- [ ] `packages/builders/src/class-builder.ts` 存在確認
- [ ] ビルドエラー修正
- [ ] 全Builder export確認

#### 0.2 循環依存地獄
**問題:** パッケージ間での循環依存
- [ ] Enhanced AST → Builders 依存の解消
- [ ] ast-tools依存の一時的無効化完了
- [ ] 依存関係グラフのクリーンアップ

#### 0.3 テスト修復
**問題:** 26個のテストファイルが失敗
- [ ] 基本Builderテスト復旧
- [ ] Core機能テスト確認
- [ ] Enhanced ASTテスト修正

### Phase 1: Type-Safety基盤の修正 🛠️
*既存のTYPE_SAFETY_ANALYSIS.mdの通りに実装*

#### 1.1 Zod Brand機能導入
- [ ] `packages/core/src/schemas/branded.ts` → Zod brand使用に書き換え
- [ ] 各diagramスキーマでBranded IDを使用
- [ ] builders packageから重複するBranded Type定義を削除

#### 1.2 型キャストの排除
- [ ] Builder classで `as string` キャストを削除
- [ ] AST Converterで `as unknown as` を削除

### Phase 2: Parser結果にBuilder機能を統合 🔄

#### 2.1 Parser結果の拡張
```typescript
// packages/parser/src/types/flowchart.ts
export interface FlowchartAST extends FlowchartDiagramBuilder {
  // 既存のASTプロパティ
  type: 'flowchart';
  nodes: FlowchartNodeAST[];
  edges: FlowchartEdgeAST[];
  
  // Builder機能を継承
  addNode(id: string, shape: NodeShape, label: string): NodeID;
  addEdge(from: NodeID, to: NodeID, type: EdgeType, label?: string): this;
  build(): FlowchartDiagram;
}
```

#### 2.2 parseFlowchartの戻り値変更
```typescript
// packages/parser/src/parsers/flowchart.ts
export function parseFlowchart(source: string): FlowchartAST {
  const ast = parseWithPegJS(source);
  
  // ASTにBuilder機能をmixin
  return Object.assign(ast, new FlowchartDiagramBuilder(ast));
}
```

### Phase 3: Diagram→Code変換の統合 📝

#### 3.1 既存のcode変換機能調査
- [ ] 既存実装の確認: `packages/renderer/` 等
- [ ] diagram→mermaid text変換の統合場所決定

#### 3.2 asCode()メソッドの追加
```typescript
// packages/core/src/types/diagram.ts
export interface Diagram {
  id: string;
  type: DiagramType;
  
  // 新機能: diagram→code変換
  asCode(): string;
}
```

#### 3.3 各Diagramでの実装
- [ ] FlowchartDiagram.asCode()
- [ ] SequenceDiagram.asCode()
- [ ] ClassDiagram.asCode()
- [ ] StateDiagram.asCode()
- [ ] ERDiagram.asCode()
- [ ] GanttDiagram.asCode()

### Phase 4: Import問題の解決 📦

#### 4.1 パッケージ依存関係の整理
```typescript
// 理想的なimport構成
import { parseFlowchart, parseSequence } from '@typermaid/parser';
import { validateDiagram } from '@typermaid/core';

// これだけでOK！
```

#### 4.2 re-export構成の見直し
- [ ] `@typermaid/core`で主要機能を re-export
- [ ] `@typermaid/parser`で各parser + unified builder機能を提供

### Phase 5: Backward Compatibility 🔄

#### 5.1 既存APIの deprecation
```typescript
// packages/builders/src/index.ts
/**
 * @deprecated Use parseFlowchart() from @typermaid/parser instead
 */
export class FlowchartDiagramBuilder {
  // 既存実装を保持しつつ deprecation warning
}
```

#### 5.2 移行ガイド
- [ ] README.mdに移行例を追加
- [ ] 既存のサンプルコードを更新

## 📋 実装チェックリスト

### Phase 1: Type-Safety基盤 ✅
- [ ] 1.1 Branded TypeとZodの統合
- [ ] 1.2 型キャストの排除  
- [ ] 1.3 テストの修正
- [ ] 1.4 lint & test通過確認

### Phase 2: Unified Parser API 🔄
- [ ] 2.1 FlowchartAST型定義拡張
- [ ] 2.2 parseFlowchartの実装変更
- [ ] 2.3 他のparser関数も同様に修正
- [ ] 2.4 テスト追加
- [ ] 2.5 lint & test通過確認

### Phase 3: asCode()機能 📝
- [ ] 3.1 既存code変換機能の調査
- [ ] 3.2 DiagramベースクラスへのasCode()追加
- [ ] 3.3 各diagram型での実装
- [ ] 3.4 テスト追加
- [ ] 3.5 lint & test通過確認

### Phase 4: Import整理 📦
- [ ] 4.1 パッケージ依存関係見直し
- [ ] 4.2 re-export構成変更
- [ ] 4.3 ドキュメント更新
- [ ] 4.4 lint & test通過確認

### Phase 5: Migration 🔄
- [ ] 5.1 既存API deprecation
- [ ] 5.2 移行ガイド作成
- [ ] 5.3 サンプルコード更新

## 🎯 成功指標

### APIシンプル化 ✨
- importが3行以下になる
- builder.build().asCode()でmermaidテキスト生成
- parseした結果がそのままbuilder機能を持つ

### Type-Safety強化 💪
- Zod brandでcompile-time & runtime型安全性
- `as any`や`as unknown as`が0個
- 異なるdiagram間でIDを混在できない

### 開発体験向上 🚀
- 直感的なAPI設計
- コード補完が効く
- エラーメッセージが分かりやすい

---

**よっしゃ〜💕 まずはPhase 1から始めましょ！Type-Safety基盤をがちがちに固めるわよ〜✨**