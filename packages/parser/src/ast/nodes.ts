import type {
  ClassDiagram,
  Direction,
  ERDiagram,
  GanttDiagram,
  NodeShape,
  SequenceDiagram,
  StateDiagram,
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
  shape: z.string() as z.ZodType<NodeShape>,
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
  direction: z.string().optional() as z.ZodType<Direction | undefined>,
  body: z.array(z.unknown()), // Will contain nodes and edges
});

/**
 * Flowchart Diagram AST
 */
export const FlowchartDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('FlowchartDiagram'),
  direction: z.string() as z.ZodType<Direction>,
  body: z.array(z.unknown()), // Will contain nodes, edges, subgraphs
});

/**
 * Sequence Diagram AST
 */
export const SequenceDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('SequenceDiagram'),
  diagram: z.unknown() as z.ZodType<SequenceDiagram>,
});

/**
 * Class Diagram AST
 */
export const ClassDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('ClassDiagram'),
  diagram: z.unknown() as z.ZodType<ClassDiagram>,
});

/**
 * ER Diagram AST
 */
export const ERDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('ERDiagram'),
  diagram: z.unknown() as z.ZodType<ERDiagram>,
});

/**
 * State Diagram AST
 */
export const StateDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('StateDiagram'),
  diagram: z.unknown() as z.ZodType<StateDiagram>,
});

/**
 * Gantt Diagram AST
 */
export const GanttDiagramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('GanttDiagram'),
  diagram: z.unknown() as z.ZodType<GanttDiagram>,
});

/**
 * Program (root) AST
 */
export const ProgramASTSchema = BaseASTNodeSchema.extend({
  type: z.literal('Program'),
  body: z.array(z.unknown()), // Will contain diagrams
});

export type ASTNodeType = z.infer<typeof ASTNodeTypeSchema>;
export type BaseASTNode = z.infer<typeof BaseASTNodeSchema>;
export type FlowchartNodeAST = z.infer<typeof FlowchartNodeASTSchema>;
export type EdgeAST = z.infer<typeof EdgeASTSchema>;
export type SubgraphAST = z.infer<typeof SubgraphASTSchema>;
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
