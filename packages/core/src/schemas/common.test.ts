import { describe, expect, it } from 'vitest';
import type { Color, Direction, Position, Size, Theme } from './common.js';
import {
  ColorSchema,
  DirectionSchema,
  PositionSchema,
  SizeSchema,
  StyleSchema,
  ThemeSchema,
} from './common.js';

describe('DirectionSchema', () => {
  it('should validate valid directions', () => {
    const validDirections: Direction[] = ['TB', 'TD', 'BT', 'LR', 'RL'];
    for (const dir of validDirections) {
      expect(DirectionSchema.parse(dir)).toBe(dir);
    }
  });

  it('should reject invalid directions', () => {
    expect(() => DirectionSchema.parse('INVALID')).toThrow();
    expect(() => DirectionSchema.parse('tb')).toThrow();
  });
});

describe('ColorSchema', () => {
  it('should validate hex colors', () => {
    const validHex: Color[] = ['#000000', '#ffffff', '#FF5733', '#abc123'];
    for (const color of validHex) {
      expect(ColorSchema.parse(color)).toBe(color);
    }
  });

  it('should validate rgb colors', () => {
    const validRgb: Color[] = ['rgb(0,0,0)', 'rgb(255, 255, 255)', 'rgb( 128 , 64 , 32 )'];
    for (const color of validRgb) {
      expect(ColorSchema.parse(color)).toBe(color);
    }
  });

  it('should validate rgba colors', () => {
    const validRgba: Color[] = [
      'rgba(0,0,0,1)',
      'rgba(255, 255, 255, 0.5)',
      'rgba( 128 , 64 , 32 , 0.75 )',
    ];
    for (const color of validRgba) {
      expect(ColorSchema.parse(color)).toBe(color);
    }
  });

  it('should validate named colors', () => {
    const namedColors: Color[] = ['red', 'blue', 'green', 'transparent'];
    for (const color of namedColors) {
      expect(ColorSchema.parse(color)).toBe(color);
    }
  });

  it('should reject invalid colors', () => {
    expect(() => ColorSchema.parse('#000')).toThrow(); // too short
    expect(() => ColorSchema.parse('rgb(300, 0, 0)')).toThrow(); // invalid format
    expect(() => ColorSchema.parse('invalid')).toThrow();
  });
});

describe('PositionSchema', () => {
  it('should validate valid positions', () => {
    const validPositions: Position[] = [
      { x: 0, y: 0 },
      { x: 100, y: 200 },
      { x: -50, y: -100 },
      { x: 3.14, y: 2.71 },
    ];
    for (const pos of validPositions) {
      expect(PositionSchema.parse(pos)).toEqual(pos);
    }
  });

  it('should reject invalid positions', () => {
    expect(() => PositionSchema.parse({ x: 0 })).toThrow();
    expect(() => PositionSchema.parse({ y: 0 })).toThrow();
    expect(() => PositionSchema.parse({ x: 'a', y: 0 })).toThrow();
  });
});

describe('SizeSchema', () => {
  it('should validate valid sizes', () => {
    const validSizes: Size[] = [
      { width: 100, height: 200 },
      { width: 1, height: 1 },
      { width: 3.14, height: 2.71 },
    ];
    for (const size of validSizes) {
      expect(SizeSchema.parse(size)).toEqual(size);
    }
  });

  it('should reject non-positive dimensions', () => {
    expect(() => SizeSchema.parse({ width: 0, height: 100 })).toThrow();
    expect(() => SizeSchema.parse({ width: 100, height: -1 })).toThrow();
    expect(() => SizeSchema.parse({ width: -1, height: -1 })).toThrow();
  });
});

describe('ThemeSchema', () => {
  it('should validate valid themes', () => {
    const validThemes: Theme[] = ['default', 'neutral', 'dark', 'forest', 'base'];
    for (const theme of validThemes) {
      expect(ThemeSchema.parse(theme)).toBe(theme);
    }
  });

  it('should reject invalid themes', () => {
    expect(() => ThemeSchema.parse('custom')).toThrow();
    expect(() => ThemeSchema.parse('light')).toThrow();
  });
});

describe('StyleSchema', () => {
  it('should validate style with all properties', () => {
    const style = {
      fill: { color: '#ff0000', opacity: 0.5 },
      stroke: { color: '#000000', width: 2, dasharray: '5,5' },
      font: { family: 'Arial', size: 14, weight: 'bold', style: 'italic', color: '#333333' },
    };
    expect(StyleSchema.parse(style)).toEqual(style);
  });

  it('should validate empty style object', () => {
    expect(StyleSchema.parse({})).toEqual({});
  });

  it('should validate partial style', () => {
    const style = {
      fill: { color: 'red' },
    };
    expect(StyleSchema.parse(style)).toEqual(style);
  });
});
