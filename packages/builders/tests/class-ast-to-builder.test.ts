import { type ClassDiagramAST, parse } from '@typermaid/parser';
import { describe, expect, it } from 'vitest';
import { classASTToBuilder } from '../src/converters/class-ast-to-builder.js';
import { brandID } from '../src/types.js';

describe('classASTToBuilder', () => {
  it('should convert basic class diagram AST to builder', () => {
    const code = `classDiagram
  class Animal {
    +name: string
    +eat()
  }
  class Dog {
    +bark()
  }
  Animal <|-- Dog`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ClassDiagramAST;
    const builder = classASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.classes.length).toBe(2);
    expect(diagram.relations.length).toBe(1);
  });

  it.skip('should allow manipulation after conversion (TODO: parser relations count)', () => {
    const code = `classDiagram
  class Animal {
    +name: string
  }
  class Dog
  Animal <|-- Dog`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ClassDiagramAST;
    const builder = classASTToBuilder(diagramAST);

    // Add new class and relationship
    const cat = builder.addClass('Cat', 'Cat');
    const animal = brandID('Animal');
    builder.addRelationship(animal, cat, '<|--', 'inherits');

    const diagram = builder.build();

    expect(diagram.classes.length).toBe(3);
    expect(diagram.relations.length).toBe(2);
  });

  it.skip('should handle class members (TODO: parser multiple members)', () => {
    const code = `classDiagram
  class User {
    +id: number
    +name: string
    +getName()
    -password: string
  }`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ClassDiagramAST;
    const builder = classASTToBuilder(diagramAST);

    const diagram = builder.build();

    const userClass = diagram.classes.find((c) => c.name === 'User');
    expect(userClass).toBeDefined();
    expect(userClass?.members.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle relationship types', () => {
    const code = `classDiagram
  A <|-- B
  C *-- D
  E o-- F`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ClassDiagramAST;
    const builder = classASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.relations.length).toBe(3);
    expect(diagram.relations[0]?.relationType).toBe('<|--');
    expect(diagram.relations[1]?.relationType).toBe('*--');
    expect(diagram.relations[2]?.relationType).toBe('o--');
  });

  it('should auto-add classes from relationships', () => {
    const code = `classDiagram
  ClassA <|-- ClassB
  ClassB --> ClassC`;

    const ast = parse(code);
    const diagramAST = ast.body[0] as ClassDiagramAST;
    const builder = classASTToBuilder(diagramAST);

    const diagram = builder.build();

    expect(diagram.classes.length).toBeGreaterThanOrEqual(3);
    expect(diagram.relations.length).toBe(2);
  });
});
