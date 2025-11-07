import type { ProgramAST } from './ast/nodes.js';
import { ClassParser } from './grammar/class.js';
import { ERParser } from './grammar/er.js';
import { FlowchartParser } from './grammar/flowchart.js';
import { GanttParser } from './grammar/gantt.js';
import { SequenceParser } from './grammar/sequence.js';
import { StateParser } from './grammar/state.js';
import { Tokenizer } from './lexer/tokenizer.js';

/**
 * Parse Mermaid flowchart syntax into AST
 */
export function parseFlowchart(input: string): ProgramAST {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  const parser = new FlowchartParser(tokens);
  return parser.parse();
}

/**
 * Parse Mermaid sequence diagram syntax
 */
export function parseSequence(input: string): ProgramAST {
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
 * Parse Mermaid class diagram syntax
 */
export function parseClass(input: string): ProgramAST {
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
 * Parse Mermaid ER diagram syntax
 */
export function parseER(input: string): ProgramAST {
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
 * Parse Mermaid state diagram syntax
 */
export function parseState(input: string): ProgramAST {
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
 * Parse Mermaid gantt chart syntax
 */
export function parseGantt(input: string): ProgramAST {
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
      return parseSequence(input);
    case 'class':
      return parseClass(input);
    case 'er':
      return parseER(input);
    case 'state':
      return parseState(input);
    case 'gantt':
      return parseGantt(input);
    default:
      return parseFlowchart(input);
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
