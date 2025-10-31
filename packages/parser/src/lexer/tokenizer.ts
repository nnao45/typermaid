import type { Position, Token, TokenType } from './tokens.js';
import { createToken } from './tokens.js';

/**
 * Lexer error
 */
export class LexerError extends Error {
  constructor(
    message: string,
    public readonly position: Position
  ) {
    super(`${message} at line ${position.line}, column ${position.column}`);
    this.name = 'LexerError';
  }
}

/**
 * Tokenizer for Mermaid flowchart syntax
 */
export class Tokenizer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 0;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the entire input
   */
  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 0;

    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.tokens.push(this.createToken('EOF', ''));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.input[this.position] ?? '\0';
  }

  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1] ?? '\0';
  }

  private advance(): string {
    const char = this.peek();
    this.position++;
    this.column++;
    return char;
  }

  private match(expected: string): boolean {
    if (this.peek() === expected) {
      this.advance();
      return true;
    }
    return false;
  }

  private getPosition(): Position {
    return {
      line: this.line,
      column: this.column,
      offset: this.position,
    };
  }

  private createToken(type: TokenType, value: string): Token {
    const end = this.getPosition();
    const start: Position = {
      line: end.line,
      column: Math.max(0, end.column - value.length),
      offset: end.offset - value.length,
    };
    return createToken(type, value, start, end);
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      case '\n':
        this.line++;
        this.column = 0;
        this.tokens.push(this.createToken('NEWLINE', '\n'));
        break;

      case ' ':
      case '\t':
      case '\r':
        this.skipWhitespace();
        break;

      case '%':
        if (this.match('%')) {
          this.scanComment();
        }
        break;

      case '[':
        this.scanSquareBracket();
        break;

      case ']':
        this.tokens.push(this.createToken('SQUARE_CLOSE', ']'));
        break;

      case '(':
        this.scanRoundBracket();
        break;

      case ')':
        this.tokens.push(this.createToken('ROUND_CLOSE', ')'));
        break;

      case '{':
        this.scanCurlyBracket();
        break;

      case '}':
        this.tokens.push(this.createToken('CURLY_CLOSE', '}'));
        break;

      case '>':
        this.tokens.push(this.createToken('ASYMMETRIC', '>'));
        break;

      case '-':
        this.scanDash();
        break;

      case '=':
        this.scanEquals();
        break;

      case '~':
        this.scanTilde();
        break;

      case '.':
        // Skip standalone dots (not part of dotted edges)
        break;

      case 'o':
        if (this.match('-')) {
          this.tokens.push(this.createToken('CIRCLE_EDGE', 'o-'));
        } else {
          this.scanIdentifier(char);
        }
        break;

      case 'x':
        if (this.match('-')) {
          this.tokens.push(this.createToken('CROSS_EDGE', 'x-'));
        } else {
          this.scanIdentifier(char);
        }
        break;

      case '|':
        this.tokens.push(this.createToken('PIPE', '|'));
        break;

      case ';':
        this.tokens.push(this.createToken('SEMICOLON', ';'));
        break;

      case ':':
        this.tokens.push(this.createToken('COLON', ':'));
        break;

      case ',':
        this.tokens.push(this.createToken('COMMA', ','));
        break;

      case '"':
      case "'":
        this.scanString(char);
        break;

      default:
        if (this.isDigit(char)) {
          this.scanNumber(char);
        } else if (this.isAlpha(char)) {
          this.scanIdentifier(char);
        } else {
          const pos = this.getPosition();
          throw new LexerError(`Unexpected character: ${char}`, pos);
        }
    }
  }

  private skipWhitespace(): void {
    while (this.peek() === ' ' || this.peek() === '\t' || this.peek() === '\r') {
      this.advance();
    }
  }

  private scanComment(): void {
    let comment = '%%';
    while (!this.isAtEnd() && this.peek() !== '\n') {
      comment += this.advance();
    }
    this.tokens.push(this.createToken('COMMENT', comment));
  }

  private scanSquareBracket(): void {
    if (this.match('[')) {
      this.tokens.push(this.createToken('SQUARE_OPEN', '[['));
    } else if (this.match('(')) {
      this.tokens.push(this.createToken('SQUARE_OPEN', '[('));
    } else if (this.match('/')) {
      this.tokens.push(this.createToken('SQUARE_OPEN', '[/'));
    } else if (this.match('\\')) {
      this.tokens.push(this.createToken('SQUARE_OPEN', '[\\'));
    } else {
      this.tokens.push(this.createToken('SQUARE_OPEN', '['));
    }
  }

  private scanRoundBracket(): void {
    if (this.match('(')) {
      if (this.match('(')) {
        this.tokens.push(this.createToken('ROUND_OPEN', '((('));
      } else {
        this.tokens.push(this.createToken('ROUND_OPEN', '(('));
      }
    } else if (this.match('[')) {
      this.tokens.push(this.createToken('ROUND_OPEN', '(['));
    } else {
      this.tokens.push(this.createToken('ROUND_OPEN', '('));
    }
  }

  private scanCurlyBracket(): void {
    if (this.match('{')) {
      this.tokens.push(this.createToken('CURLY_OPEN', '{{'));
    } else {
      this.tokens.push(this.createToken('CURLY_OPEN', '{'));
    }
  }

  private scanDash(): void {
    let dashes = '-';
    while (this.peek() === '-') {
      dashes += this.advance();
    }

    if (this.match('>')) {
      this.tokens.push(this.createToken('ARROW', `${dashes}>`));
    } else if (this.match('o')) {
      this.tokens.push(this.createToken('CIRCLE_EDGE', `${dashes}o`));
    } else if (this.match('x')) {
      this.tokens.push(this.createToken('CROSS_EDGE', `${dashes}x`));
    } else if (this.match('.')) {
      // dotted line: -.-
      let value = `${dashes}.`;
      while (this.peek() === '-') {
        value += this.advance();
      }
      if (this.match('>')) {
        this.tokens.push(this.createToken('DOTTED_ARROW', `${value}>`));
      } else {
        this.tokens.push(this.createToken('DOTTED_LINE', value));
      }
    } else {
      this.tokens.push(this.createToken('LINE', dashes));
    }
  }

  private scanEquals(): void {
    let equals = '=';
    while (this.peek() === '=') {
      equals += this.advance();
    }

    if (this.match('>')) {
      this.tokens.push(this.createToken('THICK_ARROW', `${equals}>`));
    } else {
      this.tokens.push(this.createToken('THICK_LINE', equals));
    }
  }

  private scanTilde(): void {
    let tildes = '~';
    while (this.peek() === '~') {
      tildes += this.advance();
    }
    this.tokens.push(this.createToken('INVISIBLE', tildes));
  }

  private scanString(quote: string): void {
    let value = '';
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 0;
      }
      value += this.advance();
    }

    if (this.isAtEnd()) {
      throw new LexerError('Unterminated string', this.getPosition());
    }

    this.advance(); // closing quote
    this.tokens.push(this.createToken('STRING', value));
  }

  private scanNumber(first: string): void {
    let value = first;
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // .
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.tokens.push(this.createToken('NUMBER', value));
  }

  private scanIdentifier(first: string): void {
    let value = first;
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    const type = this.getKeywordType(value);
    this.tokens.push(this.createToken(type, value));
  }

  private getKeywordType(value: string): TokenType {
    const keywords: Record<string, TokenType> = {
      flowchart: 'FLOWCHART',
      graph: 'GRAPH',
      subgraph: 'SUBGRAPH',
      end: 'END',
      classDef: 'CLASSDEF',
      class: 'CLASS',
      click: 'CLICK',
      style: 'STYLE',
      TB: 'TB',
      TD: 'TD',
      BT: 'BT',
      LR: 'LR',
      RL: 'RL',
    };

    return keywords[value] ?? 'IDENTIFIER';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
