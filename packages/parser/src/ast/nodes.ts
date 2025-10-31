import type { Direction, NodeShape } from '@lyric-js/core';
import { z } from 'zod';

/**
 * AST Node types
 */
export const ASTNodeTypeSchema = z.enum([
  'Program',
  'FlowchartDiagram',
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
export type ProgramAST = z.infer<typeof ProgramASTSchema>;

export type ASTNode = ProgramAST | FlowchartDiagramAST | FlowchartNodeAST | EdgeAST | SubgraphAST;
