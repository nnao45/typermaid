import { ParserError } from '../error.js';
export class StateParser {
  tokens;
  current = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }
  parse() {
    const states = [];
    const transitions = [];
    const notes = [];
    let version = 'v2';
    let direction;
    // Parse header: stateDiagram or stateDiagram-v2
    if (this.check('STATEDIAGRAM')) {
      const header = this.advance().value;
      version = header.includes('v2') ? 'v2' : 'v1';
    }
    while (!this.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      if (this.isAtEnd()) break;
      // Parse direction
      if (this.checkDirection()) {
        direction = this.parseDirection();
        continue;
      }
      // Parse note (before state description check)
      if (this.check('NOTE')) {
        const note = this.parseNote();
        notes.push(note);
        continue;
      }
      // Parse state with description (s1 : description)
      if (this.checkStateDescription()) {
        const state = this.parseStateDescription();
        states.push(state);
        continue;
      }
      // Parse special state (<<choice>>, <<fork>>, <<join>>)
      if (this.checkSpecialState()) {
        const state = this.parseSpecialState();
        states.push(state);
        continue;
      }
      // Parse composite state
      if (this.checkCompositeState()) {
        const state = this.parseCompositeState();
        states.push(state);
        continue;
      }
      // Parse transition
      if (this.checkTransition()) {
        const transition = this.parseTransition();
        transitions.push(transition);
        continue;
      }
      // Skip unknown tokens
      this.advance();
    }
    return {
      type: 'state',
      version,
      direction,
      states,
      transitions,
      notes,
    };
  }
  checkDirection() {
    // Check for "direction" identifier followed by direction keyword
    if (this.check('IDENTIFIER') && this.peek().value.toLowerCase() === 'direction') {
      return true;
    }
    if (this.check('DIRECTION')) {
      return true;
    }
    return false;
  }
  parseDirection() {
    // Consume "direction" keyword (might be IDENTIFIER or DIRECTION)
    if (this.check('IDENTIFIER') && this.peek().value.toLowerCase() === 'direction') {
      this.advance();
    } else if (this.check('DIRECTION')) {
      this.advance();
    }
    this.skipWhitespace();
    // Direction could be a keyword (TB, LR) or identifier
    let dir;
    if (
      this.check('TB') ||
      this.check('TD') ||
      this.check('BT') ||
      this.check('LR') ||
      this.check('RL')
    ) {
      dir = this.advance().value;
    } else if (this.check('IDENTIFIER')) {
      dir = this.advance().value;
    } else {
      throw new ParserError(
        'Expected direction value',
        this.peek().start.line,
        this.peek().start.column
      );
    }
    if (dir !== 'TB' && dir !== 'TD' && dir !== 'BT' && dir !== 'LR' && dir !== 'RL') {
      throw new ParserError('Invalid direction', this.peek().start.line, this.peek().start.column);
    }
    return dir;
  }
  checkStateDescription() {
    const saved = this.current;
    if (this.check('IDENTIFIER')) {
      this.advance();
      this.skipWhitespace();
      const hasColon = this.check('COLON');
      this.current = saved;
      return hasColon;
    }
    return false;
  }
  parseStateDescription() {
    const id = this.consume('IDENTIFIER', 'Expected state id').value;
    this.skipWhitespace();
    this.consume('COLON', 'Expected :');
    this.skipWhitespace();
    // Read until newline
    let description = '';
    while (!this.check('NEWLINE') && !this.isAtEnd()) {
      description += this.advance().value;
    }
    return {
      id,
      type: 'STATE',
      description: description.trim(),
    };
  }
  checkCompositeState() {
    const saved = this.current;
    if (this.check('STATE')) {
      this.advance();
      this.skipWhitespace();
      const hasId = this.check('IDENTIFIER');
      this.current = saved;
      return hasId;
    }
    return false;
  }
  parseCompositeState() {
    this.consume('STATE', 'Expected state keyword');
    this.skipWhitespace();
    const id = this.consume('IDENTIFIER', 'Expected state id').value;
    this.skipWhitespace();
    this.consume('CURLY_OPEN', 'Expected {');
    this.skipWhitespaceAndNewlines();
    const compositeStates = [];
    const compositeTransitions = [];
    while (!this.check('CURLY_CLOSE') && !this.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      if (this.check('CURLY_CLOSE')) break;
      // Handle concurrency separator (-- or ---)
      if (this.check('MINUS') || this.check('LINE')) {
        this.advance();
        this.skipWhitespaceAndNewlines();
        continue;
      }
      // Parse nested transition
      if (this.checkTransition()) {
        const transition = this.parseTransition();
        compositeTransitions.push(transition);
        continue;
      }
      // Skip unknown
      this.advance();
    }
    this.consume('CURLY_CLOSE', 'Expected }');
    return {
      id,
      type: 'STATE',
      compositeStates,
    };
  }
  checkSpecialState() {
    const saved = this.current;
    if (this.check('STATE')) {
      this.advance();
      this.skipWhitespace();
      // After state keyword and identifier, check for <<
      if (this.check('IDENTIFIER')) {
        this.advance();
        this.skipWhitespace();
        const result = this.peek().value === '<<' || this.check('ANGLE_OPEN');
        this.current = saved;
        return result;
      }
    }
    this.current = saved;
    return false;
  }
  parseSpecialState() {
    this.consume('STATE', 'Expected state keyword');
    this.skipWhitespace();
    const id = this.consume('IDENTIFIER', 'Expected state id').value;
    this.skipWhitespace();
    // Parse <<type>> - skip angle brackets
    while (
      (this.check('ANGLE_OPEN') ||
        this.check('ANGLE_CLOSE') ||
        this.peek().value === '<' ||
        this.peek().value === '>') &&
      !this.isAtEnd()
    ) {
      this.advance();
    }
    this.skipWhitespace();
    const typeStr = this.consume('IDENTIFIER', 'Expected state type').value;
    let stateType = 'STATE';
    if (typeStr === 'choice') stateType = 'CHOICE';
    else if (typeStr === 'fork') stateType = 'FORK';
    else if (typeStr === 'join') stateType = 'JOIN';
    // Skip closing >>
    this.skipWhitespace();
    while ((this.check('ANGLE_CLOSE') || this.peek().value === '>') && !this.isAtEnd()) {
      this.advance();
    }
    return {
      id,
      type: stateType,
    };
  }
  parseNote() {
    this.consume('NOTE', 'Expected note keyword');
    this.skipWhitespace();
    const position = this.check('IDENTIFIER') ? this.advance().value : undefined;
    this.skipWhitespace();
    if (this.check('OF')) {
      this.advance();
      this.skipWhitespace();
    }
    const state = this.consume('IDENTIFIER', 'Expected state id').value;
    this.skipWhitespaceAndNewlines();
    // Check for multi-line note (no colon, just newline)
    let note = '';
    let lastWasIdentifier = false;
    // Collect note content until "end note"
    while (!this.isAtEnd()) {
      // Check for "end note"
      if (this.check('END')) {
        const saved = this.current;
        this.advance();
        this.skipWhitespace();
        if (this.check('NOTE')) {
          this.advance();
          break;
        }
        // If not "end note", restore and add "end" to note
        this.current = saved;
        if (lastWasIdentifier) note += ' ';
        note += 'end';
        lastWasIdentifier = true;
        this.advance();
        continue;
      }
      // Check for single-line note with colon
      if (this.check('COLON') && note === '') {
        this.advance();
        this.skipWhitespace();
        while (!this.check('NEWLINE') && !this.isAtEnd()) {
          if (this.check('IDENTIFIER') && lastWasIdentifier) {
            note += ' ';
          }
          const token = this.advance();
          note += token.value;
          lastWasIdentifier = token.type === 'IDENTIFIER';
        }
        break;
      }
      // Check for end of line
      if (this.check('NEWLINE')) {
        note += '\n';
        this.advance();
        lastWasIdentifier = false;
        continue;
      }
      // Add space before identifier if previous was also identifier
      if (this.check('IDENTIFIER') && lastWasIdentifier) {
        note += ' ';
      }
      const token = this.advance();
      note += token.value;
      lastWasIdentifier = token.type === 'IDENTIFIER';
    }
    return {
      state,
      note: note.trim(),
      position: position === 'left' || position === 'right' ? position : undefined,
    };
  }
  checkTransition() {
    const saved = this.current;
    // Check for [*] or identifier
    if (this.check('SQUARE_OPEN') || this.check('IDENTIFIER')) {
      // Try to parse from state
      if (this.check('SQUARE_OPEN')) {
        this.advance();
        if (this.peek().value === '*') {
          this.advance();
        }
        if (this.check('SQUARE_CLOSE')) {
          this.advance();
        }
      } else if (this.check('IDENTIFIER')) {
        this.advance();
      }
      this.skipWhitespace();
      // Check for arrow (-->, --)
      const hasArrow =
        this.check('ARROW') ||
        this.check('LINE') ||
        this.check('MINUS') ||
        this.peek().value === '-';
      this.current = saved;
      return hasArrow;
    }
    return false;
  }
  parseTransition() {
    // Parse from state
    let from = '';
    if (this.check('SQUARE_OPEN')) {
      this.advance();
      if (this.peek().value === '*') {
        from = '[*]';
        this.advance();
      }
      if (this.check('SQUARE_CLOSE')) {
        this.advance();
      }
    } else if (this.check('IDENTIFIER')) {
      from = this.advance().value;
    }
    this.skipWhitespace();
    // Parse arrow and collect tokens until we find the target state
    let label;
    // Skip arrow tokens (-->, --, -, etc.)
    while (
      (this.check('ARROW') ||
        this.check('LINE') ||
        this.check('MINUS') ||
        this.peek().value === '-') &&
      !this.isAtEnd()
    ) {
      this.advance();
      this.skipWhitespace();
    }
    // Parse to state
    let to = '';
    if (this.check('SQUARE_OPEN')) {
      this.advance();
      if (this.peek().value === '*') {
        to = '[*]';
        this.advance();
      }
      if (this.check('SQUARE_CLOSE')) {
        this.advance();
      }
    } else if (this.check('IDENTIFIER')) {
      to = this.advance().value;
    }
    this.skipWhitespace();
    // Parse optional label after :
    if (this.check('COLON')) {
      this.advance();
      this.skipWhitespace();
      label = '';
      while (!this.check('NEWLINE') && !this.isAtEnd()) {
        label += this.advance().value;
      }
      label = label.trim();
    }
    return {
      from,
      to,
      label,
    };
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  peek() {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1] ?? this.createEOF();
  }
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  previous() {
    return this.tokens[this.current - 1] ?? this.createEOF();
  }
  isAtEnd() {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }
  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new ParserError(message, this.peek().start.line, this.peek().start.column);
  }
  skipWhitespace() {
    while (this.check('WHITESPACE') || this.check('COMMENT')) {
      this.advance();
    }
  }
  skipWhitespaceAndNewlines() {
    while (this.check('WHITESPACE') || this.check('NEWLINE') || this.check('COMMENT')) {
      this.advance();
    }
  }
  createEOF() {
    return {
      type: 'EOF',
      value: '',
      start: { line: 1, column: 0, offset: 0 },
      end: { line: 1, column: 0, offset: 0 },
    };
  }
}
//# sourceMappingURL=state.js.map
