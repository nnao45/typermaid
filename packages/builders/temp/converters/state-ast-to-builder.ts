import type { State, StateDiagram, StateTransition } from '@typermaid/core';
import { extractText } from '@typermaid/core';
import type { StateDiagramAST } from '@typermaid/parser';
import { StateDiagramBuilder } from '../state-builder.js';
import type { StateID } from '../types.js';

/**
 * Convert parsed State Diagram AST to Builder for manipulation
 *
 * @param ast - Parsed StateDiagramAST
 * @returns StateDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@typermaid/parser';
 * import { stateASTToBuilder } from '@typermaid/builders/converters';
 *
 * const code = `
 *   stateDiagram-v2
 *     [*] --> State1
 *     State1 --> State2
 *     State2 --> [*]
 * `;
 * const ast = parse(code);
 * const builder = stateASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const state3 = builder.addState('State3', 'Processing');
 * builder.addTransition(brandID('State2'), state3);
 * ```
 */
export function stateASTToBuilder(ast: StateDiagramAST): StateDiagramBuilder {
  const builder = new StateDiagramBuilder();

  // Track state IDs
  const stateIdMap = new Map<string, StateID>();

  const diagram: StateDiagram = ast.diagram;

  // Process states first
  for (const state of diagram.states) {
    const stateId = processState(state, builder);
    if (stateId) {
      stateIdMap.set(state.id, stateId);
    }
  }

  // Process transitions
  for (const transition of diagram.transitions) {
    processTransition(transition, builder, stateIdMap);
  }

  return builder;
}

/**
 * Process a single state and add to builder
 */
function processState(state: State, builder: StateDiagramBuilder): StateID | null {
  // Skip [*] states and internal start/end states (they're implicit)
  if (
    state.id === '[*]' ||
    state.id === '[*]_start' ||
    state.id === '[*]_end' ||
    state.type === 'START' ||
    state.type === 'END'
  ) {
    return null;
  }

  // Skip composite states for now (builder doesn't support nested states yet in AST conversion)
  if (state.compositeStates && state.compositeStates.length > 0) {
    // TODO: Add support for composite states in future iteration
    return null;
  }

  // Extract label and description using extractText helper
  const label = state.label ? extractText(state.label) : undefined;
  const description = state.description ? extractText(state.description) : undefined;

  return builder.addState(state.id, label, description);
}

/**
 * Process a single transition and add to builder
 */
function processTransition(
  transition: StateTransition,
  builder: StateDiagramBuilder,
  stateIdMap: Map<string, StateID>
): void {
  // Normalize [*]_start and [*]_end back to [*]
  const normalizeStateId = (id: string): string => {
    if (id === '[*]_start' || id === '[*]_end') {
      return '[*]';
    }
    return id;
  };

  const from = normalizeStateId(transition.from);
  const to = normalizeStateId(transition.to);

  // Handle transitions involving [*] (start/end states)
  if (from === '[*]') {
    // [*] --> State means State is the start state
    let toId = stateIdMap.get(to);

    if (!toId) {
      toId = builder.addState(to);
      stateIdMap.set(to, toId);
    }

    builder.setStartState(toId);
    return; // Don't add transition for [*] --> State
  }

  if (to === '[*]') {
    // State --> [*] means State can transition to end
    let fromId = stateIdMap.get(from);

    if (!fromId) {
      fromId = builder.addState(from);
      stateIdMap.set(from, fromId);
    }

    builder.setEndState(fromId);
    return; // Don't add transition for State --> [*]
  }

  // Normal state-to-state transition
  let fromId = stateIdMap.get(from);
  let toId = stateIdMap.get(to);

  if (!fromId) {
    fromId = builder.addState(from);
    stateIdMap.set(from, fromId);
  }

  if (!toId) {
    toId = builder.addState(to);
    stateIdMap.set(to, toId);
  }

  // Extract label from Content type using extractText helper
  const label = transition.label ? extractText(transition.label) : undefined;

  builder.addTransition(fromId, toId, label);
}
