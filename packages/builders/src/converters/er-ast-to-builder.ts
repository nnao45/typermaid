import type { ERDiagram, EREntity, ERRelationship } from '@typermaid/core';
import type { ERDiagramAST } from '@typermaid/parser';
import { ERDiagramBuilder } from '../er-builder.js';
import type { EntityID } from '../types.js';

/**
 * Extract string value from Content type
 */
function contentToString(content: string | { type: string; raw: string } | undefined): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

/**
 * Convert parsed ER Diagram AST to Builder for manipulation
 *
 * @param ast - Parsed ERDiagramAST
 * @returns ERDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@typermaid/parser';
 * import { erASTToBuilder } from '@typermaid/builders/converters';
 *
 * const code = `
 *   erDiagram
 *     CUSTOMER {
 *       string name
 *       int id
 *     }
 *     ORDER {
 *       int orderId
 *     }
 *     CUSTOMER ||--o{ ORDER : places
 * `;
 * const ast = parse(code);
 * const builder = erASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const product = builder.addEntity('PRODUCT');
 * builder.addRelationship('ORDER', product, 'one-to-many', 'contains');
 * ```
 */
export function erASTToBuilder(ast: ERDiagramAST): ERDiagramBuilder {
  const builder = new ERDiagramBuilder();

  // Track entity IDs
  const entityIdMap = new Map<string, EntityID>();

  const diagram: ERDiagram = ast.diagram;

  // Process entities first
  for (const entity of diagram.entities) {
    const entityId = processEntity(entity, builder);
    entityIdMap.set(entity.name, entityId);
  }

  // Process relationships
  for (const rel of diagram.relationships) {
    processRelationship(rel, builder, entityIdMap);
  }

  return builder;
}

/**
 * Process a single entity and add to builder
 */
function processEntity(entity: EREntity, builder: ERDiagramBuilder): EntityID {
  // addEntity expects (name, label) but AST has only name
  // We use name as label for AST conversion
  const entityId = builder.addEntity(entity.name, entity.name);

  // Add attributes
  for (const attr of entity.attributes) {
    // attr.key is ERAttributeKey (PK, FK, UK) or undefined
    // Builder expects isPrimaryKey: boolean
    const isPrimaryKey = attr.key === 'PK';
    builder.addAttribute(entityId, attr.name, attr.type, isPrimaryKey);
  }

  return entityId;
}

/**
 * Process a single relationship and add to builder
 */
function processRelationship(
  rel: ERRelationship,
  builder: ERDiagramBuilder,
  entityIdMap: Map<string, EntityID>
): void {
  let fromId = entityIdMap.get(rel.from);
  let toId = entityIdMap.get(rel.to);

  // Auto-add entities if they don't exist (implicit declaration)
  if (!fromId) {
    fromId = builder.addEntity(rel.from, rel.from);
    entityIdMap.set(rel.from, fromId);
  }

  if (!toId) {
    toId = builder.addEntity(rel.to, rel.to);
    entityIdMap.set(rel.to, toId);
  }

  // Convert cardinalities to Mermaid notation
  // EXACTLY_ONE || ZERO_OR_ONE |o ZERO_OR_MORE }o ONE_OR_MORE }|
  const cardinalityMap: Record<string, string> = {
    EXACTLY_ONE: '||',
    ZERO_OR_ONE: '|o',
    ZERO_OR_MORE: '}o',
    ONE_OR_MORE: '}|',
  };

  const fromCard = cardinalityMap[rel.fromCardinality] ?? '||';
  const toCard = cardinalityMap[rel.toCardinality] ?? '||';
  const cardinality = `${fromCard}--${toCard}`;

  builder.addRelationship(
    fromId,
    toId,
    cardinality,
    contentToString(rel.label),
    rel.identification === 'IDENTIFYING'
  );
}
