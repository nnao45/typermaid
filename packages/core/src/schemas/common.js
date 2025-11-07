import { z } from 'zod';
/**
 * Direction for diagram layout
 */
export const DirectionSchema = z.enum(['TB', 'TD', 'BT', 'LR', 'RL']);
/**
 * Color value (hex, rgb, named color)
 */
export const ColorSchema = z.union([
  z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/), // hex
  z
    .string()
    .regex(
      /^rgb\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*\)$/
    ), // rgb (0-255)
  z
    .string()
    .regex(
      /^rgba\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*(0|1|0?\.[0-9]+)\s*\)$/
    ), // rgba (0-255, 0-1)
  z.enum([
    // CSS named colors
    'black',
    'white',
    'red',
    'green',
    'blue',
    'yellow',
    'cyan',
    'magenta',
    'gray',
    'grey',
    'orange',
    'purple',
    'pink',
    'brown',
    'transparent',
  ]),
]);
/**
 * Position in 2D space
 */
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
/**
 * Size (width and height)
 */
export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});
/**
 * Font style
 */
export const FontStyleSchema = z.object({
  family: z.string().optional(),
  size: z.number().positive().optional(),
  weight: z
    .enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'])
    .optional(),
  style: z.enum(['normal', 'italic', 'oblique']).optional(),
  color: ColorSchema.optional(),
});
/**
 * Stroke style
 */
export const StrokeStyleSchema = z.object({
  color: ColorSchema.optional(),
  width: z.number().positive().optional(),
  dasharray: z.string().optional(), // e.g., "5,5"
});
/**
 * Fill style
 */
export const FillStyleSchema = z.object({
  color: ColorSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
});
/**
 * Common style properties
 */
export const StyleSchema = z.object({
  fill: FillStyleSchema.optional(),
  stroke: StrokeStyleSchema.optional(),
  font: FontStyleSchema.optional(),
});
/**
 * Text alignment
 */
export const TextAlignSchema = z.enum(['left', 'center', 'right', 'justify']);
/**
 * Vertical alignment
 */
export const VerticalAlignSchema = z.enum(['top', 'middle', 'bottom']);
/**
 * Theme preset
 */
export const ThemeSchema = z.enum(['default', 'neutral', 'dark', 'forest', 'base']);
//# sourceMappingURL=common.js.map
