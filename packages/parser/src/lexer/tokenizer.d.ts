import type { Position, Token } from './tokens.js';
/**
 * Lexer error
 */
export declare class LexerError extends Error {
  readonly position: Position;
  constructor(message: string, position: Position);
}
/**
 * Tokenizer for Mermaid flowchart syntax
 */
export declare class Tokenizer {
  private input;
  private position;
  private line;
  private column;
  private tokens;
  constructor(input: string);
  /**
   * Tokenize the entire input
   */
  tokenize(): Token[];
  private isAtEnd;
  private peek;
  private peekNext;
  private advance;
  private match;
  private getPosition;
  private createToken;
  private scanToken;
  private skipWhitespace;
  private scanComment;
  private scanSquareBracket;
  private scanRoundBracket;
  private scanCurlyBracket;
  private scanDash;
  private scanEquals;
  private scanTilde;
  private scanString;
  private scanNumber;
  private scanIdentifier;
  private getKeywordType;
  private isDigit;
  private isAlpha;
  private isAlphaNumeric;
  private isSpecialChar;
}
//# sourceMappingURL=tokenizer.d.ts.map
