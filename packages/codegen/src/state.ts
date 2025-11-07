import type { State, StateDiagramAST, StateNote, Transition } from '@typermaid/parser';

/**
 * Generate Mermaid code from State Diagram AST
 */
export function generateState(ast: StateDiagramAST): string {
  const lines: string[] = [];

  // Diagram declaration
  lines.push(`stateDiagram-${ast.diagram.version}`);

  // Direction
  if (ast.diagram.direction) {
    lines.push(`  direction ${ast.diagram.direction}`);
  }

  // States
  for (const state of ast.diagram.states) {
    const stateLine = generateStateNode(state);
    if (stateLine) {
      lines.push(stateLine);
    }
  }

  // Transitions
  for (const transition of ast.diagram.transitions) {
    lines.push(generateTransition(transition));
  }

  // Notes
  if (ast.diagram.notes) {
    for (const note of ast.diagram.notes) {
      lines.push(generateStateNote(note));
    }
  }

  return lines.join('\n');
}

function generateStateNode(state: State): string {
  // Start/End state
  if (state.id === '[*]') {
    return '';
  }

  // State with description
  if (state.description) {
    if (typeof state.description === 'string') {
      return `  ${state.id}: ${state.description}`;
    }
    if ('raw' in state.description) {
      return `  ${state.id}: ${state.description.raw}`;
    }
  }

  // Composite state (state with nested states)
  if (state.compositeStates && state.compositeStates.length > 0) {
    const lines: string[] = [];
    lines.push(`  state ${state.id} {`);

    for (const nestedState of state.compositeStates) {
      const nested = generateStateNode(nestedState);
      if (nested) {
        lines.push(`  ${nested}`);
      }
    }

    lines.push(`  }`);
    return lines.join('\n');
  }

  // Choice/Fork/Join state (based on StateType)
  if (state.type === 'CHOICE') {
    return `  state ${state.id} <<choice>>`;
  }
  if (state.type === 'FORK') {
    return `  state ${state.id} <<fork>>`;
  }
  if (state.type === 'JOIN') {
    return `  state ${state.id} <<join>>`;
  }

  // Simple state (just declare if needed)
  return '';
}

function generateTransition(transition: Transition): string {
  // Handle [*] special case (parser converts to [*]_start or [*]_end)
  const from = transition.from.replace(/\[\*\]_(start|end)/, '[*]');
  const to = transition.to.replace(/\[\*\]_(start|end)/, '[*]');

  if (transition.label) {
    if (typeof transition.label === 'string') {
      return `  ${from} --> ${to}: ${transition.label}`;
    }
    if ('raw' in transition.label) {
      return `  ${from} --> ${to}: ${transition.label.raw}`;
    }
  }

  return `  ${from} --> ${to}`;
}

function generateStateNote(note: StateNote): string {
  const position = note.position || 'right';
  const noteText =
    typeof note.note === 'string' ? note.note : 'raw' in note.note ? note.note.raw : '';

  return `  note ${position} of ${note.state}: ${noteText}`;
}
