import type {
	ProgramAST,
	FlowchartNodeAST,
	EdgeAST,
	SubgraphAST,
	Participant,
	Message,
	Note,
	Loop,
	Alt,
	Opt,
	Par,
	Critical,
	Break,
	State,
	Transition,
	StateNote,
	Class,
	ClassMember,
	Relationship,
	Entity,
	Attribute,
	ERRelationship,
	GanttTask,
	GanttSection,
} from "@typermaid/parser";

/**
 * Transform functions for each AST node type
 * Return the transformed node, or null to remove it
 */
export interface TransformFunctions {
	FlowchartNode?: (node: FlowchartNodeAST) => FlowchartNodeAST | null;
	Edge?: (node: EdgeAST) => EdgeAST | null;
	Subgraph?: (node: SubgraphAST) => SubgraphAST | null;
	Participant?: (node: Participant) => Participant | null;
	Message?: (node: Message) => Message | null;
	Note?: (node: Note) => Note | null;
	Loop?: (node: Loop) => Loop | null;
	Alt?: (node: Alt) => Alt | null;
	Opt?: (node: Opt) => Opt | null;
	Par?: (node: Par) => Par | null;
	Critical?: (node: Critical) => Critical | null;
	Break?: (node: Break) => Break | null;
	State?: (node: State) => State | null;
	Transition?: (node: Transition) => Transition | null;
	StateNote?: (node: StateNote) => StateNote | null;
	Class?: (node: Class) => Class | null;
	ClassMember?: (node: ClassMember) => ClassMember | null;
	Relationship?: (node: Relationship) => Relationship | null;
	Entity?: (node: Entity) => Entity | null;
	Attribute?: (node: Attribute) => Attribute | null;
	ERRelationship?: (node: ERRelationship) => ERRelationship | null;
	GanttTask?: (node: GanttTask) => GanttTask | null;
	GanttSection?: (node: GanttSection) => GanttSection | null;
}

/**
 * Transform AST with function-based API
 * Each transform function can modify or remove nodes
 *
 * @example
 * ```typescript
 * const transformed = transformAST(ast, {
 *   FlowchartNode: (node) => ({ ...node, label: node.label.toUpperCase() }),
 *   Edge: (edge) => edge.label ? { ...edge, label: edge.label.toLowerCase() } : edge,
 * });
 * ```
 */
export function transformAST<T extends ProgramAST>(
	ast: T,
	transforms: TransformFunctions,
): T {
	return walkAST(ast, transforms);
}

function walkAST<T>(node: T, transforms: TransformFunctions): T {
	if (typeof node !== "object" || node === null) return node;

	const astNode = node as unknown as { type: string };

	// Apply transform if exists
	let result: unknown = astNode;

	switch (astNode.type) {
		case "Node":
			result = transforms.FlowchartNode?.(astNode as FlowchartNodeAST) ?? astNode;
			break;
		case "Edge":
			result = transforms.Edge?.(astNode as EdgeAST) ?? astNode;
			break;
		case "Subgraph":
			result = transforms.Subgraph?.(astNode as SubgraphAST) ?? astNode;
			break;
		case "Participant":
			result = transforms.Participant?.(astNode as Participant) ?? astNode;
			break;
		case "Message":
			result = transforms.Message?.(astNode as Message) ?? astNode;
			break;
		case "Note":
			result = transforms.Note?.(astNode as Note) ?? astNode;
			break;
		case "Loop":
			result = transforms.Loop?.(astNode as Loop) ?? astNode;
			break;
		case "Alt":
			result = transforms.Alt?.(astNode as Alt) ?? astNode;
			break;
		case "Opt":
			result = transforms.Opt?.(astNode as Opt) ?? astNode;
			break;
		case "Par":
			result = transforms.Par?.(astNode as Par) ?? astNode;
			break;
		case "Critical":
			result = transforms.Critical?.(astNode as Critical) ?? astNode;
			break;
		case "Break":
			result = transforms.Break?.(astNode as Break) ?? astNode;
			break;
		case "State":
			result = transforms.State?.(astNode as State) ?? astNode;
			break;
		case "Transition":
			result = transforms.Transition?.(astNode as Transition) ?? astNode;
			break;
		case "StateNote":
			result = transforms.StateNote?.(astNode as StateNote) ?? astNode;
			break;
		case "Class":
			result = transforms.Class?.(astNode as Class) ?? astNode;
			break;
		case "ClassMember":
			result = transforms.ClassMember?.(astNode as ClassMember) ?? astNode;
			break;
		case "Relationship":
			result = transforms.Relationship?.(astNode as Relationship) ?? astNode;
			break;
		case "Entity":
			result = transforms.Entity?.(astNode as Entity) ?? astNode;
			break;
		case "Attribute":
			result = transforms.Attribute?.(astNode as Attribute) ?? astNode;
			break;
		case "ERRelationship":
			result =
				transforms.ERRelationship?.(astNode as ERRelationship) ?? astNode;
			break;
		case "GanttTask":
			result = transforms.GanttTask?.(astNode as GanttTask) ?? astNode;
			break;
		case "GanttSection":
			result = transforms.GanttSection?.(astNode as GanttSection) ?? astNode;
			break;
		default:
			result = astNode;
	}

	// If transform returned null, remove the node
	if (result === null) return null as T;

	// Recursively walk children
	if (
		typeof result === "object" &&
		result !== null &&
		"body" in result &&
		Array.isArray((result as { body: unknown[] }).body)
	) {
		const withBody = result as { body: unknown[] };
		return {
			...withBody,
			body: withBody.body
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"statements" in result &&
		Array.isArray((result as { statements: unknown[] }).statements)
	) {
		const withStatements = result as { statements: unknown[] };
		return {
			...withStatements,
			statements: withStatements.statements
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"states" in result &&
		Array.isArray((result as { states: unknown[] }).states)
	) {
		const withStates = result as { states: unknown[]; transitions?: unknown[] };
		return {
			...withStates,
			states: withStates.states
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
			transitions: withStates.transitions
				? withStates.transitions
						.map((item) => walkAST(item, transforms))
						.filter((item) => item !== null)
				: undefined,
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"classes" in result &&
		Array.isArray((result as { classes: unknown[] }).classes)
	) {
		const withClasses = result as { classes: unknown[]; relationships: unknown[] };
		return {
			...withClasses,
			classes: withClasses.classes
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
			relationships: withClasses.relationships
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"entities" in result &&
		Array.isArray((result as { entities: unknown[] }).entities)
	) {
		const withEntities = result as { entities: unknown[]; relationships: unknown[] };
		return {
			...withEntities,
			entities: withEntities.entities
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
			relationships: withEntities.relationships
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"sections" in result &&
		Array.isArray((result as { sections: unknown[] }).sections)
	) {
		const withSections = result as { sections: unknown[] };
		return {
			...withSections,
			sections: withSections.sections
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"members" in result &&
		Array.isArray((result as { members: unknown[] }).members)
	) {
		const withMembers = result as { members: unknown[] };
		return {
			...withMembers,
			members: withMembers.members
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"attributes" in result &&
		Array.isArray((result as { attributes: unknown[] }).attributes)
	) {
		const withAttributes = result as { attributes: unknown[] };
		return {
			...withAttributes,
			attributes: withAttributes.attributes
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	if (
		typeof result === "object" &&
		result !== null &&
		"tasks" in result &&
		Array.isArray((result as { tasks: unknown[] }).tasks)
	) {
		const withTasks = result as { tasks: unknown[] };
		return {
			...withTasks,
			tasks: withTasks.tasks
				.map((item) => walkAST(item, transforms))
				.filter((item) => item !== null),
		} as T;
	}

	return result as T;
}

/**
 * Find all nodes of specific type
 *
 * @example
 * ```typescript
 * const nodes = findNodes(ast, 'Node');
 * console.log(nodes); // All FlowchartNode nodes
 * ```
 */
export function findNodes<T extends { type: string }>(
	ast: ProgramAST,
	type: T["type"],
): T[] {
	const results: T[] = [];

	function collect(node: unknown): unknown {
		if (typeof node !== "object" || node === null) return node;

		const astNode = node as { type: string };

		if (astNode.type === type) {
			results.push(astNode as T);
		}

		// Recursively search in children
		if ("body" in astNode && Array.isArray((astNode as { body: unknown[] }).body)) {
			for (const item of (astNode as { body: unknown[] }).body) {
				collect(item);
			}
		}

		if (
			"statements" in astNode &&
			Array.isArray((astNode as { statements: unknown[] }).statements)
		) {
			for (const item of (astNode as { statements: unknown[] }).statements) {
				collect(item);
			}
		}

		if ("states" in astNode && Array.isArray((astNode as { states: unknown[] }).states)) {
			for (const item of (astNode as { states: unknown[] }).states) {
				collect(item);
			}
		}

		if (
			"classes" in astNode &&
			Array.isArray((astNode as { classes: unknown[] }).classes)
		) {
			for (const item of (astNode as { classes: unknown[] }).classes) {
				collect(item);
			}
		}

		if (
			"entities" in astNode &&
			Array.isArray((astNode as { entities: unknown[] }).entities)
		) {
			for (const item of (astNode as { entities: unknown[] }).entities) {
				collect(item);
			}
		}

		if (
			"sections" in astNode &&
			Array.isArray((astNode as { sections: unknown[] }).sections)
		) {
			for (const item of (astNode as { sections: unknown[] }).sections) {
				collect(item);
			}
		}

		return node;
	}

	collect(ast);
	return results;
}

/**
 * Replace node by ID (for nodes with id property)
 *
 * @example
 * ```typescript
 * const updated = replaceNodeById(ast, 'A', { label: 'Updated Label' });
 * ```
 */
export function replaceNodeById<T extends { id: string }>(
	ast: ProgramAST,
	id: string,
	newNode: Partial<T>,
): ProgramAST {
	return transformAST(ast, {
		FlowchartNode: (node) =>
			node.id === id ? { ...node, ...newNode } : node,
		Participant: (node) =>
			node.id === id ? { ...node, ...newNode } : node,
		State: (node) =>
			node.id === id ? { ...node, ...newNode } : node,
	} as TransformFunctions);
}

/**
 * Replace node by name (for nodes with name property)
 *
 * @example
 * ```typescript
 * const updated = replaceNodeByName(ast, 'User', { members: [...newMembers] });
 * ```
 */
export function replaceNodeByName<T extends { name: string }>(
	ast: ProgramAST,
	name: string,
	newNode: Partial<T>,
): ProgramAST {
	return transformAST(ast, {
		Class: (node) =>
			node.name === name ? { ...node, ...newNode } : node,
		Entity: (node) =>
			node.name === name ? { ...node, ...newNode } : node,
	} as TransformFunctions);
}
