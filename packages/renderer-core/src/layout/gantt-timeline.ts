import type { GanttTask } from '@lyric-js/core';

export interface TimelineConfig {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pixelsPerDay: number;
  timelineWidth: number;
}

export interface TimelineTask {
  task: GanttTask;
  startDate: Date;
  endDate: Date;
  x: number;
  width: number;
}

export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

export function parseDuration(duration: string | undefined): number {
  if (!duration) return 1;

  const match = duration.match(/^(\d+)([hdwm])?$/i);
  if (!match) return 1;

  const value = Number.parseInt(match[1] ?? '1', 10);
  const unit = (match[2] ?? 'd').toLowerCase();

  switch (unit) {
    case 'h':
      return Math.max(1, Math.ceil(value / 24));
    case 'd':
      return value;
    case 'w':
      return value * 7;
    case 'm':
      return value * 30;
    default:
      return value;
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export function resolveTaskDates(
  tasks: GanttTask[]
): Map<string, { startDate: Date; endDate: Date }> {
  const resolved = new Map<string, { startDate: Date; endDate: Date }>();
  const taskMap = new Map<string, GanttTask>();

  for (const task of tasks) {
    if (task.id) {
      taskMap.set(task.id, task);
    }
  }

  function resolve(task: GanttTask): { startDate: Date; endDate: Date } {
    if (task.id && resolved.has(task.id)) {
      const cached = resolved.get(task.id);
      if (!cached) {
        throw new Error(`Unexpected: resolved task ${task.id} is undefined`);
      }
      return cached;
    }

    let startDate: Date;
    const duration = parseDuration(task.duration);

    if (task.startDate) {
      if (task.startDate.startsWith('after ')) {
        const depId = task.startDate.slice(6).trim();
        const depTask = taskMap.get(depId);
        if (depTask) {
          const depDates = resolve(depTask);
          startDate = depDates.endDate;
        } else {
          startDate = new Date();
        }
      } else {
        startDate = parseDate(task.startDate);
      }
    } else {
      startDate = new Date();
    }

    const endDate = addDays(startDate, duration);

    const result = { startDate, endDate };
    if (task.id) {
      resolved.set(task.id, result);
    }
    return result;
  }

  for (const task of tasks) {
    resolve(task);
  }

  return resolved;
}

export function calculateTimelineRange(tasks: GanttTask[], availableWidth: number): TimelineConfig {
  if (tasks.length === 0) {
    const now = new Date();
    return {
      startDate: now,
      endDate: addDays(now, 30),
      totalDays: 30,
      pixelsPerDay: availableWidth / 30,
      timelineWidth: availableWidth,
    };
  }

  const taskDates = resolveTaskDates(tasks);
  const allDates = Array.from(taskDates.values());

  const startDates = allDates.map((d) => d.startDate);
  const endDates = allDates.map((d) => d.endDate);

  const startDate = new Date(Math.min(...startDates.map((d) => d.getTime())));
  const endDate = new Date(Math.max(...endDates.map((d) => d.getTime())));

  const totalDays = Math.max(1, daysBetween(startDate, endDate));
  const pixelsPerDay = availableWidth / totalDays;

  return {
    startDate,
    endDate,
    totalDays,
    pixelsPerDay,
    timelineWidth: availableWidth,
  };
}

export function calculateTimelineTasks(tasks: GanttTask[], config: TimelineConfig): TimelineTask[] {
  const taskDates = resolveTaskDates(tasks);
  const timelineTasks: TimelineTask[] = [];

  for (const task of tasks) {
    const dates = task.id ? taskDates.get(task.id) : undefined;
    if (!dates) continue;

    const { startDate, endDate } = dates;
    const daysFromStart = daysBetween(config.startDate, startDate);
    const taskDuration = daysBetween(startDate, endDate);

    const x = daysFromStart * config.pixelsPerDay;
    const width = Math.max(10, taskDuration * config.pixelsPerDay);

    timelineTasks.push({
      task,
      startDate,
      endDate,
      x,
      width,
    });
  }

  return timelineTasks;
}

export function formatDate(date: Date, format: 'MM/DD' | 'YYYY-MM-DD' = 'MM/DD'): string {
  if (format === 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

export function generateTimelineAxis(
  config: TimelineConfig,
  step: 'day' | 'week' = 'day'
): Array<{ date: Date; x: number; label: string }> {
  const axis: Array<{ date: Date; x: number; label: string }> = [];
  const currentDate = new Date(config.startDate);

  if (step === 'day') {
    let dayIndex = 0;
    while (currentDate <= config.endDate) {
      axis.push({
        date: new Date(currentDate),
        x: dayIndex * config.pixelsPerDay,
        label: formatDate(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }
  } else {
    let dayIndex = 0;
    while (currentDate <= config.endDate) {
      if (currentDate.getDay() === 0) {
        axis.push({
          date: new Date(currentDate),
          x: dayIndex * config.pixelsPerDay,
          label: formatDate(currentDate),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }
  }

  return axis;
}
