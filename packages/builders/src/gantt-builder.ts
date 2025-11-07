import type {
  GanttConfig,
  GanttDiagram,
  GanttSection,
  GanttTask,
  GanttTaskStatus,
} from '@typermaid/core';
import { createSectionID, createTaskID, type SectionID, type TaskID } from '@typermaid/core';
import { ValidationError, ValidationErrorCode } from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * Gantt Chart Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Tasks have valid dates
 * - Dependencies only reference existing tasks
 * - Sections contain valid tasks
 */
export class GanttDiagramBuilder {
  private config: GanttConfig = {
    dateFormat: 'YYYY-MM-DD',
  };
  private sections = new Map<SectionID, GanttSection>();
  private tasks = new Map<TaskID, GanttTask>();
  private sectionOrder: SectionID[] = [];
  private taskIdToTaskID = new Map<string, TaskID>();

  /**
   * Set the chart title
   */
  setTitle(title: string): this {
    if (!title || title.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Title cannot be empty', {});
    }
    this.config = { ...this.config, title };
    return this;
  }

  /**
   * Set the date format
   */
  setDateFormat(format: string): this {
    if (!format || format.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        'Date format cannot be empty',
        {}
      );
    }
    this.config = { ...this.config, dateFormat: format };
    return this;
  }

  /**
   * Add a section to the Gantt chart
   * @param name - Section ID (used for internal reference)
   * @param _label - Optional display label (defaults to name) - currently unused
   * @returns Branded SectionID that can only be used with this builder
   * @note For AST conversion, we convert display names to valid IDs automatically
   */
  addSection(name: string, _label?: string): SectionID {
    // Convert name to valid ID if needed (for AST conversion compatibility)
    const normalizedName = this.toValidSectionID(name);

    // Check reserved words
    validateNotReservedWord(normalizedName);

    // Create SectionID with validation
    let sectionId: SectionID;
    try {
      sectionId = createSectionID(normalizedName);
    } catch (error) {
      // Convert ZodError to ValidationError for consistent API
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid section ID format: "${normalizedName}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id: normalizedName }
      );
    }

    // Check for duplicates
    if (this.sections.has(sectionId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Section with name "${normalizedName}" already exists`,
        { id: normalizedName }
      );
    }

    const section: GanttSection = {
      name: sectionId,
      tasks: [],
    };

    this.sections.set(sectionId, section);
    this.sectionOrder.push(sectionId);

    return sectionId;
  }

  /**
   * Add a milestone (task with duration 0)
   * @returns Branded TaskID that can only be used with this builder
   */
  addMilestone(id: string, description: string, date: string, status?: GanttTaskStatus): TaskID {
    // Check reserved words
    validateNotReservedWord(id);

    // Validate description not empty
    if (!description || description.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Milestone description cannot be empty',
        { id }
      );
    }

    // Validate date not empty
    if (!date || date.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        'Milestone date cannot be empty',
        { taskId: id }
      );
    }

    // Validate date is valid
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        `Invalid milestone date: "${date}" is not a valid date`,
        { date, taskId: id }
      );
    }

    // Create TaskID with validation (milestone)
    let taskId: TaskID;
    try {
      taskId = createTaskID(id);
    } catch (error) {
      // Convert ZodError to ValidationError for consistent API
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id }
      );
    }

    // Check for duplicate task ID
    if (this.tasks.has(taskId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Task with ID "${id}" already exists`,
        { id }
      );
    }

    const task: GanttTask = {
      id: taskId,
      name: description,
      startDate: date,
      duration: '0d', // Milestone has 0 duration
      status: status ?? 'active',
      dependencies: [],
    };

    this.tasks.set(taskId, task);
    this.taskIdToTaskID.set(id, taskId);

    return taskId;
  }

  /**
   * Add a task without section
   * @returns Branded TaskID that can only be used with this builder
   */
  addTask(
    id: string,
    description: string,
    startDate: string,
    endDate: string,
    status?: GanttTaskStatus
  ): TaskID {
    // Check reserved words
    validateNotReservedWord(id);

    // Validate description not empty
    if (!description || description.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Task description cannot be empty',
        {
          id,
        }
      );
    }

    // Validate start date not empty
    if (!startDate || startDate.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        'Task start date cannot be empty',
        { taskId: id }
      );
    }

    // Validate end date not empty
    if (!endDate || endDate.trim() === '') {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        'Task end date cannot be empty',
        { taskId: id }
      );
    }

    // Validate date range (start date must be before end date)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (Number.isNaN(startDateObj.getTime())) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        `Invalid date range: start date "${startDate}" is not a valid date`,
        { startDate, taskId: id }
      );
    }

    if (Number.isNaN(endDateObj.getTime())) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        `Invalid date range: end date "${endDate}" is not a valid date`,
        { endDate, taskId: id }
      );
    }

    if (startDateObj >= endDateObj) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_DATE_FORMAT,
        `Invalid date range: start date must be before end date (start: ${startDate}, end: ${endDate})`,
        { startDate, endDate, taskId: id }
      );
    }

    // Create TaskID with validation (regular task)
    let taskId: TaskID;
    try {
      taskId = createTaskID(id);
    } catch (error) {
      // Convert ZodError to ValidationError for consistent API
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${id}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id }
      );
    }

    // Check for duplicate task ID
    if (this.tasks.has(taskId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Task with ID "${id}" already exists`,
        { id }
      );
    }

    // Calculate duration in days
    const durationMs = endDateObj.getTime() - startDateObj.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    const duration = `${durationDays}d`;

    const task: GanttTask = {
      id: taskId,
      name: description,
      startDate,
      duration,
      status: status ?? 'active',
      dependencies: [], // Initialize dependencies array
    };

    this.tasks.set(taskId, task);
    this.taskIdToTaskID.set(id, taskId);

    return taskId;
  }

  /**
   * Add an existing task to a section
   * @throws {ValidationError} If section or task doesn't exist
   */
  addTaskToSection(sectionId: SectionID, taskId: TaskID): this {
    // Validate section exists
    if (!this.sections.has(sectionId)) {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        `Section "${sectionId}" not found`,
        { sectionId }
      );
    }

    // Validate task exists
    if (!this.tasks.has(taskId)) {
      throw new ValidationError(
        ValidationErrorCode.TASK_NOT_FOUND,
        `Task "${taskId}" not found. You must add the task before adding it to a section.`,
        { taskId, sectionId }
      );
    }

    const section = this.sections.get(sectionId);
    const task = this.tasks.get(taskId);

    if (section && task) {
      // Check if task is already in the section
      const taskAlreadyInSection = section.tasks.some((t) => t.id === task.id);
      if (!taskAlreadyInSection) {
        section.tasks.push(task);
      }
    }

    return this;
  }

  /**
   * Add a task that starts after another task completes
   * This is a convenience method for common dependency patterns
   * @param after The task that must complete before this task starts
   */
  addTaskAfter(
    id: string,
    description: string,
    after: TaskID,
    duration: number,
    status?: GanttTaskStatus
  ): TaskID {
    // Validate the dependency task exists
    if (!this.tasks.has(after)) {
      throw new ValidationError(
        ValidationErrorCode.TASK_NOT_FOUND,
        `Dependency task "${after}" not found. You must add the task before creating a dependency.`,
        { taskId: id, after }
      );
    }

    const afterTask = this.tasks.get(after);
    if (!afterTask) {
      throw new ValidationError(
        ValidationErrorCode.TASK_NOT_FOUND,
        `Dependency task "${after}" not found`,
        { taskId: id, after }
      );
    }

    // Calculate start and end dates based on after task
    const afterEndDate = afterTask.startDate ? new Date(afterTask.startDate) : new Date();

    // Add the duration of the after task
    if (afterTask.duration) {
      const durationMatch = afterTask.duration.match(/^(\d+)([dDhHmM])$/);
      if (durationMatch) {
        const value = Number.parseInt(durationMatch[1] ?? '0', 10);
        const unit = (durationMatch[2] ?? 'd').toLowerCase();

        if (unit === 'd') {
          afterEndDate.setDate(afterEndDate.getDate() + value);
        }
      }
    }

    // Start date is the day after the after task ends
    const startDate = new Date(afterEndDate);
    startDate.setDate(startDate.getDate() + 1);

    // End date is start date + duration
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Add the task with calculated dates
    const taskId = this.addTask(
      id,
      description,
      formatDate(startDate),
      formatDate(endDate),
      status
    );

    // Add the dependency
    this.addDependency(taskId, after);

    return taskId;
  }

  /**
   * Add a dependency between tasks
   * @throws {ValidationError} If either task doesn't exist or circular dependency detected
   */
  addDependency(from: TaskID, to: TaskID): this {
    // Validate tasks exist
    if (!this.tasks.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.TASK_NOT_FOUND,
        `Source task "${from}" not found. You must add the task before creating a dependency.`,
        { task: from, dependsOn: to }
      );
    }

    if (!this.tasks.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.TASK_NOT_FOUND,
        `Target task "${to}" not found. You must add the task before creating a dependency.`,
        { task: from, dependsOn: to }
      );
    }

    // Check for circular dependency
    if (this.hasCircularDependency(from, to)) {
      throw new ValidationError(
        ValidationErrorCode.CIRCULAR_REFERENCE,
        `Circular dependency detected: adding dependency from "${from}" to "${to}" would create a cycle`,
        { task: from, dependsOn: to }
      );
    }

    const task = this.tasks.get(from); // Add to 'from' task, not 'to' task
    if (task) {
      if (!Array.isArray(task.dependencies)) {
        task.dependencies = [];
      }
      task.dependencies.push(to); // 'from' depends on 'to'
    }

    return this;
  }

  /**
   * Check if adding a dependency would create a circular dependency
   * from depends on to をチェックする
   * つまり、to -> ... -> from のパスが既に存在するかチェック
   */
  private hasCircularDependency(from: TaskID, to: TaskID): boolean {
    const visited = new Set<TaskID>();
    const stack: TaskID[] = [to];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      if (current === from) {
        return true;
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const task = this.tasks.get(current);
      if (task?.dependencies) {
        for (const depId of task.dependencies) {
          if (this.tasks.has(depId)) {
            stack.push(depId);
          }
        }
      }
    }

    return false;
  }

  /**
   * Set task status with validation
   */
  setTaskStatus(taskId: TaskID, status: GanttTaskStatus): this {
    if (!this.tasks.has(taskId)) {
      throw new ValidationError(ValidationErrorCode.TASK_NOT_FOUND, `Task "${taskId}" not found`, {
        taskId,
      });
    }

    // Validate status is a valid GanttTaskStatus
    const validStatuses: GanttTaskStatus[] = ['active', 'done', 'crit', 'milestone'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_EDGE_TYPE,
        `Invalid task status: "${status}". Valid statuses are: ${validStatuses.join(', ')}`,
        { taskId, status }
      );
    }

    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
    }

    return this;
  }

  /**
   * Mark a task as active
   */
  markActive(taskId: TaskID): this {
    return this.setTaskStatus(taskId, 'active');
  }

  /**
   * Mark a task as done
   */
  markDone(taskId: TaskID): this {
    return this.setTaskStatus(taskId, 'done');
  }

  /**
   * Mark a task as critical
   */
  markCritical(taskId: TaskID): this {
    return this.setTaskStatus(taskId, 'crit');
  }

  /**
   * Mark a task as milestone
   */
  markMilestone(taskId: TaskID): this {
    return this.setTaskStatus(taskId, 'milestone');
  }

  /**
   * Build and validate the complete Gantt chart
   */
  build(): GanttDiagram & {
    tasks?: GanttTask[];
    sections: Array<GanttSection & { tasks: string[] }>;
    title?: string;
  } {
    if (this.sections.size === 0 && this.tasks.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.EMPTY_LABEL,
        'Gantt chart must have at least one task',
        {}
      );
    }

    const sections = this.sectionOrder.map((sid) => {
      const section = this.sections.get(sid);
      if (!section) {
        throw new ValidationError(
          ValidationErrorCode.EMPTY_LABEL,
          `Section "${sid}" not found in build`,
          { sid }
        );
      }

      // Convert tasks to string IDs for test compatibility
      return {
        ...section,
        tasks: section.tasks.map((t) => t.id).filter((id) => id !== undefined) as TaskID[],
      };
    }) as Array<GanttSection & { tasks: TaskID[] }>;

    // Get all tasks as array for test compatibility
    const tasks = Array.from(this.tasks.values());

    const diagram = {
      type: 'gantt' as const,
      config: this.config,
      sections,
      tasks,
      ...(this.config.title ? { title: this.config.title } : {}),
    };

    return diagram;
  }

  /**
   * Get current section count
   */
  getSectionCount(): number {
    return this.sections.size;
  }

  /**
   * Get current task count
   */
  getTaskCount(): number {
    return this.tasks.size;
  }

  /**
   * Check if a section exists
   */
  hasSection(sectionId: SectionID): boolean {
    return this.sections.has(sectionId);
  }

  /**
   * Check if a task exists
   */
  hasTask(taskId: TaskID): boolean {
    return this.tasks.has(taskId);
  }

  /**
   * Convert display name to valid Section ID
   * @private
   * Handles names like "Phase 1" -> "phase_1"
   */
  private toValidSectionID(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '');
  }
}
