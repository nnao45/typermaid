import type { State, StateDiagram, StateID, StateTransition } from '@typermaid/core';
import type { StateDiagramAST } from './nodes.js';
/**
 * Enhanced StateDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export declare class EnhancedStateDiagramAST implements StateDiagramAST {
    type: 'StateDiagram';
    diagram: StateDiagram;
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
    constructor(ast: StateDiagramAST);
    /**
     * Add a state to the diagram
     * @param id - State ID
     * @param label - Optional display label
     * @param description - Optional state description
     * @returns StateID for method chaining with transitions
     */
    addState(id: string, label?: string, description?: string): StateID;
    /**
     * Add a composite state (state with nested states)
     * @param id - Composite state ID
     * @param label - Optional display label
     * @returns StateID for method chaining
     */
    addCompositeState(id: string, label?: string): StateID;
    /**
     * Add a state to a composite state
     * @param compositeId - Parent composite state ID
     * @param childId - Child state ID
     * @returns this for method chaining
     */
    addStateToComposite(compositeId: StateID, childId: StateID): this;
    /**
     * Add a transition between states
     * @param from - Source state
     * @param to - Target state
     * @param label - Optional transition label
     * @returns this for method chaining
     */
    addTransition(from: StateID, to: StateID, label?: string): this;
    /**
     * Add a fork state for parallel transitions
     * @param id - Fork state ID (will be prefixed with 'fork_')
     * @returns StateID for method chaining
     */
    addFork(id: string): StateID;
    /**
     * Add a join state for merging parallel transitions
     * @param id - Join state ID (will be prefixed with 'join_')
     * @returns StateID for method chaining
     */
    addJoin(id: string): StateID;
    /**
     * Get the start state ID
     */
    getStartState(): StateID;
    /**
     * Set the start state
     * @param stateId - State to mark as start
     * @returns this for method chaining
     */
    setStartState(stateId: StateID): this;
    /**
     * Set the end state
     * @param stateId - State to mark as end
     * @returns this for method chaining
     */
    setEndState(stateId: StateID): this;
    /**
     * Find states by pattern
     */
    findStates(pattern: string): State[];
    /**
     * Find transitions by pattern
     */
    findTransitions(pattern: string): StateTransition[];
    /**
     * Replace state ID throughout the diagram
     */
    replaceState(oldId: string, newId: string): this;
    /**
     * Generate Mermaid State diagram code
     * Simple implementation without external dependencies
     */
    asCode(): string;
    /**
     * Build final StateDiagram with asCode capability
     */
    build(): StateDiagram & {
        asCode(): string;
    };
    /**
     * Get state count
     */
    getStateCount(): number;
    /**
     * Get transition count
     */
    getTransitionCount(): number;
    /**
     * Check if state exists
     */
    hasState(stateId: StateID): boolean;
}
//# sourceMappingURL=enhanced-state.d.ts.map