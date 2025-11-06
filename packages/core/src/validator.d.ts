import { type Diagram } from './schema.js';
export declare class ValidationError extends Error {
    readonly issues: unknown[];
    constructor(message: string, issues: unknown[]);
}
export declare function validateDiagram(data: unknown): Diagram;
export declare function validateDiagramSafe(data: unknown): {
    success: true;
    data: Diagram;
} | {
    success: false;
    error: ValidationError;
};
//# sourceMappingURL=validator.d.ts.map