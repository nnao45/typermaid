import { describe, expect, it } from 'vitest';
import {
  circle,
  ellipse,
  group,
  line,
  path,
  rect,
  styleToString,
  text,
} from '../src/svg/primitives.js';
import { calculateViewBox, renderSVG } from '../src/svg/renderer.js';
import type { SVGDocument, SVGStyle } from '../src/svg/types.js';

describe('SVG Primitives', () => {
  describe('styleToString', () => {
    it('should convert style object to CSS string', () => {
      const style: SVGStyle = {
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
      };

      const result = styleToString(style);
      expect(result).toContain('fill:#fff');
      expect(result).toContain('stroke:#000');
      expect(result).toContain('stroke-width:2');
    });

    it('should handle camelCase conversion', () => {
      const style: SVGStyle = {
        strokeDasharray: '5,5',
        fontFamily: 'Arial',
      };

      const result = styleToString(style);
      expect(result).toContain('stroke-dasharray:5,5');
      expect(result).toContain('font-family:Arial');
    });

    it('should return undefined for empty style', () => {
      expect(styleToString(undefined)).toBeUndefined();
      expect(styleToString({})).toBeUndefined();
    });
  });

  describe('path', () => {
    it('should create path element', () => {
      const element = path('M 0 0 L 100 100');

      expect(element.type).toBe('path');
      expect(element.props.d).toBe('M 0 0 L 100 100');
    });

    it('should accept additional props', () => {
      const element = path('M 0 0', {
        id: 'test-path',
        style: { stroke: '#000' },
      });

      expect(element.props.id).toBe('test-path');
      expect(element.props.style).toEqual({ stroke: '#000' });
    });
  });

  describe('rect', () => {
    it('should create rect element', () => {
      const element = rect(10, 20, 100, 50);

      expect(element.type).toBe('rect');
      expect(element.props.x).toBe(10);
      expect(element.props.y).toBe(20);
      expect(element.props.width).toBe(100);
      expect(element.props.height).toBe(50);
    });

    it('should support rounded corners', () => {
      const element = rect(0, 0, 100, 50, { rx: 5, ry: 5 });

      expect(element.props.rx).toBe(5);
      expect(element.props.ry).toBe(5);
    });
  });

  describe('circle', () => {
    it('should create circle element', () => {
      const element = circle(50, 50, 25);

      expect(element.type).toBe('circle');
      expect(element.props.cx).toBe(50);
      expect(element.props.cy).toBe(50);
      expect(element.props.r).toBe(25);
    });
  });

  describe('ellipse', () => {
    it('should create ellipse element', () => {
      const element = ellipse(50, 50, 30, 20);

      expect(element.type).toBe('ellipse');
      expect(element.props.cx).toBe(50);
      expect(element.props.cy).toBe(50);
      expect(element.props.rx).toBe(30);
      expect(element.props.ry).toBe(20);
    });
  });

  describe('line', () => {
    it('should create line element', () => {
      const element = line(0, 0, 100, 100);

      expect(element.type).toBe('line');
      expect(element.props.x1).toBe(0);
      expect(element.props.y1).toBe(0);
      expect(element.props.x2).toBe(100);
      expect(element.props.y2).toBe(100);
    });
  });

  describe('text', () => {
    it('should create text element', () => {
      const element = text(50, 50, 'Hello');

      expect(element.type).toBe('text');
      expect(element.props.x).toBe(50);
      expect(element.props.y).toBe(50);
      expect(element.props.text).toBe('Hello');
    });
  });

  describe('group', () => {
    it('should create group element with children', () => {
      const children = [circle(50, 50, 25), text(50, 50, 'Label')];

      const element = group(children, { id: 'test-group' });

      expect(element.type).toBe('g');
      expect(element.props.children).toHaveLength(2);
      expect(element.props.id).toBe('test-group');
    });
  });
});

describe('SVG Renderer', () => {
  describe('calculateViewBox', () => {
    it('should calculate viewBox with margin', () => {
      const viewBox = calculateViewBox(0, 0, 100, 100, 10);

      expect(viewBox.x).toBe(-10);
      expect(viewBox.y).toBe(-10);
      expect(viewBox.width).toBe(120);
      expect(viewBox.height).toBe(120);
    });

    it('should use default margin', () => {
      const viewBox = calculateViewBox(10, 10, 90, 90);

      expect(viewBox.x).toBe(-10);
      expect(viewBox.y).toBe(-10);
      expect(viewBox.width).toBe(120);
      expect(viewBox.height).toBe(120);
    });
  });

  describe('renderSVG', () => {
    it('should render simple SVG document', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [
          rect(10, 10, 80, 80, {
            style: { fill: '#fff', stroke: '#000' },
          }),
        ],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 100 100"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('x="10"');
      expect(svg).toContain('y="10"');
      expect(svg).toContain('width="80"');
      expect(svg).toContain('height="80"');
    });

    it('should render with width and height', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        width: 500,
        height: 500,
        elements: [],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('width="500"');
      expect(svg).toContain('height="500"');
    });

    it('should render group with children', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [
          group(
            [
              circle(50, 50, 25, { style: { fill: '#f00' } }),
              text(50, 50, 'Test', { style: { fill: '#000' } }),
            ],
            { id: 'test-group' }
          ),
        ],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<g id="test-group">');
      expect(svg).toContain('<circle');
      expect(svg).toContain('cx="50"');
      expect(svg).toContain('<text');
      expect(svg).toContain('>Test</text>');
      expect(svg).toContain('</g>');
    });

    it('should render defs section', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [],
        defs: [path('M 0 0 L 10 5 L 0 10 Z', { id: 'arrow' })],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<defs>');
      expect(svg).toContain('id="arrow"');
      expect(svg).toContain('</defs>');
    });

    it('should render path element', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [
          path('M 0 0 L 100 100', {
            style: { stroke: '#000', strokeWidth: 2 },
          }),
        ],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<path');
      expect(svg).toContain('d="M 0 0 L 100 100"');
      expect(svg).toContain('stroke:#000');
    });

    it('should render line element', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [line(0, 0, 100, 100, { style: { stroke: '#000' } })],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<line');
      expect(svg).toContain('x1="0"');
      expect(svg).toContain('y1="0"');
      expect(svg).toContain('x2="100"');
      expect(svg).toContain('y2="100"');
    });

    it('should render ellipse element', () => {
      const doc: SVGDocument = {
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        elements: [ellipse(50, 50, 30, 20)],
      };

      const svg = renderSVG(doc);

      expect(svg).toContain('<ellipse');
      expect(svg).toContain('cx="50"');
      expect(svg).toContain('cy="50"');
      expect(svg).toContain('rx="30"');
      expect(svg).toContain('ry="20"');
    });
  });
});
