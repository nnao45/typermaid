import type { Token } from '../lexer/tokens.js';
import type { EREntity, ERRelationship } from '@lyric-js/core';
export interface ERDiagramAST {
  type: 'er';
  entities: EREntity[];
  relationships: ERRelationship[];
}
export declare class ERParser {
  private tokens;
  private current;
  constructor(tokens: Token[]);
  parse(): ERDiagramAST;
  private parseEntity;
  private parseAttribute;
  private parseRelationship;
  private parseRelationshipNotation;
  private parseNotationString;
  private parseCardinalityString;
  private parseIdentificationString;
  private lookAheadForRelationship;
  private check;
  private checkNext;
  private peek;
  private peekNext;
  private advance;
  private previous;
  private isAtEnd;
  private consume;
  private skipWhitespace;
  private skipWhitespaceAndNewlines;
  private createEOF;
}
//# sourceMappingURL=er.d.ts.map
