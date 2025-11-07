import { z } from 'zod';
export declare const NodeTypeSchema: z.ZodEnum<{
  start: 'start';
  end: 'end';
  output: 'output';
  input: 'input';
  process: 'process';
  decision: 'decision';
}>;
export declare const NodeSchema: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<{
      start: 'start';
      end: 'end';
      output: 'output';
      input: 'input';
      process: 'process';
      decision: 'decision';
    }>;
    label: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  z.core.$strip
>;
export declare const EdgeSchema: z.ZodObject<
  {
    id: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  z.core.$strip
>;
export declare const DiagramSchema: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<{
      sequence: 'sequence';
      er: 'er';
      gantt: 'gantt';
      flowchart: 'flowchart';
      class: 'class';
    }>;
    nodes: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          type: z.ZodEnum<{
            start: 'start';
            end: 'end';
            output: 'output';
            input: 'input';
            process: 'process';
            decision: 'decision';
          }>;
          label: z.ZodString;
          metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        z.core.$strip
      >
    >;
    edges: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          from: z.ZodString;
          to: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
          metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        z.core.$strip
      >
    >;
    config: z.ZodOptional<
      z.ZodObject<
        {
          theme: z.ZodDefault<
            z.ZodEnum<{
              light: 'light';
              dark: 'dark';
              neutral: 'neutral';
            }>
          >;
          direction: z.ZodDefault<
            z.ZodEnum<{
              TB: 'TB';
              BT: 'BT';
              LR: 'LR';
              RL: 'RL';
            }>
          >;
          nodeSpacing: z.ZodDefault<z.ZodNumber>;
          edgeSpacing: z.ZodDefault<z.ZodNumber>;
        },
        z.core.$strict
      >
    >;
  },
  z.core.$strip
>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Diagram = z.infer<typeof DiagramSchema>;
export type DiagramConfig = NonNullable<Diagram['config']>;
//# sourceMappingURL=schema.d.ts.map
