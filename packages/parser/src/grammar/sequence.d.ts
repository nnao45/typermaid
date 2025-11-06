import type { SequenceDiagram } from '@typermaid/core';
export declare class SequenceParser {
    private tokens;
    private current;
    parse(input: string): SequenceDiagram;
    private parseSequenceDiagram;
    private parseParticipant;
    private parseActor;
    private parseNote;
    private parseMessage;
    private mapMessageType;
    private skipUntilEnd;
    private readText;
    private parseLoop;
    private parseAlt;
    private parseOpt;
    private parsePar;
    private parseCritical;
    private parseBreak;
    private parseRect;
    private parseStatementsUntilEnd;
    private parseStatementInBlock;
    private skipUntilNewline;
    private readUntilNewline;
    private skipNewlines;
    private peek;
    private advance;
    private match;
    private consume;
    private isAtEnd;
}
//# sourceMappingURL=sequence.d.ts.map