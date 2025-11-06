/**
 * Branded Types for Type-Level Proof System
 *
 * These types provide compile-time guarantees that only valid IDs are used
 * when building diagrams. Each diagram type has its own branded ID types.
 */

// ============================================================================
// Flowchart Branded Types
// ============================================================================

/**
 * Branded type for Flowchart node IDs
 * Ensures only registered nodes can be referenced in edges
 */
export type NodeID = string & { readonly __brand: 'NodeID' };

/**
 * Branded type for Subgraph IDs
 */
export type SubgraphID = string & { readonly __brand: 'SubgraphID' };

/**
 * Branded type for ClassDef IDs
 */
export type ClassDefID = string & { readonly __brand: 'ClassDefID' };

// ============================================================================
// Sequence Diagram Branded Types
// ============================================================================

/**
 * Branded type for Participant/Actor IDs
 * Ensures only declared participants can send/receive messages
 */
export type ParticipantID = string & { readonly __brand: 'ParticipantID' };

/**
 * Branded type for Note IDs
 */
export type NoteID = string & { readonly __brand: 'NoteID' };

// ============================================================================
// State Diagram Branded Types
// ============================================================================

/**
 * Branded type for State IDs
 * Ensures only declared states can be referenced in transitions
 */
export type StateID = string & { readonly __brand: 'StateID' };

// ============================================================================
// Class Diagram Branded Types
// ============================================================================

/**
 * Branded type for Class IDs
 */
export type ClassID = string & { readonly __brand: 'ClassID' };

// ============================================================================
// ER Diagram Branded Types
// ============================================================================

/**
 * Branded type for Entity IDs
 */
export type EntityID = string & { readonly __brand: 'EntityID' };

// ============================================================================
// Gantt Chart Branded Types
// ============================================================================

/**
 * Branded type for Task IDs
 */
export type TaskID = string & { readonly __brand: 'TaskID' };

/**
 * Branded type for Section IDs
 */
export type SectionID = string & { readonly __brand: 'SectionID' };

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

/**
 * Brand a string as a specific ID type
 *
 * @internal This should only be used by builder classes
 */
export function brandID<T extends string>(id: string): T {
  return id as T;
}

/**
 * Unbrand an ID back to a plain string
 * Useful for serialization or logging
 */
export function unbrandID<T extends string>(id: T): string {
  return id as string;
}

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
