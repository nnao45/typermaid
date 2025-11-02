/**
 * Convert Parser AST to Schema-compatible format
 */
export function astToSchema(ast) {
  // Get first flowchart diagram
  const diagram = ast.body.find((node) => node.type === 'FlowchartDiagram');
  if (!diagram) {
    throw new Error('No flowchart diagram found in AST');
  }
  const nodeMap = new Map();
  const edges = [];
  let edgeIdCounter = 0;
  // First pass: collect explicit nodes
  for (const statement of diagram.body) {
    const stmt = statement;
    if (stmt.type === 'Node') {
      const node = stmt;
      nodeMap.set(node.id, {
        id: node.id,
        shape: node.shape,
        label: node.label || node.id,
      });
    }
  }
  // Second pass: collect edges and create implicit nodes
  for (const statement of diagram.body) {
    const stmt = statement;
    if (stmt.type === 'Edge') {
      const edge = stmt;
      // Create implicit nodes if they don't exist
      if (!nodeMap.has(edge.from)) {
        nodeMap.set(edge.from, {
          id: edge.from,
          shape: 'square',
          label: edge.from,
        });
      }
      if (!nodeMap.has(edge.to)) {
        nodeMap.set(edge.to, {
          id: edge.to,
          shape: 'square',
          label: edge.to,
        });
      }
      edges.push({
        id: `edge-${edgeIdCounter++}`,
        from: edge.from,
        to: edge.to,
        type: mapEdgeType(edge.edgeType),
        label: edge.label,
      });
    }
  }
  return {
    type: 'flowchart',
    direction: diagram.direction,
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}
/**
 * Map Parser edge type to Schema edge type
 */
function mapEdgeType(parserType) {
  const mapping = {
    '-->': 'arrow',
    '---': 'line',
    '-.->': 'dotted_arrow',
    '-.-': 'dotted_line',
    '==>': 'thick_arrow',
    '===': 'thick_line',
    '~~~': 'invisible',
    '--o': 'circle_arrow',
    'o--': 'circle_arrow',
    '--x': 'cross_arrow',
    'x--': 'cross_arrow',
  };
  return mapping[parserType] || 'arrow';
}
//# sourceMappingURL=ast-converter.js.map
