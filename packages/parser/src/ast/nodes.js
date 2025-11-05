import { ClassDiagramSchema, DirectionSchema, EdgeTypeSchema, ERDiagramSchema, GanttDiagramSchema, NodeShapeSchema, SequenceDiagramSchema, StateDiagramSchema, } from '@lyric-js/core';
import { z } from 'zod';
/**
 * AST Node types
 */
export const ASTNodeTypeSchema = z.enum([
    'Program',
    'FlowchartDiagram',
    'SequenceDiagram',
    'ClassDiagram',
    'ERDiagram',
    'StateDiagram',
    'GanttDiagram',
    'Node',
    'Edge',
    'Subgraph',
    'ClassDef',
    'StyleDef',
]);
/**
 * Base AST Node
 */
export const BaseASTNodeSchema = z.object({
    type: ASTNodeTypeSchema,
    loc: z
        .object({
        start: z.object({
            line: z.number(),
            column: z.number(),
        }),
        end: z.object({
            line: z.number(),
            column: z.number(),
        }),
    })
        .optional(),
});
/**
 * Flowchart Node AST
 */
export const FlowchartNodeASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('Node'),
    id: z.string(),
    shape: NodeShapeSchema,
    label: z.string(),
});
/**
 * Edge AST
 */
export const EdgeASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('Edge'),
    from: z.string(),
    to: z.string(),
    edgeType: EdgeTypeSchema,
    label: z.string().optional(),
    length: z.number().optional(),
});
export const SubgraphASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('Subgraph'),
    id: z.string(),
    label: z.string().optional(),
    direction: DirectionSchema.optional(),
    body: z.lazy(() => z.array(z.union([FlowchartNodeASTSchema, EdgeASTSchema, SubgraphASTSchema]))),
});
/**
 * Flowchart Diagram AST
 */
export const FlowchartDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('FlowchartDiagram'),
    direction: DirectionSchema,
    body: z.lazy(() => z.array(z.union([FlowchartNodeASTSchema, EdgeASTSchema, SubgraphASTSchema]))),
});
/**
 * Sequence Diagram AST
 */
export const SequenceDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('SequenceDiagram'),
    diagram: SequenceDiagramSchema,
});
/**
 * Class Diagram AST
 */
export const ClassDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('ClassDiagram'),
    diagram: ClassDiagramSchema,
});
/**
 * ER Diagram AST
 */
export const ERDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('ERDiagram'),
    diagram: ERDiagramSchema,
});
/**
 * State Diagram AST
 */
export const StateDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('StateDiagram'),
    diagram: StateDiagramSchema,
});
/**
 * Gantt Diagram AST
 */
export const GanttDiagramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('GanttDiagram'),
    diagram: GanttDiagramSchema,
});
/**
 * Program (root) AST
 */
export const ProgramASTSchema = BaseASTNodeSchema.extend({
    type: z.literal('Program'),
    body: z.lazy(() => z.array(z.union([
        FlowchartDiagramASTSchema,
        SequenceDiagramASTSchema,
        ClassDiagramASTSchema,
        ERDiagramASTSchema,
        StateDiagramASTSchema,
        GanttDiagramASTSchema,
    ]))),
});
//# sourceMappingURL=nodes.js.map