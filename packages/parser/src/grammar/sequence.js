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
    const statements = [];
    let autonumber = false;
    while (!this.isAtEnd() && this.peek().type !== 'EOF') {
      this.skipNewlines();
      if (this.isAtEnd() || this.peek().type === 'EOF') break;
      const token = this.peek();
      if (token.type === 'PARTICIPANT') {
        statements.push(this.parseParticipant());
      } else if (token.type === 'ACTOR') {
        statements.push(this.parseActor());
      } else if (token.type === 'NOTE') {
        statements.push(this.parseNote());
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
        statements.push(this.parseRect());
      } else if (token.type === 'LOOP') {
        statements.push(this.parseLoop());
      } else if (token.type === 'ALT') {
        statements.push(this.parseAlt());
      } else if (token.type === 'OPT') {
        statements.push(this.parseOpt());
      } else if (token.type === 'PAR') {
        statements.push(this.parsePar());
      } else if (token.type === 'CRITICAL') {
        statements.push(this.parseCritical());
      } else if (token.type === 'BREAK') {
        statements.push(this.parseBreak());
      } else if (token.type === 'IDENTIFIER') {
        statements.push(this.parseMessage());
      } else {
        this.advance();
      }
      this.skipNewlines();
    }
    return {
      type: 'sequence',
      statements,
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
    return {
      type: 'participant',
      id,
      alias,
    };
  }
  parseActor() {
    this.consume('ACTOR');
    const id = this.consume('IDENTIFIER').value;
    let alias;
    if (this.match('AS')) {
      this.advance();
      alias = this.readUntilNewline();
    }
    return {
      type: 'actor',
      id,
      alias,
    };
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
    return {
      type: 'note',
      position,
      actors,
      text,
    };
  }
  parseMessage() {
    const from = this.consume('IDENTIFIER').value;
    if (this.match('PLUS')) {
      this.advance();
    }
    const messageTypeToken = this.advance();
    const messageType = this.mapMessageType(messageTypeToken.type);
    if (this.match('PLUS')) {
      this.advance();
    } else if (this.match('MINUS')) {
      this.advance();
    }
    const to = this.consume('IDENTIFIER').value;
    let text;
    if (this.match('COLON')) {
      this.advance();
      text = this.readText();
    }
    return {
      type: 'message',
      from,
      to,
      arrowType: messageType,
      text,
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
      SEQ_SOLID_ARROW_SIMPLE: 'solid',
      SEQ_DOTTED_ARROW_SIMPLE: 'dotted',
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
  parseLoop() {
    this.consume('LOOP');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = this.parseStatementsUntilEnd();
    return {
      type: 'loop',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    };
  }
  parseAlt() {
    this.consume('ALT');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = [];
    const elseBlocks = [];
    // Parse statements until ELSE or END
    while (!this.isAtEnd() && !this.match('ELSE') && !this.match('END')) {
      this.skipNewlines();
      if (this.match('ELSE') || this.match('END')) break;
      const stmt = this.parseStatementInBlock();
      if (stmt) statements.push(stmt);
      this.skipNewlines();
    }
    // Parse else blocks
    while (this.match('ELSE')) {
      this.advance(); // consume ELSE
      const elseCondText = this.readUntilNewline().trim();
      this.skipNewlines();
      const elseStmts = [];
      while (!this.isAtEnd() && !this.match('ELSE') && !this.match('END')) {
        this.skipNewlines();
        if (this.match('ELSE') || this.match('END')) break;
        const stmt = this.parseStatementInBlock();
        if (stmt) elseStmts.push(stmt);
        this.skipNewlines();
      }
      elseBlocks.push({
        ...(elseCondText ? { condition: elseCondText } : {}),
        statements: elseStmts,
      });
    }
    this.consume('END');
    return {
      type: 'alt',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      elseBlocks,
    };
  }
  parseOpt() {
    this.consume('OPT');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = this.parseStatementsUntilEnd();
    return {
      type: 'opt',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    };
  }
  parsePar() {
    this.consume('PAR');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = [];
    const andBlocks = [];
    // Parse statements until AND or END
    while (!this.isAtEnd() && !this.match('AND') && !this.match('END')) {
      this.skipNewlines();
      if (this.match('AND') || this.match('END')) break;
      const stmt = this.parseStatementInBlock();
      if (stmt) statements.push(stmt);
      this.skipNewlines();
    }
    // Parse and blocks
    while (this.match('AND')) {
      this.advance(); // consume AND
      const andCondText = this.readUntilNewline().trim();
      this.skipNewlines();
      const andStmts = [];
      while (!this.isAtEnd() && !this.match('AND') && !this.match('END')) {
        this.skipNewlines();
        if (this.match('AND') || this.match('END')) break;
        const stmt = this.parseStatementInBlock();
        if (stmt) andStmts.push(stmt);
        this.skipNewlines();
      }
      andBlocks.push({
        ...(andCondText ? { condition: andCondText } : {}),
        statements: andStmts,
      });
    }
    this.consume('END');
    return {
      type: 'par',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      andBlocks,
    };
  }
  parseCritical() {
    this.consume('CRITICAL');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = [];
    const optionBlocks = [];
    // Parse statements until OPTION or END
    while (!this.isAtEnd() && !this.match('OPTION') && !this.match('END')) {
      this.skipNewlines();
      if (this.match('OPTION') || this.match('END')) break;
      const stmt = this.parseStatementInBlock();
      if (stmt) statements.push(stmt);
      this.skipNewlines();
    }
    // Parse option blocks
    while (this.match('OPTION')) {
      this.advance(); // consume OPTION
      const optCondText = this.readUntilNewline().trim();
      this.skipNewlines();
      const optStmts = [];
      while (!this.isAtEnd() && !this.match('OPTION') && !this.match('END')) {
        this.skipNewlines();
        if (this.match('OPTION') || this.match('END')) break;
        const stmt = this.parseStatementInBlock();
        if (stmt) optStmts.push(stmt);
        this.skipNewlines();
      }
      optionBlocks.push({
        ...(optCondText ? { condition: optCondText } : {}),
        statements: optStmts,
      });
    }
    this.consume('END');
    return {
      type: 'critical',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      optionBlocks,
    };
  }
  parseBreak() {
    this.consume('BREAK');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = this.parseStatementsUntilEnd();
    return {
      type: 'break',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    };
  }
  parseRect() {
    this.consume('RECT');
    const colorText = this.readUntilNewline().trim();
    this.skipNewlines();
    const statements = this.parseStatementsUntilEnd();
    return {
      type: 'rect',
      ...(colorText ? { color: colorText } : {}),
      statements,
    };
  }
  parseStatementsUntilEnd() {
    const statements = [];
    while (!this.isAtEnd() && !this.match('END')) {
      this.skipNewlines();
      if (this.match('END')) break;
      const stmt = this.parseStatementInBlock();
      if (stmt) statements.push(stmt);
      this.skipNewlines();
    }
    this.consume('END');
    return statements;
  }
  parseStatementInBlock() {
    const token = this.peek();
    if (token.type === 'NOTE') {
      return this.parseNote();
    } else if (token.type === 'LOOP') {
      return this.parseLoop();
    } else if (token.type === 'ALT') {
      return this.parseAlt();
    } else if (token.type === 'OPT') {
      return this.parseOpt();
    } else if (token.type === 'PAR') {
      return this.parsePar();
    } else if (token.type === 'CRITICAL') {
      return this.parseCritical();
    } else if (token.type === 'BREAK') {
      return this.parseBreak();
    } else if (token.type === 'RECT') {
      return this.parseRect();
    } else if (token.type === 'IDENTIFIER') {
      return this.parseMessage();
    } else if (token.type === 'PARTICIPANT') {
      return this.parseParticipant();
    } else {
      this.advance();
      return null;
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
