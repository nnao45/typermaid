#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const MORE_EXAMPLES = [
  // エッジケース・特殊パターン
  `flowchart LR
    A[Single Node]`,
    
  `flowchart TB
    A --> A`,
    
  `flowchart LR
    A --> B
    B --> A`,
    
  `flowchart TD
    A --> B --> C
    C --> A`,
    
  // 特殊文字を含むラベル
  `flowchart LR
    A["Node with spaces"] --> B["Another node"]`,
    
  `flowchart TB
    A["Special: chars!"] --> B["More #special @chars"]`,
    
  // 長いチェーン
  `flowchart LR
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J`,
    
  // ワイドな分岐
  `flowchart TD
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G`,
    
  // 複数のサブグラフ
  `flowchart TB
    subgraph s1
      a --> b
    end
    subgraph s2
      c --> d
    end
    subgraph s3
      e --> f
    end
    s1 --> s2 --> s3`,
    
  // ミックス
  `flowchart LR
    A[Start] --> B{Check}
    B -->|OK| C[Process]
    B -->|NG| D((Error))
    C --> E[(DB)]
    E --> F[End]
    D --> F`,
    
  // 最小限
  `flowchart TB
    A`,
    
  `flowchart LR
    A --> B`,
    
  // エッジのみのバリエーション
  `flowchart TD
    A -.-> B`,
    
  `flowchart LR
    A ==> B`,
    
  `flowchart TB
    A --- B`,
    
  // 複数スタート
  `flowchart LR
    A1 --> C
    A2 --> C
    A3 --> C
    C --> D`,
    
  // 複数エンド
  `flowchart TD
    A --> B1
    A --> B2
    A --> B3`,
    
  // グリッド状
  `flowchart LR
    A1 --> B1
    A1 --> B2
    A2 --> B1
    A2 --> B2`,
    
  // ピラミッド
  `flowchart TD
    A --> B
    A --> C
    B --> D
    B --> E
    C --> F
    C --> G`,
    
  // 逆ピラミッド
  `flowchart TB
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G`,
    
  // ダイヤモンド
  `flowchart LR
    A --> B
    A --> C
    B --> D
    C --> D`,
    
  // リング
  `flowchart TB
    A --> B --> C --> D --> E --> A`,
    
  // 二重リンク
  `flowchart LR
    A --> B
    A ==> B`,
    
  // 異なる方向のエッジ
  `flowchart TD
    A --> B
    A -.-> C
    A ==> D`,
    
  // 全ノード形状コンプリート
  `flowchart TB
    A[square] --> B(round)
    C([stadium]) --> D[[subroutine]]
    E[(database)] --> F((circle))
    G{diamond} --> H{{hexagon}}
    I>flag] --> J[/parallelogram/]`,
    
  // 長いラベルのエッジ
  `flowchart LR
    A -->|This is a very long label text| B`,
    
  // 特殊なID
  `flowchart TB
    id1 --> id2
    nodeA --> nodeB
    start --> end`,
    
  // 数字のみのID
  `flowchart LR
    1 --> 2 --> 3 --> 4`,
    
  // 深いネスト
  `flowchart TB
    subgraph L1
      subgraph L2
        subgraph L3
          a --> b
        end
      end
    end`,
    
  // クロスリンク
  `flowchart TD
    A --> B
    C --> D
    A --> D
    C --> B`,
    
  // スター型
  `flowchart TB
    Center --> A
    Center --> B
    Center --> C
    Center --> D
    Center --> E`,
    
  // 複雑なマルチパス
  `flowchart LR
    Start --> A
    Start --> B
    A --> C
    B --> C
    C --> End`,
    
  // ミニマル TB
  `flowchart TB
    X --> Y`,
];

async function main() {
  let counter = 66;
  
  console.log('📝 Adding more examples to reach 100...\n');
  
  for (const code of MORE_EXAMPLES) {
    counter++;
    const outputFile = path.join('e2e', 'flowchart', `${String(counter).padStart(3, '0')}_extra.mmd`);
    await fs.writeFile(outputFile, code.trim());
    console.log(`  ✅ Saved: ${outputFile}`);
    
    if (counter >= 100) break;
  }
  
  console.log(`\n🎉 Total examples now: ${counter}`);
}

main().catch(console.error);
