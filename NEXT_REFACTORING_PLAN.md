# 🎯 Next Refactoring Plan - Priority Recommendations

リファクタリング観点で次にやるべきことを決めたわよ～！💅✨

---

## 📊 Current Analysis Results

### Code Volume
```
Builders: 2,495 lines (6 files)
Enhanced AST: 2,044 lines (11 files)  
Codegen: 859 lines (7 files)
Total Core: 5,398 lines
```

### Duplication Detected
```
ValidationError throws: 94 occurrences
Similar constructors: 11 patterns
ID existence checks: ~50+ occurrences
Empty string checks: ~20+ occurrences
Build methods: 6 similar patterns
Generate functions: 7 similar patterns
```

---

## 🎯 Priority 1: Builder Base Class (HIGH IMPACT) 🔥

### Problem
6つのBuilderクラスが同じパターンを繰り返してる：
- ID validation (createXXXID + error handling)
- Empty string validation
- Duplicate ID checks
- Reserved word validation
- Build method pattern

### Current Duplication
```typescript
// This pattern appears 6 times with slight variations
addClass(name: string, label: string): ClassID {
  let classId: ClassID;
  try {
    classId = createClassID(name);
  } catch (_error) {
    throw new ValidationError(
      ValidationErrorCode.INVALID_ID_FORMAT,
      `Invalid ID format...`,
      { id: name }
    );
  }
  
  if (!label || label.trim() === '') {
    throw new ValidationError(...);
  }
  
  validateNotReservedWord(name);
  
  if (this.classes.has(classId)) {
    throw new ValidationError(
      ValidationErrorCode.DUPLICATE_ID, ...
    );
  }
  // ...
}
```

### Solution: Abstract Base Builder
```typescript
abstract class DiagramBuilder<ID, Item, Diagram> {
  protected items = new Map<ID, Item>();
  
  protected validateAndCreateID<T extends z.ZodType>(
    id: string,
    schema: T,
    entityType: string
  ): z.infer<T> {
    try {
      return schema.parse(id);
    } catch (_error) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ${entityType} ID format: "${id}"`,
        { id }
      );
    }
  }
  
  protected validateUnique(id: ID, entityType: string): void {
    if (this.items.has(id)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `${entityType} with ID "${id}" already exists`,
        { id }
      );
    }
  }
  
  abstract build(): Diagram;
}

// Then each builder becomes:
class ClassDiagramBuilder extends DiagramBuilder<ClassID, ClassDefinition, ClassDiagram> {
  addClass(name: string, label: string): ClassID {
    const classId = this.validateAndCreateID(name, ClassIDSchema, 'Class');
    validateNotEmpty(label, 'Class label cannot be empty');
    validateNotReservedWord(name);
    this.validateUnique(classId, 'Class');
    
    this.items.set(classId, { name: classId, members: [], label });
    return classId;
  }
  
  build(): ClassDiagram {
    return { type: 'class', classes: Array.from(this.items.values()), relations: this.relations };
  }
}
```

### Impact
- **Lines Reduced**: ~300-400 lines
- **Maintainability**: ⬆️⬆️⬆️ (Single point of change)
- **Type Safety**: ✅ Maintained
- **Effort**: 2-3 hours

---

## 🎯 Priority 2: Enhanced AST Base Class (MEDIUM IMPACT) 💪

### Problem
11個のEnhanced ASTクラスが似たconstructorとプロパティを持ってる：
```typescript
// This pattern repeats 11 times
constructor(ast: XXXDiagramAST) {
  this.diagram = { ...ast.diagram };
  this.loc = ast.loc;
  
  if (!this.diagram.something) {
    this.diagram.something = [];
  }
}
```

### Solution: Base Enhanced AST
```typescript
abstract class BaseEnhancedAST<T extends { type: string; diagram: unknown }> {
  type: T['type'];
  diagram: T['diagram'];
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  
  constructor(ast: T) {
    this.type = ast.type;
    this.diagram = { ...ast.diagram as object } as T['diagram'];
    this.loc = ast.loc;
    this.initializeDiagram();
  }
  
  protected abstract initializeDiagram(): void;
  abstract asCode(): string;
  abstract build(): T['diagram'] & { asCode(): string };
}

class EnhancedSequenceDiagramAST extends BaseEnhancedAST<SequenceDiagramAST> {
  protected initializeDiagram(): void {
    if (!this.diagram.statements) {
      this.diagram.statements = [];
    }
  }
  
  // Only diagram-specific methods here
  addParticipant(id: string, alias?: string): ParticipantID { ... }
}
```

### Impact
- **Lines Reduced**: ~150-200 lines
- **Maintainability**: ⬆️⬆️ (Consistent pattern)
- **Type Safety**: ✅ Maintained with generics
- **Effort**: 3-4 hours

---

## 🎯 Priority 3: Codegen Function Wrapper (LOW-MEDIUM IMPACT) 🎨

### Problem
7個のgenerate関数が同じ構造：
```typescript
export function generateXXX(ast: XXXDiagramAST): string {
  const lines: string[] = [];
  // Build lines array
  return lines.join('\n');
}
```

### Solution: Template Method Pattern
```typescript
abstract class DiagramGenerator<T> {
  generate(ast: T): string {
    const lines: string[] = [];
    this.generateHeader(lines, ast);
    this.generateBody(lines, ast);
    this.generateFooter(lines, ast);
    return lines.join('\n');
  }
  
  protected abstract generateHeader(lines: string[], ast: T): void;
  protected abstract generateBody(lines: string[], ast: T): void;
  protected generateFooter(lines: string[], ast: T): void {
    // Optional override
  }
}

class SequenceGenerator extends DiagramGenerator<SequenceDiagramAST> {
  protected generateHeader(lines: string[], ast: SequenceDiagramAST): void {
    lines.push('sequenceDiagram');
  }
  
  protected generateBody(lines: string[], ast: SequenceDiagramAST): void {
    for (const stmt of ast.diagram.statements) {
      // Generate statements
    }
  }
}
```

### Impact
- **Lines Reduced**: ~100-150 lines
- **Maintainability**: ⬆️ (Clear structure)
- **Extensibility**: ⬆️⬆️ (Easy to add hooks)
- **Effort**: 2-3 hours

---

## 🎯 Priority 4: Validation Utilities Expansion (QUICK WIN) ⚡

### Problem
まだ使ってないvalidation helpersがある。全Builderに適用すべき。

### Current
```typescript
// Only sequence-builder.ts uses validateNotEmpty
validateNotEmpty(text, 'Message text cannot be empty', { from, to });
```

### Solution
```typescript
// Apply to all 6 builders (94 ValidationError occurrences)
// class-builder.ts (15 errors) → use helpers
// er-builder.ts (13 errors) → use helpers
// flowchart-builder.ts (13 errors) → use helpers
// gantt-builder.ts (28 errors) → use helpers
// state-builder.ts (18 errors) → use helpers
```

### Impact
- **Lines Reduced**: ~150-200 lines
- **Consistency**: ⬆️⬆️⬆️ (Uniform error handling)
- **Effort**: 1-2 hours (Quick win!)

---

## 📋 Recommended Execution Order

### Phase 1: Quick Wins (1-2 hours) ⚡
**Task**: Apply validation helpers to all builders
- ✅ Immediate value
- ✅ Low risk
- ✅ Reduces ~150 lines
- **Start here!**

### Phase 2: Builder Abstraction (2-3 hours) 🔥
**Task**: Create abstract DiagramBuilder base class
- ✅ High impact
- ✅ Reduces ~300-400 lines
- ⚠️ Medium risk (touches 6 files)
- **Do this next**

### Phase 3: Enhanced AST Abstraction (3-4 hours) 💪
**Task**: Create BaseEnhancedAST class
- ✅ Good impact
- ✅ Reduces ~150-200 lines
- ⚠️ Medium-high risk (touches 11 files)
- **Third priority**

### Phase 4: Codegen Refactor (2-3 hours) 🎨
**Task**: Apply template method pattern
- ✅ Medium impact
- ✅ Reduces ~100-150 lines
- ⚠️ Low-medium risk
- **Optional/Future**

---

## 📊 Expected Total Impact

### Code Reduction
```
Phase 1: ~150-200 lines
Phase 2: ~300-400 lines
Phase 3: ~150-200 lines
Phase 4: ~100-150 lines
─────────────────────
Total:   ~700-950 lines removed! 🎉
```

### Quality Improvements
- ✨ **DRY**: Eliminate massive duplication
- 🎯 **Single Responsibility**: Clear abstractions
- 🔧 **Maintainability**: Change once, affect many
- 📚 **Readability**: Less boilerplate
- 🧪 **Testability**: Test base classes once

### Time Investment
```
Phase 1: 1-2 hours   (ROI: High ⚡)
Phase 2: 2-3 hours   (ROI: Very High 🔥)
Phase 3: 3-4 hours   (ROI: Medium-High 💪)
Phase 4: 2-3 hours   (ROI: Medium 🎨)
─────────────────────
Total:   8-12 hours
```

---

## 💡 Recommendation: Start with Phase 1 + Phase 2

**Why?**
1. **Quick Win First**: Phase 1 gives immediate results in 1-2 hours
2. **Biggest Impact**: Phase 2 reduces the most duplication (300-400 lines)
3. **Test Coverage**: We have 192 tests to catch any issues
4. **Clear Benefit**: Both are obvious improvements with proven patterns

**After Phase 1 + 2:**
- ✅ ~450-600 lines reduced
- ✅ All builders use consistent validation
- ✅ Clear base class hierarchy
- ✅ Much easier to maintain
- ✅ Ready for Phase 3 if needed

---

## 🎯 Final Decision: What Should We Do Next?

### My Recommendation: Phase 1 + Phase 2 Combined 💎

**Tasks:**
1. ✅ Expand validation helpers usage (1-2h)
2. ✅ Create abstract DiagramBuilder (2-3h)
3. ✅ Apply to all 6 builders (included)
4. ✅ Run full test suite (included)

**Total Time:** 3-5 hours  
**Total Impact:** ~450-600 lines removed  
**Risk:** Low-Medium (good test coverage)  
**Benefit:** Massive improvement in maintainability

やる？💪✨

---

*Created: 2025-11-09*  
*Analysis by: Claude (Black Gal Mode) 💅*
