import type {
	GanttDiagramAST,
	GanttTask,
	GanttSection,
} from "@lyric-js/parser";

/**
 * Generate Mermaid code from Gantt Diagram AST
 */
export function generateGantt(ast: GanttDiagramAST): string {
	const lines: string[] = [];

	lines.push("gantt");

	// Title
	if (ast.diagram.config.title) {
		lines.push(`  title ${ast.diagram.config.title}`);
	}

	// Date format
	if (ast.diagram.config.dateFormat) {
		lines.push(`  dateFormat ${ast.diagram.config.dateFormat}`);
	}

	// Axis format
	if (ast.diagram.config.axisFormat) {
		lines.push(`  axisFormat ${ast.diagram.config.axisFormat}`);
	}

	// Sections
	for (const section of ast.diagram.sections) {
		lines.push(...generateSection(section));
	}

	return lines.join("\n");
}

function generateSection(section: GanttSection): string[] {
	const lines: string[] = [];

	lines.push(`  section ${section.name}`);

	for (const task of section.tasks) {
		lines.push(`  ${generateTask(task)}`);
	}

	return lines;
}

function generateTask(task: GanttTask): string {
	let line = task.name;

	// Status
	if (task.status) {
		line = `${line} :${task.status}`;
	} else {
		line = `${line} :`;
	}

	// Task ID
	if (task.id) {
		line = `${line}${task.id},`;
	}

	// Start date
	line = `${line} ${task.startDate},`;

	// Duration
	line = `${line} ${task.duration}`;

	return line;
}
