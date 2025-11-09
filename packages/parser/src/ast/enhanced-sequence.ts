import type {
  ArrowType,
  NotePosition,
  ParticipantID,
  SequenceDiagram,
} from '@typermaid/core';
import { createParticipantID } from '@typermaid/core';
import type { SequenceDiagramAST } from './nodes.js';

/**
 * Enhanced SequenceDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedSequenceDiagramAST implements SequenceDiagramAST {
  // AST properties
  type: 'SequenceDiagram' = 'SequenceDiagram';
  diagram: SequenceDiagram;
  loc?:
    | {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    | undefined;

  constructor(ast: SequenceDiagramAST) {
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
  addParticipant(id: string, alias?: string, isActor = false): ParticipantID {
    const participantId = createParticipantID(id);

    // Check if participant already exists
    const existingParticipant = this.diagram.statements.find(
      (stmt: { type: string; id?: string }) =>
        (stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === id
    );

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
  sendMessage(
    from: ParticipantID,
    to: ParticipantID,
    text: string,
    arrowType: ArrowType = 'solid_arrow'
  ): this {
    this.diagram.statements.push({
      type: 'message',
      from,
      to,
      arrowType,
      text: { content: text, type: 'text' },
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
  addNote(
    actor: ParticipantID | ParticipantID[],
    text: string,
    position: NotePosition = 'right'
  ): this {
    const actors = Array.isArray(actor) ? actor : [actor];

    this.diagram.statements.push({
      type: 'note',
      position,
      actors,
      text: { content: text, type: 'text' },
    });

    return this;
  }

  /**
   * Find participants by pattern
   */
  findParticipants(
    pattern: string
  ): Array<{ type: 'participant' | 'actor'; id: string; alias?: string }> {
    return this.diagram.statements.filter(
      (stmt: { type: string; id?: string; alias?: string }) =>
        (stmt.type === 'participant' || stmt.type === 'actor') &&
        (stmt.id?.includes(pattern) || stmt.alias?.includes(pattern))
    ) as Array<{ type: 'participant' | 'actor'; id: string; alias?: string }>;
  }

  /**
   * Find messages by pattern
   */
  findMessages(pattern: string): Array<{ type: 'message'; text?: { content: string } }> {
    return this.diagram.statements.filter(
      (stmt: { type: string; text?: { content?: string } }) =>
        stmt.type === 'message' && stmt.text?.content?.includes(pattern)
    ) as Array<{ type: 'message'; text?: { content: string } }>;
  }

  /**
   * Replace participant ID throughout the diagram
   */
  replaceParticipant(oldId: string, newId: string): this {
    const newParticipantId = createParticipantID(newId);

    for (const stmt of this.diagram.statements) {
      if ((stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === oldId) {
        stmt.id = newParticipantId;
      } else if (stmt.type === 'message') {
        if ((stmt.from as string) === oldId) {
          stmt.from = newParticipantId;
        }
        if ((stmt.to as string) === oldId) {
          stmt.to = newParticipantId;
        }
      } else if (stmt.type === 'note') {
        if (Array.isArray(stmt.actors)) {
          stmt.actors = stmt.actors.map((actorId: string) =>
            actorId === oldId ? newParticipantId : (actorId as ParticipantID)
          );
        }
      }
    }

    return this;
  }

  /**
   * Generate Mermaid Sequence diagram code
   * Simple implementation without external dependencies
   */
  asCode(): string {
    const lines: string[] = ['sequenceDiagram'];

    for (const stmt of this.diagram.statements) {
      if (stmt.type === 'participant') {
        const alias = stmt.alias ? ` as ${stmt.alias}` : '';
        lines.push(`    participant ${stmt.id}${alias}`);
      } else if (stmt.type === 'actor') {
        const alias = stmt.alias ? ` as ${stmt.alias}` : '';
        lines.push(`    actor ${stmt.id}${alias}`);
      } else if (stmt.type === 'message') {
        const arrow = this.getArrowSymbol(stmt.arrowType);
        const text =
          typeof stmt.text === 'string'
            ? stmt.text
            : stmt.text?.content
              ? stmt.text.content
              : '';
        lines.push(`    ${stmt.from}${arrow}${stmt.to}: ${text}`);
      } else if (stmt.type === 'note') {
        const text =
          typeof stmt.text === 'string'
            ? stmt.text
            : stmt.text?.content
              ? stmt.text.content
              : '';
        const actors = stmt.actors.join(',');
        lines.push(`    Note ${stmt.position} of ${actors}: ${text}`);
      } else if (stmt.type === 'activation') {
        const action = stmt.activate ? 'activate' : 'deactivate';
        lines.push(`    ${action} ${stmt.actor}`);
      } else if (stmt.type === 'loop') {
        const condition = stmt.condition || '';
        lines.push(`    loop ${condition}`);
        // Recursively handle nested statements if needed
        lines.push('    end');
      } else if (stmt.type === 'alt') {
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
  private getArrowSymbol(arrowType: ArrowType): string {
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
  build(): SequenceDiagram & { asCode(): string } {
    const diagram = { ...this.diagram };

    return {
      ...diagram,
      asCode: () => this.asCode(),
    };
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.diagram.statements.filter((stmt) => stmt.type === 'message').length;
  }

  /**
   * Get participant count
   */
  getParticipantCount(): number {
    return this.diagram.statements.filter(
      (stmt) => stmt.type === 'participant' || stmt.type === 'actor'
    ).length;
  }

  /**
   * Get statement count
   */
  getStatementCount(): number {
    return this.diagram.statements.length;
  }

  /**
   * Check if participant exists
   */
  hasParticipant(participantId: ParticipantID): boolean {
    const participantIdStr = participantId as string;
    return this.diagram.statements.some(
      (stmt: { type: string; id?: string }) =>
        (stmt.type === 'participant' || stmt.type === 'actor') && stmt.id === participantIdStr
    );
  }
}
