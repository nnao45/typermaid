/**
 * Simple text measurement using character approximation
 * For more accurate measurements, use Canvas measureText in browser
 */
/**
 * Approximate character width based on font size
 * This is a rough estimation - real measurement requires canvas
 */
const CHAR_WIDTH_RATIO = 0.6; // Average character width as ratio of font size
/**
 * Measure text dimensions
 * Note: This is a simple approximation. For accurate measurements,
 * use canvas.measureText() in browser environment
 */
export function measureText(text, fontSize, _fontFamily = 'Arial, sans-serif') {
  // Simple approximation
  const avgCharWidth = fontSize * CHAR_WIDTH_RATIO;
  const width = text.length * avgCharWidth;
  const height = fontSize;
  return { width, height };
}
/**
 * Calculate required dimensions for text with padding
 */
export function calculateTextBox(text, fontSize, padding, fontFamily, minWidth = 0, minHeight = 0) {
  const metrics = measureText(text, fontSize, fontFamily);
  const width = Math.max(metrics.width + padding * 2, minWidth);
  const height = Math.max(metrics.height + padding * 2, minHeight);
  return { width, height };
}
/**
 * Split text into multiple lines based on max width
 */
export function wrapText(text, maxWidth, fontSize, fontFamily) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = measureText(testLine, fontSize, fontFamily);
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
//# sourceMappingURL=text-measure.js.map
