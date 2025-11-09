/**
 * Validation Error Types
 */

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
