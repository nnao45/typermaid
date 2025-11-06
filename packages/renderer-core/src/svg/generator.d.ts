/**
 * High-level SVG generator that combines layout, shapes, and edges
 */
import type { FlowchartDiagram } from '@typermaid/core';
import type { SVGDocument } from './types.js';
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
export declare const DEFAULT_THEME: Theme;
/**
 * Generate complete SVG document from flowchart diagram
 */
export declare function generateFlowchartSVG(diagram: FlowchartDiagram, theme?: Theme): SVGDocument;
//# sourceMappingURL=generator.d.ts.map
