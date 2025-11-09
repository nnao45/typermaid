import { describe, expect, it } from 'vitest';
import { parseER } from '../src/index.js';

describe('Enhanced ER AST-Builder API', () => {
  it('should parse and extend with ER builder methods', () => {
    const source = `
erDiagram
    Customer {
        string name
        int age
    }
    Order {
        int orderId PK
        string status
    }
    Customer ||--o{ Order : places
`;

    const ast = parseER(source);

    // Verify basic parsing
    expect(ast.type).toBe('ERDiagram');
    expect(ast.diagram).toBeDefined();

    // Verify builder methods exist
    expect(typeof ast.addEntity).toBe('function');
    expect(typeof ast.addAttribute).toBe('function');
    expect(typeof ast.addRelationship).toBe('function');
    expect(typeof ast.asCode).toBe('function');
    expect(typeof ast.build).toBe('function');

    // Test adding new entity
    const productId = ast.addEntity('Product', 'Product Entity');
    expect(productId).toBeDefined();

    // Test adding attributes
    ast.addAttribute(productId, 'productId', 'int', 'PK');
    ast.addAttribute(productId, 'name', 'string');
    ast.addAttribute(productId, 'price', 'decimal');

    // Verify code generation works
    const code = ast.asCode();
    expect(code).toContain('Product');
    expect(code).toContain('productId');
    expect(code).toContain('price');
  });

  it('should handle entity and relationship management', () => {
    const source = `
erDiagram
    User {
        int userId PK
        string username
    }
`;

    const ast = parseER(source);

    // Add new entities
    const postId = ast.addEntity('Post', 'Blog Post');
    const categoryId = ast.addEntity('Category');

    // Add attributes to new entities
    ast
      .addAttribute(postId, 'postId', 'int', 'PK')
      .addAttribute(postId, 'title', 'string')
      .addAttribute(postId, 'content', 'text');

    ast
      .addAttribute(categoryId, 'categoryId', 'int', 'PK')
      .addAttribute(categoryId, 'name', 'string');

    // Add relationships
    const userId = ast.getAllEntities().find((id) => id.includes('User'));
    expect(userId).toBeDefined();

    if (userId) {
      ast.addRelationship(userId, postId, 'one-to-many', 'writes');
      ast.addRelationship(postId, categoryId, 'many-to-one', 'belongs_to');
    }

    // Verify entities exist
    const entities = ast.getAllEntities();
    expect(entities).toContain(postId);
    expect(entities).toContain(categoryId);

    // Verify code generation includes relationships
    const code = ast.asCode();
    expect(code).toContain('writes');
    expect(code).toContain('belongs_to');
  });

  it('should support entity replacement', () => {
    const source = `
erDiagram
    TempEntity {
        int id PK
    }
`;

    const ast = parseER(source);

    // Replace entity
    const entities = ast.getAllEntities();
    const oldId = entities[0];
    expect(oldId).toBeDefined();

    if (oldId) {
      const newId = ast.addEntity('PermanentEntity', 'Permanent Entity');
      ast.replaceEntity(oldId, newId);

      // Verify replacement
      const updatedEntities = ast.getAllEntities();
      expect(updatedEntities).not.toContain(oldId);
      expect(updatedEntities).toContain(newId);

      // Verify code generation
      const code = ast.asCode();
      expect(code).toContain('PermanentEntity');
      expect(code).not.toContain('TempEntity');
    }
  });

  it('should support method chaining', () => {
    const source = `erDiagram`;

    const ast = parseER(source);

    // Test method chaining
    const entityId = ast.addEntity('ChainTest', 'Chain Test Entity');

    const result = ast
      .addAttribute(entityId, 'id', 'int', 'PK')
      .addAttribute(entityId, 'name', 'string')
      .addAttribute(entityId, 'description', 'text');

    // Verify chaining returns the same object
    expect(result).toBe(ast);

    // Verify all attributes were added
    const entity = ast.getEntity(entityId);
    expect(entity).toBeDefined();
    expect(entity.attributes).toHaveLength(3);
  });

  it('roundtrip: parse → modify → generate → parse', () => {
    const source1 = `
erDiagram
    Original {
        int id PK
    }
`;

    // Parse original
    const ast1 = parseER(source1);

    // Modify
    ast1.addEntity('Added', 'Added Entity').addAttribute('Added', 'addedId', 'int', 'PK');

    // Generate code
    const code = ast1.asCode();

    // Parse generated code
    const ast2 = parseER(code);

    // Verify both entities exist
    const entities = ast2.getAllEntities();
    expect(entities.some((id) => id.includes('Original'))).toBe(true);
    expect(entities.some((id) => id.includes('Added'))).toBe(true);
  });

  it('should preserve original AST properties during modifications', () => {
    const source = `
erDiagram
    %% This is a comment
    BaseEntity {
        int baseId PK
        string baseName
    }
`;

    const ast = parseER(source);

    // Store original properties
    const originalType = ast.type;
    const originalLoc = ast.loc;

    // Modify AST
    ast.addEntity('NewEntity', 'New Entity').addAttribute('NewEntity', 'newId', 'int', 'PK');

    // Verify original properties preserved
    expect(ast.type).toBe(originalType);
    expect(ast.loc).toEqual(originalLoc);

    // Verify modifications worked
    const entities = ast.getAllEntities();
    expect(entities.some((id) => id.includes('NewEntity'))).toBe(true);
  });

  it('should handle attribute types and keys correctly', () => {
    const source = `erDiagram`;

    const ast = parseER(source);

    const entityId = ast.addEntity('AttributeTest');

    // Add various attribute types
    ast
      .addAttribute(entityId, 'id', 'int', 'PK')
      .addAttribute(entityId, 'foreignKey', 'int', 'FK')
      .addAttribute(entityId, 'uniqueField', 'string', 'UK')
      .addAttribute(entityId, 'normalField', 'string');

    const entity = ast.getEntity(entityId);
    expect(entity.attributes).toHaveLength(4);

    // Verify specific attributes
    const pkAttr = entity.attributes.find((a) => a.key === 'PK');
    const fkAttr = entity.attributes.find((a) => a.key === 'FK');
    const ukAttr = entity.attributes.find((a) => a.key === 'UK');
    const normalAttr = entity.attributes.find((a) => a.key === '');

    expect(pkAttr).toBeDefined();
    expect(fkAttr).toBeDefined();
    expect(ukAttr).toBeDefined();
    expect(normalAttr).toBeDefined();

    // Verify code generation includes keys
    const code = ast.asCode();
    expect(code).toContain('PK');
    expect(code).toContain('FK');
    expect(code).toContain('UK');
  });
});
