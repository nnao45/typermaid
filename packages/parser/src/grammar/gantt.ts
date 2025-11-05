import type { GanttConfig, GanttSection, GanttTask, GanttTaskStatus } from '@lyric-js/core';
import type { Token } from '../lexer/tokens.js';

export interface GanttDiagramAST {
  type: 'gantt';
  config: GanttConfig;
  sections: GanttSection[];
}

export class GanttParser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): GanttDiagramAST {
    // Skip 'gantt' keyword
    if (this.check('GANTT')) {
      this.advance();
    }

    const config = this.parseConfig();
    const sections = this.parseSections();

    return {
      type: 'gantt',
      config,
      sections,
    };
  }

  private parseConfig(): GanttConfig {
    const config: Partial<GanttConfig> = {
      dateFormat: 'YYYY-MM-DD',
    };

    while (!this.isAtEnd() && !this.check('SECTION')) {
      this.skipWhitespaceAndNewlines();
      if (this.isAtEnd() || this.check('SECTION')) break;

      const token = this.peek();

      if (token.type === 'IDENTIFIER') {
        const keyword = token.value.toLowerCase();

        if (keyword === 'title') {
          this.advance();
          this.skipWhitespace();
          config.title = this.consumeRestOfLine();
        } else if (keyword === 'dateformat') {
          this.advance();
          this.skipWhitespace();
          config.dateFormat = this.consumeRestOfLine();
        } else if (keyword === 'axisformat') {
          this.advance();
          this.skipWhitespace();
          config.axisFormat = this.consumeRestOfLine();
        } else if (keyword === 'excludes') {
          this.advance();
          this.skipWhitespace();
          config.excludes = this.consumeRestOfLine();
        } else if (keyword === 'todaymarker') {
          this.advance();
          this.skipWhitespace();
          const value = this.consumeRestOfLine();
          config.todayMarker = value === 'on' ? 'on' : 'off';
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    return config as GanttConfig;
  }

  private parseSections(): GanttSection[] {
    const sections: GanttSection[] = [];
    let currentSection: GanttSection | null = null;

    while (!this.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      if (this.isAtEnd()) break;

      const token = this.peek();

      if (token.type === 'SECTION') {
        if (currentSection) {
          sections.push(currentSection);
        }

        this.advance();
        this.skipWhitespace();
        const sectionName = this.consumeRestOfLine();
        currentSection = {
          name: sectionName,
          tasks: [],
        };
      } else if (currentSection && token.type === 'IDENTIFIER') {
        const task = this.parseTask();
        if (task) {
          currentSection.tasks.push(task);
        }
      } else {
        this.advance();
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private parseTask(): GanttTask | null {
    const taskName = this.consumeUntil(':');
    if (!taskName) return null;

    this.advance(); // skip ':'
    this.skipWhitespace();

    // Collect the rest of the line and split by comma
    const restOfLine = this.consumeRestOfLine();
    const parts = restOfLine
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Debug: log parsing
    // console.log(`Task: ${taskName}, restOfLine: '${restOfLine}', parts: ${JSON.stringify(parts)}`);

    let id: string | undefined;
    let status: GanttTaskStatus | undefined;
    let startDate = '';
    let duration = '';

    // Parse task definition parts
    // Format: :id, start, duration or :status, start, duration or :start, duration
    let partIndex = 0;

    if (parts.length > 0) {
      const firstPart = parts[partIndex];

      // Check if first part is status
      if (
        firstPart &&
        (firstPart === 'active' ||
          firstPart === 'done' ||
          firstPart === 'crit' ||
          firstPart === 'milestone')
      ) {
        status = firstPart;
        partIndex++;
      }
      // Check if first part is an identifier (task id)
      else if (
        firstPart &&
        !firstPart.startsWith('after ') &&
        !firstPart.includes('-') &&
        !firstPart.includes(':') &&
        !firstPart.match(/^\d/)
      ) {
        id = firstPart;
        partIndex++;
      }
    }

    // Next part is start date, "after id", or duration-only
    const dependencies: string[] = [];
    if (partIndex < parts.length) {
      const startPart = parts[partIndex];
      if (startPart?.startsWith('after ')) {
        // Extract the dependency id from "after id"
        const afterId = startPart.slice(6).trim();
        if (afterId) {
          startDate = `after ${afterId}`;
          dependencies.push(afterId);
        }
        partIndex++;
      } else if (startPart && /^\d+[hdwm]$/i.test(startPart)) {
        // If it looks like a duration (e.g., "30d", "2w"), treat it as duration
        duration = startPart;
        partIndex++;
      } else if (startPart) {
        startDate = startPart;
        partIndex++;
      }
    }

    // Last part is duration
    if (partIndex < parts.length) {
      const durationPart = parts[partIndex];
      if (durationPart) {
        duration = durationPart;
      }
    }

    return {
      name: taskName.trim(),
      id,
      status,
      startDate,
      duration,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    };
  }

  private consumeRestOfLine(): string {
    const parts: string[] = [];
    while (!this.isAtEnd() && this.peek().type !== 'NEWLINE') {
      parts.push(this.peek().value);
      this.advance();
    }
    return parts.join('').trim();
  }

  private consumeUntil(char: string): string {
    const parts: string[] = [];
    while (!this.isAtEnd()) {
      const token = this.peek();
      if (token.value === char) {
        break;
      }
      if (token.type === 'NEWLINE') {
        break;
      }
      parts.push(token.value);
      this.advance();
    }
    return parts.join('').trim();
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.peek().type === 'WHITESPACE') {
      this.advance();
    }
  }

  private skipWhitespaceAndNewlines(): void {
    while (
      !this.isAtEnd() &&
      (this.peek().type === 'WHITESPACE' || this.peek().type === 'NEWLINE')
    ) {
      this.advance();
    }
  }

  private check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private peek(): Token {
    const token = this.tokens[this.current];
    if (!token) {
      throw new Error('Unexpected end of tokens');
    }
    return token;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private previous(): Token {
    const token = this.tokens[this.current - 1];
    if (!token) {
      throw new Error('No previous token');
    }
    return token;
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }
}
