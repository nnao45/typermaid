import type { EntityID, ERDiagram, EREntity } from '@typermaid/core';
import type { ERDiagramAST } from './nodes.js';
/**
 * Enhanced ERDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export declare class EnhancedERDiagramAST implements ERDiagramAST {
    type: 'ERDiagram';
    diagram: ERDiagram;
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
    constructor(ast: ERDiagramAST);
    /**
     * Add an entity to the ER diagram
     * @param id - Entity identifier
     * @returns EntityID for method chaining with relationships
     */
    addEntity(id: string): EntityID;
    /**
     * Add an attribute to an entity
     * @param entityId - Entity to add attribute to
     * @param name - Attribute name
     * @param type - Attribute type (default: 'string')
     * @param key - Attribute key type ('PK', 'FK', 'UK')
     * @returns this for method chaining
     */
    addAttribute(entityId: EntityID, name: string, type?: string, key?: 'PK' | 'FK' | 'UK'): this;
    /**
     * Add a relationship between two entities
     * @param fromEntityId - Source entity
     * @param toEntityId - Target entity
     * @param cardinality - Relationship cardinality ('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many')
     * @param label - Optional relationship label
     * @param identifying - Whether it's an identifying relationship
     * @returns this for method chaining
     */
    addRelationship(fromEntityId: EntityID, toEntityId: EntityID, cardinality: string, label?: string, identifying?: boolean): this;
    /**
     * Get an entity by ID
     */
    getEntity(id: EntityID): EREntity | undefined;
    /**
     * Get all entity IDs
     */
    getAllEntities(): EntityID[];
    /**
     * Replace entity ID throughout the diagram
     */
    replaceEntity(oldId: EntityID, newId: EntityID): this;
    /**
     * Generate Mermaid ER diagram code
     * Simple implementation without external dependencies
     */
    asCode(): string;
    /**
     * Convert cardinality enum to Mermaid symbol
     */
    private cardinalityToSymbol;
    /**
     * Build final ERDiagram with asCode capability
     */
    build(): ERDiagram & {
        asCode(): string;
    };
}
//# sourceMappingURL=enhanced-er.d.ts.map