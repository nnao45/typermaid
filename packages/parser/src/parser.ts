// Enhanced AST imports
import { EnhancedClassDiagramAST } from './ast/enhanced-class.js';
import { EnhancedERDiagramAST } from './ast/enhanced-er.js';
import { EnhancedFlowchartDiagramAST } from './ast/enhanced-flowchart.js';
import { EnhancedGanttDiagramAST } from './ast/enhanced-gantt.js';
import { EnhancedSequenceDiagramAST } from './ast/enhanced-sequence.js';
import { EnhancedStateDiagramAST } from './ast/enhanced-state.js';
import type {
  ClassDiagramAST,
  ERDiagramAST,
  FlowchartDiagramAST,
  GanttDiagramAST,
  ProgramAST,
  SequenceDiagramAST,
  StateDiagramAST,
} from './ast/nodes.js';
import { ClassParser } from './grammar/class.js';
import { ERParser } from './grammar/er.js';
import { FlowchartParser } from './grammar/flowchart.js';
import { GanttParser } from './grammar/gantt.js';
import { SequenceParser } from './grammar/sequence.js';
import { StateParser } from './grammar/state.js';
import { Tokenizer } from './lexer/tokenizer.js';

/**
 * Parse Mermaid flowchart syntax into Enhanced AST with builder capabilities
 */
export function parseFlowchart(input: string): EnhancedFlowchartDiagramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new FlowchartParser(tokens);
  const programAST = parser.parse();

  // Extract the FlowchartDiagramAST from the Program
  const flowchartDiagram = programAST.body.find(
    (node) => node.type === 'FlowchartDiagram'
  ) as FlowchartDiagramAST;

  if (!flowchartDiagram) {
    throw new Error('No flowchart diagram found in parsed AST');
  }

  // Return enhanced AST with builder capabilities
  return new EnhancedFlowchartDiagramAST(flowchartDiagram);
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseFlowchart() for enhanced API
 */
export function parseFlowchartLegacy(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new FlowchartParser(tokens);
  return parser.parse();
}

/**
 * Parse Mermaid sequence diagram syntax into Enhanced AST with builder capabilities
 */
export function parseSequence(input: string): EnhancedSequenceDiagramAST {
  const parser = new SequenceParser();
  const diagram = parser.parse(input);

  const sequenceDiagramAST: SequenceDiagramAST = {
    type: 'SequenceDiagram',
    diagram,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };

  // Return enhanced AST with builder capabilities
  return new EnhancedSequenceDiagramAST(sequenceDiagramAST);
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseSequence() for enhanced API
 */
export function parseSequenceLegacy(input: string): ProgramAST {
  const parser = new SequenceParser();
  const diagram = parser.parse(input);

  return {
    type: 'Program',
    body: [
      {
        type: 'SequenceDiagram',
        diagram,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: input.length },
        },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}

/**
 * Parse Mermaid class diagram syntax into Enhanced AST with builder capabilities
 */
export function parseClass(input: string): EnhancedClassDiagramAST {
  const parser = new ClassParser();
  const diagram = parser.parse(input);

  const classDiagramAST: ClassDiagramAST = {
    type: 'ClassDiagram',
    diagram,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };

  // Return enhanced AST with builder capabilities
  return new EnhancedClassDiagramAST(classDiagramAST);
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseClass() for enhanced API
 */
export function parseClassLegacy(input: string): ProgramAST {
  const parser = new ClassParser();
  const diagram = parser.parse(input);

  return {
    type: 'Program',
    body: [
      {
        type: 'ClassDiagram',
        diagram,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: input.length },
        },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}

/**
 * Parse Mermaid state diagram syntax into Enhanced AST with builder capabilities
 */
export function parseState(input: string): EnhancedStateDiagramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new StateParser(tokens);
  const diagram = parser.parse();

  const stateDiagramAST: StateDiagramAST = {
    type: 'StateDiagram',
    diagram,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };

  // Return enhanced AST with builder capabilities
  return new EnhancedStateDiagramAST(stateDiagramAST);
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseState() for enhanced API
 */
export function parseStateLegacy(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new StateParser(tokens);
  const diagram = parser.parse();

  return {
    type: 'Program',
    body: [
      {
        type: 'StateDiagram',
        diagram,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: input.length },
        },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}

/**
 * Parse Mermaid ER diagram syntax with enhanced builder capabilities
 */
export function parseER(input: string): EnhancedERDiagramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new ERParser(tokens);
  const diagram = parser.parse();

  const erDiagramAST: ERDiagramAST = {
    type: 'ERDiagram',
    diagram,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };

  // Return enhanced AST with builder capabilities
  return new EnhancedERDiagramAST(erDiagramAST);
}

/**
 * Parse Mermaid Gantt chart syntax with enhanced builder capabilities
 */
export function parseGantt(input: string): EnhancedGanttDiagramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new GanttParser(tokens);
  const diagram = parser.parse();

  const ganttDiagramAST: GanttDiagramAST = {
    type: 'gantt',
    config: diagram.config,
    sections: diagram.sections,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };

  // Return enhanced AST with builder capabilities
  return new EnhancedGanttDiagramAST(ganttDiagramAST);
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseER() for enhanced API
 */
export function parseERLegacy(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new ERParser(tokens);
  const diagram = parser.parse();

  return {
    type: 'Program',
    body: [
      {
        type: 'ERDiagram',
        diagram,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: input.length },
        },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}

/**
 * Legacy function - returns ProgramAST for backward compatibility
 * @deprecated Use parseGantt() for enhanced API
 */
export function parseGanttLegacy(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new GanttParser(tokens);
  const diagram = parser.parse();

  return {
    type: 'Program',
    body: [
      {
        type: 'GanttDiagram',
        diagram,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: input.length },
        },
      },
    ],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}

/**
 * Split input into multiple diagrams
 * Only splits when encountering a new diagram type keyword at the start of a line
 */
function splitDiagrams(input: string): string[] {
  const lines = input.split('\n');
  const diagrams: string[] = [];
  let currentDiagram: string[] = [];

  const diagramKeywords = [
    'sequencediagram',
    'classdiagram',
    'erdiagram',
    'statediagram',
    'gantt',
    'flowchart',
    'graph',
  ];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    const isNewDiagram = diagramKeywords.some((keyword) => trimmed.startsWith(keyword));

    if (isNewDiagram && currentDiagram.length > 0) {
      // Save current diagram and start new one
      diagrams.push(currentDiagram.join('\n'));
      currentDiagram = [line];
    } else {
      currentDiagram.push(line);
    }
  }

  // Add last diagram
  if (currentDiagram.length > 0) {
    diagrams.push(currentDiagram.join('\n'));
  }

  return diagrams.filter((d) => d.trim().length > 0);
}

/**
 * Detect diagram type from input
 */
function detectDiagramType(input: string): string {
  const trimmed = input.trim().toLowerCase();

  if (trimmed.startsWith('sequencediagram')) return 'sequence';
  if (trimmed.startsWith('classdiagram')) return 'class';
  if (trimmed.startsWith('erdiagram')) return 'er';
  if (trimmed.startsWith('statediagram')) return 'state';
  if (trimmed.startsWith('gantt')) return 'gantt';
  if (trimmed.startsWith('flowchart')) return 'flowchart';
  if (trimmed.startsWith('graph')) return 'flowchart';

  return 'flowchart'; // default
}

/**
 * Parse single diagram by type
 */
function parseSingleDiagram(input: string, type: string): ProgramAST {
  switch (type) {
    case 'sequence':
      return parseSequenceLegacy(input);
    case 'class':
      return parseClassLegacy(input);
    case 'er':
      return parseERLegacy(input);
    case 'state':
      return parseStateLegacy(input);
    case 'gantt':
      return parseGanttLegacy(input);
    default:
      return parseFlowchartLegacy(input);
  }
}

/**
 * Main parse function - auto-detects diagram type
 * Supports multiple diagrams separated by blank lines
 */
export function parse(input: string): ProgramAST {
  const diagrams = splitDiagrams(input);

  // Empty input
  if (diagrams.length === 0) {
    return {
      type: 'Program',
      body: [],
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      },
    };
  }

  // Single diagram case
  if (diagrams.length === 1) {
    const diagram = diagrams[0];
    if (!diagram) {
      return {
        type: 'Program',
        body: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
        },
      };
    }
    const type = detectDiagramType(diagram);
    return parseSingleDiagram(diagram, type);
  }

  // Multiple diagrams case
  const allDiagrams = [];
  for (const diagramInput of diagrams) {
    const type = detectDiagramType(diagramInput);
    const ast = parseSingleDiagram(diagramInput, type);
    allDiagrams.push(...ast.body);
  }

  return {
    type: 'Program',
    body: allDiagrams,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: input.length },
    },
  };
}
