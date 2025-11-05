import type { Token } from './lexer/tokens.js';
/**
 * Lexer error
 */
export declare class LexerError extends Error {
    readonly line: number;
    readonly column: number;
    constructor(message: string, line: number, column: number);
}
/**
 * Parser error
 */
export declare class ParserError extends Error {
    readonly token?: Token | undefined;
    constructor(message: string, line?: number, column?: number, token?: Token | undefined);
}
//# sourceMappingURL=error.d.ts.map