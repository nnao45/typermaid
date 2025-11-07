import type {
  Actor,
  Alt,
  Break,
  Critical,
  Loop,
  Message,
  Note,
  Opt,
  Par,
  Participant,
  Rect,
  SequenceDiagramAST,
} from '@typermaid/parser';

/**
 * Generate Mermaid code from Sequence Diagram AST
 */
export function generateSequence(ast: SequenceDiagramAST): string {
  const lines: string[] = [];

  lines.push('sequenceDiagram');

  // Autonumber if present (check top-level or style)
  const autonumber = (ast.diagram as unknown as { autonumber?: boolean }).autonumber;
  if (autonumber) {
    lines.push('  autonumber');
  }

  // Generate statements
  for (const stmt of ast.diagram.statements) {
    lines.push(...generateSequenceStatement(stmt, 1));
  }

  return lines.join('\n');
}

function generateSequenceStatement(stmt: unknown, indent: number): string[] {
  const indentStr = '  '.repeat(indent);
  const stmtTyped = stmt as { type: string };

  switch (stmtTyped.type) {
    case 'participant':
      return [generateParticipant(stmt as Participant, indentStr)];
    case 'actor':
      return [generateActor(stmt as Actor, indentStr)];
    case 'message':
      return [generateMessage(stmt as Message, indentStr)];
    case 'note':
      return [generateNote(stmt as Note, indentStr)];
    case 'loop':
      return generateLoop(stmt as Loop, indent);
    case 'alt':
      return generateAlt(stmt as Alt, indent);
    case 'opt':
      return generateOpt(stmt as Opt, indent);
    case 'par':
      return generatePar(stmt as Par, indent);
    case 'critical':
      return generateCritical(stmt as Critical, indent);
    case 'break':
      return generateBreak(stmt as Break, indent);
    case 'rect':
      return generateRect(stmt as Rect, indent);
    case 'activation':
    case 'create':
    case 'destroy':
    case 'box':
    case 'link':
    case 'properties':
    case 'autonumber':
      // Skip unsupported statement types for now
      return [];
    default:
      return [];
  }
}

function generateParticipant(stmt: Participant, indent: string): string {
  if (stmt.alias) {
    return `${indent}participant ${stmt.id} as ${stmt.alias}`;
  }
  return `${indent}participant ${stmt.id}`;
}

function generateActor(stmt: Actor, indent: string): string {
  if (stmt.alias) {
    return `${indent}actor ${stmt.id} as ${stmt.alias}`;
  }
  return `${indent}actor ${stmt.id}`;
}

function generateMessage(stmt: Message, indent: string): string {
  let arrow = '';

  switch (stmt.arrowType) {
    case 'solid_arrow':
      arrow = '->>';
      break;
    case 'dotted_arrow':
      arrow = '-->>';
      break;
    case 'solid_open':
      arrow = '->';
      break;
    case 'dotted_open':
      arrow = '-->';
      break;
    case 'solid_cross':
      arrow = '-x';
      break;
    case 'dotted_cross':
      arrow = '--x';
      break;
    case 'solid':
      arrow = '-';
      break;
    case 'dotted':
      arrow = '-.';
      break;
    default:
      arrow = '->>';
  }

  return `${indent}${stmt.from}${arrow}${stmt.to}: ${stmt.text || ''}`;
}

function generateNote(stmt: Note, indent: string): string {
  const position = stmt.position || 'over';
  const actors = stmt.actors.join(',');
  const noteText = stmt.text || '';

  return `${indent}note ${position} ${actors}: ${noteText}`;
}

function generateLoop(stmt: Loop, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  if (stmt.condition) {
    lines.push(`${indentStr}loop ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}loop`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generateAlt(stmt: Alt, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  // Main alt block
  if (stmt.condition) {
    lines.push(`${indentStr}alt ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}alt`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  // Else blocks
  for (const elseBlock of stmt.elseBlocks) {
    if (elseBlock.condition) {
      lines.push(`${indentStr}else ${elseBlock.condition}`);
    } else {
      lines.push(`${indentStr}else`);
    }

    for (const s of elseBlock.statements) {
      lines.push(...generateSequenceStatement(s, indent + 1));
    }
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generateOpt(stmt: Opt, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  if (stmt.condition) {
    lines.push(`${indentStr}opt ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}opt`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generatePar(stmt: Par, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  // Main par block
  if (stmt.condition) {
    lines.push(`${indentStr}par ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}par`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  // And blocks
  for (const andBlock of stmt.andBlocks) {
    if (andBlock.condition) {
      lines.push(`${indentStr}and ${andBlock.condition}`);
    } else {
      lines.push(`${indentStr}and`);
    }

    for (const s of andBlock.statements) {
      lines.push(...generateSequenceStatement(s, indent + 1));
    }
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generateCritical(stmt: Critical, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  if (stmt.condition) {
    lines.push(`${indentStr}critical ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}critical`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generateBreak(stmt: Break, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  if (stmt.condition) {
    lines.push(`${indentStr}break ${stmt.condition}`);
  } else {
    lines.push(`${indentStr}break`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  lines.push(`${indentStr}end`);
  return lines;
}

function generateRect(stmt: Rect, indent: number): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);

  if (stmt.color) {
    lines.push(`${indentStr}rect ${stmt.color}`);
  } else {
    lines.push(`${indentStr}rect`);
  }

  for (const s of stmt.statements) {
    lines.push(...generateSequenceStatement(s, indent + 1));
  }

  lines.push(`${indentStr}end`);
  return lines;
}
