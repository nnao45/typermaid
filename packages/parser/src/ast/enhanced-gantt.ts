import type {
  GanttConfig,
  GanttDiagram,
  GanttSection,
  GanttTask,
  GanttTaskStatus,
  SectionID,
  TaskID,
} from '@typermaid/core';
import { createSectionID, createTaskID } from '@typermaid/core';
import type { GanttDiagramAST } from '../grammar/gantt.js';

/**
 * Enhanced GanttDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedGanttDiagramAST implements GanttDiagramAST {
  // AST properties
  type: 'gantt' = 'gantt';
  config: GanttConfig;
  sections: GanttSection[];

  constructor(ast: GanttDiagramAST) {
    // Copy AST properties
    this.config = { ...ast.config };
    this.sections = [...ast.sections];

    // Initialize sections if not present
    if (!this.sections) {
      this.sections = [];
    }
  }

  /**
   * Set the chart title
   */
  setTitle(title: string): this {
    if (!this.config) {
      this.config = { dateFormat: 'YYYY-MM-DD' };
    }
    this.config.title = title;
    return this;
  }

  /**
   * Set the date format
   */
  setDateFormat(format: string): this {
    if (!this.config) {
      this.config = { dateFormat: 'YYYY-MM-DD' };
    }
    this.config.dateFormat = format;
    return this;
  }

  /**
   * Add a section to the Gantt chart
   * @param name - Section name
   * @returns SectionID for method chaining with tasks
   */
  addSection(name: string): SectionID {
    const sectionId = createSectionID(name);

    // Check if section already exists
    const existingSection = this.sections.find((s) => s.name === sectionId);
    if (!existingSection) {
      this.sections.push({
        name: sectionId,
        tasks: [],
      });
    }

    return sectionId;
  }

  /**
   * Add a task to the Gantt chart
   * @param id - Task ID
   * @param name - Task name/description
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param status - Task status ('active', 'done', 'crit', 'milestone')
   * @returns TaskID for method chaining
   */
  addTask(
    id: string,
    name: string,
    startDate: string,
    endDate: string,
    status?: GanttTaskStatus
  ): TaskID {
    const taskId = createTaskID(id);

    // Calculate duration from dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const durationMs = endDateObj.getTime() - startDateObj.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    const duration = `${durationDays}d`;

    // Find or create a default section to add the task to
    let defaultSection = this.sections.find((s) => s.name === createSectionID('Tasks'));
    if (!defaultSection) {
      defaultSection = {
        name: createSectionID('Tasks'),
        tasks: [],
      };
      this.sections.push(defaultSection);
    }

    const existingTask = defaultSection.tasks.find((t) => t.id === taskId);
    if (!existingTask) {
      defaultSection.tasks.push({
        id: taskId,
        name,
        startDate,
        duration,
        status: status ?? 'active',
        dependencies: [],
      });
    }

    return taskId;
  }

  /**
   * Add a milestone (task with duration 0)
   * @param id - Milestone ID
   * @param description - Milestone description
   * @param date - Milestone date
   * @param status - Milestone status
   * @returns TaskID for method chaining
   */
  addMilestone(id: string, description: string, date: string, status?: GanttTaskStatus): TaskID {
    const taskId = createTaskID(id);

    // Find or create a default section
    let defaultSection = this.sections.find((s) => s.name === createSectionID('Tasks'));
    if (!defaultSection) {
      defaultSection = {
        name: createSectionID('Tasks'),
        tasks: [],
      };
      this.sections.push(defaultSection);
    }

    const existingTask = defaultSection.tasks.find((t) => t.id === taskId);
    if (!existingTask) {
      defaultSection.tasks.push({
        id: taskId,
        name: description,
        startDate: date,
        duration: '0d',
        status: status ?? 'milestone',
        dependencies: [],
      });
    }

    return taskId;
  }

  /**
   * Add an existing task to a section
   * @param sectionId - Section to add task to
   * @param taskId - Task to add
   * @returns this for method chaining
   */
  addTaskToSection(sectionId: SectionID, taskId: TaskID): this {
    let task: GanttTask | undefined;

    // Find and remove task from current section
    for (const section of this.sections) {
      const taskIndex = section.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        task = section.tasks[taskIndex];
        section.tasks.splice(taskIndex, 1);
        break;
      }
    }

    // Add task to target section
    if (task) {
      const targetSection = this.sections.find((s) => s.name === sectionId);
      if (targetSection) {
        targetSection.tasks.push(task);
      }
    }

    return this;
  }

  /**
   * Add a dependency between tasks
   * @param from - Task that depends on another
   * @param to - Task that must complete first
   * @returns this for method chaining
   */
  addDependency(from: TaskID, to: TaskID): this {
    // Find the task and add dependency
    for (const section of this.sections) {
      const task = section.tasks.find((t) => t.id === from);
      if (task) {
        if (!task.dependencies) {
          task.dependencies = [];
        }
        if (!task.dependencies.includes(to)) {
          task.dependencies.push(to);
        }
        break;
      }
    }

    return this;
  }

  /**
   * Get all section IDs
   */
  getAllSections(): SectionID[] {
    return this.sections.map((s) => s.name);
  }

  /**
   * Get all task IDs
   */
  getAllTasks(): TaskID[] {
    const tasks: TaskID[] = [];
    for (const section of this.sections) {
      for (const task of section.tasks) {
        if (task.id) {
          tasks.push(task.id);
        }
      }
    }
    return tasks;
  }

  /**
   * Get a section by ID
   */
  getSection(id: SectionID): GanttSection | undefined {
    return this.sections.find((s) => s.name === id);
  }

  /**
   * Get a task by ID
   */
  getTask(id: TaskID): GanttTask | undefined {
    for (const section of this.sections) {
      const task = section.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return undefined;
  }

  /**
   * Replace section ID throughout the diagram
   */
  replaceSection(oldId: SectionID, newId: SectionID): this {
    for (const section of this.sections) {
      if (section.name === oldId) {
        section.name = newId;
      }
    }
    return this;
  }

  /**
   * Replace task ID throughout the diagram
   */
  replaceTask(oldId: TaskID, newId: TaskID): this {
    // Replace in tasks
    for (const section of this.sections) {
      for (const task of section.tasks) {
        if (task.id === oldId) {
          task.id = newId;
        }

        // Replace in dependencies
        if (task.dependencies) {
          const index = task.dependencies.indexOf(oldId);
          if (index !== -1) {
            task.dependencies[index] = newId;
          }
        }
      }
    }

    return this;
  }

  /**
   * Generate Mermaid Gantt diagram code
   * Simple implementation without external dependencies
   */
  asCode(): string {
    const lines: string[] = ['gantt'];

    // Generate config
    if (this.config.title) {
      lines.push(`    title ${this.config.title}`);
    }
    if (this.config.dateFormat) {
      lines.push(`    dateFormat ${this.config.dateFormat}`);
    }
    if (this.config.axisFormat) {
      lines.push(`    axisFormat ${this.config.axisFormat}`);
    }
    if (this.config.excludes) {
      lines.push(`    excludes ${this.config.excludes}`);
    }
    if (this.config.todayMarker) {
      lines.push(`    todayMarker ${this.config.todayMarker}`);
    }

    // Generate sections and tasks
    for (const section of this.sections) {
      lines.push(`    section ${section.name}`);

      for (const task of section.tasks) {
        let line = `        ${task.name} :`;

        // Add status if present
        if (task.status && task.status !== 'active') {
          line += ` ${task.status},`;
        }

        // Add task ID if present
        if (task.id) {
          line += ` ${task.id},`;
        }

        // Add start date
        if (task.startDate) {
          line += ` ${task.startDate},`;
        }

        // Add duration
        if (task.duration) {
          line += ` ${task.duration}`;
        }

        lines.push(line);
      }
    }

    return lines.join('\n');
  }

  /**
   * Build final GanttDiagram with asCode capability
   */
  build(): GanttDiagram & { asCode(): string } {
    const diagram: GanttDiagram = {
      type: 'gantt',
      config: this.config,
      sections: this.sections,
    };

    return {
      ...diagram,
      asCode: () => this.asCode(),
    };
  }
}
