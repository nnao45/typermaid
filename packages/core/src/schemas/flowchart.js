import { z } from 'zod';
import { DirectionSchema, StyleSchema } from './common.js';
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
  id: z.string().min(1),
  shape: NodeShapeSchema,
  label: z.string(),
  style: StyleSchema.optional(),
  classes: z.array(z.string()).optional(),
});
/**
 * Flowchart edge/link definition
 */
export const FlowchartEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: EdgeTypeSchema,
  label: z.string().optional(),
  style: StyleSchema.optional(),
  length: z.number().int().positive().optional(), // extra dashes
});
/**
 * Flowchart subgraph
 */
export const SubgraphSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  direction: DirectionSchema.optional(),
  nodes: z.array(z.string()), // node IDs
  style: StyleSchema.optional(),
});
/**
 * Class definition for styling
 */
export const ClassDefSchema = z.object({
  name: z.string().min(1),
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
//# sourceMappingURL=flowchart.js.map
