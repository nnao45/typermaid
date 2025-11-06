import type {
	ProgramAST,
	FlowchartDiagramAST,
	FlowchartNodeAST,
	EdgeAST,
	SequenceDiagramAST,
	StateDiagramAST,
	ClassDiagramAST,
	ERDiagramAST,
	GanttDiagramAST,
} from "@typermaid/parser";
import { transformAST } from "./transform.js";

/**
 * Clone AST (deep copy)
 * Creates a new AST with no shared references
 *
 * @example
 * ```typescript
 * const original = parse('flowchart LR\n  A --> B');
 * const clone = cloneAST(original);
 * // Modifications to clone won't affect original
 * ```
 */
export function cloneAST<T extends ProgramAST>(ast: T): T {
	return JSON.parse(JSON.stringify(ast)) as T;
}

/**
 * Merge two diagrams of the same type
 * Combines nodes, edges, and other elements
 *
 * @example
 * ```typescript
 * const diagram1 = parse('flowchart LR\n  A --> B').body[0];
 * const diagram2 = parse('flowchart LR\n  B --> C').body[0];
 * const merged = mergeDiagrams(diagram1, diagram2);
 * // Result: A --> B --> C
 * ```
 */
export function mergeDiagrams(
	diagram1: FlowchartDiagramAST,
	diagram2: FlowchartDiagramAST,
): FlowchartDiagramAST;
export function mergeDiagrams(
	diagram1: SequenceDiagramAST,
	diagram2: SequenceDiagramAST,
): SequenceDiagramAST;
export function mergeDiagrams(
	diagram1: StateDiagramAST,
	diagram2: StateDiagramAST,
): StateDiagramAST;
export function mergeDiagrams(
	diagram1: ClassDiagramAST,
	diagram2: ClassDiagramAST,
): ClassDiagramAST;
export function mergeDiagrams(
	diagram1: ERDiagramAST,
	diagram2: ERDiagramAST,
): ERDiagramAST;
export function mergeDiagrams(
	diagram1: GanttDiagramAST,
	diagram2: GanttDiagramAST,
): GanttDiagramAST;
export function mergeDiagrams(
	diagram1:
		| FlowchartDiagramAST
		| SequenceDiagramAST
		| StateDiagramAST
		| ClassDiagramAST
		| ERDiagramAST
		| GanttDiagramAST,
	diagram2:
		| FlowchartDiagramAST
		| SequenceDiagramAST
		| StateDiagramAST
		| ClassDiagramAST
		| ERDiagramAST
		| GanttDiagramAST,
):
	| FlowchartDiagramAST
	| SequenceDiagramAST
	| StateDiagramAST
	| ClassDiagramAST
	| ERDiagramAST
	| GanttDiagramAST {
	if (diagram1.type !== diagram2.type) {
		throw new Error(
			`Cannot merge diagrams of different types: ${diagram1.type} and ${diagram2.type}`,
		);
	}

	switch (diagram1.type) {
		case "FlowchartDiagram":
			return {
				...diagram1,
				body: [
					...diagram1.body,
					...(diagram2 as FlowchartDiagramAST).body,
				],
			} as FlowchartDiagramAST;

		case "SequenceDiagram":
			return {
				...diagram1,
				diagram: {
					...diagram1.diagram,
					statements: [
						...diagram1.diagram.statements,
						...(diagram2 as SequenceDiagramAST).diagram.statements,
					],
				},
			} as SequenceDiagramAST;

		case "StateDiagram":
			return {
				...diagram1,
				diagram: {
					...diagram1.diagram,
					states: [
						...diagram1.diagram.states,
						...(diagram2 as StateDiagramAST).diagram.states,
					],
					transitions: [
						...diagram1.diagram.transitions,
						...(diagram2 as StateDiagramAST).diagram.transitions,
					],
					notes: [
						...(diagram1.diagram.notes ?? []),
						...((diagram2 as StateDiagramAST).diagram.notes ?? []),
					],
				},
			} as StateDiagramAST;

		case "ClassDiagram":
			return {
				...diagram1,
				diagram: {
					...diagram1.diagram,
					classes: [
						...diagram1.diagram.classes,
						...(diagram2 as ClassDiagramAST).diagram.classes,
					],
					relations: [
						...diagram1.diagram.relations,
						...(diagram2 as ClassDiagramAST).diagram.relations,
					],
				},
			} as ClassDiagramAST;

		case "ERDiagram":
			return {
				...diagram1,
				diagram: {
					...diagram1.diagram,
					entities: [
						...diagram1.diagram.entities,
						...(diagram2 as ERDiagramAST).diagram.entities,
					],
					relationships: [
						...diagram1.diagram.relationships,
						...(diagram2 as ERDiagramAST).diagram.relationships,
					],
				},
			} as ERDiagramAST;

		case "GanttDiagram":
			return {
				...diagram1,
				diagram: {
					...diagram1.diagram,
					sections: [
						...diagram1.diagram.sections,
						...(diagram2 as GanttDiagramAST).diagram.sections,
					],
				},
			} as GanttDiagramAST;

		default:
			throw new Error(`Unknown diagram type: ${(diagram1 as { type: string }).type}`);
	}
}

/**
 * Remove node by ID (also removes connected edges)
 *
 * @example
 * ```typescript
 * const updated = removeNode(ast, 'B');
 * // Removes node B and all edges connected to B
 * ```
 */
export function removeNode(ast: ProgramAST, nodeId: string): ProgramAST {
	return transformAST(ast, {
		FlowchartNode: (node) => (node.id === nodeId ? null : node),
		Edge: (edge) =>
			edge.from === nodeId || edge.to === nodeId ? null : edge,
		Participant: (node) => (node.id === nodeId ? null : node),
		Message: (msg) =>
			msg.from === nodeId || msg.to === nodeId ? null : msg,
		State: (node) => (node.id === nodeId ? null : node),
		Transition: (trans) =>
			trans.from === nodeId || trans.to === nodeId ? null : trans,
	});
}

/**
 * Get all node IDs in a diagram
 *
 * @example
 * ```typescript
 * const ids = getAllNodeIds(flowchartDiagram);
 * console.log(ids); // ['A', 'B', 'C']
 * ```
 */
export function getAllNodeIds(diagram: FlowchartDiagramAST): string[] {
	const ids: string[] = [];

	function collectIds(
		body: readonly (FlowchartNodeAST | EdgeAST | { type: string })[],
	): void {
		for (const item of body) {
			if (item.type === "Node") {
				ids.push((item as FlowchartNodeAST).id);
			} else if (
				item.type === "Subgraph" &&
				"body" in item &&
				Array.isArray(item.body)
			) {
				collectIds(item.body as (FlowchartNodeAST | EdgeAST | { type: string })[]);
			}
		}
	}

	collectIds(diagram.body);
	return ids;
}

/**
 * Get all participant IDs in a sequence diagram
 *
 * @example
 * ```typescript
 * const ids = getAllParticipantIds(sequenceDiagram);
 * console.log(ids); // ['Alice', 'Bob', 'Server']
 * ```
 */
export function getAllParticipantIds(diagram: SequenceDiagramAST): string[] {
	const ids: string[] = [];

	for (const stmt of diagram.diagram.statements) {
		if (stmt.type === "participant" || stmt.type === "actor") {
			ids.push(stmt.id);
		}
	}

	return ids;
}

/**
 * Get all state IDs in a state diagram
 *
 * @example
 * ```typescript
 * const ids = getAllStateIds(stateDiagram);
 * console.log(ids); // ['[*]', 'Idle', 'Processing', 'Done']
 * ```
 */
export function getAllStateIds(diagram: StateDiagramAST): string[] {
	return diagram.diagram.states.map((state) => state.id);
}

/**
 * Validation result
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validate flowchart diagram
 * Checks for dangling edges, orphan nodes, etc.
 *
 * @example
 * ```typescript
 * const result = validateFlowchart(diagram);
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function validateFlowchart(
	diagram: FlowchartDiagramAST,
): ValidationResult {
	const nodeIds = new Set(getAllNodeIds(diagram));
	const errors: string[] = [];
	const warnings: string[] = [];

	function checkEdges(
		body: readonly (FlowchartNodeAST | EdgeAST | { type: string })[],
	): void {
		for (const item of body) {
			if (item.type === "Edge") {
				const edge = item as EdgeAST;

				if (!nodeIds.has(edge.from)) {
					errors.push(`Edge references non-existent node: ${edge.from}`);
				}
				if (!nodeIds.has(edge.to)) {
					errors.push(`Edge references non-existent node: ${edge.to}`);
				}
			} else if (
				item.type === "Subgraph" &&
				"body" in item &&
				Array.isArray(item.body)
			) {
				checkEdges(item.body as (FlowchartNodeAST | EdgeAST | { type: string })[]);
			}
		}
	}

	checkEdges(diagram.body);

	// Check for orphan nodes
	const connectedNodes = new Set<string>();

	function collectConnectedNodes(
		body: readonly (FlowchartNodeAST | EdgeAST | { type: string })[],
	): void {
		for (const item of body) {
			if (item.type === "Edge") {
				const edge = item as EdgeAST;
				connectedNodes.add(edge.from);
				connectedNodes.add(edge.to);
			} else if (
				item.type === "Subgraph" &&
				"body" in item &&
				Array.isArray(item.body)
			) {
				collectConnectedNodes(
					item.body as (FlowchartNodeAST | EdgeAST | { type: string })[],
				);
			}
		}
	}

	collectConnectedNodes(diagram.body);

	for (const nodeId of nodeIds) {
		if (!connectedNodes.has(nodeId)) {
			warnings.push(`Orphan node detected: ${nodeId}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate sequence diagram
 * Checks for undeclared participants, etc.
 *
 * @example
 * ```typescript
 * const result = validateSequence(diagram);
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function validateSequence(
	diagram: SequenceDiagramAST,
): ValidationResult {
	const participantIds = new Set(getAllParticipantIds(diagram));
	const errors: string[] = [];
	const warnings: string[] = [];

	function checkMessages(
		statements: readonly { type: string; from?: string; to?: string }[],
	): void {
		for (const stmt of statements) {
			if (stmt.type === "message") {
				if (stmt.from && !participantIds.has(stmt.from)) {
					errors.push(`Message references undeclared participant: ${stmt.from}`);
				}
				if (stmt.to && !participantIds.has(stmt.to)) {
					errors.push(`Message references undeclared participant: ${stmt.to}`);
				}
			} else if (
				(stmt.type === "loop" ||
					stmt.type === "alt" ||
					stmt.type === "opt" ||
					stmt.type === "par" ||
					stmt.type === "critical" ||
					stmt.type === "break") &&
				"statements" in stmt &&
				Array.isArray((stmt as { statements: unknown[] }).statements)
			) {
				checkMessages((stmt as { statements: { type: string; from?: string; to?: string }[] }).statements);
			}
		}
	}

	checkMessages(diagram.diagram.statements);

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate state diagram
 * Checks for dangling transitions, etc.
 *
 * @example
 * ```typescript
 * const result = validateState(diagram);
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function validateState(diagram: StateDiagramAST): ValidationResult {
	const stateIds = new Set(getAllStateIds(diagram));
	const errors: string[] = [];
	const warnings: string[] = [];

	for (const transition of diagram.diagram.transitions) {
		if (!stateIds.has(transition.from)) {
			errors.push(
				`Transition references non-existent state: ${transition.from}`,
			);
		}
		if (!stateIds.has(transition.to)) {
			errors.push(`Transition references non-existent state: ${transition.to}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
