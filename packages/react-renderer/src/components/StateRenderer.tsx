import type { State, StateDiagram, StateTransition } from '@lyric-js/core';
import type React from 'react';
import { measureText } from '@lyric-js/renderer-core';
import type { Theme } from '../themes/types';
import { ContentRenderer } from './ContentRenderer';

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
  const states = diagram.states || [];
  const transitions = diagram.transitions || [];

  // Dynamic sizing based on text measurement
  const labelFontSize = 14;
  const descFontSize = 10;
  const padding = 20;
  const spacing = 150;
  const leftMargin = 80;
  const topMargin = 80;

  // Measure each state's required size (excluding START/END states)
  const stateSizes = states
    .filter((s) => s.type !== 'START' && s.type !== 'END')
    .map((state) => {
      const label = state.label || state.id;
      const labelText = typeof label === 'string' ? label : ''; // HTML content uses fixed size
      const descText = typeof state.description === 'string' ? state.description : '';

      const labelMetrics = labelText ? measureText(labelText, labelFontSize, 'sans-serif', 'bold') : { width: 0, height: 0 };
      const descMetrics = descText ? measureText(descText, descFontSize, 'sans-serif', 'normal') : { width: 0, height: 0 };

      const width = Math.max(labelMetrics.width, descMetrics.width) + padding * 2;
      const height = labelMetrics.height + descMetrics.height + padding * 2;

      return { width, height };
    });

  const stateWidth = stateSizes.length > 0 ? Math.max(...stateSizes.map((s) => s.width), 140) : 140;
  const stateHeight = stateSizes.length > 0 ? Math.max(...stateSizes.map((s) => s.height), 60) : 60;

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {states.map((state: State, index: number) => {
        const x = leftMargin + (index % 4) * spacing;
        const y = topMargin + Math.floor(index / 4) * spacing;

        const isStart = state.type === 'START';
        const isEnd = state.type === 'END';

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
            {state.label ? (
              typeof state.label === 'string' ? (
                <text
                  x={x + stateWidth / 2}
                  y={y + stateHeight / 2}
                  fill={theme.colors.text}
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {state.label}
                </text>
              ) : (
                <ContentRenderer
                  content={state.label}
                  x={x + stateWidth / 2}
                  y={y + stateHeight / 2}
                  width={stateWidth - 10}
                  height={30}
                />
              )
            ) : (
              <text
                x={x + stateWidth / 2}
                y={y + stateHeight / 2}
                fill={theme.colors.text}
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {state.id}
              </text>
            )}
            {state.description &&
              (typeof state.description === 'string' ? (
                <text
                  x={x + stateWidth / 2}
                  y={y + stateHeight / 2 + 15}
                  fill={theme.colors.text}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {state.description}
                </text>
              ) : (
                <ContentRenderer
                  content={state.description}
                  x={x + stateWidth / 2}
                  y={y + stateHeight / 2 + 15}
                  width={stateWidth - 10}
                  height={20}
                />
              ))}
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
            {transition.label &&
              (typeof transition.label === 'string' ? (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  fill={theme.colors.text}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {transition.label}
                </text>
              ) : (
                <ContentRenderer
                  content={transition.label}
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  width={120}
                  height={25}
                />
              ))}
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
