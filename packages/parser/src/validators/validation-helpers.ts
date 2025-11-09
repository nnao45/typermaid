import { ValidationError, ValidationErrorCode } from './errors.js';

/**
 * Validate that a string is not empty
 * @param value - Value to validate
 * @param errorMessage - Error message to throw
 * @param context - Additional error context
 * @throws {ValidationError} If value is empty or contains only whitespace
 */
export function validateNotEmpty(
  value: string | undefined | null,
  errorMessage: string,
  context?: Record<string, unknown>
): void {
  if (!value || value.trim() === '') {
    throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, errorMessage, context || {});
  }
}

/**
 * Validate that an ID is unique in a collection
 * @param id - ID to validate
 * @param collection - Collection to check
 * @param getId - Function to extract ID from collection items
 * @param errorMessage - Error message to throw
 * @param context - Additional error context
 * @throws {ValidationError} If ID already exists
 */
export function validateUnique<T>(
  id: string,
  collection: T[],
  getId: (item: T) => string,
  errorMessage: string,
  context?: Record<string, unknown>
): void {
  if (collection.some((item) => getId(item) === id)) {
    throw new ValidationError(ValidationErrorCode.DUPLICATE_ID, errorMessage, context || {});
  }
}

/**
 * Validate that an item exists in a collection
 * @param id - ID to find
 * @param collection - Collection to search
 * @param getId - Function to extract ID from collection items
 * @param errorMessage - Error message to throw
 * @param context - Additional error context
 * @throws {ValidationError} If item is not found
 */
export function validateExists<T>(
  id: string,
  collection: T[],
  getId: (item: T) => string,
  errorMessage: string,
  errorCode: ValidationErrorCode,
  context?: Record<string, unknown>
): void {
  if (!collection.some((item) => getId(item) === id)) {
    throw new ValidationError(errorCode, errorMessage, context || {});
  }
}
