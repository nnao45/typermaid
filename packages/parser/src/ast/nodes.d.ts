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
export declare const ASTNodeTypeSchema: z.ZodEnum<{
  Program: 'Program';
  FlowchartDiagram: 'FlowchartDiagram';
  SequenceDiagram: 'SequenceDiagram';
  ClassDiagram: 'ClassDiagram';
  ERDiagram: 'ERDiagram';
  StateDiagram: 'StateDiagram';
  GanttDiagram: 'GanttDiagram';
  Node: 'Node';
  Edge: 'Edge';
  Subgraph: 'Subgraph';
  ClassDef: 'ClassDef';
  StyleDef: 'StyleDef';
}>;
/**
 * Base AST Node
 */
export declare const BaseASTNodeSchema: z.ZodObject<
  {
    type: z.ZodEnum<{
      Program: 'Program';
      FlowchartDiagram: 'FlowchartDiagram';
      SequenceDiagram: 'SequenceDiagram';
      ClassDiagram: 'ClassDiagram';
      ERDiagram: 'ERDiagram';
      StateDiagram: 'StateDiagram';
      GanttDiagram: 'GanttDiagram';
      Node: 'Node';
      Edge: 'Edge';
      Subgraph: 'Subgraph';
      ClassDef: 'ClassDef';
      StyleDef: 'StyleDef';
    }>;
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
/**
 * Flowchart Node AST
 */
export declare const FlowchartNodeASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'Node'>;
    id: z.ZodString;
    shape: z.ZodType<NodeShape>;
    label: z.ZodString;
  },
  z.core.$strip
>;
/**
 * Edge AST
 */
export declare const EdgeASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'Edge'>;
    from: z.ZodString;
    to: z.ZodString;
    edgeType: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    length: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
/**
 * Subgraph AST
 */
export declare const SubgraphASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'Subgraph'>;
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    direction: z.ZodType<Direction | undefined>;
    body: z.ZodArray<z.ZodUnknown>;
  },
  z.core.$strip
>;
/**
 * Flowchart Diagram AST
 */
export declare const FlowchartDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'FlowchartDiagram'>;
    direction: z.ZodType<Direction>;
    body: z.ZodArray<z.ZodUnknown>;
  },
  z.core.$strip
>;
/**
 * Sequence Diagram AST
 */
export declare const SequenceDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'SequenceDiagram'>;
    diagram: z.ZodType<SequenceDiagram>;
  },
  z.core.$strip
>;
/**
 * Class Diagram AST
 */
export declare const ClassDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'ClassDiagram'>;
    diagram: z.ZodType<ClassDiagram>;
  },
  z.core.$strip
>;
/**
 * ER Diagram AST
 */
export declare const ERDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'ERDiagram'>;
    diagram: z.ZodType<ERDiagram>;
  },
  z.core.$strip
>;
/**
 * State Diagram AST
 */
export declare const StateDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'StateDiagram'>;
    diagram: z.ZodType<StateDiagram>;
  },
  z.core.$strip
>;
/**
 * Gantt Diagram AST
 */
export declare const GanttDiagramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'GanttDiagram'>;
    diagram: z.ZodType<GanttDiagram>;
  },
  z.core.$strip
>;
/**
 * Program (root) AST
 */
export declare const ProgramASTSchema: z.ZodObject<
  {
    loc: z.ZodOptional<
      z.ZodObject<
        {
          start: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
          end: z.ZodObject<
            {
              line: z.ZodNumber;
              column: z.ZodNumber;
            },
            z.core.$strip
          >;
        },
        z.core.$strip
      >
    >;
    type: z.ZodLiteral<'Program'>;
    body: z.ZodArray<z.ZodUnknown>;
  },
  z.core.$strip
>;
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
//# sourceMappingURL=nodes.d.ts.map
