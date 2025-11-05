/**
 * Lexer error
 */
export class LexerError extends Error {
    line;
    column;
    constructor(message, line, column) {
        super(`${message} at line ${line}, column ${column}`);
        this.line = line;
        this.column = column;
        this.name = 'LexerError';
    }
}
/**
 * Parser error
 */
export class ParserError extends Error {
    token;
    constructor(message, line, column, token) {
        const location = line !== undefined && column !== undefined
            ? ` at line ${line}, column ${column}`
            : token
                ? ` at line ${token.start.line}, column ${token.start.column}`
                : '';
        super(`${message}${location}`);
        this.token = token;
        this.name = 'ParserError';
    }
}
//# sourceMappingURL=error.js.map