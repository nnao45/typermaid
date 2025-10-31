// Legacy schema exports (deprecated)
export type { Diagram, DiagramConfig, Edge, Node, NodeType } from './schema.js';
export { DiagramSchema, EdgeSchema, NodeSchema, NodeTypeSchema } from './schema.js';
// New Mermaid-compatible schemas
export type {
  ClassDef,
  Color,
  Direction,
  EdgeType,
  FillStyle,
  FlowchartDiagram,
  FlowchartEdge,
  FlowchartNode,
  FontStyle,
  NodeShape,
  Position,
  Size,
  StrokeStyle,
  Style,
  Subgraph,
  TextAlign,
  Theme,
  VerticalAlign,
} from './schemas/index.js';
export {
  ClassDefSchema,
  ColorSchema,
  DirectionSchema,
  EdgeTypeSchema,
  FillStyleSchema,
  FlowchartDiagramSchema,
  FlowchartEdgeSchema,
  FlowchartNodeSchema,
  FontStyleSchema,
  NodeShapeSchema,
  PositionSchema,
  SizeSchema,
  StrokeStyleSchema,
  StyleSchema,
  SubgraphSchema,
  TextAlignSchema,
  ThemeSchema,
  VerticalAlignSchema,
} from './schemas/index.js';
export { ValidationError, validateDiagram, validateDiagramSafe } from './validator.js';
