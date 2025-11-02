import type { FlowchartDiagramAST } from '@lyric-js/parser';
import type { LayoutEdge, LayoutNode } from '@lyric-js/renderer-core';
import { astToSchema, createLayout } from '@lyric-js/renderer-core';
import type React from 'react';
import { useMemo } from 'react';
import { useZoomPan } from '../hooks/useZoomPan';
import type { Theme } from '../themes/types';
import { Edge } from './shared/Edge';
import { Node } from './shared/Node';

interface FlowchartRendererProps {
  diagram: FlowchartDiagramAST;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
  onNodeClick?: (node: LayoutNode) => void;
  onEdgeClick?: (edge: LayoutEdge) => void;
}

export const FlowchartRenderer: React.FC<FlowchartRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
  interactive = false,
  onNodeClick,
  onEdgeClick,
}) => {
  const layout = useMemo(() => {
    const schemaDiagram = astToSchema({ type: 'Program', body: [diagram] });
    const direction = diagram.direction === 'TD' ? 'TB' : diagram.direction;
    return createLayout(schemaDiagram, {
      rankdir: direction || 'TB',
      nodesep: theme.spacing.node,
      ranksep: theme.spacing.node * 2,
      marginx: theme.spacing.padding,
      marginy: theme.spacing.padding,
    });
  }, [diagram, theme]);

  const { state, svgRef } = useZoomPan(1);
  const viewBox = `0 0 ${layout.bbox.width} ${layout.bbox.height}`;

  return (
    <svg
      ref={interactive ? svgRef : undefined}
      width={width}
      height={height}
      viewBox={viewBox}
      style={interactive ? { cursor: 'grab' } : undefined}
    >
      <g
        transform={
          interactive ? `translate(${state.x}, ${state.y}) scale(${state.scale})` : undefined
        }
      >
        {layout.edges.map((edge: LayoutEdge) => (
          <Edge
            key={edge.id}
            edge={edge}
            theme={theme}
            {...(onEdgeClick ? { onClick: onEdgeClick } : {})}
          />
        ))}

        {layout.nodes.map((node: LayoutNode) => (
          <Node
            key={node.id}
            node={node}
            theme={theme}
            {...(onNodeClick ? { onClick: onNodeClick } : {})}
          />
        ))}
      </g>
    </svg>
  );
};
