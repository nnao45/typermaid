import { z } from 'zod';

export const ThemeSchema = z.object({
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
    border: z.string(),
    node: z.object({
      fill: z.string(),
      stroke: z.string(),
      text: z.string(),
    }),
    edge: z.object({
      stroke: z.string(),
      text: z.string(),
    }),
  }),
  fonts: z.object({
    family: z.string(),
    size: z.object({
      small: z.number(),
      medium: z.number(),
      large: z.number(),
    }),
  }),
  spacing: z.object({
    node: z.number(),
    edge: z.number(),
    padding: z.number(),
  }),
});

export type Theme = z.infer<typeof ThemeSchema>;
