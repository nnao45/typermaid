import { describe, expect, it } from 'vitest';
import {
  ClassDiagramBuilder,
  type ClassID,
  ValidationError,
  ValidationErrorCode,
} from '../src/index.js';

describe('ClassDiagramBuilder', () => {
  describe('Basic Class Operations', () => {
    it('should create a class and return branded ClassID', () => {
      const builder = new ClassDiagramBuilder();
      const classId = builder.addClass('User', 'User Class');

      expect(builder.hasClass(classId)).toBe(true);
      expect(builder.getClassCount()).toBe(1);
    });

    it('should throw on duplicate class ID', () => {
      const builder = new ClassDiagramBuilder();
      builder.addClass('User', 'User Class');

      expect(() => {
        builder.addClass('User', 'Duplicate Class');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addClass('User', 'Duplicate Class');
      }).toThrow(/already exists/);
    });

    it('should throw on invalid class ID format', () => {
      const builder = new ClassDiagramBuilder();

      expect(() => {
        builder.addClass('123', 'Invalid');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addClass('123', 'Invalid');
      }).toThrow(/Invalid ID format/);
    });

    it('should throw on reserved word', () => {
      const builder = new ClassDiagramBuilder();

      expect(() => {
        builder.addClass('class', 'Reserved');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addClass('extends', 'Reserved');
      }).toThrow(ValidationError);
    });

    it('should throw on empty label', () => {
      const builder = new ClassDiagramBuilder();

      expect(() => {
        builder.addClass('A', '');
      }).toThrow(ValidationError);

      expect(() => {
        builder.addClass('B', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('Member Operations', () => {
    it('should add attribute to class', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');

      builder.addAttribute(user, 'name', 'string', 'public');

      const diagram = builder.build();
      expect(diagram.classes[0]?.attributes).toHaveLength(1);
      expect(diagram.classes[0]?.attributes?.[0]?.name).toBe('name');
    });

    it('should add method to class', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');

      builder.addMethod(user, 'getName', 'string', [], 'public');

      const diagram = builder.build();
      expect(diagram.classes[0]?.methods).toHaveLength(1);
      expect(diagram.classes[0]?.methods?.[0]?.name).toBe('getName');
    });

    it('should throw when adding member to non-existent class', () => {
      const builder = new ClassDiagramBuilder();

      expect(() => {
        // @ts-expect-error - Testing invalid ClassID
        builder.addAttribute('User' as ClassID, 'name', 'string', 'public');
      }).toThrow(ValidationError);
    });

    it('should throw on empty attribute name', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');

      expect(() => {
        builder.addAttribute(user, '', 'string', 'public');
      }).toThrow(ValidationError);
    });
  });

  describe('Relationship Operations', () => {
    it('should create a relationship between two classes', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');
      const role = builder.addClass('Role', 'Role');

      builder.addRelationship(user, role, 'association', 'has');

      expect(builder.getRelationshipCount()).toBe(1);
    });

    it('should throw when source class does not exist', () => {
      const builder = new ClassDiagramBuilder();
      const role = builder.addClass('Role', 'Role');

      expect(() => {
        // @ts-expect-error - Testing invalid ClassID
        builder.addRelationship('User' as ClassID, role, 'association', 'has');
      }).toThrow(ValidationError);

      expect(() => {
        // @ts-expect-error - Testing invalid ClassID
        builder.addRelationship('User' as ClassID, role, 'association', 'has');
      }).toThrow(/not found/);
    });

    it('should throw when target class does not exist', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');

      expect(() => {
        // @ts-expect-error - Testing invalid ClassID
        builder.addRelationship(user, 'Role' as ClassID, 'association', 'has');
      }).toThrow(ValidationError);
    });

    it('should support different relationship types', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');
      const person = builder.addClass('Person', 'Person');
      const role = builder.addClass('Role', 'Role');

      builder.addRelationship(user, person, 'inheritance');
      builder.addRelationship(user, role, 'composition');

      const diagram = builder.build();
      expect(diagram.relationships).toHaveLength(2);
      expect(diagram.relationships[0]?.type).toBe('inheritance');
      expect(diagram.relationships[1]?.type).toBe('composition');
    });

    it('should allow relationship with cardinality', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');
      const role = builder.addClass('Role', 'Role');

      builder.addRelationship(user, role, 'association', 'has', '1', '*');

      const diagram = builder.build();
      expect(diagram.relationships[0]?.fromCardinality).toBe('1');
      expect(diagram.relationships[0]?.toCardinality).toBe('*');
    });
  });

  describe('Build', () => {
    it('should build a valid class diagram', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');
      const role = builder.addClass('Role', 'Role');

      builder.addAttribute(user, 'name', 'string', 'public');
      builder.addMethod(user, 'getName', 'string', [], 'public');
      builder.addRelationship(user, role, 'association', 'has');

      const diagram = builder.build();

      expect(diagram.type).toBe('classDiagram');
      expect(diagram.classes).toHaveLength(2);
      expect(diagram.relationships).toHaveLength(1);
    });

    it('should throw when building empty diagram', () => {
      const builder = new ClassDiagramBuilder();

      expect(() => {
        builder.build();
      }).toThrow(ValidationError);

      expect(() => {
        builder.build();
      }).toThrow(/at least one class/);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');
      const role = builder.addClass('Role', 'Role');

      const diagram = builder
        .addAttribute(user, 'name', 'string', 'public')
        .addRelationship(user, role, 'association')
        .build();

      expect(diagram.classes[0]?.attributes).toHaveLength(1);
      expect(diagram.relationships).toHaveLength(1);
    });
  });

  describe('Error Context', () => {
    it('should provide detailed error context', () => {
      const builder = new ClassDiagramBuilder();
      const user = builder.addClass('User', 'User');

      try {
        // @ts-expect-error - Testing invalid ClassID
        builder.addRelationship(user, 'NonExistent' as ClassID, 'association');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.code).toBe(ValidationErrorCode.CLASS_NOT_FOUND);
        expect(validationError.context).toMatchObject({
          from: 'User',
          to: 'NonExistent',
        });
      }
    });
  });
});
