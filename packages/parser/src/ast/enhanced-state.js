import { createStateID } from '@typermaid/core';
/**
 * Enhanced StateDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedStateDiagramAST {
    // AST properties
    type = 'StateDiagram';
    diagram;
    loc;
    constructor(ast) {
        // Copy AST properties
        this.diagram = { ...ast.diagram };
        this.loc = ast.loc;
        // Initialize diagram if not present
        if (!this.diagram.states) {
            this.diagram.states = [];
        }
        if (!this.diagram.transitions) {
            this.diagram.transitions = [];
        }
        if (!this.diagram.notes) {
            this.diagram.notes = [];
        }
    }
    /**
     * Add a state to the diagram
     * @param id - State ID
     * @param label - Optional display label
     * @param description - Optional state description
     * @returns StateID for method chaining with transitions
     */
    addState(id, label, description) {
        const stateId = createStateID(id);
        // Check if state already exists
        const existingState = this.diagram.states.find((s) => s.id === stateId);
        if (!existingState) {
            this.diagram.states.push({
                id: stateId,
                type: 'STATE',
                label: label || undefined,
                description: description || undefined,
            });
        }
        return stateId;
    }
    /**
     * Add a composite state (state with nested states)
     * @param id - Composite state ID
     * @param label - Optional display label
     * @returns StateID for method chaining
     */
    addCompositeState(id, label) {
        const stateId = createStateID(id);
        // Check if state already exists
        const existingState = this.diagram.states.find((s) => s.id === stateId);
        if (!existingState) {
            this.diagram.states.push({
                id: stateId,
                type: 'STATE',
                label: label || undefined,
                compositeStates: [],
            });
        }
        return stateId;
    }
    /**
     * Add a state to a composite state
     * @param compositeId - Parent composite state ID
     * @param childId - Child state ID
     * @returns this for method chaining
     */
    addStateToComposite(compositeId, childId) {
        const compositeState = this.diagram.states.find((s) => s.id === compositeId);
        const childState = this.diagram.states.find((s) => s.id === childId);
        if (compositeState && childState) {
            if (!compositeState.compositeStates) {
                compositeState.compositeStates = [];
            }
            compositeState.compositeStates.push(childState);
        }
        return this;
    }
    /**
     * Add a transition between states
     * @param from - Source state
     * @param to - Target state
     * @param label - Optional transition label
     * @returns this for method chaining
     */
    addTransition(from, to, label) {
        this.diagram.transitions.push({
            from,
            to,
            label: label || undefined,
        });
        return this;
    }
    /**
     * Add a fork state for parallel transitions
     * @param id - Fork state ID (will be prefixed with 'fork_')
     * @returns StateID for method chaining
     */
    addFork(id) {
        const forkId = createStateID(`fork_${id}`);
        const existingState = this.diagram.states.find((s) => s.id === forkId);
        if (!existingState) {
            this.diagram.states.push({
                id: forkId,
                type: 'FORK',
            });
        }
        return forkId;
    }
    /**
     * Add a join state for merging parallel transitions
     * @param id - Join state ID (will be prefixed with 'join_')
     * @returns StateID for method chaining
     */
    addJoin(id) {
        const joinId = createStateID(`join_${id}`);
        const existingState = this.diagram.states.find((s) => s.id === joinId);
        if (!existingState) {
            this.diagram.states.push({
                id: joinId,
                type: 'JOIN',
            });
        }
        return joinId;
    }
    /**
     * Get the start state ID
     */
    getStartState() {
        return '[*]';
    }
    /**
     * Set the start state
     * @param stateId - State to mark as start
     * @returns this for method chaining
     */
    setStartState(stateId) {
        const startState = createStateID('[*]');
        this.addTransition(startState, stateId);
        return this;
    }
    /**
     * Set the end state
     * @param stateId - State to mark as end
     * @returns this for method chaining
     */
    setEndState(stateId) {
        const endState = createStateID('[*]');
        this.addTransition(stateId, endState);
        return this;
    }
    /**
     * Find states by pattern
     */
    findStates(pattern) {
        return this.diagram.states.filter((s) => s.id.includes(pattern));
    }
    /**
     * Find transitions by pattern
     */
    findTransitions(pattern) {
        return this.diagram.transitions.filter((t) => t.from.includes(pattern) || t.to.includes(pattern));
    }
    /**
     * Replace state ID throughout the diagram
     */
    replaceState(oldId, newId) {
        const newStateId = createStateID(newId);
        // Replace in states
        for (const state of this.diagram.states) {
            if (state.id === oldId) {
                state.id = newStateId;
            }
            // Handle nested states in composite states
            if (state.compositeStates) {
                for (const nestedState of state.compositeStates) {
                    if (nestedState.id === oldId) {
                        nestedState.id = newStateId;
                    }
                }
            }
        }
        // Replace in transitions
        for (const transition of this.diagram.transitions) {
            if (transition.from === oldId) {
                transition.from = newStateId;
            }
            if (transition.to === oldId) {
                transition.to = newStateId;
            }
        }
        return this;
    }
    /**
     * Generate Mermaid State diagram code
     * Simple implementation without external dependencies
     */
    asCode() {
        const lines = ['stateDiagram-v2'];
        // Add direction if specified
        if (this.diagram.direction) {
            lines.push(`    direction ${this.diagram.direction}`);
        }
        // Generate states
        for (const state of this.diagram.states) {
            if (state.type === 'FORK') {
                lines.push(`    state ${state.id} <<fork>>`);
            }
            else if (state.type === 'JOIN') {
                lines.push(`    state ${state.id} <<join>>`);
            }
            else if (state.type === 'CHOICE') {
                lines.push(`    state ${state.id} <<choice>>`);
            }
            else if (state.type === 'STATE') {
                const label = typeof state.label === 'string'
                    ? state.label
                    : state.label?.type === 'html'
                        ? state.label.raw
                        : state.label?.type === 'markdown'
                            ? state.label.raw
                            : undefined;
                if (label && label !== state.id) {
                    lines.push(`    ${state.id} : ${label}`);
                }
                else {
                    lines.push(`    state ${state.id}`);
                }
                // Add description if present
                if (state.description) {
                    const desc = typeof state.description === 'string'
                        ? state.description
                        : state.description.type === 'html'
                            ? state.description.raw
                            : state.description.type === 'markdown'
                                ? state.description.raw
                                : '';
                    lines.push(`    ${state.id} : ${desc}`);
                }
                // Handle composite states
                if (state.compositeStates && state.compositeStates.length > 0) {
                    lines.push(`    state ${state.id} {`);
                    for (const nestedState of state.compositeStates) {
                        const nestedLabel = typeof nestedState.label === 'string'
                            ? nestedState.label
                            : nestedState.label?.type === 'html'
                                ? nestedState.label.raw
                                : nestedState.label?.type === 'markdown'
                                    ? nestedState.label.raw
                                    : undefined;
                        if (nestedLabel) {
                            lines.push(`        ${nestedState.id} : ${nestedLabel}`);
                        }
                        else {
                            lines.push(`        state ${nestedState.id}`);
                        }
                    }
                    lines.push('    }');
                }
            }
        }
        // Generate transitions
        for (const transition of this.diagram.transitions) {
            const label = typeof transition.label === 'string'
                ? transition.label
                : transition.label?.type === 'html'
                    ? transition.label.raw
                    : transition.label?.type === 'markdown'
                        ? transition.label.raw
                        : '';
            if (label) {
                lines.push(`    ${transition.from} --> ${transition.to} : ${label}`);
            }
            else {
                lines.push(`    ${transition.from} --> ${transition.to}`);
            }
        }
        // Generate notes if present
        for (const note of this.diagram.notes || []) {
            const noteText = typeof note.note === 'string'
                ? note.note
                : note.note.type === 'html'
                    ? note.note.raw
                    : note.note.type === 'markdown'
                        ? note.note.raw
                        : '';
            const position = note.position || 'right';
            lines.push(`    note ${position} of ${note.state} : ${noteText}`);
        }
        return lines.join('\n');
    }
    /**
     * Build final StateDiagram with asCode capability
     */
    build() {
        const diagram = { ...this.diagram };
        return {
            ...diagram,
            asCode: () => this.asCode(),
        };
    }
    /**
     * Get state count
     */
    getStateCount() {
        return this.diagram.states.length;
    }
    /**
     * Get transition count
     */
    getTransitionCount() {
        return this.diagram.transitions.length;
    }
    /**
     * Check if state exists
     */
    hasState(stateId) {
        return this.diagram.states.some((s) => s.id === stateId);
    }
}
//# sourceMappingURL=enhanced-state.js.map