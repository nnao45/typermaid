import { DiagramSchema } from './schema.js';
export class ValidationError extends Error {
    issues;
    constructor(message, issues) {
        super(message);
        this.issues = issues;
        this.name = 'ValidationError';
    }
}
export function validateDiagram(data) {
    const result = DiagramSchema.safeParse(data);
    if (!result.success) {
        throw new ValidationError('Diagram validation failed', result.error.issues);
    }
    return result.data;
}
export function validateDiagramSafe(data) {
    const result = DiagramSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: new ValidationError('Diagram validation failed', result.error.issues),
    };
}
//# sourceMappingURL=validator.js.map