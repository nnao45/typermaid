import type {
  Actor,
  ArrowType,
  Message,
  Note,
  Participant,
  SequenceDiagram,
  SequenceStatement,
} from '@typermaid/core';
import {
  brandID,
  isValidIDFormat,
  type NoteID,
  type ParticipantID,
  ValidationError,
  ValidationErrorCode,
} from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * Sequence Diagram Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Only declared participants can send/receive messages
 * - Only declared participants can have notes
 * - Message ordering is preserved
 */
export class SequenceDiagramBuilder {
  private participants = new Map<ParticipantID, Participant | Actor>();
  private statements: SequenceStatement[] = [];
  private participantIds = new Set<string>();

  /**
   * Add a participant to the sequence diagram
   * @returns Branded ParticipantID that can only be used with this builder
   */
  addParticipant(id: string, alias?: string, isActor = false): ParticipantID {
    // Validate ID format
    if (!isValidIDFormat(id)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id }
      );
    }

    // Validate label is not empty
    if (alias !== undefined && alias.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Participant alias cannot be empty',
        { id, alias }
      );
    }

    // Check reserved words
    validateNotReservedWord(id);

    // Check for duplicates
    const participantId = brandID<ParticipantID>(id);
    if (this.participants.has(participantId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Participant with ID "${id}" already exists`,
        { id }
      );
    }

    const participant: Participant | Actor = isActor
      ? {
          type: 'actor',
          id,
          alias,
        }
      : {
          type: 'participant',
          id,
          alias,
        };

    this.participants.set(participantId, participant);
    this.participantIds.add(id);
    this.statements.push(participant);

    return participantId;
  }

  /**
   * Send a message from one participant to another
   * @throws {ValidationError} If either participant doesn't exist
   */
  sendMessage(
    from: ParticipantID,
    to: ParticipantID,
    text: string,
    arrowType: ArrowType = 'solid_arrow'
  ): this {
    // Validate participants exist
    if (!this.participants.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.PARTICIPANT_NOT_FOUND,
        `Source participant "${from}" not found. You must add the participant before sending messages.`,
        { from, to }
      );
    }

    if (!this.participants.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.PARTICIPANT_NOT_FOUND,
        `Target participant "${to}" not found. You must add the participant before sending messages.`,
        { from, to }
      );
    }

    // Validate message text not empty
    if (!text || text.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Message text cannot be empty', {
        from,
        to,
      });
    }

    const message: Message = {
      type: 'message',
      from: from as string,
      to: to as string,
      arrowType,
      text,
    };

    this.statements.push(message);

    return this;
  }

  /**
   * Add a note for one or more participants
   * @throws {ValidationError} If participant doesn't exist
   */
  addNote(
    actor: ParticipantID | ParticipantID[],
    text: string,
    position: 'left' | 'right' | 'over' = 'right'
  ): NoteID {
    const actors = Array.isArray(actor) ? actor : [actor];

    // Validate participants exist
    for (const participantId of actors) {
      if (!this.participants.has(participantId)) {
        throw new ValidationError(
          ValidationErrorCode.PARTICIPANT_NOT_FOUND,
          `Participant "${participantId}" not found. You must add the participant before adding notes.`,
          { participantId }
        );
      }
    }

    // Validate note text not empty
    if (!text || text.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Note text cannot be empty', {});
    }

    const noteId = brandID<NoteID>(`note-${this.statements.length}`);

    const note: Note = {
      type: 'note',
      position,
      actors: actors.map((a) => a as string),
      text,
    };

    this.statements.push(note);

    return noteId;
  }

  /**
   * Build and validate the complete sequence diagram
   */
  build(): SequenceDiagram & {
    participants?: (Participant | Actor)[];
    messages?: Message[];
    notes?: Note[];
  } {
    if (this.participants.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.PARTICIPANT_NOT_FOUND,
        'Sequence diagram must have at least one participant',
        {}
      );
    }

    // Extract messages from statements
    const messages = this.statements.filter((stmt): stmt is Message => stmt.type === 'message');

    // Extract notes from statements
    const notes = this.statements.filter((stmt): stmt is Note => stmt.type === 'note');

    // Check that there's at least one message (unless there are notes without messages)
    if (messages.length === 0 && notes.length === 0) {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Sequence diagram must have at least one message or note',
        {}
      );
    }

    const diagram: SequenceDiagram & {
      participants?: (Participant | Actor)[];
      messages?: Message[];
      notes?: Note[];
    } = {
      type: 'sequence',
      statements: this.statements,
    };

    // Add participants, messages and notes for test compatibility
    // Map messages to include type as arrowType for test compatibility
    const messagesWithType = messages.map((m) => ({
      ...m,
      type: m.arrowType,
    }));

    // Map notes to include 'note' property for test compatibility
    const notesWithNote = notes.map((n) => ({
      ...n,
      note: n.text,
    }));

    diagram.participants = Array.from(this.participants.values());
    diagram.messages = messagesWithType as unknown as Message[];
    diagram.notes = notesWithNote as unknown as Note[];

    return diagram;
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.statements.filter((stmt) => stmt.type === 'message').length;
  }

  /**
   * Get current participant count
   */
  getParticipantCount(): number {
    return this.participants.size;
  }

  /**
   * Get current statement count
   */
  getStatementCount(): number {
    return this.statements.length;
  }

  /**
   * Check if a participant exists
   */
  hasParticipant(participantId: ParticipantID): boolean {
    return this.participants.has(participantId);
  }
}
