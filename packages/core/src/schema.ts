import { z } from 'zod';

export const NodeTypeSchema = z.enum(['start', 'end', 'process', 'decision', 'input', 'output']);

export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['start', 'end', 'process', 'decision', 'input', 'output']),
  label: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const EdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const DiagramSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['flowchart', 'sequence', 'class', 'er', 'gantt']),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  config: z
    .object({
      theme: z.enum(['light', 'dark', 'neutral']).default('light'),
      direction: z.enum(['TB', 'BT', 'LR', 'RL']).default('TB'),
      nodeSpacing: z.number().positive().default(50),
      edgeSpacing: z.number().positive().default(30),
    })
    .strict()
    .optional(),
});

export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Diagram = z.infer<typeof DiagramSchema>;
export type DiagramConfig = NonNullable<Diagram['config']>;
