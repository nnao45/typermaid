import type { GanttDiagram, GanttTask } from '@lyric-js/core';
import type React from 'react';
import { measureText } from '@lyric-js/renderer-core';
import type { Theme } from '../themes/types';

interface GanttRendererProps {
  diagram: GanttDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const GanttRenderer: React.FC<GanttRendererProps> = ({
  diagram,
  theme,
  width = 900,
  height = 500,
}) => {
  const config = diagram.config;
  const sections = diagram.sections || [];

  // Flatten all tasks from sections
  const tasks: GanttTask[] = sections.flatMap((section) => section.tasks || []);

  // Dynamic sizing based on text measurement
  const taskNameFontSize = 12;
  const padding = 20;
  const taskHeight = 30;
  const taskSpacing = 10;
  const topMargin = 50;
  const rowHeight = taskHeight + taskSpacing;

  // Measure task names to determine left margin
  const taskNameWidths = tasks.map((task) => {
    const taskName = task.name || task.id || '';
    const metrics = measureText(taskName, taskNameFontSize, 'sans-serif', 'normal');
    return metrics.width;
  });

  const leftMargin = taskNameWidths.length > 0 ? Math.max(...taskNameWidths, 100) + padding * 2 : 200;

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      <text
        x={width / 2}
        y={25}
        fill={theme.colors.text}
        fontSize={18}
        fontWeight="bold"
        textAnchor="middle"
      >
        {config.title || 'Gantt Chart'}
      </text>

      {tasks.map((task: GanttTask, index: number) => {
        const y = topMargin + index * rowHeight;
        const barX = leftMargin + 20;
        const barWidth = 150;

        return (
          <g key={task.id || index}>
            <text
              x={10}
              y={y + taskHeight / 2}
              fill={theme.colors.text}
              fontSize={12}
              dominantBaseline="middle"
            >
              {task.name || task.id}
            </text>
            <rect
              x={barX}
              y={y}
              width={barWidth}
              height={taskHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={3}
            />
            <text
              x={barX + barWidth / 2}
              y={y + taskHeight / 2}
              fill={theme.colors.text}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {task.duration || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
