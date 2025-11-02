import type { NodeShape } from '@lyric-js/core';
import { describe, expect, it } from 'vitest';
import { generateShapePath, shapeGenerators } from '../src/shapes/index.js';

describe('Shape Generators', () => {
  const testText = 'Test Node';
  const allShapes: NodeShape[] = [
    'square',
    'round',
    'stadium',
    'subroutine',
    'cylindrical',
    'circle',
    'asymmetric',
    'rhombus',
    'hexagon',
    'parallelogram',
    'parallelogram_alt',
    'trapezoid',
    'trapezoid_alt',
    'double_circle',
  ];

  describe('All shapes', () => {
    it('should have generators for all 14 shapes', () => {
      expect(Object.keys(shapeGenerators)).toHaveLength(14);

      for (const shape of allShapes) {
        expect(shapeGenerators[shape]).toBeDefined();
      }
    });

    it('should generate valid paths for all shapes', () => {
      for (const shape of allShapes) {
        const result = generateShapePath(shape, { text: testText });

        expect(result).toBeDefined();
        expect(result.path).toBeTruthy();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.labelPosition).toBeDefined();
        expect(result.labelPosition.x).toBeGreaterThanOrEqual(0);
        expect(result.labelPosition.y).toBeGreaterThanOrEqual(0);
        expect(result.textAnchor).toMatch(/^(start|middle|end)$/);
      }
    });
  });

  describe('Square shape', () => {
    it('should generate rectangle path', () => {
      const result = generateShapePath('square', { text: testText });

      expect(result.path).toContain('M 0,0');
      expect(result.path).toContain('Z');
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.labelPosition.y).toBe(result.height / 2);
      expect(result.textAnchor).toBe('middle');
    });

    it('should respect minimum dimensions', () => {
      const result = generateShapePath('square', {
        text: 'A',
        minWidth: 100,
        minHeight: 50,
      });

      expect(result.width).toBeGreaterThanOrEqual(100);
      expect(result.height).toBeGreaterThanOrEqual(50);
    });

    it('should respect padding', () => {
      const result1 = generateShapePath('square', { text: testText, padding: 10 });
      const result2 = generateShapePath('square', { text: testText, padding: 20 });

      expect(result2.width).toBeGreaterThan(result1.width);
      expect(result2.height).toBeGreaterThan(result1.height);
    });
  });

  describe('Round shape', () => {
    it('should generate rounded rectangle path with curves', () => {
      const result = generateShapePath('round', { text: testText });

      expect(result.path).toContain('Q'); // Quadratic curves
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.textAnchor).toBe('middle');
    });
  });

  describe('Stadium shape', () => {
    it('should generate stadium path with arcs', () => {
      const result = generateShapePath('stadium', { text: testText });

      expect(result.path).toContain('A'); // Arc commands
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.textAnchor).toBe('middle');
    });
  });

  describe('Circle shape', () => {
    it('should generate circle with equal width and height', () => {
      const result = generateShapePath('circle', { text: testText });

      expect(result.width).toBe(result.height);
      expect(result.path).toContain('A'); // Arc commands for circle
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.labelPosition.y).toBe(result.height / 2);
    });
  });

  describe('Rhombus shape', () => {
    it('should generate diamond path', () => {
      const result = generateShapePath('rhombus', { text: testText });

      // Diamond should be wider than tall
      expect(result.width).toBeGreaterThan(result.height);
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.labelPosition.y).toBe(result.height / 2);
    });
  });

  describe('Hexagon shape', () => {
    it('should generate hexagon path', () => {
      const result = generateShapePath('hexagon', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.labelPosition.x).toBe(result.width / 2);
      expect(result.textAnchor).toBe('middle');
    });
  });

  describe('Parallelogram shapes', () => {
    it('should generate parallelogram leaning right', () => {
      const result = generateShapePath('parallelogram', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.width).toBeGreaterThan(0);
    });

    it('should generate parallelogram leaning left', () => {
      const result = generateShapePath('parallelogram_alt', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.width).toBeGreaterThan(0);
    });
  });

  describe('Trapezoid shapes', () => {
    it('should generate trapezoid wider at bottom', () => {
      const result = generateShapePath('trapezoid', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.width).toBeGreaterThan(0);
    });

    it('should generate trapezoid wider at top', () => {
      const result = generateShapePath('trapezoid_alt', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.width).toBeGreaterThan(0);
    });
  });

  describe('Double circle', () => {
    it('should generate concentric circles', () => {
      const result = generateShapePath('double_circle', { text: testText });

      expect(result.width).toBe(result.height);
      expect(result.path).toContain('A');
      // Path should contain multiple arcs for inner and outer circles
      const arcCount = (result.path.match(/A /g) || []).length;
      expect(arcCount).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Cylindrical shape', () => {
    it('should generate cylinder path', () => {
      const result = generateShapePath('cylindrical', { text: testText });

      expect(result.path).toContain('A'); // Ellipse arcs
      expect(result.labelPosition.x).toBe(result.width / 2);
    });
  });

  describe('Subroutine shape', () => {
    it('should generate rectangle with double lines', () => {
      const result = generateShapePath('subroutine', { text: testText });

      expect(result.path).toBeTruthy();
      // Should have multiple move commands for the inner lines
      expect(result.path.split('M').length).toBeGreaterThan(1);
    });
  });

  describe('Asymmetric shape', () => {
    it('should generate asymmetric pentagon', () => {
      const result = generateShapePath('asymmetric', { text: testText });

      expect(result.path).toBeTruthy();
      expect(result.width).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unknown shape', () => {
      expect(() => {
        generateShapePath('unknown' as NodeShape, { text: testText });
      }).toThrow('Unknown shape: unknown');
    });
  });

  describe('Text size variations', () => {
    it('should generate larger shapes for longer text', () => {
      const short = generateShapePath('square', { text: 'A' });
      const long = generateShapePath('square', { text: 'Very Long Text Here' });

      expect(long.width).toBeGreaterThan(short.width);
    });

    it('should respect font size', () => {
      const small = generateShapePath('square', { text: testText, fontSize: 12 });
      const large = generateShapePath('square', { text: testText, fontSize: 24 });

      expect(large.width).toBeGreaterThan(small.width);
      expect(large.height).toBeGreaterThan(small.height);
    });
  });
});
