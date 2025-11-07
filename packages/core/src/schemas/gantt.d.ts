import { z } from 'zod';
export declare const GanttTaskStatus: z.ZodEnum<{
  active: 'active';
  done: 'done';
  crit: 'crit';
  milestone: 'milestone';
}>;
export declare const GanttTask: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    status: z.ZodOptional<
      z.ZodEnum<{
        active: 'active';
        done: 'done';
        crit: 'crit';
        milestone: 'milestone';
      }>
    >;
    startDate: z.ZodString;
    duration: z.ZodString;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
  },
  z.core.$strip
>;
export declare const GanttSection: z.ZodObject<
  {
    name: z.ZodString;
    tasks: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodOptional<z.ZodString>;
          name: z.ZodString;
          status: z.ZodOptional<
            z.ZodEnum<{
              active: 'active';
              done: 'done';
              crit: 'crit';
              milestone: 'milestone';
            }>
          >;
          startDate: z.ZodString;
          duration: z.ZodString;
          dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const GanttConfig: z.ZodObject<
  {
    title: z.ZodOptional<z.ZodString>;
    dateFormat: z.ZodString;
    axisFormat: z.ZodOptional<z.ZodString>;
    excludes: z.ZodOptional<z.ZodString>;
    todayMarker: z.ZodOptional<
      z.ZodEnum<{
        on: 'on';
        off: 'off';
      }>
    >;
  },
  z.core.$strip
>;
export declare const GanttDiagram: z.ZodObject<
  {
    type: z.ZodLiteral<'gantt'>;
    config: z.ZodObject<
      {
        title: z.ZodOptional<z.ZodString>;
        dateFormat: z.ZodString;
        axisFormat: z.ZodOptional<z.ZodString>;
        excludes: z.ZodOptional<z.ZodString>;
        todayMarker: z.ZodOptional<
          z.ZodEnum<{
            on: 'on';
            off: 'off';
          }>
        >;
      },
      z.core.$strip
    >;
    sections: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          tasks: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodOptional<z.ZodString>;
                name: z.ZodString;
                status: z.ZodOptional<
                  z.ZodEnum<{
                    active: 'active';
                    done: 'done';
                    crit: 'crit';
                    milestone: 'milestone';
                  }>
                >;
                startDate: z.ZodString;
                duration: z.ZodString;
                dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
              },
              z.core.$strip
            >
          >;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type GanttTaskStatus = z.infer<typeof GanttTaskStatus>;
export type GanttTask = z.infer<typeof GanttTask>;
export type GanttSection = z.infer<typeof GanttSection>;
export type GanttConfig = z.infer<typeof GanttConfig>;
export type GanttDiagram = z.infer<typeof GanttDiagram>;
//# sourceMappingURL=gantt.d.ts.map
