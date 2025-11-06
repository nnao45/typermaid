import type {
	ClassDiagramAST,
	Class,
	ClassMember,
	Relationship,
} from "@typermaid/parser";

/**
 * Generate Mermaid code from Class Diagram AST
 */
export function generateClass(ast: ClassDiagramAST): string {
	const lines: string[] = [];

	lines.push("classDiagram");

	// Classes
	for (const cls of ast.diagram.classes) {
		lines.push(...generateClassDefinition(cls));
	}

	// Relationships
	for (const rel of ast.diagram.relations) {
		lines.push(generateRelationship(rel));
	}

	return lines.join("\n");
}

function generateClassDefinition(cls: Class): string[] {
	const lines: string[] = [];

	// Skip class declaration if no members, annotation, or generics
	const hasMembers = cls.members && cls.members.length > 0;
	const hasAnnotation = cls.annotation;
	const hasGenerics = cls.generics;

	if (!hasMembers && !hasAnnotation && !hasGenerics) {
		return lines;
	}

	// Class declaration with annotation
	if (hasAnnotation) {
		lines.push(`  class ${cls.name}`);
		lines.push(`  <<${hasAnnotation}>> ${cls.name}`);
	}

	// Generic types
	if (hasGenerics) {
		lines.push(`  class ${cls.name}~${hasGenerics}~`);
	}

	// Members
	if (hasMembers) {
		lines.push(`  class ${cls.name} {`);

		for (const member of cls.members) {
			lines.push(`    ${generateMember(member)}`);
		}

		lines.push(`  }`);
	}

	return lines;
}

function generateMember(member: ClassMember): string {
	let line = "";

	// Visibility
	if (member.visibility) {
		line += member.visibility;
	}

	// Static/Abstract modifiers
	const modifiers: string[] = [];
	if (member.isStatic) {
		modifiers.push("static");
	}
	if (member.isAbstract) {
		modifiers.push("abstract");
	}

	// Member type (attribute or method)
	if (member.type === "attribute") {
		// Attribute: +String name
		const returnType = member.returnType || "";
		line += `${returnType} ${member.name}`;
	} else {
		// Method: +void process(String data)
		const returnType = member.returnType || "void";
		const params = member.parameters || "";
		line += `${returnType} ${member.name}(${params})`;
	}

	// Add modifiers as suffix
	if (modifiers.length > 0) {
		line += `$`;
	}

	return line;
}

function generateRelationship(rel: Relationship): string {
	let line = `  ${rel.from} `;

	// Cardinality from
	if (rel.cardinalityFrom) {
		line += `"${rel.cardinalityFrom}" `;
	}

	// Relation type
	line += rel.relationType;

	// Cardinality to
	if (rel.cardinalityTo) {
		line += ` "${rel.cardinalityTo}"`;
	}

	line += ` ${rel.to}`;

	// Label
	if (rel.label) {
		line += ` : ${rel.label}`;
	}

	return line;
}
