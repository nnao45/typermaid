import type {
  Actor,
  Alt,
  ArrowType,
  Break,
  Critical,
  Loop,
  Message,
  Note,
  NotePosition,
  Opt,
  Par,
  Participant,
  Rect,
  SequenceDiagram,
  SequenceStatement,
} from '@lyric-js/core';
import { ParserError } from '../error.js';
import { SequenceTokenizer } from '../lexer/sequence-tokenizer.js';
import type { Token } from '../lexer/tokens.js';

export class SequenceParser {
  private tokens: Token[] = [];
  private current = 0;

  parse(input: string): SequenceDiagram {
    const tokenizer = new SequenceTokenizer(input);
    this.tokens = tokenizer.tokenize().filter((t) => t.type !== 'COMMENT');
    this.current = 0;

    return this.parseSequenceDiagram();
  }

  private parseSequenceDiagram(): SequenceDiagram {
    this.consume('SEQUENCEDIAGRAM');
    this.skipNewlines();

    const statements: SequenceStatement[] = [];
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
    } as SequenceDiagram;
  }

  private parseParticipant(): Participant {
    this.consume('PARTICIPANT');

    const id = this.consume('IDENTIFIER').value;

    let alias: string | undefined;
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

  private parseActor(): Actor {
    this.consume('ACTOR');
    const id = this.consume('IDENTIFIER').value;

    let alias: string | undefined;
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

  private parseNote(): Note {
    this.consume('NOTE');

    let position: NotePosition = 'over';
    const actors: string[] = [];

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

  private parseMessage(): Message {
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

    let text: string | undefined;
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

  private mapMessageType(tokenType: string): ArrowType {
    const map: Record<string, ArrowType> = {
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

  private skipUntilEnd(): void {
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

  private readText(): string {
    if (this.match('TEXT')) {
      return this.advance().value;
    }
    return this.readUntilNewline();
  }

  private parseLoop(): Loop {
    this.consume('LOOP');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements = this.parseStatementsUntilEnd();

    return {
      type: 'loop',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    } as Loop;
  }

  private parseAlt(): Alt {
    this.consume('ALT');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements: SequenceStatement[] = [];
    const elseBlocks: Array<{ condition?: string | undefined; statements: SequenceStatement[] }> =
      [];

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

      const elseStmts: SequenceStatement[] = [];
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
      } as { condition?: string | undefined; statements: SequenceStatement[] });
    }

    this.consume('END');

    return {
      type: 'alt',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      elseBlocks,
    } as Alt;
  }

  private parseOpt(): Opt {
    this.consume('OPT');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements = this.parseStatementsUntilEnd();

    return {
      type: 'opt',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    } as Opt;
  }

  private parsePar(): Par {
    this.consume('PAR');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements: SequenceStatement[] = [];
    const andBlocks: Array<{ condition?: string | undefined; statements: SequenceStatement[] }> =
      [];

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

      const andStmts: SequenceStatement[] = [];
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
      } as { condition?: string | undefined; statements: SequenceStatement[] });
    }

    this.consume('END');

    return {
      type: 'par',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      andBlocks,
    } as Par;
  }

  private parseCritical(): Critical {
    this.consume('CRITICAL');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements: SequenceStatement[] = [];
    const optionBlocks: Array<{ condition?: string | undefined; statements: SequenceStatement[] }> =
      [];

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

      const optStmts: SequenceStatement[] = [];
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
      } as { condition?: string | undefined; statements: SequenceStatement[] });
    }

    this.consume('END');

    return {
      type: 'critical',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
      optionBlocks,
    } as Critical;
  }

  private parseBreak(): Break {
    this.consume('BREAK');
    const conditionText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements = this.parseStatementsUntilEnd();

    return {
      type: 'break',
      ...(conditionText ? { condition: conditionText } : {}),
      statements,
    } as Break;
  }

  private parseRect(): Rect {
    this.consume('RECT');
    const colorText = this.readUntilNewline().trim();
    this.skipNewlines();

    const statements = this.parseStatementsUntilEnd();

    return {
      type: 'rect',
      ...(colorText ? { color: colorText } : {}),
      statements,
    } as Rect;
  }

  private parseStatementsUntilEnd(): SequenceStatement[] {
    const statements: SequenceStatement[] = [];

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

  private parseStatementInBlock(): SequenceStatement | null {
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

  private skipUntilNewline(): void {
    while (!this.isAtEnd() && !this.match('NEWLINE') && !this.match('EOF')) {
      this.advance();
    }
  }

  private readUntilNewline(): string {
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

  private skipNewlines(): void {
    while (this.match('NEWLINE')) {
      this.advance();
    }
  }

  private peek(): Token {
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

  private advance(): Token {
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

  private match(...types: string[]): boolean {
    if (this.isAtEnd()) return false;
    return types.includes(this.peek().type);
  }

  private consume(type: string): Token {
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

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }
}
