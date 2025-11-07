// Lexer exports

// Re-export core types for AST manipulation
export type {
  Actor,
  Alt,
  Break,
  // Class types
  ClassDefinition as Class,
  ClassMember,
  ClassRelation as Relationship,
  Critical,
  ERAttribute as Attribute,
  // ER types
  EREntity as Entity,
  ERRelationship,
  GanttSection,
  // Gantt types
  GanttTask,
  Loop,
  Message,
  Note,
  Opt,
  Par,
  // Sequence types
  Participant,
  Rect,
  SequenceStatement,
  // State types
  State,
  StateNote,
  StateTransition as Transition,
} from '@typermaid/core';
// AST exports
export type {
  ASTNode,
  ASTNodeType,
  BaseASTNode,
  ClassDiagramAST,
  EdgeAST,
  ERDiagramAST,
  FlowchartDiagramAST,
  FlowchartNodeAST,
  GanttDiagramAST,
  ProgramAST,
  SequenceDiagramAST,
  StateDiagramAST,
  SubgraphAST,
} from './ast/nodes.js';
// Parser exports
export { ParserError } from './error.js';
export { FlowchartParser } from './grammar/flowchart.js';
export { LexerError, Tokenizer } from './lexer/tokenizer.js';
export type { Position, Token, TokenType } from './lexer/tokens.js';
export { parse, parseFlowchart } from './parser.js';
