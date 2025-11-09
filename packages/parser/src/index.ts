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
// Enhanced AST exports (only flowchart for now)
// export { EnhancedClassDiagramAST } from './ast/enhanced-class.js';
// export { EnhancedERASTNode } from './ast/enhanced-er.js';
export { EnhancedFlowchartDiagramAST } from './ast/enhanced-flowchart.js';
// export { EnhancedGanttASTNode } from './ast/enhanced-gantt.js';
// export { EnhancedSequenceDiagramAST } from './ast/enhanced-sequence.js';
// export { EnhancedStateDiagramAST } from './ast/enhanced-state.js';
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
export {
  parse,
  parseClass,
  parseER,
  parseFlowchart,
  parseGantt,
  parseSequence,
  parseState,
} from './parser.js';

// Validation exports
export {
  ValidationError,
  ValidationErrorCode,
  RESERVED_WORDS,
  isReservedWord,
  validateNotReservedWord,
  getReservedWords,
  validateNotEmpty,
  validateUnique,
  validateExists,
} from './validators/index.js';
