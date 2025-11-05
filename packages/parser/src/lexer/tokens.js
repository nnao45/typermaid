import { z } from 'zod';
/**
 * Token types for lexical analysis
 */
export const TokenTypeSchema = z.enum([
    // Diagram type keywords
    'FLOWCHART',
    'GRAPH',
    'SEQUENCEDIAGRAM',
    'ERDIAGRAM',
    'STATEDIAGRAM',
    'GANTT',
    // Flowchart keywords
    'SUBGRAPH',
    'END',
    'CLASSDEF',
    'CLASS',
    'CLICK',
    'STYLE',
    'STATE',
    'DIRECTION',
    'SECTION',
    // Sequence diagram keywords
    'PARTICIPANT',
    'ACTOR',
    'NOTE',
    'LOOP',
    'ALT',
    'ELSE',
    'OPT',
    'PAR',
    'AND',
    'CRITICAL',
    'OPTION',
    'BREAK',
    'AUTONUMBER',
    'ACTIVATE',
    'DEACTIVATE',
    'LEFT_OF',
    'RIGHT_OF',
    'OVER',
    'AS',
    'OF',
    'RECT',
    'RGB',
    'RGBA',
    'LINK',
    'LINKS',
    'PROPERTIES',
    'CREATE',
    'DESTROY',
    'BOX',
    // Direction keywords
    'TB',
    'TD',
    'BT',
    'LR',
    'RL',
    // Node shape delimiters
    'SQUARE_OPEN', // [
    'SQUARE_CLOSE', // ]
    'ROUND_OPEN', // (
    'ROUND_CLOSE', // )
    'CURLY_OPEN', // {
    'CURLY_CLOSE', // }
    'ASYMMETRIC', // >
    // Edge types (flowchart)
    'ARROW', // -->
    'LINE', // ---
    'DOTTED_ARROW', // -.->
    'DOTTED_LINE', // -.-
    'THICK_ARROW', // ==>
    'THICK_LINE', // ===
    'INVISIBLE', // ~~~
    'CIRCLE_EDGE', // --o or o--
    'CROSS_EDGE', // --x or x--
    // Sequence diagram message types
    'SEQ_SOLID_ARROW', // ->>
    'SEQ_DOTTED_ARROW', // -->>
    'SEQ_SOLID_OPEN', // -)
    'SEQ_DOTTED_OPEN', // --)
    'SEQ_SOLID_CROSS', // -x
    'SEQ_DOTTED_CROSS', // --x
    'SEQ_SOLID_ARROW_SIMPLE', // ->
    'SEQ_DOTTED_ARROW_SIMPLE', // -->
    // ER diagram relationship types
    'ER_RELATIONSHIP', // ||--o{ etc
    // Literals
    'IDENTIFIER', // node IDs
    'STRING', // quoted strings
    'NUMBER', // numbers
    'TEXT', // free text
    // Special
    'DOT', // .
    'PIPE', // |
    'ASTERISK', // *
    'ANGLE_OPEN', // <
    'SEMICOLON', // ;
    'COLON', // :
    'COMMA', // ,
    'AMPERSAND', // &
    'PLUS', // +
    'MINUS', // -
    'HASH', // #
    'SLASH', // /
    'COLOR', // #RGB or #RRGGBB
    'SPECIAL_CHAR', // ( ) , etc
    'NEWLINE',
    'WHITESPACE',
    'COMMENT',
    'EOF',
]);
/**
 * Position in source code
 */
export const PositionSchema = z.object({
    line: z.number().int().positive(),
    column: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
});
/**
 * Token schema
 */
export const TokenSchema = z.object({
    type: TokenTypeSchema,
    value: z.string(),
    start: PositionSchema,
    end: PositionSchema,
});
/**
 * Helper to create tokens
 */
export function createToken(type, value, start, end) {
    return TokenSchema.parse({ type, value, start, end });
}
//# sourceMappingURL=tokens.js.map