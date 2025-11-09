import type {
  Actor,
  Message,
  Note,
  Participant,
  SequenceDiagram,
  SequenceStatement,
} from '@typermaid/core';
import type { SequenceDiagramAST } from '@typermaid/parser';
import { SequenceDiagramBuilder } from '../sequence-builder.js';
import type { ParticipantID } from '../types.js';

/**
 * Extract string value from Content type
 */
function contentToString(
  content: string | { type: string; raw: string } | undefined
): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

/**
 * Convert parsed Sequence Diagram AST to Builder for manipulation
 *
 * @param ast - Parsed SequenceDiagramAST
 * @returns SequenceDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@typermaid/parser';
 * import { sequenceASTToBuilder } from '@typermaid/builders/converters';
 *
 * const code = `
 *   sequenceDiagram
 *     participant A
 *     participant B
 *     A->>B: Hello
 * `;
 * const ast = parse(code);
 * const builder = sequenceASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const c = builder.addParticipant('C', 'Charlie');
 * builder.sendMessage(brandID('B'), c, 'Hi Charlie!');
 * ```
 */
export function sequenceASTToBuilder(ast: SequenceDiagramAST): SequenceDiagramBuilder {
  const builder = new SequenceDiagramBuilder();

  // Track participant IDs
  const participantIdMap = new Map<string, ParticipantID>();

  // Process statements in order
  const diagram: SequenceDiagram = ast.diagram;
  for (const stmt of diagram.statements) {
    processStatement(stmt, builder, participantIdMap);
  }

  return builder;
}

/**
 * Process a single sequence statement
 */
function processStatement(
  stmt: SequenceStatement,
  builder: SequenceDiagramBuilder,
  participantIdMap: Map<string, ParticipantID>
): void {
  switch (stmt.type) {
    case 'participant': {
      const participant = stmt as Participant;
      const participantId = builder.addParticipant(participant.id, participant.alias, false);
      participantIdMap.set(participant.id, participantId);
      break;
    }

    case 'actor': {
      const actor = stmt as Actor;
      const actorId = builder.addParticipant(actor.id, actor.alias, true);
      participantIdMap.set(actor.id, actorId);
      break;
    }

    case 'message': {
      const message = stmt as Message;
      let fromId = participantIdMap.get(message.from);
      let toId = participantIdMap.get(message.to);

      // Auto-add participants if they don't exist (implicit declaration)
      if (!fromId) {
        fromId = builder.addParticipant(message.from);
        participantIdMap.set(message.from, fromId);
      }
      if (!toId) {
        toId = builder.addParticipant(message.to);
        participantIdMap.set(message.to, toId);
      }

      builder.sendMessage(fromId, toId, contentToString(message.text) ?? '', message.arrowType);
      break;
    }

    case 'note': {
      const note = stmt as Note;
      const actors: ParticipantID[] = [];

      for (const actorId of note.actors) {
        let participantId = participantIdMap.get(actorId);

        // Auto-add participant if it doesn't exist
        if (!participantId) {
          participantId = builder.addParticipant(actorId);
          participantIdMap.set(actorId, participantId);
        }

        actors.push(participantId);
      }

      if (actors.length > 0) {
        const target = actors.length === 1 && actors[0] !== undefined ? actors[0] : actors;
        builder.addNote(target, contentToString(note.text) ?? '', note.position);
      }
      break;
    }

    case 'loop':
    case 'alt':
    case 'opt':
    case 'par':
    case 'critical':
    case 'break': {
      // Nested blocks are not currently supported in the builder
      // Skip for now
      // TODO: Add support for nested blocks in future iteration
      break;
    }

    default: {
      // Unknown statement type, skip
      break;
    }
  }
}
