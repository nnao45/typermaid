import type { ClassDefinition, ClassDiagram, ClassRelation } from '@typermaid/core';
import type { ClassDiagramAST } from '@typermaid/parser';
import { ClassDiagramBuilder } from '../class-builder.js';
import type { ClassID } from '../types.js';

/**
 * Extract string value from Content type
 */
function contentToString(content: string | { type: string; raw: string } | undefined): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

/**
 * Convert parsed Class Diagram AST to Builder for manipulation
 *
 * @param ast - Parsed ClassDiagramAST
 * @returns ClassDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@typermaid/parser';
 * import { classASTToBuilder } from '@typermaid/builders/converters';
 *
 * const code = `
 *   classDiagram
 *     class Animal {
 *       +name: string
 *       +eat()
 *     }
 *     class Dog {
 *       +bark()
 *     }
 *     Animal <|-- Dog
 * `;
 * const ast = parse(code);
 * const builder = classASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const cat = builder.addClass('Cat');
 * builder.addRelationship('Animal', cat, 'inheritance');
 * ```
 */
export function classASTToBuilder(ast: ClassDiagramAST): ClassDiagramBuilder {
  const builder = new ClassDiagramBuilder();

  // Track class IDs
  const classIdMap = new Map<string, ClassID>();

  const diagram: ClassDiagram = ast.diagram;

  // Process classes first
  for (const cls of diagram.classes) {
    const classId = processClass(cls, builder);
    classIdMap.set(cls.name, classId);
  }

  // Process relationships
  for (const rel of diagram.relations) {
    processRelationship(rel, builder, classIdMap);
  }

  return builder;
}

/**
 * Process a single class and add to builder
 */
function processClass(cls: ClassDefinition, builder: ClassDiagramBuilder): ClassID {
  // addClass expects (name, label) but AST has only name
  // We use name as label for AST conversion
  const classId = builder.addClass(cls.name, cls.name);

  // Add members (attributes and methods)
  for (const member of cls.members) {
    builder.addMember(classId, member.name, member.type, member.visibility, member.returnType);
  }

  return classId;
}

/**
 * Process a single relationship and add to builder
 */
function processRelationship(
  rel: ClassRelation,
  builder: ClassDiagramBuilder,
  classIdMap: Map<string, ClassID>
): void {
  let fromId = classIdMap.get(rel.from);
  let toId = classIdMap.get(rel.to);

  // Auto-add classes if they don't exist (implicit declaration)
  if (!fromId) {
    fromId = builder.addClass(rel.from, rel.from);
    classIdMap.set(rel.from, fromId);
  }

  if (!toId) {
    toId = builder.addClass(rel.to, rel.to);
    classIdMap.set(rel.to, toId);
  }

  builder.addRelationship(
    fromId,
    toId,
    rel.relationType,
    contentToString(rel.label),
    rel.cardinalityFrom,
    rel.cardinalityTo
  );
}
