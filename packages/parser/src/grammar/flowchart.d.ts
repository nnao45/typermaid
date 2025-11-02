import type { ProgramAST } from '../ast/nodes.js';
import type { Token } from '../lexer/tokens.js';
/**
 * Flowchart Parser
 */
export declare class FlowchartParser {
  private tokens;
  private current;
  constructor(tokens: Token[]);
  /**
   * Parse tokens into AST
   */
  parse(): ProgramAST;
  private parseDiagram;
  private parseSubgraph;
  private parseStatement;
  private parseNode;
  private parseEdge;
  private getNodeShape;
  private peek;
  private isAtEnd;
  private advance;
  private check;
  private checkDirection;
  private checkNodeShape;
  private checkClosing;
  private checkEdge;
  private checkKeywordAsId;
  private consume;
  private consumeClosing;
}
//# sourceMappingURL=flowchart.d.ts.map
