import type { ProgramAST } from './ast/nodes.js';
/**
 * Parse Mermaid flowchart syntax into AST
 */
export declare function parseFlowchart(input: string): ProgramAST;
/**
 * Parse Mermaid sequence diagram syntax
 */
export declare function parseSequence(input: string): ProgramAST;
/**
 * Parse Mermaid class diagram syntax
 */
export declare function parseClass(input: string): ProgramAST;
/**
 * Parse Mermaid ER diagram syntax
 */
export declare function parseER(input: string): ProgramAST;
/**
 * Parse Mermaid state diagram syntax
 */
export declare function parseState(input: string): ProgramAST;
/**
 * Parse Mermaid gantt chart syntax
 */
export declare function parseGantt(input: string): ProgramAST;
/**
 * Main parse function - auto-detects diagram type
 */
export declare function parse(input: string): ProgramAST;
//# sourceMappingURL=parser.d.ts.map
