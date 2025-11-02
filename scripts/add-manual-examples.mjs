#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

// 手動で追加するMermaidの例
const MANUAL_EXAMPLES = [
  // 基本的なフローチャート
  `flowchart TB
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]`,

  // 複雑なノード形状
  `flowchart LR
    A[Square] --> B(Round)
    B --> C([Stadium])
    C --> D[[Subroutine]]
    D --> E[(Database)]
    E --> F((Circle))`,

  // 菱形と六角形
  `flowchart TD
    A{Diamond} --> B{{Hexagon}}
    B --> C>Asymmetric]
    C --> D[/Parallelogram/]
    D --> E[\\Trapezoid\\]`,

  // エッジのバリエーション
  `flowchart LR
    A -->|text| B
    B ---|text| C
    C -.->|text| D
    D -.-|text| E
    E ==>|text| F
    F ===|text| G`,

  // サブグラフ
  `flowchart TB
    subgraph one
      a1-->a2
    end
    subgraph two
      b1-->b2
    end
    subgraph three
      c1-->c2
    end
    one --> two
    three --> two
    two --> c2`,

  // ネストしたサブグラフ
  `flowchart TB
    subgraph TOP
      subgraph B1
        i1 -->f1
      end
      subgraph B2
        i2 -->f2
      end
    end
    A --> TOP --> B
    B1 --> B2`,

  // 長いラベル
  `flowchart LR
    id1[This is the text in the box with a very long label that should wrap]
    id1-->id2[Another box with an even longer label that contains multiple words and should definitely wrap to multiple lines]`,

  // 複数のエッジ
  `flowchart LR
    A --> B
    A --> C
    B --> D
    C --> D`,

  // マルチエッジ
  `flowchart LR
    A --> B & C --> D`,

  // クロスエッジ
  `flowchart TB
    A --> B
    A --> C
    B --> D
    C --> D
    D --> E`,

  // 全方向
  `flowchart LR
    Start --> Stop`,

  `flowchart RL
    Start --> Stop`,

  `flowchart TD
    Start --> Stop`,

  `flowchart BT
    Start --> Stop`,

  // 複雑な例1
  `flowchart TB
    Start[Start Process] --> Input{Input Data?}
    Input -->|Valid| Process[Process Data]
    Input -->|Invalid| Error[Show Error]
    Process --> Save[(Save to DB)]
    Save --> Success[Success]
    Error --> End[End]
    Success --> End`,

  // 複雑な例2
  `flowchart LR
    A[Client] -->|Request| B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    B --> E[Server 3]
    C --> F[(Database)]
    D --> F
    E --> F
    F --> G[Cache]
    G --> H[Response]`,

  // シンプルなチェーン
  `flowchart LR
    A --> B --> C --> D --> E`,

  // 分岐と合流
  `flowchart TD
    A --> B
    A --> C
    A --> D
    B --> E
    C --> E
    D --> E`,

  // ダブルサークル
  `flowchart LR
    A((( Start ))) --> B[Process] --> C((( End )))`,

  // エッジラベル付き複雑な例
  `flowchart TB
    A[Auth] -->|Success| B[Dashboard]
    A -->|Fail| C[Login]
    B --> D{Action?}
    D -->|Create| E[Form]
    D -->|Read| F[List]
    D -->|Update| G[Edit]
    D -->|Delete| H[Confirm]
    E --> I[(Save)]
    F --> I
    G --> I
    H --> I`,
];

async function main() {
  let counter = 46; // 前のスクリプトで46個取得済み

  console.log('📝 Adding manual Mermaid examples...\n');

  for (const code of MANUAL_EXAMPLES) {
    counter++;
    const outputFile = path.join(
      'e2e',
      'flowchart',
      `${String(counter).padStart(3, '0')}_manual.mmd`
    );
    await fs.writeFile(outputFile, code.trim());
    console.log(`  ✅ Saved: ${outputFile}`);

    if (counter >= 100) break;
  }

  console.log(`\n🎉 Total examples: ${counter}`);
}

main().catch(console.error);
