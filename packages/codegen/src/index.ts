import type {
  ClassDiagramAST,
  ERDiagramAST,
  FlowchartDiagramAST,
  GanttDiagramAST,
  ProgramAST,
  SequenceDiagramAST,
  StateDiagramAST,
} from '@lyric-js/parser';
import { generateFlowchart } from './flowchart.js';
import { generateSequence } from './sequence.js';
import { generateState } from './state.js';
import { generateClass } from './class.js';
import { generateER } from './er.js';
import { generateGantt } from './gantt.js';

/**
 * Generate Mermaid code from AST
 *
 * @param ast - Parsed AST from @lyric-js/parser
 * @returns Generated Mermaid code
 */
export function generateCode(ast: ProgramAST): string {
  const parts: string[] = [];

  for (const node of ast.body) {
    switch (node.type) {
      case 'FlowchartDiagram':
        parts.push(generateFlowchart(node as FlowchartDiagramAST));
        break;

      case 'SequenceDiagram':
        parts.push(generateSequence(node as SequenceDiagramAST));
        break;

      case 'StateDiagram':
        parts.push(generateState(node as StateDiagramAST));
        break;

      case 'ClassDiagram':
        parts.push(generateClass(node as ClassDiagramAST));
        break;

      case 'ERDiagram':
        parts.push(generateER(node as ERDiagramAST));
        break;

      case 'GanttDiagram':
        parts.push(generateGantt(node as GanttDiagramAST));
        break;

      default: {
        // Exhaustiveness check
        const _exhaustive: never = node;
        console.warn(`Unknown diagram type:`, _exhaustive);
      }
    }
  }

  return parts.join('\n\n');
}

// Re-export individual generators
export { generateFlowchart } from './flowchart.js';
export { generateSequence } from './sequence.js';
export { generateState } from './state.js';
export { generateClass } from './class.js';
export { generateER } from './er.js';
export { generateGantt } from './gantt.js';
