import { describe, expect, it } from 'vitest';
import {
  type ParticipantID,
  SequenceDiagramBuilder,
  ValidationError,
  ValidationErrorCode,
} from '../src/index.js';

describe('SequenceDiagramBuilder', () => {
  describe('Basic Participant Operations', () => {
    it('should create a participant and return branded ParticipantID', () => {
      const builder = new SequenceDiagramBuilder();
      const pid = builder.addParticipant('Alice', 'Alice User');

      expect(builder.hasParticipant(pid)).toBe(true);
      expect(builder.getParticipantCount()).toBe(1);
    });

    it('should throw on duplicate participant ID', () => {
      const builder = new SequenceDiagramBuilder();
      builder.addParticipant('Alice', 'Alice User');

      expect(() => {
        builder.addParticipant('Alice', 'Alice Duplicate');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addParticipant('Alice', 'Alice Duplicate');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid participant ID format', () => {
      const builder = new SequenceDiagramBuilder();

      expect(() => {
        builder.addParticipant('123', 'Invalid');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addParticipant('123', 'Invalid');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new SequenceDiagramBuilder();

      expect(() => {
        builder.addParticipant('loop', 'Reserved');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addParticipant('alt', 'Reserved');
      }).toThrow(ValidationError);
    });

    it('should throw on empty label', () => {
      const builder = new SequenceDiagramBuilder();

      expect(() => {
        builder.addParticipant('A', '');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addParticipant('B', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('Message Operations', () => {
    it('should create a message between two participants', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');
      const bob = builder.addParticipant('Bob', 'Bob');

      builder.sendMessage(alice, bob, 'Hello', 'solid_arrow');

      expect(builder.getMessageCount()).toBe(1);
    });

    it('should throw when source participant does not exist', () => {
      const builder = new SequenceDiagramBuilder();
      const bob = builder.addParticipant('Bob', 'Bob');

      expect(() => {
        // @ts-expect-error - Testing invalid ParticipantID
        builder.sendMessage('Alice' as ParticipantID, bob, 'Hello', 'solid_arrow');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid ParticipantID
        builder.sendMessage('Alice' as ParticipantID, bob, 'Hello', 'solid_arrow');
      }).toThrow(/not found/);
    });

    it('should throw when target participant does not exist', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');

      expect(() => {
        // @ts-expect-error - Testing invalid ParticipantID
        builder.sendMessage(alice, 'Bob' as ParticipantID, 'Hello', 'solid_arrow');
      }).toThrow(ValidationError);
    });

    it('should allow message with different types', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');
      const bob = builder.addParticipant('Bob', 'Bob');

      builder.sendMessage(alice, bob, 'Sync', 'solid_arrow');
      builder.sendMessage(bob, alice, 'Async', 'dotted_arrow');

      const diagram = builder.build();
      expect(diagram.messages).toHaveLength(2);
      expect(diagram.messages[0]?.type).toBe('solid_arrow');
      expect(diagram.messages[1]?.type).toBe('dotted_arrow');
    });

    it('should throw on empty message text', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');
      const bob = builder.addParticipant('Bob', 'Bob');

      expect(() => {
        builder.sendMessage(alice, bob, '', 'solid_arrow');
      }).toThrow(ValidationError);

      expect(() => {
        builder.sendMessage(alice, bob, '   ', 'solid_arrow');
      }).toThrow(ValidationError);
    });
  });

  describe('Note Operations', () => {
    it('should add a note for a participant', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');

      builder.addNote(alice, 'This is a note', 'right');

      const diagram = builder.build();
      expect(diagram.notes).toHaveLength(1);
      expect(diagram.notes?.[0]?.note).toBe('This is a note');
    });

    it('should throw when adding note for non-existent participant', () => {
      const builder = new SequenceDiagramBuilder();

      expect(() => {
        // @ts-expect-error - Testing invalid ParticipantID
        builder.addNote('Alice' as ParticipantID, 'Note', 'right');
      }).toThrow(ValidationError);
    });

    it('should throw on empty note text', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');

      expect(() => {
        builder.addNote(alice, '', 'right');
      }).toThrow(ValidationError);
    });
  });

  describe('Build', () => {
    it('should build a valid sequence diagram', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');
      const bob = builder.addParticipant('Bob', 'Bob');

      builder.sendMessage(alice, bob, 'Hello Bob!', 'solid_arrow');
      builder.sendMessage(bob, alice, 'Hi Alice!', 'solid_arrow');

      const diagram = builder.build();

      expect(diagram.type).toBe('sequence');
      expect(diagram.participants).toHaveLength(2);
      expect(diagram.messages).toHaveLength(2);
    });

    it('should throw when building diagram without participants', () => {
      const builder = new SequenceDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one participant/);
    });

    it('should throw when building diagram without messages', () => {
      const builder = new SequenceDiagramBuilder();
      builder.addParticipant('Alice', 'Alice');

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one message/);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');
      const bob = builder.addParticipant('Bob', 'Bob');

      const diagram = builder
        .sendMessage(alice, bob, 'Hello', 'solid_arrow')
        .sendMessage(bob, alice, 'Hi', 'solid_arrow')
        .build();

      expect(diagram.messages).toHaveLength(2);
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new SequenceDiagramBuilder();
      const alice = builder.addParticipant('Alice', 'Alice');

      try {
        // @ts-expect-error - Testing invalid ParticipantID
        builder.sendMessage(alice, 'NonExistent' as ParticipantID, 'Hello', 'solid_arrow');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.PARTICIPANT_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          from: 'Alice',
          to: 'NonExistent',
        });
      }
    });
  });
});
