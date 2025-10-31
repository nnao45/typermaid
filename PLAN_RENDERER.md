# 🎨 Lyric-JS Renderer - Development Plan

## 🎯 Goal
**モダンなReactベースのMermaidレンダラーを構築**
- AST → SVG/Canvas変換
- インタラクティブ
- 高パフォーマンス
- 型安全

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 User Application                 │
│              (React Component)                   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           @lyric-js/react-renderer              │
│  ┌──────────────────────────────────────────┐  │
│  │  <Flowchart ast={ast} />                 │  │
│  │  <Flowchart code="flowchart TB..." />    │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
┌─────▼──────┐              ┌──────▼─────┐
│  SVG Mode  │              │ Canvas Mode│
│  (Default) │              │  (Large)   │
└─────┬──────┘              └──────┬─────┘
      │                             │
┌─────▼─────────────────────────────▼─────┐
│      @lyric-js/renderer-core            │
│  ┌───────────────────────────────────┐  │
│  │  Layout Engine (Dagre/ELK)        │  │
│  │  Node Positioning                 │  │
│  │  Edge Routing                     │  │
│  │  Dimension Calculator             │  │
│  └───────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         @lyric-js/parser                │
│              (Already Done!)            │
└─────────────────────────────────────────┘
```

---

## 📦 Package Structure

```
packages/
├── core/                    ✅ Already done
├── parser/                  ✅ Already done
├── renderer-core/           🆕 Core rendering logic
│   ├── src/
│   │   ├── layout/          # Layout algorithms
│   │   ├── shapes/          # Node shape generators
│   │   ├── edges/           # Edge path generators
│   │   ├── svg/             # SVG primitives
│   │   ├── canvas/          # Canvas primitives
│   │   └── types.ts         # Renderer types
│   └── package.json
├── react-renderer/          🆕 React components
│   ├── src/
│   │   ├── components/
│   │   │   ├── Flowchart.tsx
│   │   │   ├── Node.tsx
│   │   │   ├── Edge.tsx
│   │   │   └── Subgraph.tsx
│   │   ├── hooks/
│   │   │   ├── useLayout.ts
│   │   │   ├── useZoom.ts
│   │   │   └── usePan.ts
│   │   └── index.tsx
│   └── package.json
└── demo/                    🆕 Demo application
    ├── src/
    │   ├── App.tsx
    │   ├── examples/
    │   └── playground/
    └── package.json
```

---

## 🛠️ Tech Stack

### Core Rendering
- **TypeScript** - 型安全性
- **Dagre** / **ELK** - グラフレイアウト
- **SVG** - デフォルト出力
- **Canvas** - 大規模ダイアグラム用

### React Layer
- **React 18+** - UI framework
- **TypeScript** - strict mode
- **Zustand** / **Jotai** - 状態管理 (軽量)
- **Framer Motion** - アニメーション
- **@react-spring/web** - スムーズなトランジション

### Development
- **Vite** - 超高速ビルド
- **Vitest** - テスト
- **Storybook** - コンポーネント開発
- **Biome** - Linting/Formatting

### Demo/Playground
- **React** + **Vite**
- **Monaco Editor** - コードエディタ
- **React Router** - ルーティング
- **Tailwind CSS** - スタイリング

---

## 📋 Development Phases

### Phase 1: Core Renderer (Foundation) 🏗️
**Goal:** AST → レンダリング可能なデータ構造

#### 1-1: Layout Engine Setup
- [ ] Dagre導入 & セットアップ
- [ ] AST → Dagre Graph 変換
- [ ] ノード位置計算
- [ ] エッジパス計算

#### 1-2: Shape Generators
- [ ] 全14種類のノード形状SVGパス生成
- [ ] テキスト測定 & サイズ計算
- [ ] パディング & マージン計算

#### 1-3: Edge Generators
- [ ] 11種類のエッジパス生成
- [ ] エッジラベル配置
- [ ] 矢印/装飾生成

#### 1-4: SVG Primitives
- [ ] SVG要素生成関数
- [ ] スタイル適用
- [ ] viewBox計算

**Deliverable:** `@lyric-js/renderer-core` package

---

### Phase 2: React Components 🎨
**Goal:** 使いやすいReactコンポーネント

#### 2-1: Base Components
- [ ] `<Flowchart>` - メインコンポーネント
- [ ] `<Node>` - ノードレンダリング
- [ ] `<Edge>` - エッジレンダリング
- [ ] `<Subgraph>` - サブグラフコンテナ

#### 2-2: Interactive Features
- [ ] Zoom機能 (useZoom hook)
- [ ] Pan機能 (usePan hook)
- [ ] ノードクリック/ホバー
- [ ] エッジクリック/ホバー

#### 2-3: Customization
- [ ] テーマシステム
- [ ] カスタムスタイル
- [ ] カスタムノード形状
- [ ] カスタムエッジスタイル

**Deliverable:** `@lyric-js/react-renderer` package

---

### Phase 3: Demo Application 🎮
**Goal:** かっこいいデモ & プレイグラウンド

#### 3-1: Basic Demo
- [ ] Vite + React setup
- [ ] サンプルダイアグラム表示
- [ ] コード入力 → リアルタイムプレビュー

#### 3-2: Playground Features
- [ ] Monaco Editorインテグレーション
- [ ] シンタックスハイライト
- [ ] エラー表示
- [ ] 出力フォーマット選択 (SVG/PNG/JSON)

#### 3-3: Gallery
- [ ] 100個のE2Eサンプル表示
- [ ] フィルター & 検索
- [ ] コピー & シェア機能

**Deliverable:** Demo site

---

### Phase 4: Advanced Features 🚀
**Goal:** プロダクションレディ

#### 4-1: Performance Optimization
- [ ] 大規模ダイアグラム対応 (Canvas mode)
- [ ] 仮想化 (react-window)
- [ ] メモ化最適化
- [ ] レイジーロード

#### 4-2: Export Features
- [ ] SVGエクスポート
- [ ] PNG/JPEGエクスポート
- [ ] PDFエクスポート
- [ ] JSON/ASTエクスポート

#### 4-3: Advanced Interactions
- [ ] ノードドラッグ & ドロップ
- [ ] エッジ編集
- [ ] ライブエディット
- [ ] Undo/Redo

**Deliverable:** Production-ready renderer

---

## 🎯 Milestone Timeline

### Week 1: Foundation
- ✅ Parser完成 (Done!)
- [ ] Phase 1-1: Layout Engine
- [ ] Phase 1-2: Shape Generators

### Week 2: Rendering
- [ ] Phase 1-3: Edge Generators
- [ ] Phase 1-4: SVG Primitives
- [ ] Phase 2-1: Base Components

### Week 3: Interactivity
- [ ] Phase 2-2: Interactive Features
- [ ] Phase 2-3: Customization
- [ ] Phase 3-1: Basic Demo

### Week 4: Polish
- [ ] Phase 3-2: Playground
- [ ] Phase 3-3: Gallery
- [ ] Documentation
- [ ] Release 🚀

---

## 📐 Design Decisions

### Why Dagre?
- ✅ 実績豊富 (Mermaid.jsも使用)
- ✅ シンプルなAPI
- ✅ カスタマイズ可能
- ⚠️ 代替: ELK (より高機能だが複雑)

### Why SVG over Canvas?
- ✅ DOM操作可能 (インタラクティブ)
- ✅ CSS適用可能
- ✅ アクセシビリティ
- ✅ 拡大縮小が綺麗
- ⚠️ Canvas: 大規模向け (オプション実装)

### Why Zustand/Jotai?
- ✅ 軽量 (Redux不要)
- ✅ シンプルなAPI
- ✅ TypeScript完全対応
- ✅ React 18対応

### Why Vite?
- ✅ 超高速HMR
- ✅ モダンな設定
- ✅ TypeScript out-of-the-box
- ✅ 最適化されたビルド

---

## 🎨 API Design (Preview)

### Basic Usage
```tsx
import { Flowchart } from '@lyric-js/react-renderer';

function App() {
  const code = `
    flowchart TB
      A[Start] --> B{Check}
      B -->|Yes| C[OK]
      B -->|No| D[Error]
  `;
  
  return <Flowchart code={code} />;
}
```

### With AST
```tsx
import { parse } from '@lyric-js/parser';
import { Flowchart } from '@lyric-js/react-renderer';

const ast = parse(code);

<Flowchart ast={ast} />
```

### Customization
```tsx
<Flowchart 
  code={code}
  theme="dark"
  interactive={true}
  onNodeClick={(node) => console.log(node)}
  onEdgeClick={(edge) => console.log(edge)}
  zoom={true}
  pan={true}
  width={800}
  height={600}
/>
```

### Advanced
```tsx
<Flowchart 
  code={code}
  layout={{
    rankdir: 'TB',
    nodesep: 50,
    ranksep: 50,
  }}
  nodeRenderer={(node) => <CustomNode {...node} />}
  edgeRenderer={(edge) => <CustomEdge {...edge} />}
/>
```

---

## 🧪 Testing Strategy

### Unit Tests
- ✅ Shape generators
- ✅ Edge path calculations
- ✅ Layout algorithms
- ✅ Coordinate transformations

### Component Tests
- ✅ React component rendering
- ✅ Props validation
- ✅ Event handling
- ✅ Hooks behavior

### Integration Tests
- ✅ AST → SVG full pipeline
- ✅ Interactive features
- ✅ Theme switching
- ✅ Export functions

### Visual Regression Tests
- ✅ Snapshot testing (Storybook)
- ✅ 100 E2E examples rendering
- ✅ Cross-browser compatibility

---

## 📚 Documentation Plan

### API Documentation
- [ ] Component API reference
- [ ] Hook reference
- [ ] Theme customization guide
- [ ] TypeScript types

### Guides
- [ ] Getting Started
- [ ] Basic Usage
- [ ] Advanced Customization
- [ ] Performance Optimization

### Examples
- [ ] Gallery (100 examples)
- [ ] Interactive Playground
- [ ] Code Sandbox demos
- [ ] Best Practices

---

## 🚀 Release Plan

### v0.1.0 - Alpha
- Core renderer
- Basic React components
- Simple demo

### v0.2.0 - Beta
- Interactive features
- Playground
- Export functions

### v0.3.0 - RC
- Performance optimization
- Full documentation
- Storybook

### v1.0.0 - Release 🎉
- Production ready
- Full test coverage
- Complete documentation
- npm publish

---

## 🎯 Success Metrics

- [ ] **100/100 E2E examples render correctly**
- [ ] **All 14 node shapes perfect**
- [ ] **All 11 edge types perfect**
- [ ] **60fps smooth animations**
- [ ] **< 100ms render time** (for typical diagrams)
- [ ] **TypeScript strict mode** (0 `any`)
- [ ] **100% test coverage** (core logic)
- [ ] **Storybook完備** (全コンポーネント)

---

**Next Step:** Phase 1-1 Layout Engine Setup! ��

**Target:** モダンで美しく高速なレンダラー 💎✨
