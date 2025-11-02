import type { LayoutEdge } from '@lyric-js/renderer-core';
import React from 'react';
import type { Theme } from '../../themes/types';

interface EdgeProps {
  edge: LayoutEdge;
  theme: Theme;
  onClick?: (edge: LayoutEdge) => void;
}

export const Edge: React.FC<EdgeProps> = React.memo(({ edge, theme, onClick }) => {
  const { points, label, edgeType } = edge;

  const pathData = points
    .map((p: { x: number; y: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const markerEnd = getMarkerEnd(edgeType);
  const strokeWidth = getStrokeWidth(edgeType);
  const strokeDasharray = getStrokeDasharray(edgeType);

  const handleClick = () => {
    onClick?.(edge);
  };

  const markerId = `arrowhead-${edge.id}`;

  const midPoint = points[Math.floor(points.length / 2)];

  return (
    <g onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
      </defs>

      <path
        d={pathData}
        stroke={theme.colors.edge.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={markerEnd ? `url(#${markerId})` : ''}
      />

      {label && midPoint && (
        <text
          x={midPoint.x}
          y={midPoint.y - 5}
          textAnchor="middle"
          fill={theme.colors.edge.text}
          fontSize={theme.fonts.size.small}
          fontFamily={theme.fonts.family}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
});

Edge.displayName = 'Edge';

function getMarkerEnd(type: string): boolean {
  return type.includes('arrow');
}

function getStrokeWidth(type: string): number {
  return type.includes('thick') ? 3 : 2;
}

function getStrokeDasharray(type: string): string {
  return type.includes('dotted') ? '5,5' : '';
}
