/**
 * Simple text measurement using character approximation
 * For more accurate measurements, use Canvas measureText in browser
 */

export interface TextMetrics {
  width: number;
  height: number;
  lines?: string[];
}

export interface TextMeasureOptions {
  fontSize: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | string;
  lineHeight?: number;
  maxWidth?: number;
}

/**
 * Font-specific character width ratios
 * These are approximations based on common web fonts
 */
const FONT_WIDTH_RATIOS: Record<string, number> = {
  monospace: 0.6,
  courier: 0.6,
  arial: 0.55,
  helvetica: 0.55,
  verdana: 0.6,
  times: 0.5,
  georgia: 0.52,
  'sans-serif': 0.55,
  serif: 0.5,
  default: 0.55,
};

/**
 * Font weight multipliers
 */
const FONT_WEIGHT_MULTIPLIERS: Record<string, number> = {
  normal: 1.0,
  bold: 1.15,
  '400': 1.0,
  '700': 1.15,
  '300': 0.95,
  '600': 1.1,
  '800': 1.2,
  '900': 1.25,
};

/**
 * Get character width ratio for a font family
 */
function getCharWidthRatio(fontFamily: string = 'sans-serif'): number {
  const family = fontFamily.toLowerCase().split(',')[0]?.trim() || 'default';
  return FONT_WIDTH_RATIOS[family] || 0.55;
}

/**
 * Get font weight multiplier
 */
function getFontWeightMultiplier(fontWeight: string = 'normal'): number {
  return FONT_WEIGHT_MULTIPLIERS[fontWeight] || 1.0;
}

/**
 * Measure text dimensions
 * Note: This is a simple approximation. For accurate measurements,
 * use canvas.measureText() in browser environment
 */
export function measureText(
  text: string,
  fontSize: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal'
): TextMetrics {
  const baseCharWidth = fontSize * getCharWidthRatio(fontFamily);
  const weightMultiplier = getFontWeightMultiplier(fontWeight);
  const avgCharWidth = baseCharWidth * weightMultiplier;

  const width = text.length * avgCharWidth;
  const height = fontSize;

  return { width, height };
}

/**
 * Calculate required dimensions for text with padding
 */
export function calculateTextBox(
  text: string,
  fontSize: number,
  padding: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal',
  minWidth: number = 0,
  minHeight: number = 0
): { width: number; height: number } {
  const metrics = measureText(text, fontSize, fontFamily, fontWeight);

  const width = Math.max(metrics.width + padding * 2, minWidth);
  const height = Math.max(metrics.height + padding * 2, minHeight);

  return { width, height };
}

/**
 * Split text into multiple lines based on max width
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal'
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = measureText(testLine, fontSize, fontFamily, fontWeight);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Measure multiline text with line height
 */
export function measureMultilineText(text: string, options: TextMeasureOptions): TextMetrics {
  const {
    fontSize,
    fontFamily = 'sans-serif',
    fontWeight = 'normal',
    lineHeight = fontSize * 1.2,
    maxWidth,
  } = options;

  let lines: string[];
  if (maxWidth) {
    lines = wrapText(text, maxWidth, fontSize, fontFamily, fontWeight);
  } else {
    lines = text.split('\n');
  }

  const widths = lines.map((line) => measureText(line, fontSize, fontFamily, fontWeight).width);
  const maxLineWidth = Math.max(...widths, 0);

  const totalHeight = lines.length * lineHeight;

  return {
    width: maxLineWidth,
    height: totalHeight,
    lines,
  };
}

/**
 * Calculate text box with multiline support
 */
export function calculateMultilineTextBox(
  text: string,
  options: TextMeasureOptions & { padding: number; minWidth?: number; minHeight?: number }
): { width: number; height: number; lines: string[] } {
  const { padding, minWidth = 0, minHeight = 0 } = options;

  const metrics = measureMultilineText(text, options);

  const width = Math.max(metrics.width + padding * 2, minWidth);
  const height = Math.max(metrics.height + padding * 2, minHeight);

  return { width, height, lines: metrics.lines || [] };
}
