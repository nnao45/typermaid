import { LexerError } from '../error.js';
import type { Token, TokenType } from './tokens.js';

export class SequenceTokenizer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.pos = 0;
    this.line = 1;
    this.column = 1;

    while (this.pos < this.input.length) {
      this.scanToken();
    }

    this.addToken('EOF', '');
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.current();

    // Skip whitespace except newlines
    if (char === ' ' || char === '\t' || char === '\r') {
      this.advance();
      return;
    }

    // Handle newlines
    if (char === '\n') {
      this.addToken('NEWLINE', '\n');
      this.advance();
      this.line++;
      this.column = 1;
      return;
    }

    // Handle comments
    if (char === '%' && this.peek() === '%') {
      this.scanComment();
      return;
    }

    // Handle message arrows
    const messageToken = this.tryMatchMessageArrow();
    if (messageToken) {
      return;
    }

    // Handle activation
    if (char === '+') {
      this.addToken('PLUS', '+');
      this.advance();
      return;
    }

    if (char === '-' && this.peek() !== '-' && this.peek() !== '>') {
      this.addToken('MINUS', '-');
      this.advance();
      return;
    }

    // Handle colon and text after it
    if (char === ':') {
      this.addToken('COLON', ':');
      this.advance();
      this.skipWhitespace();
      if (!this.isAtNewlineOrEnd()) {
        this.scanText();
      }
      return;
    }

    // Handle special characters used in various contexts
    if (
      char === '(' ||
      char === ')' ||
      char === ',' ||
      char === '@' ||
      char === '.' ||
      char === '{' ||
      char === '}' ||
      char === '"' ||
      char === '<' ||
      char === '>' ||
      char === '/' ||
      char === '=' ||
      char === '[' ||
      char === ']'
    ) {
      this.addToken('SPECIAL_CHAR', char);
      this.advance();
      return;
    }

    // Handle numbers
    if (this.isDigit(char)) {
      this.scanNumber();
      return;
    }

    // Try to match keywords or identifiers
    if (this.isAlpha(char)) {
      this.scanIdentifierOrKeyword();
      return;
    }

    throw new LexerError(`Unexpected character: ${char}`, this.line, this.column);
  }

  private tryMatchMessageArrow(): boolean {
    // ->>
    if (this.current() === '-' && this.peek(1) === '>' && this.peek(2) === '>') {
      this.addToken('SEQ_SOLID_ARROW', '->>');
      this.advance(3);
      return true;
    }

    // -->>
    if (
      this.current() === '-' &&
      this.peek(1) === '-' &&
      this.peek(2) === '>' &&
      this.peek(3) === '>'
    ) {
      this.addToken('SEQ_DOTTED_ARROW', '-->>');
      this.advance(4);
      return true;
    }

    // -x
    if (this.current() === '-' && this.peek(1) === 'x') {
      this.addToken('SEQ_SOLID_CROSS', '-x');
      this.advance(2);
      return true;
    }

    // --x
    if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === 'x') {
      this.addToken('SEQ_DOTTED_CROSS', '--x');
      this.advance(3);
      return true;
    }

    // -)
    if (this.current() === '-' && this.peek(1) === ')') {
      this.addToken('SEQ_SOLID_OPEN', '-)');
      this.advance(2);
      return true;
    }

    // --)
    if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === ')') {
      this.addToken('SEQ_DOTTED_OPEN', '--)');
      this.advance(3);
      return true;
    }

    // ->
    if (this.current() === '-' && this.peek(1) === '>') {
      this.addToken('SEQ_SOLID_ARROW_SIMPLE', '->');
      this.advance(2);
      return true;
    }

    // -->
    if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === '>') {
      this.addToken('SEQ_DOTTED_ARROW_SIMPLE', '-->');
      this.advance(3);
      return true;
    }

    return false;
  }

  private scanComment(): void {
    let value = '';

    this.advance(2); // Skip %%

    while (this.pos < this.input.length && this.current() !== '\n') {
      value += this.current();
      this.advance();
    }

    this.addToken('COMMENT', value);
  }

  private scanIdentifierOrKeyword(): void {
    let value = '';

    while (
      this.pos < this.input.length &&
      (this.isAlphaNumeric(this.current()) || this.current() === '_')
    ) {
      value += this.current();
      this.advance();
    }

    const type = this.getKeywordType(value);
    this.addToken(type, value);
  }

  private getKeywordType(value: string): TokenType {
    const lower = value.toLowerCase();
    const keywords: Record<string, TokenType> = {
      sequencediagram: 'SEQUENCEDIAGRAM',
      participant: 'PARTICIPANT',
      actor: 'ACTOR',
      note: 'NOTE',
      loop: 'LOOP',
      alt: 'ALT',
      else: 'ELSE',
      opt: 'OPT',
      par: 'PAR',
      and: 'AND',
      critical: 'CRITICAL',
      option: 'OPTION',
      break: 'BREAK',
      end: 'END',
      autonumber: 'AUTONUMBER',
      activate: 'ACTIVATE',
      deactivate: 'DEACTIVATE',
      left: 'LEFT_OF',
      right: 'RIGHT_OF',
      over: 'OVER',
      as: 'AS',
      of: 'OF',
      rect: 'RECT',
      rgb: 'RGB',
      rgba: 'RGBA',
      link: 'LINK',
      links: 'LINKS',
      properties: 'PROPERTIES',
      create: 'CREATE',
      destroy: 'DESTROY',
      box: 'BOX',
    };

    return keywords[lower] || 'IDENTIFIER';
  }

  private scanNumber(): void {
    let value = '';

    while (this.isDigit(this.current())) {
      value += this.current();
      this.advance();
    }

    this.addToken('NUMBER', value);
  }

  private scanText(): void {
    let value = '';

    while (!this.isAtNewlineOrEnd()) {
      value += this.current();
      this.advance();
    }

    if (value.trim()) {
      this.addToken('TEXT', value.trim());
    }
  }

  private skipWhitespace(): void {
    while (this.current() === ' ' || this.current() === '\t') {
      this.advance();
    }
  }

  private isAtNewlineOrEnd(): boolean {
    return this.current() === '\n' || this.current() === '' || this.pos >= this.input.length;
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
  }

  private current(): string {
    return this.input[this.pos] || '';
  }

  private peek(offset = 1): string {
    return this.input[this.pos + offset] || '';
  }

  private advance(count = 1): void {
    for (let i = 0; i < count; i++) {
      this.pos++;
      this.column++;
    }
  }

  private addToken(type: TokenType, value: string): void {
    const start = {
      line: this.line,
      column: this.column - value.length,
      offset: this.pos - value.length,
    };
    const end = {
      line: this.line,
      column: this.column,
      offset: this.pos,
    };

    this.tokens.push({ type, value, start, end });
  }
}
