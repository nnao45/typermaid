import type { Direction, NodeShape } from '@lyric-js/core';
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
    this.tokens = tokens.filter((t) => t.type !== 'COMMENT' && t.type !== 'NEWLINE');
  }

  /**
   * Parse tokens into AST
   */
  parse(): ProgramAST {
    const body: ASTNode[] = [];

    while (!this.isAtEnd()) {
      const diagram = this.parseDiagram();
      if (diagram) {
        body.push(diagram);
      }
    }

    return {
      type: 'Program',
      body,
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

    // Parse body (nodes, edges, subgraphs)
    const body: ASTNode[] = [];

    while (!this.isAtEnd() && !this.check('FLOWCHART') && !this.check('GRAPH')) {
      if (this.check('SUBGRAPH')) {
        body.push(this.parseSubgraph());
      } else if (this.check('IDENTIFIER')) {
        const stmts = this.parseStatement();
        if (stmts) {
          if (Array.isArray(stmts)) {
            body.push(...stmts);
          } else {
            body.push(stmts);
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

    const body: ASTNode[] = [];

    while (!this.isAtEnd() && !this.check('END')) {
      if (this.check('IDENTIFIER')) {
        const stmts = this.parseStatement();
        if (stmts) {
          if (Array.isArray(stmts)) {
            body.push(...stmts);
          } else {
            body.push(stmts);
          }
        }
      } else {
        this.advance();
      }
    }

    this.consume('END', 'Expected end keyword');

    return {
      type: 'Subgraph',
      id,
      label,
      direction: undefined,
      body,
    };
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

  private parseEdge(fromId: string): EdgeAST | FlowchartNodeAST {
    const edgeToken = this.peek();
    if (!edgeToken) {
      throw new ParserError('Expected edge type');
    }

    const edgeType = edgeToken.value;
    this.advance(); // consume edge

    let label: string | undefined;

    // Check for edge label |text|
    if (this.check('PIPE')) {
      this.advance(); // consume |
      if (this.check('IDENTIFIER') || this.check('STRING')) {
        label = this.advance().value;
      }
      this.consume('PIPE', 'Expected closing |');
    }

    // Get target node
    if (!this.check('IDENTIFIER')) {
      throw new ParserError('Expected target node identifier');
    }

    const toToken = this.advance();
    const toId = toToken.value;

    // Check if target has node shape definition
    if (this.checkNodeShape()) {
      // Return edge, but we need to parse the target node too
      // This is handled by continuing to parse in the main loop
      return {
        type: 'Edge',
        from: fromId,
        to: toId,
        edgeType,
        label,
      };
    }

    return {
      type: 'Edge',
      from: fromId,
      to: toId,
      edgeType,
      label,
    };
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

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new ParserError(message, this.peek());
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
}
