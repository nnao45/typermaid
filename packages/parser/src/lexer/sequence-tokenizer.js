import { LexerError } from '../error.js';
export class SequenceTokenizer {
  input;
  pos = 0;
  line = 1;
  column = 1;
  tokens = [];
  constructor(input) {
    this.input = input;
  }
  tokenize() {
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
  scanToken() {
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
  tryMatchMessageArrow() {
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
      this.addToken('SEQ_SOLID_OPEN_ASYNC', '-)');
      this.advance(2);
      return true;
    }
    // --)
    if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === ')') {
      this.addToken('SEQ_DOTTED_OPEN_ASYNC', '--)');
      this.advance(3);
      return true;
    }
    // ->
    if (this.current() === '-' && this.peek(1) === '>') {
      this.addToken('SEQ_SOLID_OPEN', '->');
      this.advance(2);
      return true;
    }
    // -->
    if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === '>') {
      this.addToken('SEQ_DOTTED_OPEN', '-->');
      this.advance(3);
      return true;
    }
    return false;
  }
  scanComment() {
    let value = '';
    this.advance(2); // Skip %%
    while (this.pos < this.input.length && this.current() !== '\n') {
      value += this.current();
      this.advance();
    }
    this.addToken('COMMENT', value);
  }
  scanIdentifierOrKeyword() {
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
  getKeywordType(value) {
    const lower = value.toLowerCase();
    const keywords = {
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
  scanNumber() {
    let value = '';
    while (this.isDigit(this.current())) {
      value += this.current();
      this.advance();
    }
    this.addToken('NUMBER', value);
  }
  scanText() {
    let value = '';
    while (!this.isAtNewlineOrEnd()) {
      value += this.current();
      this.advance();
    }
    if (value.trim()) {
      this.addToken('TEXT', value.trim());
    }
  }
  skipWhitespace() {
    while (this.current() === ' ' || this.current() === '\t') {
      this.advance();
    }
  }
  isAtNewlineOrEnd() {
    return this.current() === '\n' || this.current() === '' || this.pos >= this.input.length;
  }
  isDigit(char) {
    return /[0-9]/.test(char);
  }
  isAlpha(char) {
    return /[a-zA-Z]/.test(char);
  }
  isAlphaNumeric(char) {
    return /[a-zA-Z0-9]/.test(char);
  }
  current() {
    return this.input[this.pos] || '';
  }
  peek(offset = 1) {
    return this.input[this.pos + offset] || '';
  }
  advance(count = 1) {
    for (let i = 0; i < count; i++) {
      this.pos++;
      this.column++;
    }
  }
  addToken(type, value) {
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
//# sourceMappingURL=sequence-tokenizer.js.map
