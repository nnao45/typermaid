# 🎯 Mermaid完全準拠フレームワーク開発計画

## 📊 プロジェクト概要

Mermaidの文法とスキーマに完全準拠した、型安全なダイアグラム生成フレームワークを構築する。

## 🔍 調査結果サマリー

- **パーサー技術**: Langium（最新）/ Jison（レガシー）
- **対応ダイアグラム**: 10種類以上
- **アプローチ**: 手書きパーサー + Zodによる厳格な型定義

---

## 📋 フェーズ1: Mermaid完全準拠スキーマ設計（週1-2）

### 1.1 ダイアグラムタイプ別スキーマ定義

対応するダイアグラムタイプ（優先度順）:

1. **Flowchart** - TB/BT/LR/RL方向、12種類のノード形状、複数のエッジタイプ
2. **Sequence** - アクター、メッセージタイプ、フラグメント（loop/alt/opt）
3. **Class** - クラス定義、関係（継承、実装、関連）、可視性
4. **ER** - エンティティ、関係、カーディナリティ
5. **Gantt** - タスク、期間、依存関係、セクション
6. **State** - 状態、遷移、並行状態、ネスト
7. **Pie** - データ、ラベル、値
8. **Git Graph** - コミット、ブランチ、マージ
9. **Journey** - ステップ、スコア、アクター
10. **C4** - コンテキスト、コンテナ、コンポーネント

### 1.2 Zodスキーマ実装戦略

ディレクトリ構造:

```
packages/core/src/schemas/
├── common.ts          # 共通型定義（Color, Position, Size, Direction）
├── flowchart.ts       # FlowchartSchema + ノード形状enum
├── sequence.ts        # SequenceDiagramSchema + メッセージタイプ
├── class.ts           # ClassDiagramSchema + 関係タイプ
├── er.ts              # ERDiagramSchema + カーディナリティ
├── gantt.ts           # GanttSchema + タスク状態
├── state.ts           # StateDiagramSchema + 遷移
├── pie.ts             # PieChartSchema
├── git.ts             # GitGraphSchema
├── journey.ts         # JourneySchema
├── c4.ts              # C4DiagramSchema
└── index.ts           # 統合エクスポート
```

### 1.3 型安全性レベル

- ✅ 全enum値をliteralで定義
- ✅ discriminated unionで型推論
- ✅ branded typeで値の範囲制限
- ✅ refinementsでバリデーション
- ✅ strict modeフル活用

---

## 📋 フェーズ2: Mermaid文法完全準拠パーサー（週3-8）

### 2.1 パーサー技術選定

**採用: 手書きパーサー（フルコントロール）** ⭐️⭐️⭐️

理由:
- ✅ 完全な型制御
- ✅ パフォーマンス最適化可能
- ✅ 依存ゼロ
- ✅ エラーメッセージのカスタマイズ

### 2.2 パーサー実装構造

```
packages/parser/src/
├── lexer/              # 字句解析
│   ├── tokenizer.ts   # トークン化エンジン
│   ├── tokens.ts      # トークン定義（Zod）
│   └── scanner.ts     # 文字スキャナー
├── grammar/           # 文法定義
│   ├── flowchart.ts   # Flowchart文法パーサー
│   ├── sequence.ts    # Sequence文法パーサー
│   ├── class.ts       # Class文法パーサー
│   └── ...
├── ast/               # AST定義（Zod）
│   ├── nodes.ts       # ASTノード型
│   ├── builder.ts     # ASTビルダー
│   └── types.ts       # 型定義
├── parser.ts          # メインパーサー
├── error.ts           # エラーハンドリング
└── index.ts           # エクスポート
```

### 2.3 Flowchart文法仕様

パース対象例:

```mermaid
flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
```

**パース要素**:

- ダイアグラム宣言: `flowchart LR`
- ノード定義: `A[Hard edge]` (ID + 形状 + テキスト)
- エッジ定義: `-->|Link text|` (タイプ + ラベル)
- ノード形状12種類: `[]`, `()`, `{}`, `<>`, `(())`, `[[]]`, `[()]`, `>]`, `{{}}`, `[//]`, `[\\]`, `((()))`
- エッジタイプ: `-->`, `---`, `-.->`, `==>`, など

---

## 📋 フェーズ3: ダイアグラム別パーサー実装（週9-16）

### 3.1 実装スケジュール

| 週 | ダイアグラム | 実装内容 | 難易度 |
|---|---|---|---|
| 9-10 | **Flowchart** | 全ノード形状、全エッジタイプ、サブグラフ、スタイル | 🔥🔥🔥 |
| 11-12 | **Sequence** | アクター、メッセージ、フラグメント（loop/alt/opt/par） | 🔥🔥🔥 |
| 13 | **Class** | クラス定義、関係、メンバー可視性 | 🔥🔥 |
| 14 | **ER** | エンティティ、関係、カーディナリティ | 🔥🔥 |
| 15 | **State** | 状態、遷移、並行状態、ネスト | 🔥🔥 |
| 16 | **Gantt/Pie** | タスク、期間、データ、ラベル | 🔥 |

### 3.2 Flowchart完全仕様

**ノード形状**:

```typescript
export const NodeShape = z.enum([
  'square',         // [text]
  'round',          // (text)
  'stadium',        // ([text])
  'subroutine',     // [[text]]
  'cylindrical',    // [(text)]
  'circle',         // ((text))
  'asymmetric',     // >text]
  'rhombus',        // {text}
  'hexagon',        // {{text}}
  'parallelogram',  // [/text/]
  'trapezoid_alt',  // [\text/]
  'trapezoid',      // [/text\]
  'double_circle',  // (((text)))
]);
```

**エッジタイプ**:

```typescript
export const EdgeType = z.enum([
  'arrow',          // -->
  'line',           // ---
  'dotted_arrow',   // -.->
  'dotted_line',    // -.-
  'thick_arrow',    // ==>
  'thick_line',     // ===
  'invisible',      // ~~~
]);
```

---

## 📋 フェーズ4: テスト駆動開発（並行実施）

### 4.1 テスト構造

```
packages/parser/tests/
├── fixtures/
│   ├── flowchart/
│   │   ├── basic.mmd
│   │   ├── complex.mmd
│   │   ├── subgraph.mmd
│   │   ├── styles.mmd
│   │   └── edge-cases.mmd
│   ├── sequence/
│   │   ├── actors.mmd
│   │   ├── loops.mmd
│   │   └── alternatives.mmd
│   └── ...
├── lexer/
│   └── tokenizer.test.ts
├── grammar/
│   ├── flowchart.test.ts
│   └── sequence.test.ts
└── parser.test.ts
```

### 4.2 テスト戦略

1. **互換性テスト**: Mermaid公式のサンプル全パース
2. **エラーハンドリング**: 構文エラー、意味エラーの検出
3. **パフォーマンステスト**: 10KB以上のダイアグラムを1秒以内
4. **スナップショットテスト**: AST出力の回帰テスト
5. **カバレッジ**: 95%以上を維持

---

## 📋 フェーズ5: VS Code拡張対応（週17-18）

### 5.1 Language Server Protocol実装

```
packages/vscode-extension/
├── src/
│   ├── server.ts           # LSP server
│   ├── features/
│   │   ├── hover.ts        # ホバー情報
│   │   ├── completion.ts   # 補完
│   │   ├── diagnostics.ts  # エラー表示
│   │   └── formatting.ts   # フォーマット
│   └── client.ts           # LSP client
├── syntaxes/
│   └── lyric.tmLanguage.json
└── package.json
```

### 5.2 提供機能

- ✅ シンタックスハイライト
- ✅ リアルタイムエラー表示
- ✅ 補完候補表示
- ✅ ホバー時の型情報
- ✅ フォーマット機能

---

## 🎯 マイルストーン＆成果物

### M1: コアスキーマ完成（2週間後）

- ✅ 10種類のダイアグラムスキーマ完成
- ✅ 100%型安全なZod定義
- ✅ discriminated union完備
- ✅ 共通型定義（Color, Position, Direction）

**成果物**:
- `packages/core/src/schemas/` 全ファイル
- スキーマバリデーションテスト
- 型推論テスト

### M2: Flowchart完全対応（4週間後）

- ✅ Mermaid互換Flowchartパーサー
- ✅ 12種類の全ノード形状対応
- ✅ 7種類の全エッジタイプ対応
- ✅ サブグラフ、スタイル対応

**成果物**:
- `packages/parser/src/grammar/flowchart.ts`
- Flowchart専用lexer
- 100個以上のテストケース

### M3: 5大ダイアグラム対応（8週間後）

- ✅ Flowchart, Sequence, Class, ER, State完全対応
- ✅ 公式テストケース全通過
- ✅ エラーメッセージの充実

**成果物**:
- 5種類のパーサー実装
- 500個以上のテストケース
- パフォーマンスベンチマーク

### M4: 完全互換（16週間後）

- ✅ 10種類全ダイアグラム対応
- ✅ VS Code拡張リリース
- ✅ パフォーマンスベンチマーク公開
- ✅ ドキュメント完備

**成果物**:
- npm公開可能なパッケージ
- VS Code Extension
- 公式ドキュメントサイト

---

## 🔥 技術スタック

```json
{
  "parser": "Hand-written (full control)",
  "lexer": "Custom tokenizer with Zod",
  "ast": "Zod schemas (runtime + compile-time)",
  "testing": "Vitest + snapshot testing",
  "coverage": "> 95%",
  "typescript": "strict mode + all strict options",
  "formatter": "Biome",
  "monorepo": "pnpm workspace"
}
```

---

## 📈 品質指標

| 指標 | 目標値 |
|------|--------|
| 型安全性 | 100% (any禁止) |
| テストカバレッジ | > 95% |
| パフォーマンス | 10KB < 1秒 |
| バンドルサイズ | Core < 100KB (gzip) |
| Mermaid互換性 | 100% (公式サンプル全通過) |

---

## 🚀 現在の進捗

### ✅ 完了済み

#### フェーズ0: 環境構築
- [x] プロジェクト初期化
- [x] TypeScript strict設定完了
- [x] Biome導入・設定完了
- [x] pnpm monorepo構築
- [x] Vitest設定完了

#### フェーズ1: Mermaid完全準拠スキーマ設計 ✅ **完了！**
- [x] 共通スキーマ定義 (`packages/core/src/schemas/common.ts`)
  - Color (hex/rgb/rgba/named - RGB値範囲バリデーション付き)
  - Position, Size, Direction
  - FontStyle, StrokeStyle, FillStyle, Style
  - TextAlign, VerticalAlign, Theme
- [x] Flowchartスキーマ完全実装 (`packages/core/src/schemas/flowchart.ts`)
  - 14種類のノード形状 (square, round, rhombus, hexagon, etc)
  - 11種類のエッジタイプ (arrow, dotted, thick, invisible, etc)
  - FlowchartNode, FlowchartEdge, Subgraph, ClassDef
  - FlowchartDiagram完全定義
- [x] スキーマバリデーションテスト
  - 38テストケース全通過
  - 型安全性100%達成

**成果物**:
- `packages/core/src/schemas/` (common.ts, flowchart.ts, index.ts)
- テストスイート (common.test.ts, flowchart.test.ts)
- 完全な型推論とZodバリデーション

#### フェーズ2: Mermaid文法完全準拠パーサー ✅ **完了！**

**2.1 Lexer（字句解析器）実装完了**
- [x] トークン定義 (`packages/parser/src/lexer/tokens.ts`)
  - 50種類以上のトークンタイプ定義
  - 位置情報トラッキング (line, column, offset)
  - Zodバリデーション完備
- [x] Tokenizer実装 (`packages/parser/src/lexer/tokenizer.ts`)
  - 全ノード形状検出: [], [[]], (), ((())), {}, {{}}, ([]), [(]), >]
  - 全エッジタイプ検出: -->, ---, -.-, -.->, ==>, ~~~, --o, --x
  - コメント対応 (%%)
  - エラーハンドリング (LexerError)
- [x] Lexerテスト
  - 30テストケース全通過
  - 複雑なflowchart対応確認

**成果物**:
- `packages/parser/src/lexer/` (tokens.ts, tokenizer.ts)
- テストスイート (tokenizer.test.ts)

**2.2 Parser（構文解析器）実装完了**
- [x] AST定義 (`packages/parser/src/ast/nodes.ts`)
  - ProgramAST, FlowchartDiagramAST
  - FlowchartNodeAST, EdgeAST, SubgraphAST
  - 位置情報 (loc) 対応
- [x] Flowchartパーサー実装 (`packages/parser/src/grammar/flowchart.ts`)
  - ノード定義のパース (全形状対応)
  - エッジのパース (全タイプ、ラベル付き対応)
  - サブグラフのパース (subgraph ~ end)
  - 方向指定対応 (TB, TD, BT, LR, RL)
  - 連続定義対応: `A[Start] --> B[End]`
- [x] メインパーサー (`packages/parser/src/parser.ts`)
  - parse(): 自動ダイアグラムタイプ検出
  - parseFlowchart(): Flowchart専用パーサー
- [x] Parserテスト
  - 9テストケース全通過
  - 単一/複数ノード、各形状、エッジ、サブグラフ対応

**成果物**:
- `packages/parser/src/` (ast/, grammar/, parser.ts, error.ts, index.ts)
- テストスイート (parser.test.ts)
- **合計77テスト全通過** (Core 38 + Lexer 30 + Parser 9)

### 📊 現在の実績

| 項目 | 状態 | 備考 |
|------|------|------|
| テスト | ✅ 77/77 通過 | 100%通過率 |
| 型安全性 | ✅ 100% | any完全排除 |
| Lint | ✅ 通過 | Biome strict |
| TypeCheck | ✅ 通過 | strict mode |
| カバレッジ | 🟡 測定前 | 目標>95% |

### 🎯 次のステップ

- [ ] **← いまここ: フェーズ2完了、次の計画検討中**
- [ ] AST→Schema変換器実装
- [ ] SVGレンダラー実装
- [ ] 追加ダイアグラムタイプ対応 (Sequence, Class, etc)

---

## 📝 次のアクション候補

### オプションA: レンダラー実装
- SVGレンダラーパッケージ作成
- Flowchart→SVG変換実装
- レイアウトアルゴリズム (Dagre/ELK)

### オプションB: 追加ダイアグラム対応
- Sequence diagram parser実装
- Class diagram parser実装

### オプションC: 機能拡充
- スタイル定義対応 (classDef, style)
- クリックイベント対応
- リンク対応

---

_Last updated: 2025-10-31 (Phase 2完了時点)_
