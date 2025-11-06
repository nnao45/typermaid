import { isReservedWord, RESERVED_WORDS, ValidationError, ValidationErrorCode } from '../types.js';

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
