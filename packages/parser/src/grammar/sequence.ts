import type {
  ArrowType,
  Message,
  Note,
  NotePosition,
  Participant,
  SequenceDiagram,
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

    const participants: Participant[] = [];
    const messages: Message[] = [];
    const notes: Note[] = [];
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

    const statements: Array<Participant | Message | Note> = [
      ...participants,
      ...messages,
      ...notes,
    ];

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

  private parseActor(): void {
    this.consume('ACTOR');
    this.consume('IDENTIFIER');
    if (this.match('AS')) {
      this.advance();
      this.readUntilNewline();
    }
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
      SEQ_SOLID_OPEN_ASYNC: 'solid',
      SEQ_DOTTED_OPEN_ASYNC: 'dotted',
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

  private skipRect(): void {
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
