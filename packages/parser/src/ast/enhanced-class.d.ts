import type { ClassDefinition, ClassDiagram, ClassID, ClassRelationType, ClassVisibility } from '@typermaid/core';
import type { ClassDiagramAST } from './nodes.js';
/**
 * Enhanced ClassDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export declare class EnhancedClassDiagramAST implements ClassDiagramAST {
    type: 'ClassDiagram';
    diagram: ClassDiagram;
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
    constructor(ast: ClassDiagramAST);
    /**
     * Add a class to the diagram
     * @param name - Class name (used as ID)
     * @returns ClassID for method chaining with relationships
     */
    addClass(name: string): ClassID;
    /**
     * Add an attribute to a class
     * @param classId - Class to add attribute to
     * @param name - Attribute name
     * @param type - Attribute type
     * @param visibility - Visibility (+, -, #, ~)
     * @returns this for method chaining
     */
    addAttribute(classId: ClassID, name: string, type: string, visibility?: ClassVisibility): this;
    /**
     * Add a method to a class
     * @param classId - Class to add method to
     * @param name - Method name
     * @param returnType - Return type
     * @param parameters - Method parameters
     * @param visibility - Visibility (+, -, #, ~)
     * @returns this for method chaining
     */
    addMethod(classId: ClassID, name: string, returnType?: string, parameters?: string[], visibility?: ClassVisibility): this;
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
    addRelation(from: ClassID, to: ClassID, type: ClassRelationType, label?: string, cardinalityFrom?: string, cardinalityTo?: string): this;
    /**
     * Convenient inheritance method
     * @param child - Child class
     * @param parent - Parent class
     * @returns this for method chaining
     */
    addInheritance(child: ClassID, parent: ClassID): this;
    /**
     * Convenient implementation method (interface realization)
     * @param implementer - Implementing class
     * @param interface_ - Interface being implemented
     * @returns this for method chaining
     */
    addImplementation(implementer: ClassID, interface_: ClassID): this;
    /**
     * Convenient association method
     * @param from - Source class
     * @param to - Target class
     * @param label - Optional association label
     * @param cardinalityFrom - Cardinality at source
     * @param cardinalityTo - Cardinality at target
     * @returns this for method chaining
     */
    addAssociation(from: ClassID, to: ClassID, label?: string, cardinalityFrom?: string, cardinalityTo?: string): this;
    /**
     * Get a class by name
     */
    getClass(name: string): ClassDefinition | undefined;
    /**
     * Get all class names
     */
    getAllClasses(): string[];
    /**
     * Find classes by pattern
     */
    findClasses(pattern: string): ClassDefinition[];
    /**
     * Replace class name throughout the diagram
     */
    replaceClass(oldName: string, newName: string): this;
    /**
     * Generate Mermaid Class diagram code
     * Simple implementation without external dependencies
     */
    asCode(): string;
    /**
     * Build final ClassDiagram with asCode capability
     */
    build(): ClassDiagram & {
        asCode(): string;
    };
    /**
     * Get class count
     */
    getClassCount(): number;
    /**
     * Get relationship count
     */
    getRelationshipCount(): number;
    /**
     * Check if class exists
     */
    hasClass(classId: ClassID): boolean;
}
//# sourceMappingURL=enhanced-class.d.ts.map