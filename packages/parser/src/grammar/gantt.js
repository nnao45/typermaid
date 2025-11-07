export class GanttParser {
  tokens;
  current = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }
  parse() {
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
  parseConfig() {
    const config = {
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
    return config;
  }
  parseSections() {
    const sections = [];
    let currentSection = null;
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
  parseTask() {
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
    let id;
    let status;
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
    const dependencies = [];
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
  consumeRestOfLine() {
    const parts = [];
    while (!this.isAtEnd() && this.peek().type !== 'NEWLINE') {
      parts.push(this.peek().value);
      this.advance();
    }
    return parts.join('').trim();
  }
  consumeUntil(char) {
    const parts = [];
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
  skipWhitespace() {
    while (!this.isAtEnd() && this.peek().type === 'WHITESPACE') {
      this.advance();
    }
  }
  skipWhitespaceAndNewlines() {
    while (
      !this.isAtEnd() &&
      (this.peek().type === 'WHITESPACE' || this.peek().type === 'NEWLINE')
    ) {
      this.advance();
    }
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  peek() {
    const token = this.tokens[this.current];
    if (!token) {
      throw new Error('Unexpected end of tokens');
    }
    return token;
  }
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  previous() {
    const token = this.tokens[this.current - 1];
    if (!token) {
      throw new Error('No previous token');
    }
    return token;
  }
  isAtEnd() {
    return this.current >= this.tokens.length;
  }
}
//# sourceMappingURL=gantt.js.map
