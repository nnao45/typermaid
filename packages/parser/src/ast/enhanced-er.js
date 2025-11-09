import { createEntityID } from '@typermaid/core';
/**
 * Enhanced ERDiagramAST with integrated Builder and CodeGen capabilities
 * Uses class-based approach for better type safety
 */
export class EnhancedERDiagramAST {
    // AST properties
    type = 'ERDiagram';
    diagram;
    loc;
    constructor(ast) {
        // Copy AST properties
        this.diagram = { ...ast.diagram };
        this.loc = ast.loc;
        // Initialize diagram if not present
        if (!this.diagram.entities) {
            this.diagram.entities = [];
        }
        if (!this.diagram.relationships) {
            this.diagram.relationships = [];
        }
    }
    /**
     * Add an entity to the ER diagram
     * @param id - Entity identifier
     * @returns EntityID for method chaining with relationships
     */
    addEntity(id) {
        const entityId = createEntityID(id);
        // Check if entity already exists
        const existingEntity = this.diagram.entities.find((e) => e.name === entityId);
        if (!existingEntity) {
            this.diagram.entities.push({
                name: entityId,
                attributes: [],
            });
        }
        return entityId;
    }
    /**
     * Add an attribute to an entity
     * @param entityId - Entity to add attribute to
     * @param name - Attribute name
     * @param type - Attribute type (default: 'string')
     * @param key - Attribute key type ('PK', 'FK', 'UK')
     * @returns this for method chaining
     */
    addAttribute(entityId, name, type, key) {
        const entity = this.diagram.entities.find((e) => e.name === entityId);
        if (entity) {
            const existingAttr = entity.attributes.find((a) => a.name === name);
            if (!existingAttr) {
                entity.attributes.push({
                    name,
                    type: type || 'string',
                    key,
                });
            }
        }
        return this;
    }
    /**
     * Add a relationship between two entities
     * @param fromEntityId - Source entity
     * @param toEntityId - Target entity
     * @param cardinality - Relationship cardinality ('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many')
     * @param label - Optional relationship label
     * @param identifying - Whether it's an identifying relationship
     * @returns this for method chaining
     */
    addRelationship(fromEntityId, toEntityId, cardinality, label, identifying) {
        // Map string cardinality to ER cardinality enums
        let fromCard = 'EXACTLY_ONE';
        let toCard = 'EXACTLY_ONE';
        switch (cardinality) {
            case 'one-to-many':
                fromCard = 'EXACTLY_ONE';
                toCard = 'ZERO_OR_MORE';
                break;
            case 'many-to-one':
                fromCard = 'ZERO_OR_MORE';
                toCard = 'EXACTLY_ONE';
                break;
            case 'many-to-many':
                fromCard = 'ZERO_OR_MORE';
                toCard = 'ZERO_OR_MORE';
                break;
            default: // 'one-to-one'
                fromCard = 'EXACTLY_ONE';
                toCard = 'EXACTLY_ONE';
                break;
        }
        this.diagram.relationships.push({
            from: fromEntityId,
            to: toEntityId,
            fromCardinality: fromCard,
            toCardinality: toCard,
            identification: identifying ? 'IDENTIFYING' : 'NON_IDENTIFYING',
            label,
        });
        return this;
    }
    /**
     * Get an entity by ID
     */
    getEntity(id) {
        return this.diagram.entities.find((e) => e.name === id);
    }
    /**
     * Get all entity IDs
     */
    getAllEntities() {
        return this.diagram.entities.map((e) => e.name);
    }
    /**
     * Replace entity ID throughout the diagram
     */
    replaceEntity(oldId, newId) {
        // Replace in entities
        for (const entity of this.diagram.entities) {
            if (entity.name === oldId) {
                entity.name = newId;
            }
        }
        // Replace in relationships
        for (const rel of this.diagram.relationships) {
            if (rel.from === oldId) {
                rel.from = newId;
            }
            if (rel.to === oldId) {
                rel.to = newId;
            }
        }
        return this;
    }
    /**
     * Generate Mermaid ER diagram code
     * Simple implementation without external dependencies
     */
    asCode() {
        const lines = ['erDiagram'];
        // Generate entities with attributes
        for (const entity of this.diagram.entities) {
            if (entity.attributes.length > 0) {
                lines.push(`  ${entity.name} {`);
                for (const attr of entity.attributes) {
                    let line = `    ${attr.type} ${attr.name}`;
                    if (attr.key) {
                        line += ` ${attr.key}`;
                    }
                    if (attr.comment) {
                        const commentStr = typeof attr.comment === 'string' ? attr.comment : attr.comment.raw;
                        line += ` "${commentStr}"`;
                    }
                    lines.push(line);
                }
                lines.push('  }');
            }
            else {
                // Entity without attributes
                lines.push(`  ${entity.name}`);
            }
        }
        // Generate relationships
        for (const rel of this.diagram.relationships) {
            const fromCard = this.cardinalityToSymbol(rel.fromCardinality);
            const toCard = this.cardinalityToSymbol(rel.toCardinality);
            const ident = rel.identification === 'IDENTIFYING' ? '..' : '--';
            let line = `  ${rel.from} ${fromCard}${ident}${toCard} ${rel.to}`;
            if (rel.label) {
                const labelStr = typeof rel.label === 'string' ? rel.label : rel.label.raw;
                const quotedLabel = labelStr.includes(' ') ? `"${labelStr}"` : labelStr;
                line += ` : ${quotedLabel}`;
            }
            lines.push(line);
        }
        return lines.join('\n');
    }
    /**
     * Convert cardinality enum to Mermaid symbol
     */
    cardinalityToSymbol(cardinality) {
        switch (cardinality) {
            case 'ZERO_OR_ONE':
                return '|o';
            case 'EXACTLY_ONE':
                return '||';
            case 'ZERO_OR_MORE':
                return '}o';
            case 'ONE_OR_MORE':
                return '}|';
            default:
                return '||';
        }
    }
    /**
     * Build final ERDiagram with asCode capability
     */
    build() {
        const diagram = { ...this.diagram };
        return {
            ...diagram,
            asCode: () => this.asCode(),
        };
    }
}
//# sourceMappingURL=enhanced-er.js.map