import { type ERDiagramAST, parse } from '@lyric-js/parser';
import { describe, expect, it } from 'vitest';
import { erASTToBuilder } from '../src/converters/er-ast-to-builder.js';
import { brandID } from '../src/types.js';

describe('erASTToBuilder', () => {
  it('should convert basic ER diagram AST to builder', () => {
    const code = `erDiagram
  CUSTOMER {
    string name
    int id PK
  }
  ORDER {
    int orderId PK
  }
  CUSTOMER ||--o{ ORDER : places`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ERDiagramAST;
    const builder = erASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.entities.length).toBe(2);
    expect(diagram.relationships.length).toBe(1);
  });

  it('should allow manipulation after conversion', () => {
    const code = `erDiagram
  CUSTOMER {
    string name
  }
  ORDER {
    int orderId
  }
  CUSTOMER ||--o{ ORDER : places`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ERDiagramAST;
    const builder = erASTToBuilder(diagramAST);

    // Add new entity and relationship
    const product = builder.addEntity('PRODUCT', 'Product');
    const order = brandID('ORDER');
    builder.addRelationship(order, product, '||--o{', 'contains');

    const diagram = builder.build();

    expect(diagram.entities.length).toBe(3);
    expect(diagram.relationships.length).toBe(2);
  });

  it('should handle entity attributes', () => {
    const code = `erDiagram
  USER {
    int id PK
    string name
    string email UK
  }`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ERDiagramAST;
    const builder = erASTToBuilder(diagramAST);

    const diagram = builder.build();

    const userEntity = diagram.entities.find((e) => e.name === 'USER');
    expect(userEntity).toBeDefined();
    expect(userEntity?.attributes.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle different cardinalities', () => {
    const code = `erDiagram
  A ||--|| B : one-to-one
  C ||--o{ D : one-to-many
  E }o--o{ F : many-to-many`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ERDiagramAST;
    const builder = erASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.relationships.length).toBe(3);
  });

  it('should auto-add entities from relationships', () => {
    const code = `erDiagram
  ENTITY1 ||--o{ ENTITY2 : relation1
  ENTITY2 ||--o{ ENTITY3 : relation2`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ERDiagramAST;
    const builder = erASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.entities.length).toBeGreaterThanOrEqual(3);
    expect(diagram.relationships.length).toBe(2);
  });
});
