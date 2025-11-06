/**
 * Canvas-based accurate text measurement
 * Provides precise text measurements using Canvas API in browsers
 * Falls back to approximation in SSR environments
 *
 * Uses advanced Canvas TextMetrics properties for maximum accuracy:
 * - actualBoundingBox* for precise width/height
 * - fontBoundingBox* for font metrics
 * - Baseline information for accurate text positioning
 */

import type { TextMeasureOptions, TextMetrics } from './text-measure';
import { measureText as approximateMeasureText } from './text-measure';

/**
 * Enhanced text metrics with Canvas API properties
 */
export interface EnhancedTextMetrics extends TextMetrics {
  /** Distance from text baseline to actual left edge */
  actualBoundingBoxLeft?: number;
  /** Distance from text baseline to actual right edge */
  actualBoundingBoxRight?: number;
  /** Distance from text baseline to actual top edge */
  actualBoundingBoxAscent?: number;
  /** Distance from text baseline to actual bottom edge */
  actualBoundingBoxDescent?: number;
  /** Baseline position from top (for SVG text positioning) */
  baseline?: number;
}

/**
 * Canvas singleton for text measurement
 * Lazily initialized to avoid SSR issues
 */
let canvasContext: CanvasRenderingContext2D | null = null;

/**
 * Get or create canvas context for text measurement
 */
function getCanvasContext(): CanvasRenderingContext2D | null {
  // Return existing context if available
  if (canvasContext) {
    return canvasContext;
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  // Create offscreen canvas for measurement
  try {
    const canvas = document.createElement('canvas');
    canvasContext = canvas.getContext('2d');
    return canvasContext;
  } catch {
    // Canvas not supported (unlikely in modern browsers)
    return null;
  }
}

/**
 * Build font string for Canvas API
 */
function buildFontString(
  fontSize: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal'
): string {
  return `${fontWeight} ${fontSize}px ${fontFamily}`;
}

/**
 * Cache for text measurements to improve performance
 * Key format: "fontSize:fontFamily:fontWeight:text"
 */
const measurementCache = new Map<string, TextMetrics>();

/**
 * Maximum cache size to prevent memory issues
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key for text measurement
 */
function getCacheKey(
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: string
): string {
  return `${fontSize}:${fontFamily}:${fontWeight}:${text}`;
}

/**
 * Add measurement to cache with size limit
 */
function addToCache(key: string, metrics: TextMetrics): void {
  // Clear oldest entries if cache is full
  if (measurementCache.size >= MAX_CACHE_SIZE) {
    const firstKey = measurementCache.keys().next().value;
    if (firstKey) {
      measurementCache.delete(firstKey);
    }
  }
  measurementCache.set(key, metrics);
}

/**
 * Measure text using Canvas API with enhanced metrics (accurate)
 * Falls back to approximation if Canvas is not available
 *
 * Returns EnhancedTextMetrics with:
 * - Accurate width using actualBoundingBox properties
 * - Accurate height using actualBoundingBox properties
 * - Baseline information for precise text positioning
 */
export function measureTextCanvas(
  text: string,
  fontSize: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal'
): EnhancedTextMetrics {
  // Check cache first
  const cacheKey = getCacheKey(text, fontSize, fontFamily, fontWeight);
  const cached = measurementCache.get(cacheKey);
  if (cached) {
    return cached as EnhancedTextMetrics;
  }

  const ctx = getCanvasContext();

  // Fallback to approximation if Canvas not available (SSR)
  // Don't cache in SSR mode since we're using approximation
  if (!ctx) {
    const approx = approximateMeasureText(text, fontSize, fontFamily, fontWeight);
    return {
      ...approx,
      baseline: fontSize * 0.8, // Approximate baseline (80% of fontSize)
    };
  }

  // Set font before measurement
  ctx.font = buildFontString(fontSize, fontFamily, fontWeight);

  // Measure text using Canvas API
  const metrics = ctx.measureText(text);

  // Use advanced Canvas TextMetrics for accurate dimensions
  // actualBoundingBox* provides the tightest bounding box
  const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  const result: EnhancedTextMetrics = {
    width,
    height,
    actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
    actualBoundingBoxRight: metrics.actualBoundingBoxRight,
    actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
    baseline: metrics.actualBoundingBoxAscent, // Distance from top to baseline
  };

  // Cache the result only when using Canvas
  addToCache(cacheKey, result);

  return result;
}

/**
 * Calculate required dimensions for text with padding
 */
export function calculateTextBoxCanvas(
  text: string,
  fontSize: number,
  padding: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'normal',
  minWidth: number = 0,
  minHeight: number = 0
): { width: number; height: number } {
  const metrics = measureTextCanvas(text, fontSize, fontFamily, fontWeight);

  const width = Math.max(metrics.width + padding * 2, minWidth);
  const height = Math.max(metrics.height + padding * 2, minHeight);

  return { width, height };
}

/**
 * Split text into multiple lines based on max width using Canvas measurement
 */
export function wrapTextCanvas(
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
    const metrics = measureTextCanvas(testLine, fontSize, fontFamily, fontWeight);

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
 * Measure multiline text with line height using Canvas
 * Returns enhanced metrics with accurate dimensions
 */
export function measureMultilineTextCanvas(
  text: string,
  options: TextMeasureOptions
): EnhancedTextMetrics {
  const {
    fontSize,
    fontFamily = 'sans-serif',
    fontWeight = 'normal',
    lineHeight = fontSize * 1.2,
    maxWidth,
  } = options;

  let lines: string[];
  if (maxWidth) {
    lines = wrapTextCanvas(text, maxWidth, fontSize, fontFamily, fontWeight);
  } else {
    lines = text.split('\n');
  }

  // Measure all lines and collect metrics
  const lineMetrics = lines.map((line) =>
    measureTextCanvas(line, fontSize, fontFamily, fontWeight)
  );

  // Find max width across all lines
  const maxLineWidth = Math.max(...lineMetrics.map((m) => m.width), 0);

  const totalHeight = lines.length * lineHeight;

  // Use metrics from the first line for baseline information
  const firstLineMetrics = lineMetrics[0];

  const result: EnhancedTextMetrics = {
    width: maxLineWidth,
    height: totalHeight,
    lines,
  };

  // Add optional properties only if they exist and are defined
  if (firstLineMetrics) {
    if (firstLineMetrics.actualBoundingBoxLeft !== undefined) {
      result.actualBoundingBoxLeft = firstLineMetrics.actualBoundingBoxLeft;
    }
    if (firstLineMetrics.actualBoundingBoxRight !== undefined) {
      result.actualBoundingBoxRight = firstLineMetrics.actualBoundingBoxRight;
    }
    if (firstLineMetrics.actualBoundingBoxAscent !== undefined) {
      result.actualBoundingBoxAscent = firstLineMetrics.actualBoundingBoxAscent;
    }
    if (firstLineMetrics.actualBoundingBoxDescent !== undefined) {
      result.actualBoundingBoxDescent = firstLineMetrics.actualBoundingBoxDescent;
    }
    if (firstLineMetrics.baseline !== undefined) {
      result.baseline = firstLineMetrics.baseline;
    }
  }

  return result;
}

/**
 * Calculate text box with multiline support using Canvas
 */
export function calculateMultilineTextBoxCanvas(
  text: string,
  options: TextMeasureOptions & { padding: number; minWidth?: number; minHeight?: number }
): { width: number; height: number; lines: string[] } {
  const { padding, minWidth = 0, minHeight = 0 } = options;

  const metrics = measureMultilineTextCanvas(text, options);

  const width = Math.max(metrics.width + padding * 2, minWidth);
  const height = Math.max(metrics.height + padding * 2, minHeight);

  return { width, height, lines: metrics.lines || [] };
}

/**
 * Clear measurement cache
 * Useful for testing or memory management
 */
export function clearMeasurementCache(): void {
  measurementCache.clear();
}

/**
 * Get current cache size
 * Useful for monitoring and debugging
 */
export function getCacheSize(): number {
  return measurementCache.size;
}
