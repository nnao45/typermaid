import { z } from 'zod';
import { ClassDefIDSchema, EdgeIDSchema, NodeIDSchema, SubgraphIDSchema } from './branded.js';
import { DirectionSchema, StyleSchema } from './common.js';
import { ContentSchema } from './content.js';

/**
 * Flowchart node shapes (Mermaid compatible)
 */
export const NodeShapeSchema = z.enum([
  'square', // [text]
  'round', // (text)
  'stadium', // ([text])
  'subroutine', // [[text]]
  'cylindrical', // [(text)]
  'circle', // ((text))
  'asymmetric', // >text]
  'rhombus', // {text}
  'hexagon', // {{text}}
  'parallelogram', // [/text/]
  'parallelogram_alt', // [\text\]
  'trapezoid', // [/text\]
  'trapezoid_alt', // [\text/]
  'double_circle', // (((text)))
]);

/**
 * Flowchart edge/arrow types
 */
export const EdgeTypeSchema = z.enum([
  'arrow', // -->
  'line', // ---
  'dotted_arrow', // -.->
  'dotted_line', // -.-
  'thick_arrow', // ==>
  'thick_line', // ===
  'invisible', // ~~~
  'circle_arrow', // --o
  'cross_arrow', // --x
  'multi_arrow', // <-->
  'multi_line', // <---
]);

/**
 * Flowchart node definition
 */
export const FlowchartNodeSchema = z.object({
  id: NodeIDSchema,
  shape: NodeShapeSchema,
  label: ContentSchema, // HTML/Markdown/PlainText support 💅
  style: StyleSchema.optional(),
  classes: z.array(z.string()).optional(),
});

/**
 * Flowchart edge/link definition
 */
export const FlowchartEdgeSchema = z.object({
  id: EdgeIDSchema,
  from: NodeIDSchema,
  to: NodeIDSchema,
  type: EdgeTypeSchema,
  label: ContentSchema.optional(), // HTML/Markdown/PlainText support 💅
  style: StyleSchema.optional(),
  length: z.number().int().positive().optional(), // extra dashes
});

/**
 * Flowchart subgraph
 */
export const SubgraphSchema = z.object({
  id: SubgraphIDSchema,
  label: ContentSchema.optional(), // HTML/Markdown/PlainText support 💅
  direction: DirectionSchema.optional(),
  nodes: z.array(NodeIDSchema), // node IDs
  style: StyleSchema.optional(),
});

/**
 * Class definition for styling
 */
export const ClassDefSchema = z.object({
  name: ClassDefIDSchema,
  style: StyleSchema,
});

/**
 * Complete Flowchart diagram schema
 */
export const FlowchartDiagramSchema = z.object({
  type: z.literal('flowchart'),
  direction: DirectionSchema.default('TB'),
  nodes: z.array(FlowchartNodeSchema),
  edges: z.array(FlowchartEdgeSchema),
  subgraphs: z.array(SubgraphSchema).optional(),
  classDefs: z.array(ClassDefSchema).optional(),
});

export type NodeShape = z.infer<typeof NodeShapeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type FlowchartNode = z.infer<typeof FlowchartNodeSchema>;
export type FlowchartEdge = z.infer<typeof FlowchartEdgeSchema>;
export type Subgraph = z.infer<typeof SubgraphSchema>;
export type ClassDef = z.infer<typeof ClassDefSchema>;
export type FlowchartDiagram = z.infer<typeof FlowchartDiagramSchema>;
