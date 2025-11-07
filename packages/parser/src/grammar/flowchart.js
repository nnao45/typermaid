import { ParserError } from '../error.js';
/**
 * Flowchart Parser
 */
export class FlowchartParser {
  tokens;
  current = 0;
  constructor(tokens) {
    this.tokens = tokens.filter(
      (t) => t.type !== 'COMMENT' && t.type !== 'NEWLINE' && t.type !== 'WHITESPACE'
    );
  }
  /**
   * Parse tokens into AST
   */
  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      const diagram = this.parseDiagram();
      if (diagram) {
        body.push(diagram);
      }
    }
    return {
      type: 'Program',
      body: body,
    };
  }
  parseDiagram() {
    if (!this.check('FLOWCHART') && !this.check('GRAPH')) {
      return null;
    }
    this.advance(); // consume FLOWCHART/GRAPH
    // Parse direction
    let direction = 'TB';
    if (this.checkDirection()) {
      const dirToken = this.advance();
      direction = dirToken.value;
    }
    // Parse body (nodes, edges, subgraphs, classDefs, class assignments)
    const body = [];
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
  parseSubgraph() {
    this.consume('SUBGRAPH', 'Expected subgraph keyword');
    let id = 'subgraph';
    let label;
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
    const body = [];
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
    const result = {
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
  parseStatement() {
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
  parseNode(id) {
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
  parseEdge(fromId) {
    const edgeToken = this.peek();
    if (!edgeToken) {
      throw new ParserError('Expected edge type');
    }
    const edgeType = this.getEdgeType(edgeToken.value);
    this.advance(); // consume edge
    let label;
    // Check for edge label |text|
    if (this.check('PIPE')) {
      this.advance(); // consume |
      // Collect all tokens until closing pipe
      const labelParts = [];
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
    const edge = {
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
  getNodeShape(shapeValue) {
    const shapeMap = {
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
  getEdgeType(edgeValue) {
    const edgeMap = {
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
  peek() {
    return this.tokens[this.current];
  }
  isAtEnd() {
    const token = this.peek();
    return !token || token.type === 'EOF';
  }
  advance() {
    const token = this.peek();
    if (!token) {
      throw new ParserError('Unexpected end of input');
    }
    this.current++;
    return token;
  }
  check(type) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token?.type === type;
  }
  checkDirection() {
    return (
      this.check('TB') ||
      this.check('TD') ||
      this.check('BT') ||
      this.check('LR') ||
      this.check('RL')
    );
  }
  checkNodeShape() {
    return (
      this.check('SQUARE_OPEN') ||
      this.check('ROUND_OPEN') ||
      this.check('CURLY_OPEN') ||
      this.check('ASYMMETRIC')
    );
  }
  checkClosing() {
    return this.check('SQUARE_CLOSE') || this.check('ROUND_CLOSE') || this.check('CURLY_CLOSE');
  }
  checkEdge() {
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
  checkKeywordAsId() {
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
  consume(type, message) {
    if (this.check(type)) {
      return this.advance();
    }
    const token = this.peek();
    if (!token) {
      throw new ParserError(message);
    }
    throw new ParserError(message, token.start.line, token.start.column, token);
  }
  consumeClosing() {
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
  parseClassDef() {
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
  parseClassAssignment() {
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
//# sourceMappingURL=flowchart.js.map
