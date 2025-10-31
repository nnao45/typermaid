# 🎯 E2E Testing with 100 Real-World Examples

## 📊 現状

### ✅ 準備完了
- **100個のMermaid Flowchartサンプル** を収集
- E2Eテスト環境構築完了
- 基本パターンはパース可能

### 📈 テスト結果

```bash
pnpm test e2e/flowchart.test.ts
```

**現在の成功率**: 70% (10個中7個成功)

#### ✅ 成功パターン
- 基本的なフローチャート
- 全ノード形状 (square, round, diamond, circle, database)
- 基本エッジタイプ (arrow, line, dotted, thick)
- シンプルなサブグラフ

#### ❌ 未対応パターン
1. **特殊文字in ラベル**: `B{Is it?}` の `?` がLexerエラー
2. **マルチエッジ**: `A --> B & C` の `&` 記法未対応
3. **スラッシュ形状**: `[/Parallelogram/]` 未対応

## 📁 ディレクトリ構造

```
e2e/
├── flowchart/
│   ├── 001-046_example.mmd   # 公式リポジトリから抽出
│   ├── 047-066_manual.mmd    # 手動作成パターン
│   └── 067-100_extra.mmd     # エッジケース
└── flowchart.test.ts         # E2Eテスト
```

## 🚀 TDD開発フロー

### ステップ1: 失敗するテストを見つける
```bash
pnpm test e2e/flowchart.test.ts
```

### ステップ2: 失敗パターンを分析
```bash
# 失敗したファイルを見る
cat e2e/flowchart/047_manual.mmd
```

### ステップ3: パーサーを修正
- Lexerに特殊文字対応追加
- Parserに新構文対応追加

### ステップ4: テスト再実行
```bash
pnpm test e2e/flowchart.test.ts
```

### ステップ5: 成功率が上がるまで繰り返し

## 🎯 目標

- [ ] **90%以上の成功率** を達成
- [ ] 全ノード形状対応
- [ ] 全エッジタイプ対応
- [ ] サブグラフ完全対応
- [ ] 特殊文字対応
- [ ] マルチエッジ対応

## 💡 次のアクション

1. ラベル内の特殊文字を許可 (Lexer修正)
2. マルチエッジ構文 `A --> B & C` 対応 (Parser修正)
3. Parallelogram形状 `[/text/]` 対応 (Lexer修正)
4. Trapezoid形状 `[\\text\\]` 対応 (Lexer修正)

---

**現在の進捗**: フェーズ2完了 → **E2E TDD準備完了！** 🚀
