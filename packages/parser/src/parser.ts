import type { ProgramAST } from './ast/nodes.js';
import { FlowchartParser } from './grammar/flowchart.js';
import { Tokenizer } from './lexer/tokenizer.js';

/**
 * Parse Mermaid flowchart syntax into AST
 */
export function parseFlowchart(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new FlowchartParser(tokens);
  return parser.parse();
}

/**
 * Main parse function - auto-detects diagram type
 */
export function parse(input: string): ProgramAST {
  // For now, only flowchart is supported
  return parseFlowchart(input);
}
