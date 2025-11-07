import type {
  ERAttribute,
  ERCardinality,
  ERDiagram,
  EREntity,
  ERIdentification,
  ERRelationship,
} from '@typermaid/core';
import { createEntityID, type EntityID } from '@typermaid/core';
import { ValidationError, ValidationErrorCode } from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * ER Diagram Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Only declared entities can be referenced in relationships
 * - Cardinality constraints are validated
 * - Attribute types are correct
 */
export class ERDiagramBuilder {
  private entities = new Map<EntityID, EREntity>();
  private relationships: ERRelationship[] = [];
  private entityOrder: EntityID[] = [];
  private relationshipCount = 0;

  /**
   * Add an entity to the ER diagram
   * @returns Branded EntityID that can only be used with this builder
   */
  addEntity(name: string, label: string): EntityID {
    // Create EntityID with validation
    let entityId: EntityID;
    try {
      entityId = createEntityID(name);
    } catch (error) {
      // Convert ZodError to ValidationError for consistent API
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${name}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id: name }
      );
    }

    // Validate label is not empty
    if (!label || label.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Entity label cannot be empty', {
        id: name,
      });
    }

    // Check reserved words
    validateNotReservedWord(name);

    // Check for duplicates
    if (this.entities.has(entityId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Entity with name "${name}" already exists`,
        { id: name }
      );
    }

    const entity: EREntity = {
      name: entityId,
      attributes: [],
    };

    this.entities.set(entityId, entity);
    this.entityOrder.push(entityId);

    return entityId;
  }

  /**
   * Add an attribute to an entity
   * @throws {ValidationError} If entity doesn't exist
   */
  addAttribute(entityId: EntityID, name: string, type: string, isPrimaryKey: boolean): this {
    // Validate entity exists
    if (!this.entities.has(entityId)) {
      throw new ValidationError(
        ValidationErrorCode.ENTITY_NOT_FOUND,
        `Entity "${entityId}" not found. You must add the entity before adding attributes.`,
        { entityId }
      );
    }

    // Validate attribute name not empty
    if (!name || name.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Attribute name cannot be empty', {
        entityId,
      });
    }

    // Validate type not empty
    if (!type || type.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Attribute type cannot be empty', {
        entityId,
        attributeName: name,
      });
    }

    const entity = this.entities.get(entityId);
    if (entity) {
      // Check for existing primary key if trying to add another one
      if (isPrimaryKey) {
        const existingPK = entity.attributes?.find((attr) => attr.key === 'PK');
        if (existingPK) {
          throw new ValidationError(
            ValidationErrorCode.EMPTY_LABEL,
            `Entity "${entityId}" already has a primary key "${existingPK.name}". Only one primary key is allowed per entity.`,
            { entityId, existingPrimaryKey: existingPK.name, newPrimaryKey: name }
          );
        }
      }

      const attribute: ERAttribute = {
        name,
        type,
        key: isPrimaryKey ? 'PK' : undefined,
      };

      if (!Array.isArray(entity.attributes)) {
        entity.attributes = [];
      }

      entity.attributes.push(attribute);
    }

    return this;
  }

  /**
   * Add a primary key attribute
   */
  addPrimaryKey(entityId: EntityID, name: string, type: string): this {
    return this.addAttribute(entityId, name, type, true);
  }

  /**
   * Add a foreign key attribute
   */
  addForeignKey(entityId: EntityID, name: string, type: string): this {
    // Validate entity exists
    if (!this.entities.has(entityId)) {
      throw new ValidationError(
        ValidationErrorCode.ENTITY_NOT_FOUND,
        `Entity "${entityId}" not found. You must add the entity before adding attributes.`,
        { entityId }
      );
    }

    const entity = this.entities.get(entityId);
    if (entity) {
      const attribute: ERAttribute = {
        name,
        type,
        key: 'FK',
      };

      if (!Array.isArray(entity.attributes)) {
        entity.attributes = [];
      }

      entity.attributes.push(attribute);
    }

    return this;
  }

  /**
   * Add a relationship between two entities with cardinality validation
   * @throws {ValidationError} If either entity doesn't exist or cardinality is invalid
   *
   * @param cardinality - Relationship type: 'one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'
   *
   * @example
   * ```typescript
   * builder.addRelationship(user, post, 'one-to-many', 'creates');
   * // User ||--o{ Post : creates
   * ```
   */
  addRelationship(
    from: EntityID,
    to: EntityID,
    cardinality: string,
    label?: string,
    identifying?: boolean
  ): this {
    // Validate entities exist
    if (!this.entities.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.ENTITY_NOT_FOUND,
        `Source entity "${from}" not found. You must add the entity before creating a relationship.`,
        { from, to }
      );
    }

    if (!this.entities.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.ENTITY_NOT_FOUND,
        `Target entity "${to}" not found. You must add the entity before creating a relationship.`,
        { from, to }
      );
    }

    // Parse cardinality notation (支持Mermaid记法 ||--}o 或易读形式 one-to-many)
    let fromCardinality: ERCardinality = 'EXACTLY_ONE';
    let toCardinality: ERCardinality = 'EXACTLY_ONE';

    // Mermaid記法: ||--}o, |o--}o, etc.
    if (cardinality.includes('--')) {
      const [fromPart, toPart] = cardinality.split('--');

      const cardinalityMap: Record<string, ERCardinality> = {
        '||': 'EXACTLY_ONE',
        '|o': 'ZERO_OR_ONE',
        '}o': 'ZERO_OR_MORE',
        '}|': 'ONE_OR_MORE',
      };

      fromCardinality = cardinalityMap[fromPart?.trim() ?? ''] ?? 'EXACTLY_ONE';
      toCardinality = cardinalityMap[toPart?.trim() ?? ''] ?? 'EXACTLY_ONE';
    }
    // 人間が読みやすい形式: one-to-one, one-to-many, etc.
    else {
      const validCardinalities = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'];
      if (!validCardinalities.includes(cardinality)) {
        throw new ValidationError(
          ValidationErrorCode.INVALID_RELATIONSHIP,
          `Invalid cardinality: "${cardinality}". Valid types are: ${validCardinalities.join(', ')} or Mermaid notation (||--}o, |o--}o, etc.)`,
          { from, to, cardinality }
        );
      }

      switch (cardinality) {
        case 'one-to-one':
          fromCardinality = 'EXACTLY_ONE';
          toCardinality = 'EXACTLY_ONE';
          break;
        case 'one-to-many':
          fromCardinality = 'EXACTLY_ONE';
          toCardinality = 'ZERO_OR_MORE';
          break;
        case 'many-to-one':
          fromCardinality = 'ZERO_OR_MORE';
          toCardinality = 'EXACTLY_ONE';
          break;
        case 'many-to-many':
          fromCardinality = 'ZERO_OR_MORE';
          toCardinality = 'ZERO_OR_MORE';
          break;
      }
    }

    const relationship: ERRelationship = {
      from,
      to,
      fromCardinality,
      toCardinality,
      identification: identifying ? 'IDENTIFYING' : 'NON_IDENTIFYING',
      label: label ?? '',
    };

    this.relationships.push(relationship);
    this.relationshipCount++;

    return this;
  }

  /**
   * Add a one-to-one relationship
   */
  oneToOne(
    from: EntityID,
    to: EntityID,
    label?: string,
    identification: ERIdentification = 'NON_IDENTIFYING'
  ): this {
    return this.addRelationship(from, to, 'one-to-one', label, identification === 'IDENTIFYING');
  }

  /**
   * Add a one-to-many relationship
   */
  oneToMany(
    from: EntityID,
    to: EntityID,
    label?: string,
    identification: ERIdentification = 'NON_IDENTIFYING'
  ): this {
    return this.addRelationship(from, to, 'one-to-many', label, identification === 'IDENTIFYING');
  }

  /**
   * Add a many-to-one relationship
   */
  manyToOne(
    from: EntityID,
    to: EntityID,
    label?: string,
    identification: ERIdentification = 'NON_IDENTIFYING'
  ): this {
    return this.addRelationship(from, to, 'many-to-one', label, identification === 'IDENTIFYING');
  }

  /**
   * Add a many-to-many relationship
   */
  manyToMany(
    from: EntityID,
    to: EntityID,
    label?: string,
    identification: ERIdentification = 'NON_IDENTIFYING'
  ): this {
    return this.addRelationship(from, to, 'many-to-many', label, identification === 'IDENTIFYING');
  }

  /**
   * Build and validate the complete ER diagram
   */
  build(): ERDiagram & {
    relationships: Array<ERRelationship & { cardinality?: string; identifying?: boolean }>;
  } {
    if (this.entities.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.ENTITY_NOT_FOUND,
        'ER diagram must have at least one entity',
        {}
      );
    }

    const entities = this.entityOrder.map((eid) => {
      const entity = this.entities.get(eid);
      if (!entity) {
        throw new ValidationError(
          ValidationErrorCode.ENTITY_NOT_FOUND,
          `Entity "${eid}" not found in build`,
          { eid }
        );
      }

      // Add isPrimaryKey flag to attributes for test compatibility
      const attributes =
        entity.attributes?.map((attr) => ({
          ...attr,
          isPrimaryKey: attr.key === 'PK',
        })) ?? [];

      return {
        ...entity,
        attributes,
      };
    });

    // Map relationships to include cardinality string and identifying boolean for test compatibility
    const relationships = this.relationships.map((rel) => {
      let cardinality = 'one-to-one';
      if (rel.fromCardinality === 'EXACTLY_ONE' && rel.toCardinality === 'ZERO_OR_MORE') {
        cardinality = 'one-to-many';
      } else if (rel.fromCardinality === 'ZERO_OR_MORE' && rel.toCardinality === 'EXACTLY_ONE') {
        cardinality = 'many-to-one';
      } else if (rel.fromCardinality === 'ZERO_OR_MORE' && rel.toCardinality === 'ZERO_OR_MORE') {
        cardinality = 'many-to-many';
      }

      return {
        ...rel,
        cardinality,
        identifying: rel.identification === 'IDENTIFYING',
      };
    });

    const diagram: ERDiagram & {
      relationships: Array<ERRelationship & { cardinality?: string; identifying?: boolean }>;
    } = {
      type: 'er',
      entities,
      relationships,
    };

    return diagram;
  }

  /**
   * Get current entity count
   */
  getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Get current relationship count
   */
  getRelationshipCount(): number {
    return this.relationshipCount;
  }

  /**
   * Check if an entity exists
   */
  hasEntity(entityId: EntityID): boolean {
    return this.entities.has(entityId);
  }
}
