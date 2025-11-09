# Type Safety Improvement Plan 🎯✨

## 🎉 Phase 1 & 2 完了！全ダイアグラムタイプ対応 🎉

### ✅ 完了した作業まとめ

#### 1. Enhanced AST の完全実装
全6種類のダイアグラムタイプで Enhanced AST を実装：

- ✅ **EnhancedFlowchartDiagramAST** - フローチャート図
- ✅ **EnhancedERDiagramAST** - ER図（Entity-Relationship）
- ✅ **EnhancedGanttDiagramAST** - ガントチャート
- ✅ **EnhancedClassDiagramAST** - クラス図
- ✅ **EnhancedSequenceDiagramAST** - シーケンス図
- ✅ **EnhancedStateDiagramAST** - ステート図

#### 2. クラスベース統一パターン
全Enhanced ASTをクラスベースに統一：

```typescript
export class EnhancedXDiagramAST implements XDiagramAST {
  type: 'X' = 'X';
  diagram: XDiagram;
  loc?: { start: {...}, end: {...} };

  constructor(ast: XDiagramAST) { ... }

  // Builder methods
  addX(...): XID { ... }

  // AST manipulation
  replaceX(...): this { ... }
  findXs(...): X[] { ... }

  // Code generation
  asCode(): string { ... }

  // Final build
  build(): XDiagram & { asCode(): string } { ... }
}
```

#### 3. 循環依存の完全解消
Builder/codegen依存を削除：

- ❌ **削除前**: `@typermaid/builders`, `@typermaid/codegen` に依存
- ✅ **削除後**: 独自実装で循環依存ゼロ

各Enhanced ASTクラスが独自に：
- Builder機能を内包
- asCode()でMermaid構文を直接生成
- 外部パッケージへの依存なし

#### 4. 統一API の完全実装
全parse関数がEnhanced ASTを返却：

```typescript
// 全てこのパターンで統一！
export function parseFlowchart(input: string): EnhancedFlowchartDiagramAST;
export function parseER(input: string): EnhancedERDiagramAST;
export function parseGantt(input: string): EnhancedGanttDiagramAST;
export function parseClass(input: string): EnhancedClassDiagramAST;
export function parseSequence(input: string): EnhancedSequenceDiagramAST;
export function parseState(input: string): EnhancedStateDiagramAST;
```

### 🚀 実現できたユーザー理想API

#### Flowchart Example
```typescript
import { parseFlowchart } from '@typermaid/parser';

const source = `flowchart TB
  start((Start)) --> end((Finish))`;

const ast = parseFlowchart(source);
ast.addNode('task', 'square', 'Process');
ast.addEdge('start', 'task', 'arrow');
ast.addEdge('task', 'end', 'arrow');

// Direct code generation!
const code = ast.asCode();
```

#### ER Diagram Example
```typescript
import { parseER } from '@typermaid/parser';

const source = `erDiagram
  USER ||--o{ ORDER : places`;

const ast = parseER(source);
const user = ast.addEntity('USER');
const order = ast.addEntity('ORDER');

ast.addAttribute(user, 'id', 'int', 'PK');
ast.addAttribute(user, 'name', 'string');
ast.addRelationship(user, order, 'one-to-many', 'places');

const code = ast.asCode();
```

#### Class Diagram Example
```typescript
import { parseClass } from '@typermaid/parser';

const ast = parseClass('classDiagram');
const animal = ast.addClass('Animal');
const dog = ast.addClass('Dog');

ast.addMethod(animal, 'move', 'void', [], '+');
ast.addInheritance(dog, animal);

const code = ast.asCode();
```

#### Sequence Diagram Example
```typescript
import { parseSequence } from '@typermaid/parser';

const ast = parseSequence('sequenceDiagram');
const alice = ast.addParticipant('Alice');
const bob = ast.addParticipant('Bob');

ast.sendMessage(alice, bob, 'Hello Bob!', 'solid_arrow');
ast.addNote(bob, 'Bob thinks', 'right');

const code = ast.asCode();
```

#### State Diagram Example
```typescript
import { parseState } from '@typermaid/parser';

const ast = parseState('stateDiagram-v2');
const idle = ast.addState('Idle');
const active = ast.addState('Active');

ast.setStartState(idle);
ast.addTransition(idle, active, 'start');
ast.setEndState(active);

const code = ast.asCode();
```

#### Gantt Chart Example
```typescript
import { parseGantt } from '@typermaid/parser';

const ast = parseGantt('gantt\n    title My Project');
const section = ast.addSection('Development');
const task1 = ast.addTask('task1', 'Design', '2024-01-01', '2024-01-05');

ast.addTaskToSection(section, task1);
ast.setTitle('My Awesome Project');

const code = ast.asCode();
```

### 💪 達成された Type Safety

#### Branded Types の活用
全ダイアグラムタイプで型安全なID使用：

```typescript
type NodeID = string & { readonly _brand: 'NodeID' };
type EntityID = string & { readonly _brand: 'EntityID' };
type ClassID = string & { readonly _brand: 'ClassID' };
type ParticipantID = string & { readonly _brand: 'ParticipantID' };
type StateID = string & { readonly _brand: 'StateID' };
type TaskID = string & { readonly _brand: 'TaskID' };
type SectionID = string & { readonly _brand: 'SectionID' };
```

createXXXID関数でバリデーション付き生成：
```typescript
const nodeId = createNodeID('start');  // NodeID
const entityId = createEntityID('User');  // EntityID
const classId = createClassID('Animal');  // ClassID
```

#### Method Chaining の完全サポート
全Enhanced ASTで流れるようなAPI：

```typescript
ast
  .addNode('A', 'square', 'Node A')
  .addNode('B', 'circle', 'Node B')
  .addEdge('A', 'B', 'arrow')
  .replaceNode('A', 'Start');

const code = ast.asCode();
```

## 📦 パッケージ構成

### @typermaid/parser
- 全parse関数 → Enhanced AST返却
- Enhanced AST クラス群
- **依存**: `@typermaid/core` のみ
- **非依存**: `@typermaid/builders`, `@typermaid/codegen`

### @typermaid/builders
- 従来のBuilderクラス（後方互換性のため保持）
- 新規コードではEnhanced ASTを推奨

### @typermaid/codegen
- 従来のコード生成（後方互換性のため保持）
- 新規コードではast.asCode()を推奨

## 🎯 今後の展望

### 次のステップ候補
1. ✅ **Phase 1 & 2 完了**: 統一API実装 + Type Safety強化
2. 🔄 **Phase 3 候補**: テスト強化
   - 全Enhanced ASTの単体テスト
   - asCode()のラウンドトリップテスト（parse → asCode → parse）
3. 🔄 **Phase 4 候補**: ドキュメント拡充
   - Enhanced API使用例
   - マイグレーションガイド

## 📝 技術的な詳細

### 実装されたメソッド群

#### Flowchart Enhanced AST
- `addNode(id, shape, label): this`
- `createNode(id, shape, label): NodeID`
- `addEdge(from, to, type, label?): this`
- `replaceNode(oldId, newId): this`
- `findNodes(pattern): FlowchartNodeAST[]`
- `asCode(): string`
- `build(): FlowchartDiagram & { asCode(): string }`

#### ER Enhanced AST
- `addEntity(id, label?): EntityID`
- `addAttribute(entityId, name, type?, key?): this`
- `addRelationship(from, to, cardinality, label?, identifying?): this`
- `getEntity(id): EREntity | undefined`
- `getAllEntities(): EntityID[]`
- `replaceEntity(oldId, newId): this`
- `asCode(): string`
- `build(): ERDiagram & { asCode(): string }`

#### Class Enhanced AST
- `addClass(name, label?): ClassID`
- `addAttribute(classId, name, type, visibility?): this`
- `addMethod(classId, name, returnType?, parameters?, visibility?): this`
- `addRelation(from, to, type, label?, cardFrom?, cardTo?): this`
- `addInheritance(child, parent): this`
- `addImplementation(implementer, interface): this`
- `replaceClass(oldName, newName): this`
- `findClasses(pattern): ClassDefinition[]`
- `asCode(): string`
- `build(): ClassDiagram & { asCode(): string }`

#### Sequence Enhanced AST
- `addParticipant(id, alias?, isActor?): ParticipantID`
- `sendMessage(from, to, text, arrowType?): this`
- `addNote(actor, text, position?): this`
- `findParticipants(pattern): Array<...>`
- `replaceParticipant(oldId, newId): this`
- `asCode(): string`
- `build(): SequenceDiagram & { asCode(): string }`

#### State Enhanced AST
- `addState(id, label?, description?): StateID`
- `addCompositeState(id, label?): StateID`
- `addStateToComposite(compositeId, childId): this`
- `addTransition(from, to, label?): this`
- `addFork(id): StateID`
- `addJoin(id): StateID`
- `setStartState(stateId): this`
- `setEndState(stateId): this`
- `replaceState(oldId, newId): this`
- `asCode(): string`
- `build(): StateDiagram & { asCode(): string }`

#### Gantt Enhanced AST
- `setTitle(title): this`
- `setDateFormat(format): this`
- `addSection(name): SectionID`
- `addTask(id, name, startDate, endDate, status?): TaskID`
- `addMilestone(id, description, date, status?): TaskID`
- `addTaskToSection(sectionId, taskId): this`
- `addDependency(from, to): this`
- `replaceSection(oldId, newId): this`
- `replaceTask(oldId, newId): this`
- `asCode(): string`
- `build(): GanttDiagram & { asCode(): string }`

## 🎊 まとめ

**Phase 1 & 2 完全達成！**

- ✅ 全6種類のダイアグラムタイプで統一API実装
- ✅ クラスベースパターンで一貫性のある設計
- ✅ 循環依存を完全に解消
- ✅ Builder/codegen依存なしの独立した実装
- ✅ asCode()直接変換対応
- ✅ Branded Typesで型安全性確保
- ✅ Method chainingで流れるようなAPI
- ✅ 全parse関数がEnhanced ASTを返却

理想のユーザー体験を実現！🎉
