import type { ArrowType, NotePosition, ParticipantID, SequenceDiagram } from '@typermaid/core';
import type { SequenceDiagramAST } from './nodes.js';
/**
 * Enhanced SequenceDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export declare class EnhancedSequenceDiagramAST implements SequenceDiagramAST {
    type: 'SequenceDiagram';
    diagram: SequenceDiagram;
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    } | undefined;
    constructor(ast: SequenceDiagramAST);
    /**
     * Add a participant to the diagram
     * @param id - Participant ID
     * @param alias - Display alias
     * @param isActor - Whether to render as actor (stick figure) or participant (box)
     * @returns ParticipantID for method chaining with messages
     */
    addParticipant(id: string, alias?: string, isActor?: boolean): ParticipantID;
    /**
     * Send a message between participants
     * @param from - Source participant
     * @param to - Target participant
     * @param text - Message text
     * @param arrowType - Arrow type (solid_arrow, dotted_arrow, etc.)
     * @returns this for method chaining
     */
    sendMessage(from: ParticipantID, to: ParticipantID, text: string, arrowType?: ArrowType): this;
    /**
     * Add a note to one or more participants
     * @param actor - Participant(s) to attach note to
     * @param text - Note text
     * @param position - Note position (left, right, over)
     * @returns this for method chaining
     */
    addNote(actor: ParticipantID | ParticipantID[], text: string, position?: NotePosition): this;
    /**
     * Find participants by pattern
     */
    findParticipants(pattern: string): Array<{
        type: 'participant' | 'actor';
        id: ParticipantID;
        alias?: string;
    }>;
    /**
     * Find messages by pattern
     */
    findMessages(pattern: string): Array<{
        type: 'message';
        text?: string;
    }>;
    /**
     * Replace participant ID throughout the diagram
     */
    replaceParticipant(oldId: string, newId: string): this;
    /**
     * Generate Mermaid Sequence diagram code
     * Simple implementation without external dependencies
     */
    asCode(): string;
    /**
     * Convert arrow type to Mermaid symbol
     */
    private getArrowSymbol;
    /**
     * Build final SequenceDiagram with asCode capability
     */
    build(): SequenceDiagram & {
        asCode(): string;
    };
    /**
     * Get message count
     */
    getMessageCount(): number;
    /**
     * Get participant count
     */
    getParticipantCount(): number;
    /**
     * Get statement count
     */
    getStatementCount(): number;
    /**
     * Check if participant exists
     */
    hasParticipant(participantId: ParticipantID): boolean;
}
//# sourceMappingURL=enhanced-sequence.d.ts.map