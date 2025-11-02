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
  shape: z.string(),
  label: z.string(),
});
/**
 * Edge AST
 */
export const EdgeASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('Edge'),
  from: z.string(),
  to: z.string(),
  edgeType: z.string(),
  label: z.string().optional(),
  length: z.number().optional(),
});
/**
 * Subgraph AST
 */
export const SubgraphASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('Subgraph'),
  id: z.string(),
  label: z.string().optional(),
  direction: z.string().optional(),
  body: z.array(z.unknown()), // Will contain nodes and edges
});
/**
 * Flowchart Diagram AST
 */
export const FlowchartDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('FlowchartDiagram'),
  direction: z.string(),
  body: z.array(z.unknown()), // Will contain nodes, edges, subgraphs
});
/**
 * Sequence Diagram AST
 */
export const SequenceDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('SequenceDiagram'),
  diagram: z.unknown(),
});
/**
 * Class Diagram AST
 */
export const ClassDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('ClassDiagram'),
  diagram: z.unknown(),
});
/**
 * ER Diagram AST
 */
export const ERDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('ERDiagram'),
  diagram: z.unknown(),
});
/**
 * State Diagram AST
 */
export const StateDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('StateDiagram'),
  diagram: z.unknown(),
});
/**
 * Gantt Diagram AST
 */
export const GanttDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('GanttDiagram'),
  diagram: z.unknown(),
});
/**
 * Program (root) AST
 */
export const ProgramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('Program'),
  body: z.array(z.unknown()), // Will contain diagrams
});
//# sourceMappingURL=nodes.js.map
