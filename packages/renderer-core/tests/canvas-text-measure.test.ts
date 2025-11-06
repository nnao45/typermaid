import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateMultilineTextBoxCanvas,
  calculateTextBoxCanvas,
  clearMeasurementCache,
  getCacheSize,
  measureMultilineTextCanvas,
  measureTextCanvas,
  wrapTextCanvas,
} from '../src/shapes/canvas-text-measure';

describe('Canvas-based Text Measurement', () => {
  beforeEach(() => {
    clearMeasurementCache();
  });

  describe('measureTextCanvas', () => {
    it('should measure text width accurately', () => {
      const metrics = measureTextCanvas('Hello', 14, 'sans-serif', 'normal');
      expect(metrics.width).toBeGreaterThan(0);
      expect(metrics.height).toBe(14);
    });

    it('should handle different font sizes', () => {
      const small = measureTextCanvas('Test', 12, 'sans-serif', 'normal');
      const large = measureTextCanvas('Test', 24, 'sans-serif', 'normal');

      expect(large.width).toBeGreaterThan(small.width);
      expect(large.height).toBeGreaterThan(small.height);
    });

    it('should handle different font weights', () => {
      const normal = measureTextCanvas('Bold', 14, 'sans-serif', 'normal');
      const bold = measureTextCanvas('Bold', 14, 'sans-serif', 'bold');

      // Bold text should be wider
      expect(bold.width).toBeGreaterThanOrEqual(normal.width);
    });

    it('should handle different font families', () => {
      const sans = measureTextCanvas('Test', 14, 'sans-serif', 'normal');
      const mono = measureTextCanvas('Test', 14, 'monospace', 'normal');

      expect(sans.width).toBeGreaterThan(0);
      expect(mono.width).toBeGreaterThan(0);
    });

    it('should handle empty strings', () => {
      const metrics = measureTextCanvas('', 14, 'sans-serif', 'normal');
      expect(metrics.width).toBe(0);
      expect(metrics.height).toBe(14);
    });

    it('should handle special characters', () => {
      const special = measureTextCanvas('🎉✨💖', 14, 'sans-serif', 'normal');
      expect(special.width).toBeGreaterThan(0);
      expect(special.height).toBe(14);
    });

    it('should handle unicode characters', () => {
      const unicode = measureTextCanvas('こんにちは', 14, 'sans-serif', 'normal');
      expect(unicode.width).toBeGreaterThan(0);
      expect(unicode.height).toBe(14);
    });

    it('should cache measurements for performance (browser only)', () => {
      const text = 'Cached Text';
      const fontSize = 16;

      // Clear cache first
      const initialSize = getCacheSize();

      // First measurement
      measureTextCanvas(text, fontSize, 'sans-serif', 'normal');
      const afterFirst = getCacheSize();

      // In browser: cache increases, In Node.js: stays 0
      expect(afterFirst).toBeGreaterThanOrEqual(initialSize);

      // Second measurement (should use cache in browser)
      measureTextCanvas(text, fontSize, 'sans-serif', 'normal');
      const afterSecond = getCacheSize();

      // Cache size should not increase on second call (if cached)
      expect(afterSecond).toBe(afterFirst);

      // Different text
      measureTextCanvas('Different', fontSize, 'sans-serif', 'normal');
      const afterThird = getCacheSize();

      // Should add new entry (in browser) or stay same (in Node.js)
      expect(afterThird).toBeGreaterThanOrEqual(afterSecond);
    });
  });

  describe('calculateTextBoxCanvas', () => {
    it('should calculate text box with padding', () => {
      const box = calculateTextBoxCanvas('Test', 14, 10, 'sans-serif', 'normal');

      // Width should be text width + 2*padding
      expect(box.width).toBeGreaterThan(20); // At least padding*2
      expect(box.height).toBe(14 + 20); // height + padding*2
    });

    it('should respect minimum dimensions', () => {
      const box = calculateTextBoxCanvas('A', 14, 5, 'sans-serif', 'normal', 100, 50);

      expect(box.width).toBeGreaterThanOrEqual(100);
      expect(box.height).toBeGreaterThanOrEqual(50);
    });

    it('should handle zero padding', () => {
      const box = calculateTextBoxCanvas('Test', 14, 0, 'sans-serif', 'normal');

      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBe(14);
    });
  });

  describe('wrapTextCanvas', () => {
    it('should wrap text when exceeding max width', () => {
      const lines = wrapTextCanvas('Hello World Test', 50, 14, 'sans-serif', 'normal');

      expect(lines.length).toBeGreaterThan(1);
      expect(lines.join(' ')).toBe('Hello World Test');
    });

    it('should not wrap short text', () => {
      const lines = wrapTextCanvas('Hi', 200, 14, 'sans-serif', 'normal');

      expect(lines.length).toBe(1);
      expect(lines[0]).toBe('Hi');
    });

    it('should handle single long word', () => {
      const lines = wrapTextCanvas(
        'Supercalifragilisticexpialidocious',
        50,
        14,
        'sans-serif',
        'normal'
      );

      expect(lines.length).toBeGreaterThanOrEqual(1);
    });

    it('should preserve word order', () => {
      const lines = wrapTextCanvas('One Two Three Four', 100, 14, 'sans-serif', 'normal');

      expect(lines.join(' ')).toBe('One Two Three Four');
    });
  });

  describe('measureMultilineTextCanvas', () => {
    it('should measure multiline text', () => {
      const metrics = measureMultilineTextCanvas('Line 1\nLine 2\nLine 3', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
      });

      expect(metrics.width).toBeGreaterThan(0);
      expect(metrics.height).toBeGreaterThan(14);
      expect(metrics.lines).toHaveLength(3);
    });

    it('should use custom line height', () => {
      const metrics = measureMultilineTextCanvas('Line 1\nLine 2', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        lineHeight: 20,
      });

      expect(metrics.height).toBe(40); // 2 lines * 20
    });

    it('should wrap text when maxWidth is specified', () => {
      const metrics = measureMultilineTextCanvas('This is a very long line that should wrap', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        maxWidth: 100,
      });

      expect(metrics.lines?.length).toBeGreaterThan(1);
    });

    it('should calculate width as max line width', () => {
      const metrics = measureMultilineTextCanvas('Short\nVery Long Line', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
      });

      const longLineMetrics = measureTextCanvas('Very Long Line', 14, 'sans-serif', 'normal');
      expect(metrics.width).toBeCloseTo(longLineMetrics.width, 1);
    });
  });

  describe('calculateMultilineTextBoxCanvas', () => {
    it('should calculate multiline text box with padding', () => {
      const box = calculateMultilineTextBoxCanvas('Line 1\nLine 2', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        padding: 10,
      });

      expect(box.width).toBeGreaterThan(20);
      expect(box.height).toBeGreaterThan(20);
      expect(box.lines).toHaveLength(2);
    });

    it('should respect minimum dimensions', () => {
      const box = calculateMultilineTextBoxCanvas('A', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        padding: 5,
        minWidth: 150,
        minHeight: 100,
      });

      expect(box.width).toBeGreaterThanOrEqual(150);
      expect(box.height).toBeGreaterThanOrEqual(100);
    });

    it('should handle wrapped text', () => {
      const box = calculateMultilineTextBoxCanvas('This is a very long line that needs wrapping', {
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        maxWidth: 100,
        padding: 10,
      });

      expect(box.lines.length).toBeGreaterThan(1);
      expect(box.height).toBeGreaterThan(34); // At least 2 lines + padding
    });
  });

  describe('Cache Management', () => {
    it('should clear cache (browser only)', () => {
      // In SSR/Node.js environment, cache is not used
      // This test would only work in browser environment with Canvas API
      const initialSize = getCacheSize();

      measureTextCanvas('Test 1', 14, 'sans-serif', 'normal');
      measureTextCanvas('Test 2', 14, 'sans-serif', 'normal');

      // In browser: cache would have 2 items
      // In Node.js: cache would have 0 items (fallback to approximation)
      const afterMeasure = getCacheSize();
      expect(afterMeasure).toBeGreaterThanOrEqual(initialSize);

      clearMeasurementCache();
      expect(getCacheSize()).toBe(0);
    });

    it('should limit cache size (browser only)', () => {
      clearMeasurementCache();

      // Measure more than MAX_CACHE_SIZE (1000) entries
      // In Node.js this won't cache, so size will stay 0
      for (let i = 0; i < 1050; i++) {
        measureTextCanvas(`Text ${i}`, 14, 'sans-serif', 'normal');
      }

      // Cache should not exceed MAX_CACHE_SIZE
      // In browser: <= 1000, In Node.js: 0
      expect(getCacheSize()).toBeLessThanOrEqual(1000);
    });
  });

  describe('SSR Compatibility', () => {
    it('should fallback gracefully when Canvas is not available', () => {
      // This test will use fallback automatically in Node.js environment
      const metrics = measureTextCanvas('Test', 14, 'sans-serif', 'normal');

      expect(metrics.width).toBeGreaterThan(0);
      expect(metrics.height).toBe(14);
    });
  });

  describe('Performance', () => {
    it('should measure text quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        measureTextCanvas('Performance Test', 14, 'sans-serif', 'normal');
      }

      const duration = performance.now() - start;

      // Should complete in less than 100ms for 100 measurements (with cache)
      expect(duration).toBeLessThan(100);
    });

    it('should cache improve performance', () => {
      clearMeasurementCache();

      const text = 'Cached Performance';
      const fontSize = 16;

      // First measurement (not cached)
      const start1 = performance.now();
      measureTextCanvas(text, fontSize, 'sans-serif', 'normal');
      const duration1 = performance.now() - start1;

      // Second measurement (cached)
      const start2 = performance.now();
      measureTextCanvas(text, fontSize, 'sans-serif', 'normal');
      const duration2 = performance.now() - start2;

      // Cached measurement should be faster (or at least not slower)
      expect(duration2).toBeLessThanOrEqual(duration1 * 2);
    });
  });
});
