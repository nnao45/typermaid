import {
  ClassDiagramSchema,
  DirectionSchema,
  EdgeTypeSchema,
  ERDiagramSchema,
  GanttDiagramSchema,
  NodeShapeSchema,
  SequenceDiagramSchema,
  StateDiagramSchema,
} from '@lyric-js/core';
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

/**
 * Subgraph AST
 */
export type SubgraphAST = z.infer<typeof BaseASTNodeSchema> & {
  type: 'Subgraph';
  id: string;
  label?: string | undefined;
  direction?: z.infer<typeof DirectionSchema> | undefined;
  body: Array<z.infer<typeof FlowchartNodeASTSchema> | z.infer<typeof EdgeASTSchema> | SubgraphAST>;
};

export const SubgraphASTSchema: z.ZodType<SubgraphAST> = BaseASTNodeSchema.extend({
  type: z.literal('Subgraph'),
  id: z.string(),
  label: z.string().optional(),
  direction: DirectionSchema.optional(),
  body: z.lazy(() => z.array(z.union([FlowchartNodeASTSchema, EdgeASTSchema, SubgraphASTSchema]))),
}) as z.ZodType<SubgraphAST>;

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
  body: z.lazy(() =>
    z.array(
      z.union([
        FlowchartDiagramASTSchema,
        SequenceDiagramASTSchema,
        ClassDiagramASTSchema,
        ERDiagramASTSchema,
        StateDiagramASTSchema,
        GanttDiagramASTSchema,
      ])
    )
  ),
});

export type ASTNodeType = z.infer<typeof ASTNodeTypeSchema>;
export type BaseASTNode = z.infer<typeof BaseASTNodeSchema>;
export type FlowchartNodeAST = z.infer<typeof FlowchartNodeASTSchema>;
export type EdgeAST = z.infer<typeof EdgeASTSchema>;
// SubgraphAST is defined above with explicit type annotation
export type FlowchartDiagramAST = z.infer<typeof FlowchartDiagramASTSchema>;
export type SequenceDiagramAST = z.infer<typeof SequenceDiagramASTSchema>;
export type ClassDiagramAST = z.infer<typeof ClassDiagramASTSchema>;
export type ERDiagramAST = z.infer<typeof ERDiagramASTSchema>;
export type StateDiagramAST = z.infer<typeof StateDiagramASTSchema>;
export type GanttDiagramAST = z.infer<typeof GanttDiagramASTSchema>;
export type ProgramAST = z.infer<typeof ProgramASTSchema>;

export type ASTNode =
  | ProgramAST
  | FlowchartDiagramAST
  | SequenceDiagramAST
  | ClassDiagramAST
  | ERDiagramAST
  | StateDiagramAST
  | GanttDiagramAST
  | FlowchartNodeAST
  | EdgeAST
  | SubgraphAST;
