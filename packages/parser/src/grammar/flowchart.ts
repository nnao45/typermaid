import type { Direction, EdgeType, NodeShape } from '@typermaid/core';
import type {
  ASTNode,
  EdgeAST,
  FlowchartDiagramAST,
  FlowchartNodeAST,
  ProgramAST,
  SubgraphAST,
} from '../ast/nodes.js';
import { ParserError } from '../error.js';
import type { Token, TokenType } from '../lexer/tokens.js';

/**
 * Flowchart Parser
 */
export class FlowchartParser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(
      (t) => t.type !== 'COMMENT' && t.type !== 'NEWLINE' && t.type !== 'WHITESPACE'
    );
  }

  /**
   * Parse tokens into AST
   */
  parse(): ProgramAST {
    const body: (FlowchartDiagramAST | ASTNode)[] = [];

    while (!this.isAtEnd()) {
      const diagram = this.parseDiagram();
      if (diagram) {
        body.push(diagram);
      }
    }

    return {
      type: 'Program',
      body: body as ProgramAST['body'],
    };
  }

  private parseDiagram(): FlowchartDiagramAST | null {
    if (!this.check('FLOWCHART') && !this.check('GRAPH')) {
      return null;
    }

    this.advance(); // consume FLOWCHART/GRAPH

    // Parse direction
    let direction: Direction = 'TB';
    if (this.checkDirection()) {
      const dirToken = this.advance();
      direction = dirToken.value as Direction;
    }

    // Parse body (nodes, edges, subgraphs, classDefs, class assignments)
    const body: (FlowchartNodeAST | EdgeAST | SubgraphAST)[] = [];

    while (!this.isAtEnd() && !this.check('FLOWCHART') && !this.check('GRAPH')) {
      if (this.check('SUBGRAPH')) {
        body.push(this.parseSubgraph());
      } else if (this.check('CLASSDEF')) {
        // Skip classDef for now (not in AST structure yet)
        this.parseClassDef();
      } else if (this.check('CLASS')) {
        // Skip class assignment for now (not in AST structure yet)
        this.parseClassAssignment();
      } else if (this.check('IDENTIFIER')) {
        const stmts = this.parseStatement();
        if (stmts) {
          if (Array.isArray(stmts)) {
            body.push(...(stmts as (FlowchartNodeAST | EdgeAST)[]));
          } else {
            body.push(stmts as FlowchartNodeAST | EdgeAST | SubgraphAST);
          }
        }
      } else {
        this.advance(); // skip unknown tokens
      }
    }

    return {
      type: 'FlowchartDiagram',
      direction,
      body,
    };
  }

  private parseSubgraph(): SubgraphAST {
    this.consume('SUBGRAPH', 'Expected subgraph keyword');

    let id = 'subgraph';
    let label: string | undefined;

    if (this.check('IDENTIFIER')) {
      const idToken = this.advance();
      id = idToken.value;
    }

    if (this.check('SQUARE_OPEN')) {
      this.advance();
      if (this.check('IDENTIFIER') || this.check('STRING')) {
        label = this.advance().value;
      }
      this.consumeClosing();
    }

    const body: (FlowchartNodeAST | EdgeAST | SubgraphAST)[] = [];

    while (!this.isAtEnd() && !this.check('END')) {
      if (this.check('IDENTIFIER')) {
        const stmts = this.parseStatement();
        if (stmts) {
          if (Array.isArray(stmts)) {
            body.push(...(stmts as (FlowchartNodeAST | EdgeAST | SubgraphAST)[]));
          } else {
            body.push(stmts as FlowchartNodeAST | EdgeAST | SubgraphAST);
          }
        }
      } else {
        this.advance();
      }
    }

    this.consume('END', 'Expected end keyword');

    const result: SubgraphAST = {
      type: 'Subgraph',
      id,
      direction: undefined,
      body,
    };

    if (label !== undefined) {
      result.label = label;
    }

    return result;
  }

  private parseStatement(): ASTNode | ASTNode[] | null {
    const startToken = this.peek();
    if (!startToken) return null;

    const id = startToken.value;
    this.advance();

    // Check if it's a node definition
    if (this.checkNodeShape()) {
      const node = this.parseNode(id);

      // After parsing node, check if there's an edge following
      if (this.checkEdge()) {
        const edge = this.parseEdge(id);
        // edge can be EdgeAST or [EdgeAST, NodeAST]
        if (Array.isArray(edge)) {
          return [node, ...edge];
        }
        return [node, edge];
      }

      return node;
    }

    // Check if it's an edge
    if (this.checkEdge()) {
      return this.parseEdge(id);
    }

    return null;
  }

  private parseNode(id: string): FlowchartNodeAST {
    const shapeToken = this.peek();
    if (!shapeToken) {
      throw new ParserError('Expected node shape');
    }

    const shape = this.getNodeShape(shapeToken.value);
    this.advance(); // consume shape open

    let label = '';
    while (!this.isAtEnd() && !this.checkClosing()) {
      const token = this.advance();
      if (token.type === 'IDENTIFIER' || token.type === 'STRING') {
        label += (label ? ' ' : '') + token.value;
      }
    }

    this.consumeClosing();

    return {
      type: 'Node',
      id,
      shape,
      label: label || id,
    };
  }

  private parseEdge(fromId: string): EdgeAST | ASTNode[] {
    const edgeToken = this.peek();
    if (!edgeToken) {
      throw new ParserError('Expected edge type');
    }

    const edgeType = this.getEdgeType(edgeToken.value);
    this.advance(); // consume edge

    let label: string | undefined;

    // Check for edge label |text|
    if (this.check('PIPE')) {
      this.advance(); // consume |

      // Collect all tokens until closing pipe
      const labelParts: string[] = [];
      while (!this.check('PIPE') && !this.isAtEnd()) {
        labelParts.push(this.advance().value);
      }
      label = labelParts.join(' ');

      this.consume('PIPE', 'Expected closing |');
    }

    // Get target node (allow keywords as node IDs)
    if (!this.check('IDENTIFIER') && !this.checkKeywordAsId()) {
      throw new ParserError('Expected target node identifier');
    }

    const toToken = this.advance();
    const toId = toToken.value;

    const edge: EdgeAST = {
      type: 'Edge',
      from: fromId,
      to: toId,
      edgeType,
      label,
    };

    // Check if target has node shape definition
    if (this.checkNodeShape()) {
      const targetNode = this.parseNode(toId);
      return [edge, targetNode];
    }

    return edge;
  }

  private getNodeShape(shapeValue: string): NodeShape {
    const shapeMap: Record<string, NodeShape> = {
      '[': 'square',
      '[[': 'subroutine',
      '[(': 'cylindrical',
      '[/': 'parallelogram',
      '[\\': 'trapezoid_alt',
      '(': 'round',
      '([': 'stadium',
      '((': 'circle',
      '(((': 'double_circle',
      '{': 'rhombus',
      '{{': 'hexagon',
      '>': 'asymmetric',
    };

    return shapeMap[shapeValue] ?? 'square';
  }

  private getEdgeType(edgeValue: string): EdgeType {
    const edgeMap: Record<string, EdgeType> = {
      '-->': 'arrow',
      '---': 'line',
      '-.->': 'dotted_arrow',
      '-.-': 'dotted_line',
      '==>': 'thick_arrow',
      '===': 'thick_line',
      '~~~': 'invisible',
      '--o': 'circle_arrow',
      '--x': 'cross_arrow',
      '<-->': 'multi_arrow',
      '<---': 'multi_line',
    };

    return edgeMap[edgeValue] ?? 'arrow';
  }

  // Helper methods
  private peek(): Token | undefined {
    return this.tokens[this.current];
  }

  private isAtEnd(): boolean {
    const token = this.peek();
    return !token || token.type === 'EOF';
  }

  private advance(): Token {
    const token = this.peek();
    if (!token) {
      throw new ParserError('Unexpected end of input');
    }
    this.current++;
    return token;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token?.type === type;
  }

  private checkDirection(): boolean {
    return (
      this.check('TB') ||
      this.check('TD') ||
      this.check('BT') ||
      this.check('LR') ||
      this.check('RL')
    );
  }

  private checkNodeShape(): boolean {
    return (
      this.check('SQUARE_OPEN') ||
      this.check('ROUND_OPEN') ||
      this.check('CURLY_OPEN') ||
      this.check('ASYMMETRIC')
    );
  }

  private checkClosing(): boolean {
    return this.check('SQUARE_CLOSE') || this.check('ROUND_CLOSE') || this.check('CURLY_CLOSE');
  }

  private checkEdge(): boolean {
    return (
      this.check('ARROW') ||
      this.check('LINE') ||
      this.check('DOTTED_ARROW') ||
      this.check('DOTTED_LINE') ||
      this.check('THICK_ARROW') ||
      this.check('THICK_LINE') ||
      this.check('INVISIBLE') ||
      this.check('CIRCLE_EDGE') ||
      this.check('CROSS_EDGE')
    );
  }

  private checkKeywordAsId(): boolean {
    // Allow certain keywords to be used as node IDs
    return (
      this.check('END') ||
      this.check('TB') ||
      this.check('TD') ||
      this.check('BT') ||
      this.check('LR') ||
      this.check('RL')
    );
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    const token = this.peek();
    if (!token) {
      throw new ParserError(message);
    }
    throw new ParserError(message, token.start.line, token.start.column, token);
  }

  private consumeClosing(): void {
    if (this.check('SQUARE_CLOSE')) {
      this.advance();
    } else if (this.check('ROUND_CLOSE')) {
      // Handle multiple closing parens
      while (this.check('ROUND_CLOSE')) {
        this.advance();
      }
    } else if (this.check('CURLY_CLOSE')) {
      // Handle multiple closing braces
      while (this.check('CURLY_CLOSE')) {
        this.advance();
      }
    }
  }

  /**
   * Parse classDef statement
   * Example: classDef myClass fill:#f9f,stroke:#333,stroke-width:2px
   */
  private parseClassDef(): void {
    this.consume('CLASSDEF', 'Expected classDef keyword');

    // Class name
    this.consume('IDENTIFIER', 'Expected class name');

    // Parse style properties (just skip for now, as we don't store in AST yet)
    while (!this.isAtEnd() && !this.check('NEWLINE')) {
      this.advance();
    }

    // Note: classDef is not stored in AST yet, will be added in future enhancement
  }

  /**
   * Parse class assignment statement
   * Example: class A,B,C myClass
   */
  private parseClassAssignment(): void {
    this.consume('CLASS', 'Expected class keyword');

    // Parse node IDs (comma-separated)
    do {
      if (this.check('COMMA')) {
        this.advance();
      }
      if (this.check('IDENTIFIER')) {
        this.advance();
      }
    } while (this.check('COMMA'));

    // Class name
    if (this.check('IDENTIFIER')) {
      this.advance();
      // Note: class assignment is not stored in AST yet, will be added in future enhancement
    }
  }
}
