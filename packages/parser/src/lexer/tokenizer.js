import { createToken } from './tokens.js';
/**
 * Lexer error
 */
export class LexerError extends Error {
  position;
  constructor(message, position) {
    super(`${message} at line ${position.line}, column ${position.column}`);
    this.position = position;
    this.name = 'LexerError';
  }
}
/**
 * Tokenizer for Mermaid flowchart syntax
 */
export class Tokenizer {
  input;
  position = 0;
  line = 1;
  column = 0;
  tokens = [];
  constructor(input) {
    this.input = input;
  }
  /**
   * Tokenize the entire input
   */
  tokenize() {
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
  isAtEnd() {
    return this.position >= this.input.length;
  }
  peek() {
    if (this.isAtEnd()) return '\0';
    return this.input[this.position] ?? '\0';
  }
  peekNext() {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1] ?? '\0';
  }
  advance() {
    const char = this.peek();
    this.position++;
    this.column++;
    return char;
  }
  match(expected) {
    if (this.peek() === expected) {
      this.advance();
      return true;
    }
    return false;
  }
  getPosition() {
    return {
      line: this.line,
      column: this.column,
      offset: this.position,
    };
  }
  createToken(type, value) {
    const end = this.getPosition();
    const start = {
      line: end.line,
      column: Math.max(0, end.column - value.length),
      offset: end.offset - value.length,
    };
    return createToken(type, value, start, end);
  }
  scanToken() {
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
        this.tokens.push(this.createToken('ANGLE_CLOSE', '>'));
        break;
      case '<':
        this.tokens.push(this.createToken('ANGLE_OPEN', '<'));
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
        // Create DOT token for ER diagrams (used in identifying relationships)
        this.tokens.push(this.createToken('DOT', '.'));
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
      case '*':
        this.tokens.push(this.createToken('ASTERISK', '*'));
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
      case '&':
        this.tokens.push(this.createToken('AMPERSAND', '&'));
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
  skipWhitespace() {
    while (this.peek() === ' ' || this.peek() === '\t' || this.peek() === '\r') {
      this.advance();
    }
  }
  scanComment() {
    let comment = '%%';
    while (!this.isAtEnd() && this.peek() !== '\n') {
      comment += this.advance();
    }
    this.tokens.push(this.createToken('COMMENT', comment));
  }
  scanSquareBracket() {
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
  scanRoundBracket() {
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
  scanCurlyBracket() {
    if (this.match('{')) {
      this.tokens.push(this.createToken('CURLY_OPEN', '{{'));
    } else {
      this.tokens.push(this.createToken('CURLY_OPEN', '{'));
    }
  }
  scanDash() {
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
  scanEquals() {
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
  scanTilde() {
    let tildes = '~';
    while (this.peek() === '~') {
      tildes += this.advance();
    }
    this.tokens.push(this.createToken('INVISIBLE', tildes));
  }
  scanString(quote) {
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
  scanNumber(first) {
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
  scanIdentifier(first) {
    let value = first;
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }
    const type = this.getKeywordType(value);
    this.tokens.push(this.createToken(type, value));
  }
  getKeywordType(value) {
    const keywords = {
      flowchart: 'FLOWCHART',
      graph: 'GRAPH',
      subgraph: 'SUBGRAPH',
      end: 'END',
      classDef: 'CLASSDEF',
      class: 'CLASS',
      click: 'CLICK',
      style: 'STYLE',
      state: 'STATE',
      direction: 'DIRECTION',
      note: 'NOTE',
      of: 'OF',
      erDiagram: 'ERDIAGRAM',
      'stateDiagram-v2': 'STATEDIAGRAM',
      stateDiagram: 'STATEDIAGRAM',
      gantt: 'GANTT',
      section: 'SECTION',
      TB: 'TB',
      TD: 'TD',
      BT: 'BT',
      LR: 'LR',
      RL: 'RL',
    };
    return keywords[value] ?? 'IDENTIFIER';
  }
  isDigit(char) {
    return char >= '0' && char <= '9';
  }
  isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char) || this.isSpecialChar(char);
  }
  isSpecialChar(char) {
    // Allow common special characters in node labels
    // Note: / and \ are now allowed for parallelogram/trapezoid shapes
    // & is used for multi-edge syntax but also allowed in labels
    // : is excluded as it's used as a separator in state descriptions
    const allowed = '?!;,.\'"@#$%^&*+-=<>~`/\\';
    return allowed.includes(char);
  }
}
//# sourceMappingURL=tokenizer.js.map
