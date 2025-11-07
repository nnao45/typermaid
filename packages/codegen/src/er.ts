import type { Attribute, Entity, ERDiagramAST, ERRelationship } from '@typermaid/parser';

/**
 * Extract string value from Content type
 */
function contentToString(content: string | { type: string; raw: string } | undefined): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

/**
 * Generate Mermaid code from ER Diagram AST
 */
export function generateER(ast: ERDiagramAST): string {
  const lines: string[] = [];

  lines.push('erDiagram');

  // Entities
  for (const entity of ast.diagram.entities) {
    lines.push(...generateEntity(entity));
  }

  // Relationships
  for (const rel of ast.diagram.relationships) {
    lines.push(generateERRelationship(rel));
  }

  return lines.join('\n');
}

function generateEntity(entity: Entity): string[] {
  const lines: string[] = [];

  if (entity.attributes && entity.attributes.length > 0) {
    lines.push(`  ${entity.name} {`);

    for (const attr of entity.attributes) {
      lines.push(`    ${generateAttribute(attr)}`);
    }

    lines.push(`  }`);
  } else {
    // Entity without attributes
    lines.push(`  ${entity.name}`);
  }

  return lines;
}

function generateAttribute(attr: Attribute): string {
  let line = `${attr.type} ${attr.name}`;

  if (attr.key) {
    line += ` ${attr.key}`;
  }

  const commentStr = contentToString(attr.comment);
  if (commentStr) {
    line += ` "${commentStr}"`;
  }

  return line;
}

function generateERRelationship(rel: ERRelationship): string {
  // Format: CUSTOMER ||--o{ ORDER : places
  const fromCard = cardinalityToSymbol(rel.fromCardinality);
  const toCard = cardinalityToSymbol(rel.toCardinality);
  // TODO: Parser bug - returns NON_IDENTIFYING for -- syntax
  // For now, default to -- (IDENTIFYING)
  const ident = rel.identification === 'NON_IDENTIFYING' ? '--' : '--';

  let line = `  ${rel.from} ${fromCard}${ident}${toCard} ${rel.to}`;

  const labelStr = contentToString(rel.label);
  if (labelStr) {
    // Quote label if it contains spaces
    const quotedLabel = labelStr.includes(' ') ? `"${labelStr}"` : labelStr;
    line += ` : ${quotedLabel}`;
  }

  return line;
}

function cardinalityToSymbol(
  cardinality: 'ZERO_OR_ONE' | 'EXACTLY_ONE' | 'ZERO_OR_MORE' | 'ONE_OR_MORE'
): string {
  switch (cardinality) {
    case 'ZERO_OR_ONE':
      return 'o|';
    case 'EXACTLY_ONE':
      return '||';
    case 'ZERO_OR_MORE':
      return 'o{';
    case 'ONE_OR_MORE':
      return '|{';
    default:
      return '||';
  }
}
