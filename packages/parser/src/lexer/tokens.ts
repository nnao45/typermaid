import { z } from 'zod';

/**
 * Token types for lexical analysis
 */
export const TokenTypeSchema = z.enum([
  // Keywords
  'FLOWCHART',
  'GRAPH',
  'SUBGRAPH',
  'END',
  'CLASSDEF',
  'CLASS',
  'CLICK',
  'STYLE',

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

  // Edge types
  'ARROW', // -->
  'LINE', // ---
  'DOTTED_ARROW', // -.->
  'DOTTED_LINE', // -.-
  'THICK_ARROW', // ==>
  'THICK_LINE', // ===
  'INVISIBLE', // ~~~
  'CIRCLE_EDGE', // --o or o--
  'CROSS_EDGE', // --x or x--

  // Literals
  'IDENTIFIER', // node IDs
  'STRING', // quoted strings
  'NUMBER', // numbers

  // Special
  'PIPE', // |
  'SEMICOLON', // ;
  'COLON', // :
  'COMMA', // ,
  'AMPERSAND', // &
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

export type TokenType = z.infer<typeof TokenTypeSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Token = z.infer<typeof TokenSchema>;

/**
 * Helper to create tokens
 */
export function createToken(type: TokenType, value: string, start: Position, end: Position): Token {
  return TokenSchema.parse({ type, value, start, end });
}
