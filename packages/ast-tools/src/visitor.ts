import type {
	FlowchartDiagramAST,
	FlowchartNodeAST,
	EdgeAST,
	SubgraphAST,
	SequenceDiagramAST,
	Participant,
	Message,
	Note,
	Loop,
	Alt,
	Opt,
	Par,
	Critical,
	Break,
	StateDiagramAST,
	State,
	Transition,
	StateNote,
	ClassDiagramAST,
	Class,
	ClassMember,
	Relationship,
	ERDiagramAST,
	Entity,
	Attribute,
	ERRelationship,
	GanttDiagramAST,
	GanttTask,
	GanttSection,
} from "@typermaid/parser";

/**
 * Base visitor interface for AST traversal
 * Implement any or all of these methods to transform AST nodes
 */
export interface ASTVisitor {
	// Flowchart
	visitFlowchartDiagram?(node: FlowchartDiagramAST): FlowchartDiagramAST;
	visitFlowchartNode?(node: FlowchartNodeAST): FlowchartNodeAST;
	visitEdge?(node: EdgeAST): EdgeAST;
	visitSubgraph?(node: SubgraphAST): SubgraphAST;

	// Sequence
	visitSequenceDiagram?(node: SequenceDiagramAST): SequenceDiagramAST;
	visitParticipant?(node: Participant): Participant;
	visitMessage?(node: Message): Message;
	visitNote?(node: Note): Note;
	visitLoop?(node: Loop): Loop;
	visitAlt?(node: Alt): Alt;
	visitOpt?(node: Opt): Opt;
	visitPar?(node: Par): Par;
	visitCritical?(node: Critical): Critical;
	visitBreak?(node: Break): Break;

	// State
	visitStateDiagram?(node: StateDiagramAST): StateDiagramAST;
	visitState?(node: State): State;
	visitTransition?(node: Transition): Transition;
	visitStateNote?(node: StateNote): StateNote;

	// Class
	visitClassDiagram?(node: ClassDiagramAST): ClassDiagramAST;
	visitClass?(node: Class): Class;
	visitClassMember?(node: ClassMember): ClassMember;
	visitRelationship?(node: Relationship): Relationship;

	// ER
	visitERDiagram?(node: ERDiagramAST): ERDiagramAST;
	visitEntity?(node: Entity): Entity;
	visitAttribute?(node: Attribute): Attribute;
	visitERRelationship?(node: ERRelationship): ERRelationship;

	// Gantt
	visitGanttDiagram?(node: GanttDiagramAST): GanttDiagramAST;
	visitGanttTask?(node: GanttTask): GanttTask;
	visitGanttSection?(node: GanttSection): GanttSection;
}

/**
 * AST Transformer with visitor pattern
 * Traverses AST and applies visitor transformations
 */
export class ASTTransformer {
	private visitors: ASTVisitor[] = [];

	/**
	 * Add a visitor to the transformation pipeline
	 */
	addVisitor(visitor: ASTVisitor): this {
		this.visitors.push(visitor);
		return this;
	}

	/**
	 * Transform AST with all registered visitors
	 */
	transform<T>(ast: T): T {
		let result = ast;

		for (const visitor of this.visitors) {
			result = this.visit(result, visitor);
		}

		return result;
	}

	private visit<T>(node: T, visitor: ASTVisitor): T {
		if (typeof node !== "object" || node === null) return node;

		const astNode = node as unknown as { type: string };

		switch (astNode.type) {
			case "FlowchartDiagram":
				return this.visitFlowchartDiagram(
					astNode as FlowchartDiagramAST,
					visitor,
				) as T;
			case "Node":
				return (
					visitor.visitFlowchartNode?.(astNode as FlowchartNodeAST) ?? astNode
				) as T;
			case "Edge":
				return (visitor.visitEdge?.(astNode as EdgeAST) ?? astNode) as T;
			case "Subgraph":
				return this.visitSubgraph(astNode as SubgraphAST, visitor) as T;

			case "SequenceDiagram":
				return this.visitSequenceDiagram(
					astNode as SequenceDiagramAST,
					visitor,
				) as T;
			case "Participant":
				return (
					visitor.visitParticipant?.(astNode as Participant) ?? astNode
				) as T;
			case "Message":
				return (visitor.visitMessage?.(astNode as Message) ?? astNode) as T;
			case "Note":
				return (visitor.visitNote?.(astNode as Note) ?? astNode) as T;
			case "Loop":
				return this.visitLoop(astNode as Loop, visitor) as T;
			case "Alt":
				return this.visitAlt(astNode as Alt, visitor) as T;
			case "Opt":
				return this.visitOpt(astNode as Opt, visitor) as T;
			case "Par":
				return this.visitPar(astNode as Par, visitor) as T;
			case "Critical":
				return this.visitCritical(astNode as Critical, visitor) as T;
			case "Break":
				return (visitor.visitBreak?.(astNode as Break) ?? astNode) as T;

			case "StateDiagram":
				return this.visitStateDiagram(
					astNode as StateDiagramAST,
					visitor,
				) as T;
			case "State":
				return (visitor.visitState?.(astNode as State) ?? astNode) as T;
			case "Transition":
				return (
					visitor.visitTransition?.(astNode as Transition) ?? astNode
				) as T;
			case "StateNote":
				return (
					visitor.visitStateNote?.(astNode as StateNote) ?? astNode
				) as T;

			case "ClassDiagram":
				return this.visitClassDiagram(
					astNode as ClassDiagramAST,
					visitor,
				) as T;
			case "Class":
				return this.visitClass(astNode as Class, visitor) as T;
			case "ClassMember":
				return (
					visitor.visitClassMember?.(astNode as ClassMember) ?? astNode
				) as T;
			case "Relationship":
				return (
					visitor.visitRelationship?.(astNode as Relationship) ?? astNode
				) as T;

			case "ERDiagram":
				return this.visitERDiagram(astNode as ERDiagramAST, visitor) as T;
			case "Entity":
				return this.visitEntity(astNode as Entity, visitor) as T;
			case "Attribute":
				return (
					visitor.visitAttribute?.(astNode as Attribute) ?? astNode
				) as T;
			case "ERRelationship":
				return (
					visitor.visitERRelationship?.(astNode as ERRelationship) ?? astNode
				) as T;

			case "GanttDiagram":
				return this.visitGanttDiagram(
					astNode as GanttDiagramAST,
					visitor,
				) as T;
			case "GanttTask":
				return (
					visitor.visitGanttTask?.(astNode as GanttTask) ?? astNode
				) as T;
			case "GanttSection":
				return (
					visitor.visitGanttSection?.(astNode as GanttSection) ?? astNode
				) as T;

			default:
				return astNode as T;
		}
	}

	private visitFlowchartDiagram(
		node: FlowchartDiagramAST,
		visitor: ASTVisitor,
	): FlowchartDiagramAST {
		const transformedBody = node.body.map((item) =>
			this.visit(item, visitor),
		) as (FlowchartNodeAST | EdgeAST | SubgraphAST)[];

		const transformed: FlowchartDiagramAST = {
			...node,
			body: transformedBody,
		};

		return visitor.visitFlowchartDiagram?.(transformed) ?? transformed;
	}

	private visitSubgraph(node: SubgraphAST, visitor: ASTVisitor): SubgraphAST {
		const transformedBody = node.body.map((item) =>
			this.visit(item, visitor),
		) as (FlowchartNodeAST | EdgeAST | SubgraphAST)[];

		const transformed: SubgraphAST = {
			...node,
			body: transformedBody,
		};

		return visitor.visitSubgraph?.(transformed) ?? transformed;
	}

	private visitSequenceDiagram(
		node: SequenceDiagramAST,
		visitor: ASTVisitor,
	): SequenceDiagramAST {
		const transformedStatements = node.diagram.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformed: SequenceDiagramAST = {
			...node,
			diagram: {
				...node.diagram,
				statements: transformedStatements,
			},
		};

		return visitor.visitSequenceDiagram?.(transformed) ?? transformed;
	}

	private visitLoop(node: Loop, visitor: ASTVisitor): Loop {
		const transformedStatements = node.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformed: Loop = {
			...node,
			statements: transformedStatements,
		};

		return visitor.visitLoop?.(transformed) ?? transformed;
	}

	private visitAlt(node: Alt, visitor: ASTVisitor): Alt {
		const transformedStatements = node.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformedElseBlocks = node.elseBlocks.map((block) => ({
			...block,
			statements: block.statements.map((stmt) => this.visit(stmt, visitor)),
		}));

		const transformed: Alt = {
			...node,
			statements: transformedStatements,
			elseBlocks: transformedElseBlocks,
		};

		return visitor.visitAlt?.(transformed) ?? transformed;
	}

	private visitOpt(node: Opt, visitor: ASTVisitor): Opt {
		const transformedStatements = node.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformed: Opt = {
			...node,
			statements: transformedStatements,
		};

		return visitor.visitOpt?.(transformed) ?? transformed;
	}

	private visitPar(node: Par, visitor: ASTVisitor): Par {
		const transformedStatements = node.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformedAndBlocks = node.andBlocks.map((block) => ({
			...block,
			statements: block.statements.map((stmt) => this.visit(stmt, visitor)),
		}));

		const transformed: Par = {
			...node,
			statements: transformedStatements,
			andBlocks: transformedAndBlocks,
		};

		return visitor.visitPar?.(transformed) ?? transformed;
	}

	private visitCritical(node: Critical, visitor: ASTVisitor): Critical {
		const transformedStatements = node.statements.map((stmt) =>
			this.visit(stmt, visitor),
		);

		const transformed: Critical = {
			...node,
			statements: transformedStatements,
		};

		return visitor.visitCritical?.(transformed) ?? transformed;
	}

	private visitStateDiagram(
		node: StateDiagramAST,
		visitor: ASTVisitor,
	): StateDiagramAST {
		const transformedStates = node.diagram.states.map((state) =>
			this.visit(state, visitor),
		);

		const transformedTransitions = node.diagram.transitions.map((transition) =>
			this.visit(transition, visitor),
		);

		const transformedNotes = node.diagram.notes?.map((note) =>
			this.visit(note, visitor),
		);

		const transformed: StateDiagramAST = {
			...node,
			diagram: {
				...node.diagram,
				states: transformedStates,
				transitions: transformedTransitions,
				notes: transformedNotes,
			},
		};

		return visitor.visitStateDiagram?.(transformed) ?? transformed;
	}

	private visitClassDiagram(
		node: ClassDiagramAST,
		visitor: ASTVisitor,
	): ClassDiagramAST {
		const transformedClasses = node.diagram.classes.map((cls) =>
			this.visit(cls, visitor),
		);

		const transformedRelationships = node.diagram.relations.map((rel) =>
			this.visit(rel, visitor),
		);

		const transformed: ClassDiagramAST = {
			...node,
			diagram: {
				...node.diagram,
				classes: transformedClasses,
				relations: transformedRelationships,
			},
		};

		return visitor.visitClassDiagram?.(transformed) ?? transformed;
	}

	private visitClass(node: Class, visitor: ASTVisitor): Class {
		const transformedMembers = node.members.map((member) =>
			this.visit(member, visitor),
		);

		const transformed: Class = {
			...node,
			members: transformedMembers,
		};

		return visitor.visitClass?.(transformed) ?? transformed;
	}

	private visitERDiagram(
		node: ERDiagramAST,
		visitor: ASTVisitor,
	): ERDiagramAST {
		const transformedEntities = node.diagram.entities.map((entity) =>
			this.visit(entity, visitor),
		);

		const transformedRelationships = node.diagram.relationships.map((rel) =>
			this.visit(rel, visitor),
		);

		const transformed: ERDiagramAST = {
			...node,
			diagram: {
				...node.diagram,
				entities: transformedEntities,
				relationships: transformedRelationships,
			},
		};

		return visitor.visitERDiagram?.(transformed) ?? transformed;
	}

	private visitEntity(node: Entity, visitor: ASTVisitor): Entity {
		const transformedAttributes = node.attributes.map((attr) =>
			this.visit(attr, visitor),
		);

		const transformed: Entity = {
			...node,
			attributes: transformedAttributes,
		};

		return visitor.visitEntity?.(transformed) ?? transformed;
	}

	private visitGanttDiagram(
		node: GanttDiagramAST,
		visitor: ASTVisitor,
	): GanttDiagramAST {
		const transformedSections = node.diagram.sections.map((section) =>
			this.visit(section, visitor),
		);

		const transformed: GanttDiagramAST = {
			...node,
			diagram: {
				...node.diagram,
				sections: transformedSections,
			},
		};

		return visitor.visitGanttDiagram?.(transformed) ?? transformed;
	}
}
