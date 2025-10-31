import { type Diagram, DiagramSchema } from './schema.js';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: unknown[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateDiagram(data: unknown): Diagram {
  const result = DiagramSchema.safeParse(data);

  if (!result.success) {
    throw new ValidationError('Diagram validation failed', result.error.issues);
  }

  return result.data;
}

export function validateDiagramSafe(
  data: unknown
): { success: true; data: Diagram } | { success: false; error: ValidationError } {
  const result = DiagramSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: new ValidationError('Diagram validation failed', result.error.issues),
  };
}
