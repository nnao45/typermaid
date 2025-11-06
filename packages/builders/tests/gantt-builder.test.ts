import { describe, expect, it } from 'vitest';
import {
  GanttDiagramBuilder,
  type TaskID,
  ValidationError,
  ValidationErrorCode,
} from '../src/index.js';

describe('GanttDiagramBuilder', () => {
  describe('Basic Task Operations', () => {
    it('should create a task and return branded TaskID', () => {
      const builder = new GanttDiagramBuilder();
      const taskId = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      expect(builder.hasTask(taskId)).toBe(true);
      expect(builder.getTaskCount()).toBe(1);
    });

    it('should throw on duplicate task ID', () => {
      const builder = new GanttDiagramBuilder();
      builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      expect(() => {
        builder.addTask('task1', 'Duplicate Task', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addTask('task1', 'Duplicate Task', '2024-01-01', '2024-01-10');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid task ID format', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addTask('123', 'Invalid', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addTask('123', 'Invalid', '2024-01-01', '2024-01-10');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addTask('gantt', 'Reserved', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addTask('section', 'Reserved', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);
    });

    it('should throw on empty task description', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addTask('task1', '', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addTask('task1', '   ', '2024-01-01', '2024-01-10');
      }).toThrow(ValidationError);
    });

    it('should throw on invalid date range', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addTask('task1', 'Invalid Task', '2024-01-10', '2024-01-01');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addTask('task1', 'Invalid Task', '2024-01-10', '2024-01-01');
      }).toThrow(/start date must be before end date/);
    });
  });

  describe('Task Dependencies', () => {
    it('should add dependency between tasks', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');
      const task2 = builder.addTask('task2', 'Develop', '2024-01-11', '2024-01-20');

      builder.addDependency(task2, task1);

      const diagram = builder.build();
      expect(diagram.tasks[1]?.dependencies).toContain('task1');
    });

    it('should throw when adding dependency to non-existent task', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      expect(() => {
        // @ts-expect-error - Testing invalid TaskID
        builder.addDependency('task2' as TaskID, task1);
      }).toThrow(ValidationError);
    });

    it('should throw when adding circular dependency', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');
      const task2 = builder.addTask('task2', 'Develop', '2024-01-11', '2024-01-20');

      builder.addDependency(task2, task1);

      expect(() => {
        builder.addDependency(task1, task2);
      }).toThrow(ValidationError);

      expect(() => {
        builder.addDependency(task1, task2);
      }).toThrow(/Circular dependency/i);
    });
  });

  describe('Section Operations', () => {
    it('should create a section and add tasks to it', () => {
      const builder = new GanttDiagramBuilder();
      const section = builder.addSection('planning', 'Planning Phase');
      const task1 = builder.addTask('task1', 'Requirements', '2024-01-01', '2024-01-10');

      builder.addTaskToSection(section, task1);

      const diagram = builder.build();
      expect(diagram.sections).toHaveLength(1);
      expect(diagram.sections?.[0]?.tasks).toContain('task1');
    });

    it('should throw on duplicate section ID', () => {
      const builder = new GanttDiagramBuilder();
      builder.addSection('planning', 'Planning Phase');

      expect(() => {
        builder.addSection('planning', 'Duplicate Section');
      }).toThrow(ValidationError);
    });

    it('should throw when adding non-existent task to section', () => {
      const builder = new GanttDiagramBuilder();
      const section = builder.addSection('planning', 'Planning');

      expect(() => {
        // @ts-expect-error - Testing invalid TaskID
        builder.addTaskToSection(section, 'task1' as TaskID);
      }).toThrow(ValidationError);
    });
  });

  describe('Task Status', () => {
    it('should set task status', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      builder.setTaskStatus(task1, 'done');

      const diagram = builder.build();
      expect(diagram.tasks[0]?.status).toBe('done');
    });

    it('should default to active status', () => {
      const builder = new GanttDiagramBuilder();
      const _task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      const diagram = builder.build();
      expect(diagram.tasks[0]?.status).toBe('active');
    });

    it('should throw on invalid task status', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      expect(() => {
        // @ts-expect-error - Testing invalid status
        builder.setTaskStatus(task1, 'invalid');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid status
        builder.setTaskStatus(task1, 'invalid');
      }).toThrow(/Invalid task status/);
    });

    it('should mark task as milestone', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      builder.markMilestone(task1);

      const diagram = builder.build();
      expect(diagram.tasks[0]?.status).toBe('milestone');
    });
  });

  describe('Milestones', () => {
    it('should create a milestone with duration 0', () => {
      const builder = new GanttDiagramBuilder();
      const milestone = builder.addMilestone('m1', 'Launch', '2024-01-15');

      const diagram = builder.build();
      expect(diagram.tasks).toHaveLength(1);
      expect(diagram.tasks[0]?.id).toBe('m1');
      expect(diagram.tasks[0]?.duration).toBe('0d');
      expect(builder.hasTask(milestone)).toBe(true);
    });

    it('should throw on invalid milestone date', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addMilestone('m1', 'Launch', 'invalid-date');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addMilestone('m1', 'Launch', 'invalid-date');
      }).toThrow(/not a valid date/);
    });

    it('should throw on empty milestone description', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.addMilestone('m1', '', '2024-01-15');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addMilestone('m1', '   ', '2024-01-15');
      }).toThrow(/description cannot be empty/);
    });
  });

  describe('Task After Dependencies', () => {
    it('should add task after another task with correct dates', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');
      const _task2 = builder.addTaskAfter('task2', 'Develop', task1, 5);

      const diagram = builder.build();
      expect(diagram.tasks).toHaveLength(2);
      expect(diagram.tasks[1]?.dependencies).toContain('task1');

      // task2 should start on 2024-01-11 (day after task1 ends)
      expect(diagram.tasks[1]?.startDate).toBe('2024-01-11');
    });

    it('should throw when adding task after non-existent task', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        // @ts-expect-error - Testing invalid TaskID
        builder.addTaskAfter('task2', 'Develop', 'task1' as TaskID, 5);
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid TaskID
        builder.addTaskAfter('task2', 'Develop', 'task1' as TaskID, 5);
      }).toThrow(/Dependency task .* not found/);
    });

    it('should chain multiple tasks with after dependencies', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');
      const task2 = builder.addTaskAfter('task2', 'Develop', task1, 5);
      const _task3 = builder.addTaskAfter('task3', 'Test', task2, 3);

      const diagram = builder.build();
      expect(diagram.tasks).toHaveLength(3);
      expect(diagram.tasks[1]?.dependencies).toContain('task1');
      expect(diagram.tasks[2]?.dependencies).toContain('task2');
    });
  });

  describe('Build', () => {
    it('should build a valid gantt diagram', () => {
      const builder = new GanttDiagramBuilder();
      const section = builder.addSection('planning', 'Planning');
      const task1 = builder.addTask('task1', 'Requirements', '2024-01-01', '2024-01-10');
      const task2 = builder.addTask('task2', 'Design', '2024-01-11', '2024-01-20');

      builder.addTaskToSection(section, task1);
      builder.addTaskToSection(section, task2);
      builder.addDependency(task2, task1);

      const diagram = builder.build();

      expect(diagram.type).toBe('gantt');
      expect(diagram.tasks).toHaveLength(2);
      expect(diagram.sections).toHaveLength(1);
    });

    it('should throw when building diagram without tasks', () => {
      const builder = new GanttDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one task/);
    });

    it('should set title when provided', () => {
      const builder = new GanttDiagramBuilder();
      builder.setTitle('Project Timeline');
      builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      const diagram = builder.build();
      expect(diagram.title).toBe('Project Timeline');
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');
      const task2 = builder.addTask('task2', 'Develop', '2024-01-11', '2024-01-20');

      const diagram = builder
        .setTitle('Project')
        .addDependency(task2, task1)
        .setTaskStatus(task1, 'done')
        .build();

      expect(diagram.title).toBe('Project');
      expect(diagram.tasks[1]?.dependencies).toContain('task1');
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new GanttDiagramBuilder();
      const task1 = builder.addTask('task1', 'Design', '2024-01-01', '2024-01-10');

      try {
        // @ts-expect-error - Testing invalid TaskID
        builder.addDependency('task2' as TaskID, task1);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.TASK_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          task: 'task2',
        });
      }
    });
  });
});
