/**
 * @lyric-js/ast-tools
 *
 * AST manipulation and transformation tools for Lyric.js
 * Provides visitor pattern, functional transforms, and utilities
 */

// Visitor pattern exports
export { ASTVisitor, ASTTransformer } from "./visitor.js";

// Functional transform exports
export {
	TransformFunctions,
	transformAST,
	findNodes,
	replaceNodeById,
	replaceNodeByName,
} from "./transform.js";

// Utility exports
export {
	cloneAST,
	mergeDiagrams,
	removeNode,
	getAllNodeIds,
	getAllParticipantIds,
	getAllStateIds,
	validateFlowchart,
	validateSequence,
	validateState,
	type ValidationResult,
} from "./utils.js";
