// Lexer exports
export { LexerError, Tokenizer } from './lexer/tokenizer.js';
export type { Position, Token, TokenType } from './lexer/tokens.js';

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

// Re-export core types for AST manipulation
export type {
  // Sequence types
  Participant,
  Actor,
  Message,
  Note,
  Loop,
  Alt,
  Opt,
  Par,
  Critical,
  Break,
  Rect,
  SequenceStatement,
  // State types
  State,
  StateTransition as Transition,
  StateNote,
  // Class types
  ClassDefinition as Class,
  ClassMember,
  ClassRelation as Relationship,
  // ER types
  EREntity as Entity,
  ERAttribute as Attribute,
  ERRelationship,
  // Gantt types
  GanttTask,
  GanttSection,
} from '@typermaid/core';

// Parser exports
export { ParserError } from './error.js';
export { FlowchartParser } from './grammar/flowchart.js';
export { parse, parseFlowchart } from './parser.js';
