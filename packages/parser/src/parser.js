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
export function parseFlowchart(input) {
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    const parser = new FlowchartParser(tokens);
    return parser.parse();
}
/**
 * Parse Mermaid sequence diagram syntax
 */
export function parseSequence(input) {
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
export function parseClass(input) {
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
export function parseER(input) {
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
export function parseState(input) {
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
export function parseGantt(input) {
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
 * Main parse function - auto-detects diagram type
 */
export function parse(input) {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.startsWith('sequencediagram')) {
        return parseSequence(input);
    }
    if (trimmed.startsWith('classdiagram')) {
        return parseClass(input);
    }
    if (trimmed.startsWith('erdiagram')) {
        return parseER(input);
    }
    if (trimmed.startsWith('statediagram')) {
        return parseState(input);
    }
    if (trimmed.startsWith('gantt')) {
        return parseGantt(input);
    }
    // Default to flowchart
    return parseFlowchart(input);
}
//# sourceMappingURL=parser.js.map