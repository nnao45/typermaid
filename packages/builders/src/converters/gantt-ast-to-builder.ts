import type { GanttDiagram, GanttSection, GanttTask } from '@lyric-js/core';
import type { GanttDiagramAST } from '@lyric-js/parser';
import { GanttDiagramBuilder } from '../gantt-builder.js';
import type { SectionID, TaskID } from '../types.js';

/**
 * Convert parsed Gantt Diagram AST to Builder for manipulation
 *
 * @param ast - Parsed GanttDiagramAST
 * @returns GanttDiagramBuilder instance populated with AST data
 *
 * @example
 * ```typescript
 * import { parse } from '@lyric-js/parser';
 * import { ganttASTToBuilder } from '@lyric-js/builders/converters';
 *
 * const code = `
 *   gantt
 *     title Project Schedule
 *     dateFormat YYYY-MM-DD
 *     section Planning
 *     Task 1 :task1, 2024-01-01, 5d
 *     Task 2 :task2, after task1, 3d
 * `;
 * const ast = parse(code);
 * const builder = ganttASTToBuilder(ast.body[0]);
 *
 * // Now manipulate!
 * const devSection = builder.addSection('Development');
 * const task3 = builder.addTask('Task 3', '2024-01-15', '5d', devSection);
 * ```
 */
export function ganttASTToBuilder(ast: GanttDiagramAST): GanttDiagramBuilder {
  const builder = new GanttDiagramBuilder();

  const diagram: GanttDiagram = ast.diagram;

  // Set title if exists
  if (diagram.config.title) {
    builder.setTitle(diagram.config.title);
  }

  // Set date format if exists
  if (diagram.config.dateFormat) {
    builder.setDateFormat(diagram.config.dateFormat);
  }

  // Process sections and tasks
  for (const section of diagram.sections) {
    processSection(section, builder);
  }

  return builder;
}

/**
 * Process a single section and its tasks
 */
function processSection(section: GanttSection, builder: GanttDiagramBuilder): SectionID {
  // addSectionにname（元の表示名）をそのまま渡す
  // builderが内部でID変換とlabel保持をハンドルする
  const sectionId = builder.addSection(section.name);

  // Process tasks in this section
  for (const task of section.tasks) {
    processTask(task, builder, sectionId);
  }

  return sectionId;
}

/**
 * Process a single task and add to builder
 */
function processTask(task: GanttTask, builder: GanttDiagramBuilder, sectionId: SectionID): TaskID {
  // Calculate end date from start date and duration
  const endDate = calculateEndDate(task.startDate, task.duration);

  const taskId = builder.addTask(
    task.id ?? `task-${Math.random().toString(36).substring(7)}`,
    task.name,
    task.startDate,
    endDate,
    task.status
  );

  // Add task to section
  builder.addTaskToSection(sectionId, taskId);

  // Dependencies will be handled after all tasks are added
  // (not supported in current builder API for AST conversion)

  return taskId;
}

/**
 * Calculate end date from start date and duration
 * Duration format: "5d", "3w", "2h"
 */
function calculateEndDate(startDate: string, duration: string): string {
  const start = new Date(startDate);

  // Parse duration (e.g., "5d", "3w", "2h")
  const match = duration.match(/^(\d+)([dwh])$/);
  if (!match) {
    // If duration is not in format "Xd", assume it's a date
    return duration;
  }

  const amount = Number.parseInt(match[1] ?? '0', 10);
  const unit = match[2];

  let days = 0;
  switch (unit) {
    case 'd':
      days = amount;
      break;
    case 'w':
      days = amount * 7;
      break;
    case 'h':
      days = amount / 24;
      break;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + days);

  // Format as YYYY-MM-DD
  return end.toISOString().split('T')[0] ?? startDate;
}
