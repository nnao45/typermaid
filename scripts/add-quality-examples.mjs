#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const QUALITY_EXAMPLES = [
  // 基本パターン
  `flowchart TB
    Start --> End`,

  `flowchart LR
    A --> B`,

  `flowchart TD
    A --> B --> C`,

  `flowchart BT
    A --> B`,

  `flowchart RL
    A --> B`,

  // ノード形状完全版
  `flowchart LR
    id1[This is the text in the box]`,

  `flowchart LR
    id1(This is the text in the box)`,

  `flowchart LR
    id1([This is the text in the box])`,

  `flowchart LR
    id1[[This is the text in the box]]`,

  `flowchart LR
    id1[(Database)]`,

  `flowchart LR
    id1((This is the text in the circle))`,

  `flowchart LR
    id1>This is the text in the box]`,

  `flowchart LR
    id1{This is the text in the box}`,

  `flowchart LR
    id1{{This is the text in the box}}`,

  // エッジタイプ完全版
  `flowchart LR
    A-->B`,

  `flowchart LR
    A---B`,

  `flowchart LR
    A-.->B`,

  `flowchart LR
    A-.-B`,

  `flowchart LR
    A==>B`,

  `flowchart LR
    A===B`,

  `flowchart LR
    A~~~B`,

  `flowchart LR
    A--oB`,

  `flowchart LR
    A--xB`,

  // ラベル付きエッジ
  `flowchart LR
    A-->|text|B`,

  `flowchart LR
    A---|text|B`,

  `flowchart LR
    A-.->|text|B`,

  `flowchart LR
    A==>|text|B`,

  // 複数ノード
  `flowchart TB
    A
    B
    C`,

  `flowchart LR
    A[Node A]
    B[Node B]
    C[Node C]`,

  // 複数エッジ
  `flowchart TB
    A --> B
    B --> C`,

  `flowchart LR
    A --> B
    A --> C`,

  `flowchart TD
    A --> B
    A --> C
    B --> D
    C --> D`,

  // サブグラフ基本
  `flowchart TB
    subgraph one
      a1
    end`,

  `flowchart TB
    subgraph one
      a1-->a2
    end`,

  `flowchart TB
    subgraph one[Label]
      a1-->a2
    end`,

  // 実践的なパターン
  `flowchart TB
    Start[Start] --> Process[Process Data]
    Process --> End[End]`,

  `flowchart LR
    Input[User Input] --> Validate{Valid?}
    Validate -->|Yes| Success[Success]
    Validate -->|No| Error[Error]`,

  `flowchart TD
    A[Client] --> B[Server]
    B --> C[(Database)]`,

  `flowchart TB
    Init[Initialize] --> Load[Load Data]
    Load --> Process[Process]
    Process --> Save[(Save)]
    Save --> Done[Done]`,

  // チェーンパターン
  `flowchart LR
    A --> B --> C --> D`,

  `flowchart TB
    A --> B
    B --> C
    C --> D
    D --> E`,

  // 分岐パターン
  `flowchart TD
    A --> B
    A --> C`,

  `flowchart LR
    A --> B
    A --> C
    A --> D`,

  // 合流パターン
  `flowchart TB
    A --> C
    B --> C`,

  `flowchart LR
    A --> D
    B --> D
    C --> D`,

  // ダイヤモンドパターン
  `flowchart TB
    A --> B
    A --> C
    B --> D
    C --> D`,
];

async function main() {
  let counter = 0;

  console.log('📝 Adding 46 quality examples...\n');

  for (const code of QUALITY_EXAMPLES) {
    counter++;
    const outputFile = path.join(
      'e2e',
      'flowchart',
      `${String(counter).padStart(3, '0')}_quality.mmd`
    );
    await fs.writeFile(outputFile, code.trim());
    console.log(`  ✅ Saved: ${outputFile}`);
  }

  console.log(`\n🎉 Added ${counter} quality examples!`);
}

main().catch(console.error);
