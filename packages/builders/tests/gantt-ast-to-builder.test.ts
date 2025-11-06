import { type GanttDiagramAST, parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { ganttASTToBuilder } from '../src/converters/gantt-ast-to-builder.js';

describe('ganttASTToBuilder', () => {
  it('should convert basic gantt diagram AST to builder', () => {
    const code = `gantt
  title Project Schedule
  dateFormat YYYY-MM-DD
  section Planning
  Task 1 :task1, 2024-01-01, 5d
  Task 2 :task2, 2024-01-06, 3d`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as GanttDiagramAST;
    const builder = ganttASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.config.title).toBe('Project Schedule');
    expect(diagram.config.dateFormat).toBe('YYYY-MM-DD');
    expect(diagram.sections.length).toBe(1);
    expect(diagram.sections[0]?.tasks.length).toBe(2);
  });

  it('should allow manipulation after conversion', () => {
    const code = `gantt
  title My Project
  dateFormat YYYY-MM-DD
  section Phase 1
  Task 1 :task1, 2024-01-01, 5d`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as GanttDiagramAST;
    const builder = ganttASTToBuilder(diagramAST);

    // Add new section and task
    const phase2 = builder.addSection('Phase 2');
    const task2 = builder.addTask('task2', 'Task 2', '2024-01-10', '2024-01-13');
    builder.addTaskToSection(phase2, task2);

    const diagram = builder.build();

    expect(diagram.sections.length).toBe(2);
  });

  it('should handle multiple sections', () => {
    const code = `gantt
  dateFormat YYYY-MM-DD
  section Development
  Task A :taskA, 2024-01-01, 5d
  section Testing
  Task B :taskB, 2024-01-06, 3d`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as GanttDiagramAST;
    const builder = ganttASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.sections.length).toBe(2);
    expect(diagram.sections[0]?.name).toBe('Development');
    expect(diagram.sections[1]?.name).toBe('Testing');
  });

  it.skip('should handle task status (TODO: parser task status/id/dates order)', () => {
    const code = `gantt
  dateFormat YYYY-MM-DD
  section Tasks
  Done task :done, task1, 2024-01-01, 2d
  Active task :active, task2, 2024-01-03, 3d
  Critical task :crit, task3, 2024-01-06, 2d`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as GanttDiagramAST;
    const builder = ganttASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.sections[0]?.tasks.length).toBe(3);
    expect(diagram.sections[0]?.tasks[0]?.status).toBe('done');
    expect(diagram.sections[0]?.tasks[1]?.status).toBe('active');
    expect(diagram.sections[0]?.tasks[2]?.status).toBe('crit');
  });

  it('should handle date format configuration', () => {
    const code = `gantt
  title Test
  dateFormat YYYY-MM-DD
  section Work
  Task :t1, 2024-01-01, 5d`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as GanttDiagramAST;
    const builder = ganttASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.config.dateFormat).toBe('YYYY-MM-DD');
  });
});
