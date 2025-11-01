import { describe, it, expect } from 'vitest';
import { generateEdgePath, edgeGenerators } from '../src/edges/index.js';
import type { EdgeType } from '@lyric-js/core';

describe('Edge Generators', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 100, y: 100 };
  
  const allEdgeTypes: EdgeType[] = [
    'arrow',
    'line',
    'circle_arrow',
    'cross_arrow',
    'dotted_arrow',
    'dotted_line',
    'thick_arrow',
    'thick_line',
    'invisible',
    'multi_arrow',
    'multi_line',
  ];

  describe('All edge types', () => {
    it('should have generators for all 11 edge types', () => {
      expect(Object.keys(edgeGenerators)).toHaveLength(11);
      
      for (const type of allEdgeTypes) {
        expect(edgeGenerators[type]).toBeDefined();
      }
    });

    it('should generate valid paths for all edge types', () => {
      for (const type of allEdgeTypes) {
        const result = generateEdgePath(type, { from, to });
        
        expect(result).toBeDefined();
        expect(result.path).toBeTruthy();
        expect(result.strokeWidth).toBeGreaterThanOrEqual(0);
        
        if (result.labelPosition) {
          expect(result.labelPosition.x).toBeGreaterThanOrEqual(0);
          expect(result.labelPosition.y).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Arrow edge', () => {
    it('should generate straight line with arrow marker', () => {
      const result = generateEdgePath('arrow', { from, to });
      
      expect(result.path).toContain('M 0,0');
      expect(result.path).toContain('L 100,100');
      expect(result.markerId).toBe('arrow-end');
      expect(result.markerDef).toBeTruthy();
      expect(result.strokeWidth).toBe(2);
      expect(result.strokeDasharray).toBeUndefined();
    });

    it('should generate smooth curve with multiple points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 50, y: 25 },
        { x: 100, y: 100 },
      ];
      const result = generateEdgePath('arrow', { from, to, points });
      
      expect(result.path).toContain('M 0,0');
      // Should use curves for multiple points
      expect(result.path.length).toBeGreaterThan(20);
    });
  });

  describe('Circle arrow edge', () => {
    it('should generate line with circle marker', () => {
      const result = generateEdgePath('circle_arrow', { from, to });
      
      expect(result.markerId).toBe('circle-end');
      expect(result.markerDef).toContain('circle');
      expect(result.strokeWidth).toBe(2);
    });
  });

  describe('Cross arrow edge', () => {
    it('should generate line with cross marker', () => {
      const result = generateEdgePath('cross_arrow', { from, to });
      
      expect(result.markerId).toBe('cross-end');
      expect(result.markerDef).toContain('cross');
      expect(result.strokeWidth).toBe(2);
    });
  });

  describe('Dotted edges', () => {
    it('should generate dotted arrow', () => {
      const result = generateEdgePath('dotted_arrow', { from, to });
      
      expect(result.strokeDasharray).toBe('5,5');
      expect(result.markerId).toBe('arrow-end');
    });

    it('should generate dotted line', () => {
      const result = generateEdgePath('dotted_line', { from, to });
      
      expect(result.strokeDasharray).toBe('5,5');
      expect(result.markerId).toBe('circle-end');
    });
  });

  describe('Thick edges', () => {
    it('should generate thick arrow', () => {
      const result = generateEdgePath('thick_arrow', { from, to });
      
      expect(result.strokeWidth).toBe(4); // Default 2 * 2
      expect(result.markerId).toBe('arrow-end');
    });

    it('should generate thick line', () => {
      const result = generateEdgePath('thick_line', { from, to });
      
      expect(result.strokeWidth).toBe(4);
      expect(result.markerId).toBe('circle-end');
    });

    it('should respect custom thickness', () => {
      const result = generateEdgePath('thick_arrow', { from, to, thickness: 5 });
      
      expect(result.strokeWidth).toBe(10); // 5 * 2
    });
  });

  describe('Invisible edge', () => {
    it('should generate invisible path', () => {
      const result = generateEdgePath('invisible', { from, to });
      
      expect(result.path).toBeTruthy();
      expect(result.strokeWidth).toBe(0);
      expect(result.markerId).toBeUndefined();
    });
  });

  describe('Line edge', () => {
    it('should generate line without marker', () => {
      const result = generateEdgePath('line', { from, to });
      
      expect(result.path).toContain('M 0,0');
      expect(result.path).toContain('L 100,100');
      expect(result.markerId).toBeUndefined();
      expect(result.strokeWidth).toBe(2);
    });
  });

  describe('Label positioning', () => {
    it('should calculate label position at midpoint', () => {
      const result = generateEdgePath('arrow', { from, to });
      
      expect(result.labelPosition).toBeDefined();
      expect(result.labelPosition!.x).toBe(50);
      expect(result.labelPosition!.y).toBe(50);
    });

    it('should calculate label position for multi-point path', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 100 },
      ];
      const result = generateEdgePath('arrow', { from, to, points });
      
      expect(result.labelPosition).toBeDefined();
      // Should be at middle point (index 1)
      expect(result.labelPosition!.x).toBe(50);
      expect(result.labelPosition!.y).toBe(0);
    });
  });

  describe('Custom options', () => {
    it('should respect custom arrow size', () => {
      const result = generateEdgePath('arrow', { from, to, arrowSize: 16 });
      
      expect(result.markerDef).toContain('16'); // Marker size
    });

    it('should respect custom thickness', () => {
      const result = generateEdgePath('arrow', { from, to, thickness: 5 });
      
      expect(result.strokeWidth).toBe(5);
    });

    it('should respect custom tension', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 50, y: 25 },
        { x: 100, y: 100 },
      ];
      
      const smooth = generateEdgePath('arrow', { from, to, points, tension: 0 });
      const curved = generateEdgePath('arrow', { from, to, points, tension: 1 });
      
      expect(smooth.path).toBeTruthy();
      expect(curved.path).toBeTruthy();
      expect(smooth.path).not.toBe(curved.path);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unknown edge type', () => {
      expect(() => {
        generateEdgePath('unknown' as EdgeType, { from, to });
      }).toThrow('Unknown edge type: unknown');
    });
  });
});
