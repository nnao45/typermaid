import { describe, expect, it } from 'vitest';
import {
  type EntityID,
  ERDiagramBuilder,
  ValidationError,
  ValidationErrorCode,
} from '../src/index.js';

describe('ERDiagramBuilder', () => {
  describe('Basic Entity Operations', () => {
    it('should create an entity and return branded EntityID', () => {
      const builder = new ERDiagramBuilder();
      const entityId = builder.addEntity('User', 'User Entity');

      expect(builder.hasEntity(entityId)).toBe(true);
      expect(builder.getEntityCount()).toBe(1);
    });

    it('should throw on duplicate entity ID', () => {
      const builder = new ERDiagramBuilder();
      builder.addEntity('User', 'User Entity');

      expect(() => {
        builder.addEntity('User', 'Duplicate Entity');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addEntity('User', 'Duplicate Entity');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid entity ID format', () => {
      const builder = new ERDiagramBuilder();

      expect(() => {
        builder.addEntity('123', 'Invalid');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addEntity('123', 'Invalid');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new ERDiagramBuilder();

      expect(() => {
        builder.addEntity('entity', 'Reserved');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addEntity('relationship', 'Reserved');
      }).toThrow(ValidationError);
    });

    it('should throw on empty label', () => {
      const builder = new ERDiagramBuilder();

      expect(() => {
        builder.addEntity('A', '');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addEntity('B', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('Attribute Operations', () => {
    it('should add attribute to entity', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');

      builder.addAttribute(user, 'id', 'int', true);
      builder.addAttribute(user, 'name', 'string', false);

      const diagram = builder.build();
      expect(diagram.entities[0]?.attributes).toHaveLength(2);
      expect(diagram.entities[0]?.attributes?.[0]?.isPrimaryKey).toBe(true);
    });

    it('should throw when adding attribute to non-existent entity', () => {
      const builder = new ERDiagramBuilder();

      expect(() => {
        // @ts-expect-error - Testing invalid EntityID
        builder.addAttribute('User' as EntityID, 'id', 'int', true);
      }).toThrow(ValidationError);
    });

    it('should throw on empty attribute name', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');

      expect(() => {
        builder.addAttribute(user, '', 'string', false);
      }).toThrow(ValidationError);
    });

    it('should allow only one primary key per entity', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');

      builder.addAttribute(user, 'id', 'int', true);

      expect(() => {
        builder.addAttribute(user, 'secondId', 'int', true);
      }).toThrow(ValidationError);

      expect(() => {
        builder.addAttribute(user, 'secondId', 'int', true);
      }).toThrow(/primary key/);
    });
  });

  describe('Relationship Operations', () => {
    it('should create a relationship between two entities', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');
      const role = builder.addEntity('Role', 'Role');

      builder.addRelationship(user, role, 'one-to-many', 'has');

      expect(builder.getRelationshipCount()).toBe(1);
    });

    it('should throw when source entity does not exist', () => {
      const builder = new ERDiagramBuilder();
      const role = builder.addEntity('Role', 'Role');

      expect(() => {
        // @ts-expect-error - Testing invalid EntityID
        builder.addRelationship('User' as EntityID, role, 'one-to-many', 'has');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid EntityID
        builder.addRelationship('User' as EntityID, role, 'one-to-many', 'has');
      }).toThrow(/not found/);
    });

    it('should throw when target entity does not exist', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');

      expect(() => {
        // @ts-expect-error - Testing invalid EntityID
        builder.addRelationship(user, 'Role' as EntityID, 'one-to-many', 'has');
      }).toThrow(ValidationError);
    });

    it('should support different cardinality types', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');
      const role = builder.addEntity('Role', 'Role');
      const profile = builder.addEntity('Profile', 'Profile');

      builder.addRelationship(user, role, 'one-to-many', 'has');
      builder.addRelationship(user, profile, 'one-to-one', 'owns');

      const diagram = builder.build();
      expect(diagram.relationships).toHaveLength(2);
      expect(diagram.relationships[0]?.cardinality).toBe('one-to-many');
      expect(diagram.relationships[1]?.cardinality).toBe('one-to-one');
    });

    it('should allow relationship with identifying flag', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');
      const address = builder.addEntity('Address', 'Address');

      builder.addRelationship(user, address, 'one-to-many', 'has', true);

      const diagram = builder.build();
      expect(diagram.relationships[0]?.identifying).toBe(true);
    });
  });

  describe('Build', () => {
    it('should build a valid ER diagram', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');
      const role = builder.addEntity('Role', 'Role');

      builder.addAttribute(user, 'id', 'int', true);
      builder.addAttribute(user, 'name', 'string', false);
      builder.addRelationship(user, role, 'one-to-many', 'has');

      const diagram = builder.build();

      expect(diagram.type).toBe('er');
      expect(diagram.entities).toHaveLength(2);
      expect(diagram.relationships).toHaveLength(1);
    });

    it('should throw when building empty diagram', () => {
      const builder = new ERDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one entity/);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');
      const role = builder.addEntity('Role', 'Role');

      const diagram = builder
        .addAttribute(user, 'id', 'int', true)
        .addAttribute(user, 'name', 'string', false)
        .addRelationship(user, role, 'one-to-many')
        .build();

      expect(diagram.entities[0]?.attributes).toHaveLength(2);
      expect(diagram.relationships).toHaveLength(1);
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new ERDiagramBuilder();
      const user = builder.addEntity('User', 'User');

      try {
        // @ts-expect-error - Testing invalid EntityID
        builder.addRelationship(user, 'NonExistent' as EntityID, 'one-to-many');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.ENTITY_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          from: 'User',
          to: 'NonExistent',
        });
      }
    });
  });
});
