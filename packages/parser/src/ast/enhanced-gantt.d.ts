import type { GanttDiagram, GanttSection, GanttTask, GanttTaskStatus, SectionID, TaskID } from '@typermaid/core';
import type { GanttDiagramAST } from './nodes.js';
/**
 * Enhanced GanttDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export declare class EnhancedGanttDiagramAST implements GanttDiagramAST {
    type: 'GanttDiagram';
    diagram: GanttDiagram;
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    } | undefined;
    constructor(ast: GanttDiagramAST);
    /**
     * Set the chart title
     */
    setTitle(title: string): this;
    /**
     * Set the date format
     */
    setDateFormat(format: string): this;
    /**
     * Add a section to the Gantt chart
     * @param name - Section name
     * @returns SectionID for method chaining with tasks
     */
    addSection(name: string): SectionID;
    /**
     * Add a task to the Gantt chart
     * @param id - Task ID
     * @param name - Task name/description
     * @param startDate - Start date (YYYY-MM-DD)
     * @param endDate - End date (YYYY-MM-DD)
     * @param status - Task status ('active', 'done', 'crit', 'milestone')
     * @returns TaskID for method chaining
     */
    addTask(id: string, name: string, startDate: string, endDate: string, status?: GanttTaskStatus): TaskID;
    /**
     * Add a milestone (task with duration 0)
     * @param id - Milestone ID
     * @param description - Milestone description
     * @param date - Milestone date
     * @param status - Milestone status
     * @returns TaskID for method chaining
     */
    addMilestone(id: string, description: string, date: string, status?: GanttTaskStatus): TaskID;
    /**
     * Add an existing task to a section
     * @param sectionId - Section to add task to
     * @param taskId - Task to add
     * @returns this for method chaining
     */
    addTaskToSection(sectionId: SectionID, taskId: TaskID): this;
    /**
     * Add a dependency between tasks
     * @param from - Task that depends on another
     * @param to - Task that must complete first
     * @returns this for method chaining
     */
    addDependency(from: TaskID, to: TaskID): this;
    /**
     * Get all section IDs
     */
    getAllSections(): SectionID[];
    /**
     * Get all task IDs
     */
    getAllTasks(): TaskID[];
    /**
     * Get a section by ID
     */
    getSection(id: SectionID): GanttSection | undefined;
    /**
     * Get a task by ID
     */
    getTask(id: TaskID): GanttTask | undefined;
    /**
     * Replace section ID throughout the diagram
     */
    replaceSection(oldId: SectionID, newId: SectionID): this;
    /**
     * Replace task ID throughout the diagram
     */
    replaceTask(oldId: TaskID, newId: TaskID): this;
    /**
     * Generate Mermaid Gantt diagram code
     * Simple implementation without external dependencies
     */
    asCode(): string;
    /**
     * Build final GanttDiagram with asCode capability
     */
    build(): GanttDiagram & {
        asCode(): string;
    };
}
//# sourceMappingURL=enhanced-gantt.d.ts.map