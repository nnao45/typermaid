import type {
	FlowchartDiagramAST,
	FlowchartNodeAST,
	EdgeAST,
	SubgraphAST,
} from "@typermaid/parser";

/**
 * Check if label needs quotes (contains special characters)
 */
function needsQuotes(label: string): boolean {
	// Check for special characters that require quoting
	return /[@#:!;\s]/.test(label);
}

/**
 * Wrap label in quotes if it contains special characters
 */
function quoteLabel(label: string): string {
	return needsQuotes(label) ? `"${label}"` : label;
}

/**
 * Generate Mermaid code from Flowchart AST
 */
export function generateFlowchart(ast: FlowchartDiagramAST): string {
	const lines: string[] = [];

	// Diagram declaration
	lines.push(`flowchart ${ast.direction || "TD"}`);

	// Generate body
	for (const item of ast.body) {
		if (item.type === "Node") {
			lines.push(generateNode(item));
		} else if (item.type === "Edge") {
			lines.push(generateEdge(item));
		} else if (item.type === "Subgraph") {
			lines.push(...generateSubgraph(item, 1));
		}
	}

	return lines.join("\n");
}

function generateNode(node: FlowchartNodeAST): string {
	const { id, shape, label } = node;

	// Simple node without label
	if (!label) {
		return `  ${id}`;
	}

	const quotedLabel = quoteLabel(label);

	// Node with shape
	switch (shape) {
		case "square":
			return `  ${id}[${quotedLabel}]`;
		case "round":
			return `  ${id}(${quotedLabel})`;
		case "stadium":
			return `  ${id}([${quotedLabel}])`;
		case "subroutine":
			return `  ${id}[[${quotedLabel}]]`;
		case "cylindrical":
			return `  ${id}[(${quotedLabel})]`;
		case "circle":
			return `  ${id}((${quotedLabel}))`;
		case "asymmetric":
			return `  ${id}>${quotedLabel}]`;
		case "rhombus":
			return `  ${id}{${quotedLabel}}`;
		case "hexagon":
			return `  ${id}{{${quotedLabel}}}`;
		case "parallelogram":
			return `  ${id}[/${quotedLabel}/]`;
		case "parallelogram_alt":
			return `  ${id}[\\${quotedLabel}\\]`;
		case "trapezoid":
			return `  ${id}[/${quotedLabel}\\]`;
		case "trapezoid_alt":
			return `  ${id}[\\${quotedLabel}/]`;
		case "double_circle":
			return `  ${id}(((${quotedLabel})))`;
		default:
			return `  ${id}[${quotedLabel}]`;
	}
}

function generateEdge(edge: EdgeAST): string {
	const { from, to, edgeType, label } = edge;

	let connector = "";
	switch (edgeType) {
		case "arrow":
			connector = "-->";
			break;
		case "line":
			connector = "---";
			break;
		case "dotted_arrow":
			connector = "-.->";
			break;
		case "dotted_line":
			connector = "-.-";
			break;
		case "thick_arrow":
			connector = "==>";
			break;
		case "thick_line":
			connector = "===";
			break;
		case "invisible":
			connector = "~~~";
			break;
		case "circle_arrow":
			connector = "--o";
			break;
		case "cross_arrow":
			connector = "--x";
			break;
		case "multi_arrow":
			connector = "<-->";
			break;
		case "multi_line":
			connector = "<---";
			break;
		default:
			connector = "-->";
	}

	if (label) {
		// Mermaid labeled edge syntax: connector|label| target
		// Examples: -->|Yes| B, ---|No| C, --o|Maybe| D
		return `  ${from} ${connector}|${label}| ${to}`;
	}

	return `  ${from} ${connector} ${to}`;
}

function generateSubgraph(subgraph: SubgraphAST, indent: number): string[] {
	const lines: string[] = [];
	const indentStr = "  ".repeat(indent);

	// Subgraph declaration
	if (subgraph.label) {
		lines.push(`${indentStr}subgraph ${subgraph.id}[${subgraph.label}]`);
	} else {
		lines.push(`${indentStr}subgraph ${subgraph.id}`);
	}

	// Subgraph body
	for (const item of subgraph.body) {
		if (item.type === "Node") {
			lines.push(indentStr + generateNode(item).trim());
		} else if (item.type === "Edge") {
			lines.push(indentStr + generateEdge(item).trim());
		} else if (item.type === "Subgraph") {
			lines.push(...generateSubgraph(item, indent + 1));
		}
	}

	lines.push(`${indentStr}end`);

	return lines;
}
