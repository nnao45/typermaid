import type {
  ERAttribute,
  ERAttributeKey,
  ERCardinality,
  EREntity,
  ERIdentification,
  ERRelationship,
} from '@lyric-js/core';
import { ParserError } from '../error.js';
import type { Token } from '../lexer/tokens.js';

export interface ERDiagramAST {
  type: 'er';
  entities: EREntity[];
  relationships: ERRelationship[];
}

export class ERParser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ERDiagramAST {
    const entities: EREntity[] = [];
    const relationships: ERRelationship[] = [];

    // Skip erDiagram keyword
    if (this.check('ERDIAGRAM')) {
      this.advance();
    }

    while (!this.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      if (this.isAtEnd()) break;

      // Try to parse entity with attributes
      if (this.lookAheadForEntity()) {
        const entity = this.parseEntity();
        entities.push(entity);
        continue;
      }
      // Try to parse relationship
      if (this.lookAheadForRelationship()) {
        const relationship = this.parseRelationship();
        relationships.push(relationship);

        // Auto-create entities from relationships if they don't exist
        if (!entities.find((e) => e.name === relationship.from)) {
          entities.push({ name: relationship.from, attributes: [] });
        }
        if (!entities.find((e) => e.name === relationship.to)) {
          entities.push({ name: relationship.to, attributes: [] });
        }
        continue;
      }
      // Skip unknown tokens
      this.advance();
    }

    return {
      type: 'er',
      entities,
      relationships,
    };
  }

  private parseEntity(): EREntity {
    const name = this.consume('IDENTIFIER', 'Expected entity name').value;
    this.skipWhitespace(); // Skip whitespace before CURLY_OPEN
    this.consume('CURLY_OPEN', 'Expected {');
    this.skipWhitespaceAndNewlines();

    const attributes: ERAttribute[] = [];

    while (!this.check('CURLY_CLOSE') && !this.isAtEnd()) {
      this.skipWhitespaceAndNewlines();
      if (this.check('CURLY_CLOSE')) break;

      const attribute = this.parseAttribute();
      attributes.push(attribute);
      this.skipWhitespaceAndNewlines();
    }

    this.consume('CURLY_CLOSE', 'Expected }');

    return {
      name,
      attributes,
    };
  }

  private parseAttribute(): ERAttribute {
    // Format: type name [key] ["comment"]
    const type = this.consume('IDENTIFIER', 'Expected attribute type').value;
    this.skipWhitespace(); // Skip whitespace between type and name
    const name = this.consume('IDENTIFIER', 'Expected attribute name').value;

    let key: ERAttributeKey | undefined;
    let comment: string | undefined;

    // Check for key (PK, FK, UK)
    this.skipWhitespace(); // Skip whitespace before key
    if (this.check('IDENTIFIER')) {
      const keyValue = this.peek().value;
      if (keyValue === 'PK' || keyValue === 'FK' || keyValue === 'UK') {
        key = keyValue as ERAttributeKey;
        this.advance();
      }
    }

    // Check for comment
    this.skipWhitespace(); // Skip whitespace before comment
    if (this.check('STRING')) {
      comment = this.advance().value;
    }

    return {
      type,
      name,
      key,
      comment,
    };
  }

  private parseRelationship(): ERRelationship {
    // Format: ENTITY1 ||--o{ ENTITY2 : label
    const from = this.consume('IDENTIFIER', 'Expected entity name').value;
    this.skipWhitespace();

    // Parse relationship notation: ||--o{
    const { fromCardinality, identification, toCardinality } = this.parseRelationshipNotation();

    this.skipWhitespace();
    const to = this.consume('IDENTIFIER', 'Expected entity name').value;

    // Optional label after :
    let label: string | undefined;
    this.skipWhitespace();
    if (this.check('COLON')) {
      this.advance();
      this.skipWhitespace();
      if (this.check('STRING')) {
        label = this.advance().value;
      } else if (this.check('IDENTIFIER') || this.check('TEXT')) {
        label = this.advance().value;
      }
    }

    return {
      from,
      to,
      fromCardinality,
      toCardinality,
      identification,
      label,
    };
  }

  private parseRelationshipNotation(): {
    fromCardinality: ERCardinality;
    identification: ERIdentification;
    toCardinality: ERCardinality;
  } {
    // Collect all tokens until we find the end of the relationship notation
    // Format: ||--o{ or }|..o{ etc.
    let notation = '';
    let tokenCount = 0;
    const maxTokens = 20; // Safety limit

    while (!this.isAtEnd() && tokenCount < maxTokens) {
      const token = this.peek();

      // Stop at identifier (target entity) or newline
      if (token.type === 'IDENTIFIER' || token.type === 'NEWLINE') {
        break;
      }

      // Skip whitespace and comments
      if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
        this.advance();
        tokenCount++;
        continue;
      }

      // Handle special token types that lexer might create
      // DOTTED_LINE is "-.->", but we need just the dots for ER notation
      if (token.type === 'DOTTED_LINE') {
        // Extract just the dots for ER notation
        notation += '..';
        this.advance();
        tokenCount++;
        continue;
      }

      // Handle LINE token (---) for ER relationships
      if (token.type === 'LINE') {
        // ER uses -- for non-identifying relationships
        notation += '--';
        this.advance();
        tokenCount++;
        continue;
      }

      // Handle CIRCLE_EDGE and CROSS_EDGE tokens (e.g., 'o--', 'o-')
      // These are flowchart tokens that appear in ER relationships
      if (token.type === 'CIRCLE_EDGE' || token.type === 'CROSS_EDGE') {
        // Just use the value as-is since it contains the ER notation
        notation += token.value;
        this.advance();
        tokenCount++;
        continue;
      }

      // Collect all non-whitespace tokens (including PIPE, MINUS, SPECIAL_CHAR, CURLY_CLOSE, etc.)
      notation += token.value;
      this.advance();
      tokenCount++;

      // Check if we have enough characters to parse (minimum 5: }|..|{)
      // But continue if we haven't seen the full pattern yet
      if (notation.length >= 5 && this.peek().type === 'IDENTIFIER') {
        break;
      }
    }

    // Parse the notation string
    if (notation.length < 5) {
      throw new ParserError(
        `Invalid relationship notation '${notation}' (expected at least 5 characters)`,
        this.peek().start.line,
        this.peek().start.column
      );
    }
    return this.parseNotationString(notation);
  }

  private parseNotationString(notation: string): {
    fromCardinality: ERCardinality;
    identification: ERIdentification;
    toCardinality: ERCardinality;
  } {
    // Parse from cardinality (first 2 chars)
    const fromPart = notation.substring(0, 2);
    const fromCardinality = this.parseCardinalityString(fromPart);

    // Find identification marker (-- or ..)
    const idStart = 2;
    const idPart = notation.substring(idStart, idStart + 2);
    const identification = this.parseIdentificationString(idPart);

    // Parse to cardinality (remaining chars after identification)
    const toStart = idStart + 2;
    const toPart = notation.substring(toStart, toStart + 2);
    const toCardinality = this.parseCardinalityString(toPart);

    return { fromCardinality, identification, toCardinality };
  }

  private parseCardinalityString(str: string): ERCardinality {
    switch (str) {
      case '||':
        return 'EXACTLY_ONE';
      case '}|':
      case '|{':
        return 'ONE_OR_MORE';
      case '}o':
      case 'o{':
        return 'ZERO_OR_MORE';
      case '|o':
      case 'o|':
        return 'ZERO_OR_ONE';
      default:
        throw new ParserError(
          `Expected cardinality (||, }|, }o, o{, |{, |o, o|), got '${str}'`,
          this.peek().start.line,
          this.peek().start.column
        );
    }
  }

  private parseIdentificationString(str: string): ERIdentification {
    if (str === '--') {
      return 'NON_IDENTIFYING';
    }
    if (str === '..') {
      return 'IDENTIFYING';
    }
    throw new ParserError(
      `Expected identification (-- or ..), got '${str}'`,
      this.peek().start.line,
      this.peek().start.column
    );
  }

  private lookAheadForEntity(): boolean {
    // Look ahead to see if this looks like an entity declaration
    // Format: IDENTIFIER { ... }
    const saved = this.current;
    let result = false;

    if (this.check('IDENTIFIER')) {
      this.advance();
      this.skipWhitespace();
      // Check if next token is CURLY_OPEN
      if (this.check('CURLY_OPEN')) {
        result = true;
      }
    }

    this.current = saved;
    return result;
  }

  private lookAheadForRelationship(): boolean {
    // Look ahead to see if this looks like a relationship line
    // Format: IDENTIFIER (cardinality)(identification)(cardinality) IDENTIFIER
    const saved = this.current;
    let result = false;

    if (this.check('IDENTIFIER')) {
      this.advance();
      this.skipWhitespace();
      
      const token = this.peek();
      
      // Check for cardinality markers (excluding { which is entity declaration)
      const char = token.value;
      if ('|o'.includes(char)) {
        result = true;
      }
      // Special case: }| or }o for reverse cardinality
      if (char === '}') {
        const nextToken = this.peekNext();
        const nextChar = nextToken?.value || '';
        // Check if next token starts with | or o
        if (nextChar.length > 0 && '|o'.includes(nextChar[0] || '')) {
          result = true;
        }
      }
      // Handle CIRCLE_EDGE tokens (e.g., 'o-' or 'o--') which appear in ER relationships
      if (token.type === 'CIRCLE_EDGE' || token.type === 'CROSS_EDGE') {
        result = true;
      }
    }

    this.current = saved;
    return result;
  }

  private check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private peek(): Token {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1] ?? this.createEOF();
  }

  private peekNext(): Token | null {
    if (this.current + 1 >= this.tokens.length) return null;
    return this.tokens[this.current + 1] ?? null;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private previous(): Token {
    return this.tokens[this.current - 1] ?? this.createEOF();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }

  private consume(type: Token['type'], message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParserError(message, this.peek().start.line, this.peek().start.column);
  }

  private skipWhitespace(): void {
    while (this.check('WHITESPACE') || this.check('COMMENT')) {
      this.advance();
    }
  }

  private skipWhitespaceAndNewlines(): void {
    while (this.check('WHITESPACE') || this.check('NEWLINE') || this.check('COMMENT')) {
      this.advance();
    }
  }

  private createEOF(): Token {
    return {
      type: 'EOF',
      value: '',
      start: { line: 1, column: 0, offset: 0 },
      end: { line: 1, column: 0, offset: 0 },
    };
  }
}
