import { createParticipantID } from '@typermaid/core';
/**
 * Enhanced SequenceDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedSequenceDiagramAST {
    // AST properties
    type = 'SequenceDiagram';
    diagram;
    loc;
    constructor(ast) {
        // Copy AST properties
        this.diagram = { ...ast.diagram };
        this.loc = ast.loc;
        // Initialize diagram if not present
        if (!this.diagram.statements) {
            this.diagram.statements = [];
        }
    }
    /**
     * Add a participant to the diagram
     * @param id - Participant ID
     * @param alias - Display alias
     * @param isActor - Whether to render as actor (stick figure) or participant (box)
     * @returns ParticipantID for method chaining with messages
     */
    addParticipant(id, alias, isActor = false) {
        const participantId = createParticipantID(id);
        // Check if participant already exists
        const existingParticipant = this.diagram.statements.find((stmt) => (stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === id);
        if (!existingParticipant) {
            this.diagram.statements.push({
                type: isActor ? 'actor' : 'participant',
                id: participantId,
                alias,
            });
        }
        return participantId;
    }
    /**
     * Send a message between participants
     * @param from - Source participant
     * @param to - Target participant
     * @param text - Message text
     * @param arrowType - Arrow type (solid_arrow, dotted_arrow, etc.)
     * @returns this for method chaining
     */
    sendMessage(from, to, text, arrowType = 'solid_arrow') {
        this.diagram.statements.push({
            type: 'message',
            from,
            to,
            arrowType,
            text,
        });
        return this;
    }
    /**
     * Add a note to one or more participants
     * @param actor - Participant(s) to attach note to
     * @param text - Note text
     * @param position - Note position (left, right, over)
     * @returns this for method chaining
     */
    addNote(actor, text, position = 'right') {
        const actors = Array.isArray(actor) ? actor : [actor];
        this.diagram.statements.push({
            type: 'note',
            position,
            actors,
            text,
        });
        return this;
    }
    /**
     * Find participants by pattern
     */
    findParticipants(pattern) {
        return this.diagram.statements.filter((stmt) => (stmt.type === 'participant' || stmt.type === 'actor') &&
            (stmt.id.includes(pattern) || stmt.alias?.includes(pattern)));
    }
    /**
     * Find messages by pattern
     */
    findMessages(pattern) {
        return this.diagram.statements.filter((stmt) => stmt.type === 'message' && typeof stmt.text === 'string' && stmt.text.includes(pattern));
    }
    /**
     * Replace participant ID throughout the diagram
     */
    replaceParticipant(oldId, newId) {
        const newParticipantId = createParticipantID(newId);
        for (const stmt of this.diagram.statements) {
            if ((stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === oldId) {
                stmt.id = newParticipantId;
            }
            else if (stmt.type === 'message') {
                if (stmt.from === oldId) {
                    stmt.from = newParticipantId;
                }
                if (stmt.to === oldId) {
                    stmt.to = newParticipantId;
                }
            }
            else if (stmt.type === 'note') {
                if (Array.isArray(stmt.actors)) {
                    stmt.actors = stmt.actors.map((actorId) => actorId === oldId ? newParticipantId : actorId);
                }
            }
        }
        return this;
    }
    /**
     * Generate Mermaid Sequence diagram code
     * Simple implementation without external dependencies
     */
    asCode() {
        const lines = ['sequenceDiagram'];
        for (const stmt of this.diagram.statements) {
            if (stmt.type === 'participant') {
                const alias = stmt.alias ? ` as ${stmt.alias}` : '';
                lines.push(`    participant ${stmt.id}${alias}`);
            }
            else if (stmt.type === 'actor') {
                const alias = stmt.alias ? ` as ${stmt.alias}` : '';
                lines.push(`    actor ${stmt.id}${alias}`);
            }
            else if (stmt.type === 'message') {
                const arrow = this.getArrowSymbol(stmt.arrowType);
                const text = typeof stmt.text === 'string'
                    ? stmt.text
                    : stmt.text?.type === 'html'
                        ? stmt.text.raw
                        : stmt.text?.type === 'markdown'
                            ? stmt.text.raw
                            : '';
                lines.push(`    ${stmt.from}${arrow}${stmt.to}: ${text}`);
            }
            else if (stmt.type === 'note') {
                const text = typeof stmt.text === 'string'
                    ? stmt.text
                    : stmt.text?.type === 'html'
                        ? stmt.text.raw
                        : stmt.text?.type === 'markdown'
                            ? stmt.text.raw
                            : '';
                const actors = stmt.actors.join(',');
                lines.push(`    Note ${stmt.position} of ${actors}: ${text}`);
            }
            else if (stmt.type === 'activation') {
                const action = stmt.activate ? 'activate' : 'deactivate';
                lines.push(`    ${action} ${stmt.actor}`);
            }
            else if (stmt.type === 'loop') {
                const condition = stmt.condition || '';
                lines.push(`    loop ${condition}`);
                // Recursively handle nested statements if needed
                lines.push('    end');
            }
            else if (stmt.type === 'alt') {
                const condition = stmt.condition || '';
                lines.push(`    alt ${condition}`);
                // Handle else blocks if needed
                if (stmt.elseBlocks) {
                    for (const elseBlock of stmt.elseBlocks) {
                        const elseCondition = elseBlock.condition || '';
                        lines.push(`    else ${elseCondition}`);
                    }
                }
                lines.push('    end');
            }
        }
        return lines.join('\n');
    }
    /**
     * Convert arrow type to Mermaid symbol
     */
    getArrowSymbol(arrowType) {
        switch (arrowType) {
            case 'solid':
                return '->';
            case 'dotted':
                return '-->';
            case 'solid_arrow':
                return '->>';
            case 'dotted_arrow':
                return '-->>';
            case 'solid_cross':
                return '-x';
            case 'dotted_cross':
                return '--x';
            case 'solid_open':
                return '-)';
            case 'dotted_open':
                return '--)';
            default:
                return '->>';
        }
    }
    /**
     * Build final SequenceDiagram with asCode capability
     */
    build() {
        const diagram = { ...this.diagram };
        return {
            ...diagram,
            asCode: () => this.asCode(),
        };
    }
    /**
     * Get message count
     */
    getMessageCount() {
        return this.diagram.statements.filter((stmt) => stmt.type === 'message').length;
    }
    /**
     * Get participant count
     */
    getParticipantCount() {
        return this.diagram.statements.filter((stmt) => stmt.type === 'participant' || stmt.type === 'actor').length;
    }
    /**
     * Get statement count
     */
    getStatementCount() {
        return this.diagram.statements.length;
    }
    /**
     * Check if participant exists
     */
    hasParticipant(participantId) {
        return this.diagram.statements.some((stmt) => (stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === participantId);
    }
}
//# sourceMappingURL=enhanced-sequence.js.map