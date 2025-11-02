import { parse } from './packages/parser/dist/index.js';

const tests = [
  {
    name: 'Flowchart - Subgraph',
    code: `flowchart TD
  subgraph S1
    A-->B
  end`,
  },
  {
    name: 'Sequence - Basic',
    code: `sequenceDiagram
  Alice->>Bob: Hello`,
  },
  {
    name: 'ER - Basic',
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places`,
  },
  {
    name: 'Class - Basic',
    code: `classDiagram
  Animal <|-- Duck`,
  },
  {
    name: 'State - Basic',
    code: `stateDiagram-v2
  [*] --> Still
  Still --> [*]`,
  },
  {
    name: 'Gantt - Basic',
    code: `gantt
  title A Gantt Diagram
  dateFormat YYYY-MM-DD
  section Section
  A task :a1, 2014-01-01, 30d`,
  },
];

console.log('🧪 Testing Parsers\n');

for (const test of tests) {
  try {
    const ast = parse(test.code);
    const diagram = ast.body[0];

    console.log(`✅ ${test.name}`);
    console.log(`   Type: ${diagram.type}`);

    // Check structure
    if (diagram.type === 'FlowchartDiagram') {
      console.log(`   Direction: ${diagram.direction}`);
      console.log(`   Body items: ${diagram.body.length}`);
    } else if (diagram.type === 'SequenceDiagram') {
      console.log(`   Statements: ${diagram.diagram?.statements?.length || 0}`);
    } else if (diagram.type === 'ERDiagram') {
      console.log(`   Entities: ${diagram.diagram?.entities?.length || 0}`);
      console.log(`   Relationships: ${diagram.diagram?.relationships?.length || 0}`);
    } else if (diagram.type === 'ClassDiagram') {
      console.log(`   Classes: ${diagram.diagram?.classes?.length || 0}`);
    } else if (diagram.type === 'StateDiagram') {
      console.log(`   States: ${diagram.diagram?.states?.length || 0}`);
    } else if (diagram.type === 'GanttDiagram') {
      console.log(`   Sections: ${diagram.diagram?.sections?.length || 0}`);
    }

    console.log('');
  } catch (e) {
    console.log(`❌ ${test.name}`);
    console.log(`   Error: ${e.message}\n`);
  }
}
