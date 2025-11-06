import type { GanttDiagram, GanttTask } from '@typermaid/core';
import {
  calculateTimelineRange,
  calculateTimelineTasks,
  generateTimelineAxis,
  measureTextCanvas,
  type TimelineConfig,
  type TimelineTask,
} from '@typermaid/renderer-core';
import type React from 'react';
import { useMemo } from 'react';
import type { Theme } from '../themes/types';

interface GanttRendererProps {
  diagram: GanttDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

interface TaskRowPosition {
  task: GanttTask;
  index: number;
  y: number;
  height: number;
}

export const GanttRenderer: React.FC<GanttRendererProps> = ({
  diagram,
  theme,
  width = 1200,
  height = 600,
}) => {
  const config = diagram.config;
  const sections = diagram.sections || [];

  // Flatten all tasks from sections
  const tasks: GanttTask[] = sections.flatMap((section) => section.tasks || []);

  // Layout constants
  const taskNameFontSize = 12;
  const padding = 20;
  const taskHeight = 30;
  const taskSpacing = 10;
  const topMargin = 100; // Increased for timeline axis
  const rowHeight = taskHeight + taskSpacing;

  // Measure task names to determine left margin
  const taskNameWidths = tasks.map((task) => {
    const taskName = task.name || task.id || '';
    const metrics = measureTextCanvas(taskName, taskNameFontSize, 'sans-serif', 'normal');
    return metrics.width;
  });

  const leftMargin =
    taskNameWidths.length > 0 ? Math.max(...taskNameWidths, 100) + padding * 2 : 250;

  // Calculate timeline configuration
  const timelineWidth = width - leftMargin - 50;
  const timelineConfig: TimelineConfig = useMemo(() => {
    return calculateTimelineRange(tasks, timelineWidth);
  }, [tasks, timelineWidth]);

  // Calculate timeline tasks (position on timeline)
  const timelineTasks: TimelineTask[] = useMemo(() => {
    return calculateTimelineTasks(tasks, timelineConfig);
  }, [tasks, timelineConfig]);

  // Calculate task row positions
  const taskRows: Map<string, TaskRowPosition> = useMemo(() => {
    const rows = new Map<string, TaskRowPosition>();
    tasks.forEach((task, index) => {
      if (!task.id) return;
      rows.set(task.id, {
        task,
        index,
        y: topMargin + index * rowHeight,
        height: taskHeight,
      });
    });
    return rows;
  }, [tasks, rowHeight]);

  // Generate timeline axis
  const timelineAxis = useMemo(() => {
    const totalDays = timelineConfig.totalDays;
    const step = totalDays > 60 ? 'week' : 'day';
    return generateTimelineAxis(timelineConfig, step);
  }, [timelineConfig]);

  // Generate dependency arrows
  const dependencyArrows = useMemo(() => {
    const arrows: JSX.Element[] = [];

    for (const timelineTask of timelineTasks) {
      const { task } = timelineTask;
      if (!task.id) continue;

      const currentRow = taskRows.get(task.id);
      if (!currentRow) continue;

      const taskX = leftMargin + timelineTask.x;
      const taskY = currentRow.y;

      if (!task.dependencies || task.dependencies.length === 0) {
        continue;
      }

      for (const depId of task.dependencies) {
        const depTask = timelineTasks.find((t) => t.task.id === depId);
        const depRow = taskRows.get(depId);
        if (!depTask || !depRow) continue;

        // Arrow from end of dependency task to start of current task
        const x1 = leftMargin + depTask.x + depTask.width;
        const y1 = depRow.y + depRow.height / 2;
        const x2 = taskX;
        const y2 = taskY + currentRow.height / 2;

        // Create curved arrow path
        const midX = (x1 + x2) / 2;
        const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

        // Arrow marker
        const arrowSize = 6;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowPoints = [
          { x: x2, y: y2 },
          {
            x: x2 - arrowSize * Math.cos(angle - Math.PI / 6),
            y: y2 - arrowSize * Math.sin(angle - Math.PI / 6),
          },
          {
            x: x2 - arrowSize * Math.cos(angle + Math.PI / 6),
            y: y2 - arrowSize * Math.sin(angle + Math.PI / 6),
          },
        ];

        const key = `arrow-${task.id}-${depId}`;
        arrows.push(
          <g key={key}>
            <path
              d={pathData}
              fill="none"
              stroke={theme.colors.edge.stroke}
              strokeWidth={1.5}
              strokeDasharray="5,5"
            />
            <polygon
              points={arrowPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={theme.colors.edge.stroke}
            />
          </g>
        );
      }
    }

    return arrows;
  }, [timelineTasks, taskRows, leftMargin, theme.colors.edge.stroke]);

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {/* Title */}
      <text
        x={width / 2}
        y={30}
        fill={theme.colors.text}
        fontSize={18}
        fontWeight="bold"
        textAnchor="middle"
      >
        {config.title || 'Gantt Chart'}
      </text>

      {/* Timeline axis (grid lines and date labels) */}
      {timelineAxis.map((axisPoint: { date: Date; x: number; label: string }, i: number) => {
        const axisX = leftMargin + axisPoint.x;
        const isWeekend = axisPoint.date.getDay() === 0 || axisPoint.date.getDay() === 6;

        return (
          <g key={`axis-${i}`}>
            {/* Grid line */}
            <line
              x1={axisX}
              y1={topMargin - 20}
              x2={axisX}
              y2={height - 20}
              stroke={isWeekend ? '#e0e0e0' : '#f0f0f0'}
              strokeWidth={isWeekend ? 1 : 0.5}
            />
            {/* Date label */}
            <text
              x={axisX}
              y={topMargin - 30}
              fontSize={9}
              textAnchor="middle"
              fill={isWeekend ? '#999' : '#666'}
            >
              {axisPoint.label}
            </text>
          </g>
        );
      })}

      {/* Timeline start/end markers */}
      <line
        x1={leftMargin}
        y1={topMargin - 25}
        x2={leftMargin}
        y2={topMargin - 5}
        stroke={theme.colors.text}
        strokeWidth={2}
      />
      <line
        x1={leftMargin + timelineConfig.timelineWidth}
        y1={topMargin - 25}
        x2={leftMargin + timelineConfig.timelineWidth}
        y2={topMargin - 5}
        stroke={theme.colors.text}
        strokeWidth={2}
      />

      {/* Draw dependency arrows first (behind tasks) */}
      {dependencyArrows}

      {/* Draw tasks */}
      {timelineTasks.map((timelineTask, i) => {
        const { task, x, width } = timelineTask;
        const row = task.id ? taskRows.get(task.id) : undefined;
        if (!row) return null;

        const taskX = leftMargin + x;
        const taskY = row.y;

        // Determine task color based on status
        let taskFill = theme.colors.node.fill;
        let taskStroke = theme.colors.node.stroke;

        if (task.status === 'done') {
          taskFill = '#90EE90'; // Light green for done
          taskStroke = '#228B22';
        } else if (task.status === 'active') {
          taskFill = '#FFD700'; // Gold for active
          taskStroke = '#FFA500';
        } else if (task.status === 'crit') {
          taskFill = '#FFB6C1'; // Light red for critical
          taskStroke = '#DC143C';
        }

        return (
          <g key={task.id || i}>
            {/* Task name (left side) */}
            <text
              x={10}
              y={taskY + taskHeight / 2}
              fill={theme.colors.text}
              fontSize={taskNameFontSize}
              dominantBaseline="middle"
            >
              {task.name || task.id}
            </text>

            {/* Task bar (timeline) */}
            <rect
              x={taskX}
              y={taskY}
              width={width}
              height={taskHeight}
              fill={taskFill}
              stroke={taskStroke}
              strokeWidth={2}
              rx={3}
            />

            {/* Task duration label (inside bar if wide enough) */}
            {width > 40 && (
              <text
                x={taskX + width / 2}
                y={taskY + taskHeight / 2}
                fill="#333"
                fontSize={10}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {task.duration || ''}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
