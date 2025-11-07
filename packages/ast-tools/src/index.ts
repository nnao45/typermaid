/**
 * @typermaid/ast-tools
 *
 * AST manipulation and transformation tools for Lyric.js
 * Provides visitor pattern, functional transforms, and utilities
 */

// Functional transform exports
export {
  findNodes,
  replaceNodeById,
  replaceNodeByName,
  TransformFunctions,
  transformAST,
} from './transform.js';
// Utility exports
export {
  cloneAST,
  getAllNodeIds,
  getAllParticipantIds,
  getAllStateIds,
  mergeDiagrams,
  removeNode,
  type ValidationResult,
  validateFlowchart,
  validateSequence,
  validateState,
} from './utils.js';
// Visitor pattern exports
export { ASTTransformer, ASTVisitor } from './visitor.js';
