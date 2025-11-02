import type { LayoutNode } from '@lyric-js/renderer-core';
import React from 'react';
import type { Theme } from '../../themes/types';

interface NodeProps {
  node: LayoutNode;
  theme: Theme;
  onClick?: (node: LayoutNode) => void;
}

export const Node: React.FC<NodeProps> = React.memo(({ node, theme, onClick }) => {
  const { position, dimensions, label, shape } = node;
  const { x, y } = position;
  const { width, height } = dimensions;

  const handleClick = () => {
    onClick?.(node);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {renderShape(shape, width, height, theme)}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={theme.colors.node.text}
        fontSize={theme.fonts.size.medium}
        fontFamily={theme.fonts.family}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
});

Node.displayName = 'Node';

function renderShape(
  shape: string,
  width: number,
  height: number,
  theme: Theme
): React.ReactElement {
  const commonProps = {
    fill: theme.colors.node.fill,
    stroke: theme.colors.node.stroke,
    strokeWidth: 2,
  };

  switch (shape) {
    case 'square':
      return <rect x={-width / 2} y={-height / 2} width={width} height={height} {...commonProps} />;

    case 'round':
      return (
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          {...commonProps}
        />
      );

    case 'circle':
      return <circle cx={0} cy={0} r={width / 2} {...commonProps} />;

    case 'rhombus': {
      const points = `0,${-height / 2} ${width / 2},0 0,${height / 2} ${-width / 2},0`;
      return <polygon points={points} {...commonProps} />;
    }

    case 'hexagon': {
      const hexPoints = [
        [width / 4, -height / 2],
        [width / 2, 0],
        [width / 4, height / 2],
        [-width / 4, height / 2],
        [-width / 2, 0],
        [-width / 4, -height / 2],
      ]
        .map((p: number[]) => p.join(','))
        .join(' ');
      return <polygon points={hexPoints} {...commonProps} />;
    }

    case 'stadium':
      return (
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          ry={height / 2}
          {...commonProps}
        />
      );

    case 'subroutine':
      return (
        <g>
          <rect x={-width / 2} y={-height / 2} width={width} height={height} {...commonProps} />
          <line
            x1={-width / 2 + 5}
            y1={-height / 2}
            x2={-width / 2 + 5}
            y2={height / 2}
            stroke={theme.colors.node.stroke}
            strokeWidth={2}
          />
          <line
            x1={width / 2 - 5}
            y1={-height / 2}
            x2={width / 2 - 5}
            y2={height / 2}
            stroke={theme.colors.node.stroke}
            strokeWidth={2}
          />
        </g>
      );

    default:
      return <rect x={-width / 2} y={-height / 2} width={width} height={height} {...commonProps} />;
  }
}
