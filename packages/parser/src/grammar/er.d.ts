import type { EREntity, ERRelationship } from '@typermaid/core';
import type { Token } from '../lexer/tokens.js';
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
    private lookAheadForEntity;
    private lookAheadForRelationship;
    private check;
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