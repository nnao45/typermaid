/**
 * High-level SVG generator that combines layout, shapes, and edges
 */

import type { FlowchartDiagram } from '@typermaid/core';
import { createArrowMarker } from '../edges/markers.js';
import { createLayout } from '../layout/dagre-layout.js';
import { generateShapePath } from '../shapes/index.js';
import type { LayoutEdge, LayoutNode, Position } from '../types/layout.js';
import { path as createPath, text as createText, group } from './primitives.js';
import { calculateViewBox } from './renderer.js';
import type { SVGDocument, SVGElement } from './types.js';

/**
 * Default theme colors
 */
export interface Theme {
  nodeFill: string;
  nodeStroke: string;
  nodeStrokeWidth: number;
  edgeStroke: string;
  edgeStrokeWidth: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export const DEFAULT_THEME: Theme = {
  nodeFill: '#f9f9f9',
  nodeStroke: '#333',
  nodeStrokeWidth: 2,
  edgeStroke: '#333',
  edgeStrokeWidth: 2,
  textColor: '#333',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
};

/**
 * Generate SVG node element from layout node
 */
function generateNodeElement(node: LayoutNode, theme: Theme): SVGElement {
  // Generate shape path using shape generator
  const shapePath = generateShapePath(node.shape, {
    text: node.label,
    fontSize: theme.fontSize,
    fontFamily: theme.fontFamily,
  });

  // Calculate absolute position for shape
  const shapeX = node.position.x - shapePath.width / 2;
  const shapeY = node.position.y - shapePath.height / 2;

  // Transform the path to the correct position
  const transformedPath = `M ${shapeX} ${shapeY} ${shapePath.path.slice(2)}`;

  // Create shape element
  const shapeElement = createPath(transformedPath, {
    id: `node-${node.id}`,
    class: 'flowchart-node',
    style: {
      fill: theme.nodeFill,
      stroke: theme.nodeStroke,
      strokeWidth: theme.nodeStrokeWidth,
    },
  });

  // Create text element (label position is relative to shape origin)
  const textElement = createText(node.position.x, node.position.y, node.label, {
    class: 'flowchart-node-text',
    style: {
      fill: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
      textAnchor: 'middle',
      dominantBaseline: 'middle',
    },
  });

  // Group shape and text
  return group([shapeElement, textElement], {
    id: `node-group-${node.id}`,
  });
}

/**
 * Generate SVG edge element from layout edge
 */
function generateEdgeElement(edge: LayoutEdge, theme: Theme): SVGElement {
  const elements: SVGElement[] = [];

  // Generate path from points array
  let pathData = '';
  if (edge.points.length >= 2) {
    const firstPoint = edge.points[0];
    if (firstPoint) {
      pathData =
        `M ${firstPoint.x},${firstPoint.y} ` +
        edge.points
          .slice(1)
          .map((p) => `L ${p.x},${p.y}`)
          .join(' ');
    }
  }

  // Create path element
  const pathElement = createPath(pathData, {
    id: `edge-${edge.id}`,
    class: 'flowchart-edge',
    style: {
      fill: 'none',
      stroke: theme.edgeStroke,
      strokeWidth: theme.edgeStrokeWidth,
    },
    'marker-end': `url(#arrow-${edge.edgeType})`,
  });

  elements.push(pathElement);

  // Add label if present
  if (edge.label && edge.points.length >= 2) {
    const midIndex = Math.floor(edge.points.length / 2);
    const midPoint: Position | undefined = edge.points[midIndex];

    if (midPoint) {
      const labelElement = createText(midPoint.x, midPoint.y - 5, edge.label, {
        class: 'flowchart-edge-label',
        style: {
          fill: theme.textColor,
          fontSize: theme.fontSize * 0.9,
          fontFamily: theme.fontFamily,
          textAnchor: 'middle',
        },
      });

      elements.push(labelElement);
    }
  }

  return group(elements, {
    id: `edge-group-${edge.id}`,
  });
}

/**
 * Generate marker definitions for edge arrows
 */
function generateMarkerDefs(theme: Theme): SVGElement[] {
  const markerTypes = ['arrow', 'circle', 'cross'];

  return markerTypes.map((type) => {
    // Create marker but we'll use simple path for now
    createArrowMarker(`arrow-${type}`, 8, theme.edgeStroke);

    // Create a simple arrow path
    const markerElement = createPath('M 0 0 L 10 5 L 0 10 Z', {
      style: {
        fill: theme.edgeStroke,
      },
    });

    return group([markerElement], {
      id: `arrow-${type}`,
    });
  });
}

/**
 * Generate complete SVG document from flowchart diagram
 */
export function generateFlowchartSVG(
  diagram: FlowchartDiagram,
  theme: Theme = DEFAULT_THEME
): SVGDocument {
  // Calculate layout
  const layout = createLayout(diagram);

  // Generate elements
  const nodeElements = layout.nodes.map((node: LayoutNode) => generateNodeElement(node, theme));
  const edgeElements = layout.edges.map((edge: LayoutEdge) => generateEdgeElement(edge, theme));

  // Calculate viewBox from layout bbox
  const viewBox = calculateViewBox(
    layout.bbox.x,
    layout.bbox.y,
    layout.bbox.x + layout.bbox.width,
    layout.bbox.y + layout.bbox.height
  );

  // Generate marker definitions
  const markerDefs = generateMarkerDefs(theme);

  return {
    viewBox,
    elements: [...edgeElements, ...nodeElements],
    defs: markerDefs,
  };
}
