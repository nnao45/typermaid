import { ValidationError, ValidationErrorCode } from './errors.js';

/**
 * Mermaid reserved words that cannot be used as IDs
 */
export const RESERVED_WORDS = new Set([
  // Common keywords
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'journey',
  'pie',
  'gitGraph',
  'mindmap',
  'timeline',

  // Flowchart keywords
  'subgraph',
  'end',
  'style',
  'class',
  'classDef',
  'click',
  'call',
  'href',

  // Sequence keywords
  'participant',
  'actor',
  'loop',
  'alt',
  'else',
  'opt',
  'par',
  'and',
  'critical',
  'break',
  'note',
  'over',
  'activate',
  'deactivate',
  'autonumber',

  // State keywords
  'state',
  'fork',
  'join',
  'choice',

  // Class keywords
  'namespace',
  'interface',
  'enum',
  'annotation',
  'extends',
  'implements',

  // ER keywords
  'entity',
  'relationship',

  // Gantt keywords
  'section',
  'title',
  'dateFormat',

  // Direction keywords
  'TB',
  'TD',
  'BT',
  'LR',
  'RL',
]);

/**
 * Check if a string is a reserved word
 */
export function isReservedWord(id: string): boolean {
  return RESERVED_WORDS.has(id.toLowerCase());
}

/**
 * Validate that an ID is not a reserved word
 * @throws {ValidationError} If the ID is a reserved word
 */
export function validateNotReservedWord(id: string): void {
  if (isReservedWord(id)) {
    throw new ValidationError(
      ValidationErrorCode.RESERVED_WORD,
      `ID "${id}" is a reserved word and cannot be used. Reserved words: ${Array.from(RESERVED_WORDS).join(', ')}`,
      { id }
    );
  }
}

/**
 * Get list of all reserved words
 */
export function getReservedWords(): readonly string[] {
  return Array.from(RESERVED_WORDS);
}
