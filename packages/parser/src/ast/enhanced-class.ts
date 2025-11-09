import type {
  ClassDefinition,
  ClassDiagram,
  ClassID,
  ClassMember,
  ClassRelationType,
  ClassVisibility,
} from '@typermaid/core';
import { createClassID } from '@typermaid/core';
import type { ClassDiagramAST } from './nodes.js';

/**
 * Enhanced ClassDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedClassDiagramAST implements ClassDiagramAST {
  // AST properties
  type: 'ClassDiagram' = 'ClassDiagram';
  diagram: ClassDiagram;
  loc?:
    | {
        start: { line: number; column: number };
        end: { line: number; column: number };
      }
    | undefined;

  constructor(ast: ClassDiagramAST) {
    // Copy AST properties
    this.diagram = { ...ast.diagram };
    this.loc = ast.loc;

    // Initialize diagram if not present
    if (!this.diagram.classes) {
      this.diagram.classes = [];
    }
    if (!this.diagram.relations) {
      this.diagram.relations = [];
    }
    if (!this.diagram.namespaces) {
      this.diagram.namespaces = [];
    }
  }

  /**
   * Add a class to the diagram
   * @param name - Class name (used as ID)
   * @param label - Display label
   * @returns ClassID for method chaining with relationships
   */
  addClass(name: string, label?: string): ClassID {
    const classId = createClassID(name);

    // Check if class already exists
    const existingClass = this.diagram.classes.find((c) => c.name === name);
    if (!existingClass) {
      this.diagram.classes.push({
        id: classId,
        name,
        members: [],
      });
    }

    return classId;
  }

  /**
   * Add an attribute to a class
   * @param classId - Class to add attribute to
   * @param name - Attribute name
   * @param type - Attribute type
   * @param visibility - Visibility (+, -, #, ~)
   * @returns this for method chaining
   */
  addAttribute(
    classId: ClassID,
    name: string,
    type: string,
    visibility: ClassVisibility = '+'
  ): this {
    const className = classId as string;
    const cls = this.diagram.classes.find((c) => c.name === className);
    if (cls) {
      const existingMember = cls.members.find((m) => m.name === name && m.type === 'attribute');
      if (!existingMember) {
        cls.members.push({
          type: 'attribute',
          name,
          returnType: type,
          visibility,
          isStatic: false,
          isAbstract: false,
        });
      }
    }

    return this;
  }

  /**
   * Add a method to a class
   * @param classId - Class to add method to
   * @param name - Method name
   * @param returnType - Return type
   * @param parameters - Method parameters
   * @param visibility - Visibility (+, -, #, ~)
   * @returns this for method chaining
   */
  addMethod(
    classId: ClassID,
    name: string,
    returnType: string = 'void',
    parameters: string[] = [],
    visibility: ClassVisibility = '+'
  ): this {
    const className = classId as string;
    const cls = this.diagram.classes.find((c) => c.name === className);
    if (cls) {
      const existingMember = cls.members.find((m) => m.name === name && m.type === 'method');
      if (!existingMember) {
        cls.members.push({
          type: 'method',
          name,
          returnType,
          parameters: parameters.join(', '),
          visibility,
          isStatic: false,
          isAbstract: false,
        });
      }
    }

    return this;
  }

  /**
   * Add a relationship between classes
   * @param from - Source class
   * @param to - Target class
   * @param type - Relationship type (<|--, *--, o--, -->, --, ..|>, ..>, ..)
   * @param label - Optional relationship label
   * @param cardinalityFrom - Cardinality at source (e.g., "1", "0..1", "*")
   * @param cardinalityTo - Cardinality at target (e.g., "1", "0..1", "*")
   * @returns this for method chaining
   */
  addRelation(
    from: ClassID,
    to: ClassID,
    type: ClassRelationType,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    this.diagram.relations.push({
      from,
      to,
      relationType: type,
      label: label ? { content: label, type: 'text' } : undefined,
      cardinalityFrom,
      cardinalityTo,
    });

    return this;
  }

  /**
   * Convenient inheritance method
   * @param child - Child class
   * @param parent - Parent class
   * @returns this for method chaining
   */
  addInheritance(child: ClassID, parent: ClassID): this {
    return this.addRelation(child, parent, '<|--');
  }

  /**
   * Convenient implementation method (interface realization)
   * @param implementer - Implementing class
   * @param interface_ - Interface being implemented
   * @returns this for method chaining
   */
  addImplementation(implementer: ClassID, interface_: ClassID): this {
    return this.addRelation(implementer, interface_, '..|>');
  }

  /**
   * Convenient association method
   * @param from - Source class
   * @param to - Target class
   * @param label - Optional association label
   * @param cardinalityFrom - Cardinality at source
   * @param cardinalityTo - Cardinality at target
   * @returns this for method chaining
   */
  addAssociation(
    from: ClassID,
    to: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addRelation(from, to, '-->', label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Get a class by name
   */
  getClass(name: string): ClassDefinition | undefined {
    return this.diagram.classes.find((c) => c.name === name);
  }

  /**
   * Get all class names
   */
  getAllClasses(): string[] {
    return this.diagram.classes.map((c) => c.name);
  }

  /**
   * Find classes by pattern
   */
  findClasses(pattern: string): ClassDefinition[] {
    return this.diagram.classes.filter((c) => c.name.includes(pattern));
  }

  /**
   * Replace class name throughout the diagram
   */
  replaceClass(oldName: string, newName: string): this {
    // Replace in classes
    for (const cls of this.diagram.classes) {
      if (cls.name === oldName) {
        cls.name = newName;
        cls.id = createClassID(newName);
      }
    }

    // Replace in relations
    const newClassId = createClassID(newName);
    for (const rel of this.diagram.relations) {
      if ((rel.from as string) === oldName) {
        rel.from = newClassId;
      }
      if ((rel.to as string) === oldName) {
        rel.to = newClassId;
      }
    }

    return this;
  }

  /**
   * Generate Mermaid Class diagram code
   * Simple implementation without external dependencies
   */
  asCode(): string {
    const lines: string[] = ['classDiagram'];

    // Generate classes with members
    for (const cls of this.diagram.classes) {
      // Class declaration with annotation if present
      if (cls.annotation) {
        lines.push(`    class ${cls.name}`);
        lines.push(`    <<${cls.annotation}>> ${cls.name}`);
      } else {
        lines.push(`    class ${cls.name}`);
      }

      // Add generics if present
      if (cls.generics) {
        lines.push(`    ${cls.name} : ${cls.generics}`);
      }

      // Add members
      for (const member of cls.members) {
        const visibility = member.visibility || '+';
        const isStatic = member.isStatic ? '$' : '';
        const isAbstract = member.isAbstract ? '*' : '';

        if (member.type === 'attribute') {
          const type = member.returnType || 'any';
          lines.push(`    ${cls.name} : ${isStatic}${isAbstract}${visibility}${member.name} ${type}`);
        } else if (member.type === 'method') {
          const returnType = member.returnType || 'void';
          const params = member.parameters || '';
          lines.push(
            `    ${cls.name} : ${isStatic}${isAbstract}${visibility}${member.name}(${params}) ${returnType}`
          );
        }
      }
    }

    // Generate relationships
    for (const rel of this.diagram.relations) {
      const fromCard = rel.cardinalityFrom ? `"${rel.cardinalityFrom}" ` : '';
      const toCard = rel.cardinalityTo ? ` "${rel.cardinalityTo}"` : '';
      const label = rel.label
        ? ` : ${typeof rel.label === 'string' ? rel.label : rel.label.content}`
        : '';

      lines.push(`    ${rel.from} ${fromCard}${rel.relationType}${toCard} ${rel.to}${label}`);
    }

    return lines.join('\n');
  }

  /**
   * Build final ClassDiagram with asCode capability
   */
  build(): ClassDiagram & { asCode(): string } {
    const diagram = { ...this.diagram };

    return {
      ...diagram,
      asCode: () => this.asCode(),
    };
  }

  /**
   * Get class count
   */
  getClassCount(): number {
    return this.diagram.classes.length;
  }

  /**
   * Get relationship count
   */
  getRelationshipCount(): number {
    return this.diagram.relations.length;
  }

  /**
   * Check if class exists
   */
  hasClass(classId: ClassID): boolean {
    const className = classId as string;
    return this.diagram.classes.some((c) => c.name === className);
  }
}
