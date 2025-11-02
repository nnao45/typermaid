import { ParserError } from '../error.js';
import { SequenceTokenizer } from '../lexer/sequence-tokenizer.js';
export class SequenceParser {
  tokens = [];
  current = 0;
  parse(input) {
    const tokenizer = new SequenceTokenizer(input);
    this.tokens = tokenizer.tokenize().filter((t) => t.type !== 'COMMENT');
    this.current = 0;
    return this.parseSequenceDiagram();
  }
  parseSequenceDiagram() {
    this.consume('SEQUENCEDIAGRAM');
    this.skipNewlines();
    const participants = [];
    const messages = [];
    const notes = [];
    let autonumber = false;
    while (!this.isAtEnd() && this.peek().type !== 'EOF') {
      this.skipNewlines();
      if (this.isAtEnd() || this.peek().type === 'EOF') break;
      const token = this.peek();
      if (token.type === 'PARTICIPANT') {
        participants.push(this.parseParticipant());
      } else if (token.type === 'ACTOR') {
        this.parseActor();
      } else if (token.type === 'NOTE') {
        notes.push(this.parseNote());
      } else if (token.type === 'AUTONUMBER') {
        this.advance();
        autonumber = true;
      } else if (token.type === 'LINK' || token.type === 'LINKS' || token.type === 'PROPERTIES') {
        // Skip link/links/properties statements
        this.skipUntilNewline();
      } else if (token.type === 'CREATE' || token.type === 'DESTROY') {
        // Skip create/destroy statements
        this.skipUntilNewline();
      } else if (token.type === 'ACTIVATE' || token.type === 'DEACTIVATE') {
        // Skip activate/deactivate statements
        this.skipUntilNewline();
      } else if (token.type === 'BOX') {
        // Skip box statements
        this.skipUntilEnd();
      } else if (token.type === 'RECT') {
        // Skip rect blocks for now
        this.skipRect();
      } else if (token.type === 'LOOP') {
        // TODO: implement loop parsing
        this.skipUntilEnd();
      } else if (token.type === 'ALT') {
        // TODO: implement alt parsing
        this.skipUntilEnd();
      } else if (token.type === 'OPT') {
        // TODO: implement opt parsing
        this.skipUntilEnd();
      } else if (token.type === 'PAR') {
        // TODO: implement par parsing
        this.skipUntilEnd();
      } else if (token.type === 'CRITICAL') {
        // TODO: implement critical parsing
        this.skipUntilEnd();
      } else if (token.type === 'BREAK') {
        // TODO: implement break parsing
        this.skipUntilEnd();
      } else if (token.type === 'IDENTIFIER') {
        messages.push(this.parseMessage());
      } else {
        this.advance();
      }
      this.skipNewlines();
    }
    return {
      type: 'sequence',
      participants,
      actors: [],
      messages,
      notes,
      fragments: [],
      autonumber: autonumber || undefined,
    };
  }
  parseParticipant() {
    this.consume('PARTICIPANT');
    const id = this.consume('IDENTIFIER').value;
    let alias;
    if (this.match('AS')) {
      this.advance();
      alias = this.readUntilNewline();
    }
    return { id, alias };
  }
  parseActor() {
    this.consume('ACTOR');
    this.consume('IDENTIFIER');
    if (this.match('AS')) {
      this.advance();
      this.readUntilNewline();
    }
  }
  parseNote() {
    this.consume('NOTE');
    let position = 'over';
    const actors = [];
    if (this.match('LEFT_OF')) {
      this.advance();
      if (this.match('OF')) {
        this.advance();
      }
      position = 'left';
      actors.push(this.consume('IDENTIFIER').value);
    } else if (this.match('RIGHT_OF')) {
      this.advance();
      if (this.match('OF')) {
        this.advance();
      }
      position = 'right';
      actors.push(this.consume('IDENTIFIER').value);
    } else if (this.match('OVER')) {
      this.advance();
      position = 'over';
      actors.push(this.consume('IDENTIFIER').value);
      // Can have multiple actors for 'over'
      while (this.match('COMMA') || this.match('SPECIAL_CHAR')) {
        this.advance();
        if (this.match('IDENTIFIER')) {
          actors.push(this.consume('IDENTIFIER').value);
        }
      }
    }
    this.consume('COLON');
    const text = this.readText();
    return { position, actors, text };
  }
  parseMessage() {
    const from = this.consume('IDENTIFIER').value;
    let activate = false;
    if (this.match('PLUS')) {
      this.advance();
      activate = true;
    }
    const messageTypeToken = this.advance();
    const messageType = this.mapMessageType(messageTypeToken.type);
    let deactivate = false;
    if (this.match('PLUS')) {
      this.advance();
      activate = true;
    } else if (this.match('MINUS')) {
      this.advance();
      deactivate = true;
    }
    const to = this.consume('IDENTIFIER').value;
    let text;
    if (this.match('COLON')) {
      this.advance();
      text = this.readText();
    }
    return {
      from,
      to,
      messageType,
      text,
      activate: activate || undefined,
      deactivate: deactivate || undefined,
    };
  }
  mapMessageType(tokenType) {
    const map = {
      SEQ_SOLID_ARROW: 'solid_arrow',
      SEQ_DOTTED_ARROW: 'dotted_arrow',
      SEQ_SOLID_OPEN: 'solid_open',
      SEQ_DOTTED_OPEN: 'dotted_open',
      SEQ_SOLID_CROSS: 'solid_cross',
      SEQ_DOTTED_CROSS: 'dotted_cross',
      SEQ_SOLID_OPEN_ASYNC: 'solid_open_async',
      SEQ_DOTTED_OPEN_ASYNC: 'dotted_open_async',
    };
    return map[tokenType] || 'solid_arrow';
  }
  skipUntilEnd() {
    let depth = 1;
    while (!this.isAtEnd() && depth > 0) {
      const token = this.peek();
      if (
        token.type === 'LOOP' ||
        token.type === 'ALT' ||
        token.type === 'OPT' ||
        token.type === 'PAR' ||
        token.type === 'CRITICAL' ||
        token.type === 'BREAK' ||
        token.type === 'RECT' ||
        token.type === 'BOX'
      ) {
        depth++;
      } else if (token.type === 'END') {
        depth--;
      }
      this.advance();
    }
  }
  readText() {
    if (this.match('TEXT')) {
      return this.advance().value;
    }
    return this.readUntilNewline();
  }
  skipRect() {
    this.consume('RECT');
    // Skip rect parameters (rgb, rgba, etc)
    while (!this.isAtEnd() && !this.match('NEWLINE') && !this.match('IDENTIFIER')) {
      this.advance();
    }
    this.skipNewlines();
    // Skip until matching end
    let depth = 1;
    while (!this.isAtEnd() && depth > 0) {
      const token = this.peek();
      if (
        token.type === 'LOOP' ||
        token.type === 'ALT' ||
        token.type === 'OPT' ||
        token.type === 'PAR' ||
        token.type === 'CRITICAL' ||
        token.type === 'BREAK' ||
        token.type === 'RECT' ||
        token.type === 'BOX'
      ) {
        depth++;
      } else if (token.type === 'END') {
        depth--;
      }
      this.advance();
    }
  }
  skipUntilNewline() {
    while (!this.isAtEnd() && !this.match('NEWLINE') && !this.match('EOF')) {
      this.advance();
    }
  }
  readUntilNewline() {
    let text = '';
    while (!this.isAtEnd() && this.peek().type !== 'NEWLINE' && this.peek().type !== 'EOF') {
      const token = this.advance();
      if (text.length > 0 && token.type !== 'COLON') {
        text += ' ';
      }
      text += token.value;
    }
    return text.trim();
  }
  skipNewlines() {
    while (this.match('NEWLINE')) {
      this.advance();
    }
  }
  peek() {
    const token = this.tokens[this.current];
    if (!token) {
      return (
        this.tokens[this.tokens.length - 1] || {
          type: 'EOF',
          value: '',
          start: { line: 1, column: 0, offset: 0 },
          end: { line: 1, column: 0, offset: 0 },
        }
      );
    }
    return token;
  }
  advance() {
    const token = this.tokens[this.current];
    if (!this.isAtEnd()) {
      this.current++;
    }
    if (!token) {
      return (
        this.tokens[this.tokens.length - 1] || {
          type: 'EOF',
          value: '',
          start: { line: 1, column: 0, offset: 0 },
          end: { line: 1, column: 0, offset: 0 },
        }
      );
    }
    return token;
  }
  match(...types) {
    if (this.isAtEnd()) return false;
    return types.includes(this.peek().type);
  }
  consume(type) {
    const token = this.peek();
    if (token.type !== type) {
      throw new ParserError(
        `Expected ${type}, but got ${token.type}`,
        token.start.line,
        token.start.column
      );
    }
    return this.advance();
  }
  isAtEnd() {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }
}
//# sourceMappingURL=sequence.js.map
