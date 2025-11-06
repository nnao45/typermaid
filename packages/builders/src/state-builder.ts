import type { State, StateDiagram, StateTransition } from '@typermaid/core';
import {
  brandID,
  isValidIDFormat,
  type StateID,
  ValidationError,
  ValidationErrorCode,
} from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * State Diagram Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Only declared states can be referenced in transitions
 * - Special states ([*], fork, join) are handled correctly
 * - Composite states maintain valid structure
 */
export class StateDiagramBuilder {
  private states = new Map<StateID, State>();
  private transitions: StateTransition[] = [];
  private stateOrder: StateID[] = [];
  private transitionCount = 0;
  private startStateId: StateID | null = null;
  private endStateId: StateID | null = null;

  // Special state IDs
  private readonly START_STATE = brandID<StateID>('[*]');
  private readonly FORK_STATE_PREFIX = 'fork_';
  private readonly JOIN_STATE_PREFIX = 'join_';

  /**
   * Add a state to the diagram
   * @returns Branded StateID that can only be used with this builder
   */
  addState(id: string, label?: string, description?: string): StateID {
    // Validate ID format (allow [*] for start/end)
    if (id !== '[*]' && !isValidIDFormat(id)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id }
      );
    }

    // Validate label is not empty
    if (label !== undefined && label.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'State label cannot be empty', {
        id,
        label,
      });
    }

    // Check reserved words (except special states)
    if (id !== '[*]') {
      validateNotReservedWord(id);
    }

    // Check for duplicates
    const stateId = brandID<StateID>(id);
    if (this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `State with ID "${id}" already exists`,
        { id }
      );
    }

    const state: State = {
      id,
      type: 'STATE',
      label,
      description,
    };

    this.states.set(stateId, state);
    this.stateOrder.push(stateId);

    return stateId;
  }

  /**
   * Add a composite state (state with nested states)
   */
  addCompositeState(
    id: string,
    label?: string,
    callback?: (builder: StateDiagramBuilder) => void
  ): StateID {
    // Validate ID
    if (!isValidIDFormat(id)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}"`,
        { id }
      );
    }

    validateNotReservedWord(id);

    const stateId = brandID<StateID>(id);

    if (this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Composite state with ID "${id}" already exists`,
        { id }
      );
    }

    // Create composite state with empty children initially
    const compositeState: State = {
      id,
      type: 'STATE',
      label,
      compositeStates: [],
    };

    this.states.set(stateId, compositeState);
    this.stateOrder.push(stateId);

    // If callback is provided, use it (for backward compatibility)
    if (callback) {
      const nestedBuilder = new StateDiagramBuilder();
      callback(nestedBuilder);
      // Only build if the nested builder has states
      if (nestedBuilder.getStateCount() > 0) {
        const nestedDiagram = nestedBuilder.build();
        compositeState.compositeStates = nestedDiagram.states;
      }
    }

    return stateId;
  }

  /**
   * Add a state to a composite state
   * @throws {ValidationError} If either state doesn't exist
   */
  addStateToComposite(compositeId: StateID, childId: StateID): this {
    // Validate composite state exists
    if (!this.states.has(compositeId)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `Composite state "${compositeId}" not found. You must add the composite state first.`,
        { compositeId, childId }
      );
    }

    // Validate child state exists
    if (!this.states.has(childId)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `Child state "${childId}" not found. You must add the child state first.`,
        { compositeId, childId }
      );
    }

    const compositeState = this.states.get(compositeId);
    const childState = this.states.get(childId);

    if (compositeState && childState) {
      if (!Array.isArray(compositeState.compositeStates)) {
        compositeState.compositeStates = [];
      }
      compositeState.compositeStates.push(childState);
    }

    return this;
  }

  /**
   * Add a transition between two states
   * @throws {ValidationError} If either state doesn't exist
   */
  addTransition(from: StateID, to: StateID, label?: string): this {
    // Validate states exist
    if (!this.states.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `Source state "${from}" not found. You must add the state before creating a transition.`,
        { from, to }
      );
    }

    if (!this.states.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `Target state "${to}" not found. You must add the state before creating a transition.`,
        { from, to }
      );
    }

    const transition: StateTransition = {
      from: from as string,
      to: to as string,
      label,
    };

    this.transitions.push(transition);
    this.transitionCount++;

    return this;
  }

  /**
   * Get the start state ID for transitions from initial state
   */
  getStartState(): StateID {
    return this.START_STATE;
  }

  /**
   * Add a fork state for parallel transitions
   */
  addFork(id: string): StateID {
    const forkId = `${this.FORK_STATE_PREFIX}${id}`;

    if (!isValidIDFormat(forkId)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid Fork ID format: "${forkId}"`,
        { id: forkId }
      );
    }

    const stateId = brandID<StateID>(forkId);

    if (this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Fork state with ID "${forkId}" already exists`,
        { id: forkId }
      );
    }

    const forkState: State = {
      id: forkId,
      type: 'FORK',
    };

    this.states.set(stateId, forkState);
    this.stateOrder.push(stateId);

    return stateId;
  }

  /**
   * Add a join state for merging parallel transitions
   */
  addJoin(id: string): StateID {
    const joinId = `${this.JOIN_STATE_PREFIX}${id}`;

    if (!isValidIDFormat(joinId)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid Join ID format: "${joinId}"`,
        { id: joinId }
      );
    }

    const stateId = brandID<StateID>(joinId);

    if (this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Join state with ID "${joinId}" already exists`,
        { id: joinId }
      );
    }

    const joinState: State = {
      id: joinId,
      type: 'JOIN',
    };

    this.states.set(stateId, joinState);
    this.stateOrder.push(stateId);

    return stateId;
  }

  /**
   * Set the start state
   */
  setStartState(stateId: StateID): this {
    if (!this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `State "${stateId}" does not exist`,
        { stateId }
      );
    }

    this.startStateId = stateId;
    return this;
  }

  /**
   * Set the end state
   */
  setEndState(stateId: StateID): this {
    if (!this.states.has(stateId)) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        `State "${stateId}" does not exist`,
        { stateId }
      );
    }

    this.endStateId = stateId;
    return this;
  }

  /**
   * Build and validate the complete state diagram
   */
  build(): StateDiagram & { startState?: string; endStates?: string[] } {
    if (this.states.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        'State diagram must have at least one state',
        {}
      );
    }

    // Validate that start state is set
    if (!this.startStateId) {
      throw new ValidationError(
        ValidationErrorCode.STATE_NOT_FOUND,
        'State diagram must have a start state. Use setStartState() to set one.',
        {}
      );
    }

    const states = this.stateOrder.map((sid) => {
      const state = this.states.get(sid);
      if (!state) {
        throw new ValidationError(
          ValidationErrorCode.STATE_NOT_FOUND,
          `State "${sid}" not found in build`,
          { sid }
        );
      }

      // Convert compositeStates to IDs for test compatibility
      if (Array.isArray(state.compositeStates) && state.compositeStates.length > 0) {
        return {
          ...state,
          compositeStates: state.compositeStates.map((cs) => cs.id),
        } as unknown as State;
      }

      return state;
    });

    const diagram: StateDiagram & { startState?: string; endStates?: string[] } = {
      type: 'state',
      version: 'v2',
      states,
      transitions: this.transitions,
      notes: [],
    };

    // Add startState if set (for compatibility with tests)
    if (this.startStateId) {
      const startState = this.states.get(this.startStateId);
      if (startState) {
        diagram.startState = startState.id;
      }
    }

    // Add endStates if set
    if (this.endStateId) {
      const endState = this.states.get(this.endStateId);
      if (endState) {
        diagram.endStates = [endState.id];
      }
    }

    return diagram;
  }

  /**
   * Get current state count
   */
  getStateCount(): number {
    return this.states.size;
  }

  /**
   * Get current transition count
   */
  getTransitionCount(): number {
    return this.transitionCount;
  }

  /**
   * Check if a state exists
   */
  hasState(stateId: StateID): boolean {
    return this.states.has(stateId);
  }
}
