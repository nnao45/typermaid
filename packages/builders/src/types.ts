/**
 * Builder Types and Validation Errors
 *
 * Branded types are now imported from @typermaid/core to maintain single source of truth ✨
 */

// Re-export branded types from core
export type {
  ClassDefID,
  ClassID,
  EntityID,
  NodeID,
  ParticipantID,
  SectionID,
  StateID,
  SubgraphID,
  TaskID,
} from '@typermaid/core';

// ============================================================================
// Validation Error Types
// ============================================================================

/**
 * Error codes for validation failures
 */
export enum ValidationErrorCode {
  // Reference errors
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND',
  STATE_NOT_FOUND = 'STATE_NOT_FOUND',
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  CLASSDEF_NOT_FOUND = 'CLASSDEF_NOT_FOUND',

  // Structure errors
  DUPLICATE_ID = 'DUPLICATE_ID',
  INVALID_NESTING_DEPTH = 'INVALID_NESTING_DEPTH',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',

  // Syntax errors
  RESERVED_WORD = 'RESERVED_WORD',
  INVALID_ID_FORMAT = 'INVALID_ID_FORMAT',
  EMPTY_LABEL = 'EMPTY_LABEL',

  // Diagram-specific errors
  INVALID_EDGE_TYPE = 'INVALID_EDGE_TYPE',
  INVALID_RELATIONSHIP = 'INVALID_RELATIONSHIP',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
}

/**
 * Validation error with detailed context
 */
export class ValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';

    // Maintain proper stack trace (only in V8 environments like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

// ============================================================================
// Type Branding Helpers
// ============================================================================

// NOTE: brandID function removed - use Zod schemas from @typermaid/core instead
// Example: NodeIDSchema.parse(id) instead of brandID<NodeID>(id)

// ============================================================================
// Reserved Words (共通)
// ============================================================================

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
  'note',

  // Class keywords
  'class',
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
 * Validate ID format
 * IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens
 */
export function isValidIDFormat(id: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id);
}
