import type { State, StateDiagram, StateTransition } from '@lyric-js/core';
import type React from 'react';
import type { Theme } from '../themes/types';

interface StateRendererProps {
  diagram: StateDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const StateRenderer: React.FC<StateRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
}) => {
  // Handle both AST structure (diagram.diagram) and direct structure
  const diagramData = diagram.diagram || diagram;
  const states = diagramData.states || [];
  const transitions = diagramData.transitions || [];

  const stateWidth = 140;
  const stateHeight = 60;
  const spacing = 150;
  const leftMargin = 80;
  const topMargin = 80;

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {states.map((state: State, index: number) => {
        const x = leftMargin + (index % 4) * spacing;
        const y = topMargin + Math.floor(index / 4) * spacing;

        const isStart = state.type === 'start' || state.id === '[*]';
        const isEnd = state.type === 'end';

        if (isStart || isEnd) {
          return (
            <circle
              key={state.id || index}
              cx={x + stateWidth / 2}
              cy={y + stateHeight / 2}
              r={15}
              fill={isStart ? theme.colors.node.stroke : theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={isEnd ? 4 : 2}
            />
          );
        }

        return (
          <g key={state.id || index}>
            <rect
              x={x}
              y={y}
              width={stateWidth}
              height={stateHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={8}
            />
            <text
              x={x + stateWidth / 2}
              y={y + stateHeight / 2}
              fill={theme.colors.text}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {state.label || state.id}
            </text>
            {state.description && (
              <text
                x={x + stateWidth / 2}
                y={y + stateHeight / 2 + 15}
                fill={theme.colors.text}
                fontSize={10}
                textAnchor="middle"
              >
                {state.description}
              </text>
            )}
          </g>
        );
      })}

      {transitions.map((transition: StateTransition, index: number) => {
        const fromState = states.find((s: State) => s.id === transition.from);
        const toState = states.find((s: State) => s.id === transition.to);

        if (!fromState || !toState) return null;

        const fromIndex = states.indexOf(fromState);
        const toIndex = states.indexOf(toState);

        const x1 = leftMargin + (fromIndex % 4) * spacing + stateWidth / 2;
        const y1 = topMargin + Math.floor(fromIndex / 4) * spacing + stateHeight / 2;
        const x2 = leftMargin + (toIndex % 4) * spacing + stateWidth / 2;
        const y2 = topMargin + Math.floor(toIndex / 4) * spacing + stateHeight / 2;

        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.colors.edge.stroke}
              strokeWidth={2}
              markerEnd="url(#arrowhead-state)"
            />
            {transition.label && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 5}
                fill={theme.colors.text}
                fontSize={11}
                textAnchor="middle"
              >
                {transition.label}
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <marker
          id="arrowhead-state"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
      </defs>
    </svg>
  );
};
