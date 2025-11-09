import { describe, expect, test } from 'vitest';
import { parseClass } from '../src/index.js';

describe('Enhanced Class AST-Builder API', () => {
  test('should parse and extend with class builder methods', () => {
    const source = `
      classDiagram
        class Animal {
          +String name
          +makeSound() void
        }
    `;

    const ast = parseClass(source);

    // Should have AST properties
    expect(ast.type).toBe('ClassDiagram');
    expect(ast.diagram).toBeDefined();

    // Builder capabilities - add new class with members
    const dogId = ast.addClass('Dog', 'Dog Class');
    ast.addAttribute(dogId, 'name', 'String', '+'); // Add member so it shows in code

    // Check if class was added (using findClasses)
    const dogClasses = ast.findClasses('Dog');
    expect(dogClasses).toHaveLength(1);
    expect(dogClasses[0]?.name).toBe('Dog');

    // Add attributes and methods with chaining
    const catId = ast.addClass('Cat', 'Cat Class');
    ast.addAttribute(catId, 'breed', 'String', '+').addMethod(catId, 'meow', 'void', [], '+');

    // Code generation
    const code = ast.asCode();
    expect(code).toContain('classDiagram');
    expect(code).toContain('Dog');
    expect(code).toContain('Cat');

    // Build diagram with enhanced methods
    const diagram = ast.build();
    expect(diagram.type).toBe('classDiagram');
    expect(typeof diagram.asCode).toBe('function');
    expect(diagram.asCode()).toBe(code);
  });

  test('should handle class relationships', () => {
    const source = `
      classDiagram
        class Animal
        class Dog
        Animal <|-- Dog
    `;

    const ast = parseClass(source);

    // Add new relationship
    const birdId = ast.addClass('Bird2', 'Bird');
    const animalId = ast.addClass('AnimalBase2', 'Animal Base');

    ast.addInheritance(birdId, animalId);
    ast.addAssociation(birdId, animalId, 'flies to', '1', '*');

    // Check relationships exist in generated code
    const code = ast.asCode();
    expect(code).toContain('Bird2');
    expect(code).toContain('AnimalBase2');

    // Count relationships
    expect(ast.getRelationshipCount()).toBeGreaterThan(0);
    expect(ast.getClassCount()).toBeGreaterThan(2);
  });

  test('should support class replacement', () => {
    const source = `
      classDiagram
        class Animal {
          +String name
        }
        class Dog {
          +String breed
        }
        Animal <|-- Dog
    `;

    const ast = parseClass(source);

    // Replace Animal with Pet
    ast.replaceClass('Animal', 'Pet');

    // Check replacement worked
    const petClasses = ast.findClasses('Pet');
    expect(petClasses).toHaveLength(1);

    const animalClasses = ast.findClasses('Animal');
    expect(animalClasses).toHaveLength(0);

    // Generate code and verify replacement
    const code = ast.asCode();
    expect(code).toContain('Pet');
    expect(code).not.toContain('Animal');
  });

  test('should support method chaining', () => {
    const ast = parseClass('classDiagram\n  class Base');

    // Method chaining with addAttribute and addMethod
    const serviceId = ast.addClass('Service');
    const controllerId = ast.addClass('Controller');

    const result = ast
      .addAttribute(serviceId, 'name', 'String', '+')
      .addMethod(serviceId, 'execute', 'void', [], '+')
      .addAttribute(controllerId, 'route', 'String', '+');

    expect(result).toBe(ast); // Should return self
    expect(ast.findClasses('Service')).toHaveLength(1);
    expect(ast.findClasses('Controller')).toHaveLength(1);
  });

  test.todo('roundtrip: parse → modify → generate → parse', () => {
    // TODO: Generator output format needs to be compatible with parser
    // Currently generates: `ClassName : +member Type`
    // Parser expects: class block syntax with members inside {}
    const original = `classDiagram
  class Animal {
    +String name
    +makeSound() void
  }`;

    const ast1 = parseClass(original);

    // Modify: add new class with attributes
    const dogId = ast1.addClass('Dog2', 'Dog Class');
    ast1.addAttribute(dogId, 'breed', 'String', '+');
    const puppyId = ast1.addClass('Puppy2', 'Puppy');
    ast1.addAttribute(puppyId, 'age', 'int', '+');

    // Generate modified code
    const modified = ast1.asCode();
    expect(modified).toContain('Dog2');
    expect(modified).toContain('Puppy2');

    // Parse modified code
    const ast2 = parseClass(modified);
    expect(ast2.findClasses('Dog2')).toHaveLength(1);
    expect(ast2.findClasses('Puppy2')).toHaveLength(1);
  });

  test('should preserve original AST properties during modifications', () => {
    const source = `
      classDiagram
        class Animal {
          +String name
        }
    `;

    const ast = parseClass(source);

    // Original properties should be preserved
    expect(ast.type).toBe('ClassDiagram');
    expect(ast.diagram).toBeDefined();

    // Add new elements
    ast.addClass('Bird', 'Bird Class');

    // Original properties should still be preserved
    expect(ast.type).toBe('ClassDiagram');
    expect(ast.diagram).toBeDefined();

    // Code generation should maintain class diagram structure
    const code = ast.asCode();
    expect(code).toMatch(/^classDiagram/);
  });
});
