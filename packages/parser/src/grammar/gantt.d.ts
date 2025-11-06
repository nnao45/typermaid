import type { GanttConfig, GanttSection } from '@typermaid/core';
import type { Token } from '../lexer/tokens.js';
export interface GanttDiagramAST {
    type: 'gantt';
    config: GanttConfig;
    sections: GanttSection[];
}
export declare class GanttParser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    parse(): GanttDiagramAST;
    private parseConfig;
    private parseSections;
    private parseTask;
    private consumeRestOfLine;
    private consumeUntil;
    private skipWhitespace;
    private skipWhitespaceAndNewlines;
    private check;
    private peek;
    private advance;
    private previous;
    private isAtEnd;
}
//# sourceMappingURL=gantt.d.ts.map