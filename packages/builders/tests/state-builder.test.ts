import { describe, expect, it } from 'vitest';
import {
  StateDiagramBuilder,
  type StateID,
  ValidationError,
  ValidationErrorCode,
} from '../src/index.js';

describe('StateDiagramBuilder', () => {
  describe('Basic State Operations', () => {
    it('should create a state and return branded StateID', () => {
      const builder = new StateDiagramBuilder();
      const stateId = builder.addState('Active', 'Active State');

      expect(builder.hasState(stateId)).toBe(true);
      expect(builder.getStateCount()).toBe(1);
    });

    it('should throw on duplicate state ID', () => {
      const builder = new StateDiagramBuilder();
      builder.addState('Active', 'Active State');

      expect(() => {
        builder.addState('Active', 'Duplicate State');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addState('Active', 'Duplicate State');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid state ID format', () => {
      const builder = new StateDiagramBuilder();

      expect(() => {
        builder.addState('123', 'Invalid');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addState('123', 'Invalid');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new StateDiagramBuilder();

      expect(() => {
        builder.addState('state', 'Reserved');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addState('note', 'Reserved');
      }).toThrow(ValidationError);
    });

    it('should throw on empty label', () => {
      const builder = new StateDiagramBuilder();

      expect(() => {
        builder.addState('A', '');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addState('B', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('Transition Operations', () => {
    it('should create a transition between two states', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const active = builder.addState('Active', 'Active');

      builder.addTransition(idle, active, 'start');

      expect(builder.getTransitionCount()).toBe(1);
    });

    it('should throw when source state does not exist', () => {
      const builder = new StateDiagramBuilder();
      const active = builder.addState('Active', 'Active');

      expect(() => {
        // @ts-expect-error - Testing invalid StateID
        builder.addTransition('Idle' as StateID, active, 'start');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid StateID
        builder.addTransition('Idle' as StateID, active, 'start');
      }).toThrow(/not found/);
    });

    it('should throw when target state does not exist', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');

      expect(() => {
        // @ts-expect-error - Testing invalid StateID
        builder.addTransition(idle, 'Active' as StateID, 'start');
      }).toThrow(ValidationError);
    });

    it('should allow transition with label', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const active = builder.addState('Active', 'Active');

      builder.setStartState(idle);
      builder.addTransition(idle, active, 'start event');

      const diagram = builder.build();
      expect(diagram.transitions[0]?.label).toBe('start event');
    });

    it('should allow multiple transitions from same state', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const active = builder.addState('Active', 'Active');
      const error = builder.addState('Error', 'Error');

      builder.setStartState(idle);
      builder.addTransition(idle, active, 'start');
      builder.addTransition(idle, error, 'error');

      expect(builder.getTransitionCount()).toBe(2);
    });
  });

  describe('Start/End States', () => {
    it('should set start state', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');

      builder.setStartState(idle);

      const diagram = builder.build();
      expect(diagram.startState).toBe('Idle');
    });

    it('should set end state', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const done = builder.addState('Done', 'Done');

      builder.setStartState(idle);
      builder.addTransition(idle, done, 'finish');
      builder.setEndState(done);

      const diagram = builder.build();
      expect(diagram.endStates).toContain('Done');
    });

    it('should throw when setting non-existent state as start', () => {
      const builder = new StateDiagramBuilder();

      expect(() => {
        // @ts-expect-error - Testing invalid StateID
        builder.setStartState('NonExistent' as StateID);
      }).toThrow(ValidationError);
    });
  });

  describe('Composite States', () => {
    it('should create a composite state', () => {
      const builder = new StateDiagramBuilder();
      const parent = builder.addCompositeState('Processing', 'Processing');
      const child = builder.addState('Validate', 'Validate');

      builder.addStateToComposite(parent, child);
      builder.setStartState(parent);

      const diagram = builder.build();
      const composite = diagram.states.find((s) => s.id === 'Processing');
      expect(composite?.compositeStates).toContain('Validate');
    });

    it('should throw when adding non-existent child to composite', () => {
      const builder = new StateDiagramBuilder();
      const parent = builder.addCompositeState('Processing', 'Processing');

      expect(() => {
        // @ts-expect-error - Testing invalid StateID
        builder.addStateToComposite(parent, 'NonExistent' as StateID);
      }).toThrow(ValidationError);
    });
  });

  describe('Build', () => {
    it('should build a valid state diagram', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const active = builder.addState('Active', 'Active');
      const done = builder.addState('Done', 'Done');

      builder.setStartState(idle);
      builder.addTransition(idle, active, 'start');
      builder.addTransition(active, done, 'finish');
      builder.setEndState(done);

      const diagram = builder.build();

      expect(diagram.type).toBe('state');
      expect(diagram.states).toHaveLength(3);
      expect(diagram.transitions).toHaveLength(2);
      expect(diagram.startState).toBe('Idle');
    });

    it('should throw when building diagram without states', () => {
      const builder = new StateDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one state/);
    });

    it('should throw when building diagram without start state', () => {
      const builder = new StateDiagramBuilder();
      builder.addState('Idle', 'Idle');

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/start state/);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');
      const active = builder.addState('Active', 'Active');

      const diagram = builder.setStartState(idle).addTransition(idle, active, 'start').build();

      expect(diagram.transitions).toHaveLength(1);
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new StateDiagramBuilder();
      const idle = builder.addState('Idle', 'Idle');

      try {
        // @ts-expect-error - Testing invalid StateID
        builder.addTransition(idle, 'NonExistent' as StateID, 'start');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.STATE_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          from: 'Idle',
          to: 'NonExistent',
        });
      }
    });
  });
});
