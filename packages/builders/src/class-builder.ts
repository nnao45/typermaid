import type {
  ClassDefinition,
  ClassDiagram,
  ClassMember,
  ClassRelation,
  ClassRelationType,
  ClassVisibility,
} from '@typermaid/core';
import {
  brandID,
  type ClassID,
  isValidIDFormat,
  ValidationError,
  ValidationErrorCode,
} from './types.js';
import { validateNotReservedWord } from './validators/reserved-words.js';

/**
 * Class Diagram Builder with Type-Level Proof System
 *
 * Provides compile-time guarantees that:
 * - Only declared classes can be referenced in relationships
 * - Member visibility is validated
 * - Relationship types are correct
 */
export class ClassDiagramBuilder {
  private classes = new Map<ClassID, ClassDefinition>();
  private relations: ClassRelation[] = [];
  private classOrder: ClassID[] = [];
  private relationCount = 0;
  private classCounter = 0;

  /**
   * Add a class to the diagram
   * @returns Branded ClassID that can only be used with this builder
   */
  addClass(name: string, label: string): ClassID {
    // Validate class name format
    if (!isValidIDFormat(name)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_ID_FORMAT,
        `Invalid ID format: "${name}". IDs must start with a letter and contain only alphanumeric characters, underscores, and hyphens.`,
        { id: name }
      );
    }

    // Validate label is not empty
    if (!label || label.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Class label cannot be empty', {
        id: name,
      });
    }

    // Check reserved words
    validateNotReservedWord(name);

    // Check for duplicates
    const classId = brandID<ClassID>(name);
    if (this.classes.has(classId)) {
      throw new ValidationError(
        ValidationErrorCode.DUPLICATE_ID,
        `Class with name "${name}" already exists`,
        { id: name }
      );
    }

    const classDef: ClassDefinition = {
      id: `class-${this.classCounter++}`,
      name,
      members: [],
    };

    this.classes.set(classId, classDef);
    this.classOrder.push(classId);

    return classId;
  }

  /**
   * Add a member (field or method) to a class
   * @throws {ValidationError} If class doesn't exist
   */
  addMember(
    classId: ClassID,
    name: string,
    type: 'attribute' | 'method',
    visibility: ClassVisibility = '+',
    returnType?: string
  ): this {
    // Validate class exists
    if (!this.classes.has(classId)) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        `Class "${classId}" not found. You must add the class before adding members.`,
        { classId }
      );
    }

    // Validate member name not empty
    if (!name || name.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Member name cannot be empty', {
        classId,
      });
    }

    const classDef = this.classes.get(classId);
    if (classDef) {
      const member: ClassMember = {
        type,
        name,
        visibility,
        returnType,
        isStatic: false,
        isAbstract: false,
      };

      if (!classDef.members) {
        classDef.members = [];
      }

      classDef.members.push(member);
    }

    return this;
  }

  /**
   * Add an attribute to a class
   */
  addAttribute(classId: ClassID, name: string, type: string, visibility: ClassVisibility): this {
    // Validate class exists
    if (!this.classes.has(classId)) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        `Class "${classId}" not found. You must add the class before adding attributes.`,
        { classId }
      );
    }

    // Validate attribute name not empty
    if (!name || name.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Attribute name cannot be empty', {
        classId,
      });
    }

    const classDef = this.classes.get(classId);
    if (classDef) {
      const attribute = {
        type: 'attribute' as const,
        name,
        visibility,
        returnType: type,
        isStatic: false,
        isAbstract: false,
      };

      if (!Array.isArray(classDef.members)) {
        classDef.members = [];
      }

      classDef.members.push(attribute);
    }

    return this;
  }

  /**
   * Add a method to a class
   */
  addMethod(
    classId: ClassID,
    name: string,
    returnType: string,
    _parameters: string[],
    visibility: ClassVisibility
  ): this {
    // Validate class exists
    if (!this.classes.has(classId)) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        `Class "${classId}" not found. You must add the class before adding methods.`,
        { classId }
      );
    }

    // Validate method name not empty
    if (!name || name.trim() === '') {
      throw new ValidationError(ValidationErrorCode.EMPTY_LABEL, 'Method name cannot be empty', {
        classId,
      });
    }

    const classDef = this.classes.get(classId);
    if (classDef) {
      const method = {
        type: 'method' as const,
        name,
        visibility,
        returnType,
        isStatic: false,
        isAbstract: false,
      };

      if (!Array.isArray(classDef.members)) {
        classDef.members = [];
      }

      classDef.members.push(method);
    }

    return this;
  }

  /**
   * Add a field to a class
   */
  addField(
    classId: ClassID,
    name: string,
    fieldType: string,
    visibility: ClassVisibility = '-'
  ): this {
    return this.addAttribute(classId, name, fieldType, visibility);
  }

  /**
   * Add a relationship between two classes
   * @throws {ValidationError} If either class doesn't exist
   */
  addRelationship(
    from: ClassID,
    to: ClassID,
    relationType: ClassRelationType,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addRelation(from, to, relationType, label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Add a relation between two classes
   * @throws {ValidationError} If either class doesn't exist
   */
  addRelation(
    from: ClassID,
    to: ClassID,
    relationType: ClassRelationType,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    // Validate classes exist
    if (!this.classes.has(from)) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        `Source class "${from}" not found. You must add the class before creating a relation.`,
        { from, to }
      );
    }

    if (!this.classes.has(to)) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        `Target class "${to}" not found. You must add the class before creating a relation.`,
        { from, to }
      );
    }

    const relation: ClassRelation = {
      from: from as string,
      to: to as string,
      relationType,
      label,
      cardinalityFrom,
      cardinalityTo,
    };

    this.relations.push(relation);
    this.relationCount++;

    return this;
  }

  /**
   * Add an inheritance relation (is-a)
   * Child class extends parent class
   *
   * @example
   * ```typescript
   * builder.addInheritance(dog, animal); // Dog extends Animal
   * ```
   */
  addInheritance(child: ClassID, parent: ClassID): this {
    return this.addRelation(child, parent, '<|--');
  }

  /**
   * Alias for addInheritance
   */
  extends(from: ClassID, to: ClassID): this {
    return this.addInheritance(from, to);
  }

  /**
   * Add an implementation relation (implements)
   * Class implements interface
   *
   * @example
   * ```typescript
   * builder.addImplementation(myClass, myInterface); // MyClass implements MyInterface
   * ```
   */
  addImplementation(implementer: ClassID, interface_: ClassID): this {
    return this.addRelation(implementer, interface_, '..|>');
  }

  /**
   * Alias for addImplementation
   */
  implements(implementer: ClassID, interface_: ClassID): this {
    return this.addImplementation(implementer, interface_);
  }

  /**
   * Alias for addImplementation
   */
  realizes(from: ClassID, to: ClassID): this {
    return this.addImplementation(from, to);
  }

  /**
   * Add an association relation
   * Basic relationship between classes
   *
   * @param cardinality - Cardinality like '1', '*', '0..1', '1..*', '0..*'
   *
   * @example
   * ```typescript
   * builder.addAssociation(student, course, 'enrolls in', '1', '*');
   * // Student --"enrolls in"--> Course (1 student enrolls in many courses)
   * ```
   */
  addAssociation(
    from: ClassID,
    to: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    // Validate cardinality format if provided
    if (cardinalityFrom && !this.isValidCardinality(cardinalityFrom)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_RELATIONSHIP,
        `Invalid cardinality: "${cardinalityFrom}". Valid formats: "1", "*", "0..1", "1..*", "0..*", "n"`,
        { from, to, cardinalityFrom }
      );
    }

    if (cardinalityTo && !this.isValidCardinality(cardinalityTo)) {
      throw new ValidationError(
        ValidationErrorCode.INVALID_RELATIONSHIP,
        `Invalid cardinality: "${cardinalityTo}". Valid formats: "1", "*", "0..1", "1..*", "0..*", "n"`,
        { from, to, cardinalityTo }
      );
    }

    return this.addRelation(from, to, '-->', label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Alias for addAssociation
   */
  associates(
    from: ClassID,
    to: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addAssociation(from, to, label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Add a composition relation (has-a, strong ownership)
   * Composed class cannot exist without composer
   */
  addComposition(
    composer: ClassID,
    composed: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addRelation(composer, composed, '*--', label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Alias for addComposition
   */
  composedOf(
    from: ClassID,
    to: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addComposition(from, to, label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Add an aggregation relation (has-a, weak ownership)
   * Aggregated class can exist independently
   *
   * @param cardinality - Cardinality like '1', '*', '0..1', '1..*', '0..*'
   *
   * @example
   * ```typescript
   * builder.addAggregation(team, player, 'has', '1', '*');
   * // Team o-- Player (Team aggregates Players)
   * ```
   */
  addAggregation(
    aggregator: ClassID,
    aggregated: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addRelation(aggregator, aggregated, 'o--', label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Alias for addAggregation
   */
  aggregates(
    from: ClassID,
    to: ClassID,
    label?: string,
    cardinalityFrom?: string,
    cardinalityTo?: string
  ): this {
    return this.addAggregation(from, to, label, cardinalityFrom, cardinalityTo);
  }

  /**
   * Add a dependency relation (uses)
   * One class depends on another temporarily
   *
   * @example
   * ```typescript
   * builder.addDependency(controller, service, 'uses');
   * // Controller ..> Service
   * ```
   */
  addDependency(from: ClassID, to: ClassID, label?: string): this {
    return this.addRelation(from, to, '..>', label);
  }

  /**
   * Alias for addDependency
   */
  dependsOn(from: ClassID, to: ClassID, label?: string): this {
    return this.addDependency(from, to, label);
  }

  /**
   * Validate cardinality format
   * Valid formats: "1", "*", "0..1", "1..*", "0..*", "n", "m", "1..n"
   */
  private isValidCardinality(cardinality: string): boolean {
    return /^(\d+|\*|n|m|[0-9]+\.\.\*|[0-9]+\.\.[0-9]+|[0-9]+\.\.n)$/.test(cardinality);
  }

  /**
   * Build and validate the complete class diagram
   */
  build(): ClassDiagram {
    if (this.classes.size === 0) {
      throw new ValidationError(
        ValidationErrorCode.CLASS_NOT_FOUND,
        'Class diagram must have at least one class',
        {}
      );
    }

    const classes = this.classOrder.map((cid) => {
      const cls = this.classes.get(cid);
      if (!cls) {
        throw new ValidationError(
          ValidationErrorCode.CLASS_NOT_FOUND,
          `Class "${cid}" not found in build`,
          { cid }
        );
      }

      // Separate members into attributes and methods for test compatibility
      const attributes = cls.members?.filter((m) => m.type === 'attribute') ?? [];
      const methods = cls.members?.filter((m) => m.type === 'method') ?? [];

      return {
        ...cls,
        attributes,
        methods,
      };
    });

    const diagram = {
      type: 'classDiagram' as const,
      classes,
      relations: this.relations,
      namespaces: [],
      relationships: this.relations.map((r) => ({
        ...r,
        type: r.relationType, // Add for test compatibility
        fromCardinality: r.cardinalityFrom, // Add for test compatibility
        toCardinality: r.cardinalityTo, // Add for test compatibility
      })),
    };

    return diagram;
  }

  /**
   * Get current class count
   */
  getClassCount(): number {
    return this.classes.size;
  }

  /**
   * Get current relationship count
   */
  getRelationshipCount(): number {
    return this.relationCount;
  }

  /**
   * Check if a class exists
   */
  hasClass(classId: ClassID): boolean {
    return this.classes.has(classId);
  }
}
