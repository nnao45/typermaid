import type { State, StateDirection, StateNote, StateTransition } from '@typermaid/core';
import type { Token } from '../lexer/tokens.js';
export interface StateDiagramAST {
  type: 'state';
  version: 'v1' | 'v2';
  direction?: StateDirection;
  states: State[];
  transitions: StateTransition[];
  notes: StateNote[];
}
export declare class StateParser {
  private tokens;
  private current;
  constructor(tokens: Token[]);
  parse(): StateDiagramAST;
  private parseHTMLContent;
  private checkDirection;
  private parseDirection;
  private checkStateDescription;
  private parseStateDescription;
  private checkStateWithLabel;
  private parseStateWithLabel;
  private checkCompositeState;
  private parseCompositeState;
  private checkSpecialState;
  private parseSpecialState;
  private parseNote;
  private checkTransition;
  private parseTransition;
  private check;
  private peek;
  private advance;
  private previous;
  private isAtEnd;
  private consume;
  private skipWhitespace;
  private skipWhitespaceAndNewlines;
  private createEOF;
}
//# sourceMappingURL=state.d.ts.map
