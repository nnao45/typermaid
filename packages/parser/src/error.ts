import type { Token } from './lexer/tokens.js';

/**
 * Lexer error
 */
export class LexerError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number
  ) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = 'LexerError';
  }
}

/**
 * Parser error
 */
export class ParserError extends Error {
  constructor(
    message: string,
    line?: number,
    column?: number,
    public readonly token?: Token
  ) {
    const location =
      line !== undefined && column !== undefined
        ? ` at line ${line}, column ${column}`
        : token
          ? ` at line ${token.start.line}, column ${token.start.column}`
          : '';
    super(`${message}${location}`);
    this.name = 'ParserError';
  }
}
