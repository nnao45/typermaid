import { z } from 'zod';

export const GanttTaskStatus = z.enum(['active', 'done', 'crit', 'milestone']);

export const GanttTask = z.object({
  id: z.string().optional(),
  name: z.string(),
  status: GanttTaskStatus.optional(),
  startDate: z.string(),
  duration: z.string(),
  dependencies: z.array(z.string()).optional(),
});

export const GanttSection = z.object({
  name: z.string(),
  tasks: z.array(GanttTask),
});

export const GanttConfig = z.object({
  title: z.string().optional(),
  dateFormat: z.string(),
  axisFormat: z.string().optional(),
  excludes: z.string().optional(),
  todayMarker: z.enum(['on', 'off']).optional(),
});

export const GanttDiagram = z.object({
  type: z.literal('gantt'),
  config: GanttConfig,
  sections: z.array(GanttSection),
});

export type GanttTaskStatus = z.infer<typeof GanttTaskStatus>;
export type GanttTask = z.infer<typeof GanttTask>;
export type GanttSection = z.infer<typeof GanttSection>;
export type GanttConfig = z.infer<typeof GanttConfig>;
export type GanttDiagram = z.infer<typeof GanttDiagram>;
