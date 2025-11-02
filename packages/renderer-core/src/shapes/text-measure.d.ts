/**
 * Simple text measurement using character approximation
 * For more accurate measurements, use Canvas measureText in browser
 */
export interface TextMetrics {
  width: number;
  height: number;
}
/**
 * Measure text dimensions
 * Note: This is a simple approximation. For accurate measurements,
 * use canvas.measureText() in browser environment
 */
export declare function measureText(
  text: string,
  fontSize: number,
  _fontFamily?: string
): TextMetrics;
/**
 * Calculate required dimensions for text with padding
 */
export declare function calculateTextBox(
  text: string,
  fontSize: number,
  padding: number,
  fontFamily?: string,
  minWidth?: number,
  minHeight?: number
): {
  width: number;
  height: number;
};
/**
 * Split text into multiple lines based on max width
 */
export declare function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily?: string
): string[];
//# sourceMappingURL=text-measure.d.ts.map
