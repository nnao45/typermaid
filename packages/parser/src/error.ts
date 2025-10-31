import type { Token } from './lexer/tokens.js';

/**
 * Parser error
 */
export class ParserError extends Error {
  constructor(
    message: string,
    public readonly token?: Token
  ) {
    super(token ? `${message} at line ${token.start.line}, column ${token.start.column}` : message);
    this.name = 'ParserError';
  }
}
