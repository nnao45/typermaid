import type {
  ClassAnnotation,
  ClassDefinition,
  ClassDiagram,
  ClassMember,
  ClassNamespace,
  ClassRelation,
  ClassVisibility,
} from '@lyric-js/core';

export class ClassParser {
  private lines: string[];
  private currentLine = 0;

  constructor() {
    this.lines = [];
  }

  parse(input: string): ClassDiagram {
    this.lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('%%'));
    this.currentLine = 0;

    const diagram: ClassDiagram = {
      type: 'classDiagram',
      classes: [],
      relations: [],
      namespaces: [],
    };

    // Skip "classDiagram" declaration
    if (this.lines[0]?.toLowerCase() === 'classdiagram') {
      this.currentLine++;
    }

    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine];

      if (!line) {
        this.currentLine++;
        continue;
      }

      // Direction
      if (line.startsWith('direction ')) {
        diagram.direction = line.split(' ')[1] as 'TB' | 'BT' | 'LR' | 'RL';
        this.currentLine++;
        continue;
      }

      // Namespace
      if (line.startsWith('namespace ')) {
        const namespace = this.parseNamespace();
        diagram.namespaces.push(namespace);
        continue;
      }

      // Class definition
      if (line.startsWith('class ')) {
        const classData = this.parseClass();
        diagram.classes.push(classData);
        continue;
      }

      // Relation
      if (this.isRelationLine(line)) {
        const relation = this.parseRelation(line);
        diagram.relations.push(relation);
        this.currentLine++;
        continue;
      }

      this.currentLine++;
    }

    return diagram;
  }

  private parseNamespace(): ClassNamespace {
    const line = this.lines[this.currentLine];
    if (!line) {
      return { name: '', classes: [] };
    }
    const match = line.match(/namespace\s+(\w+)\s*{?/);
    const name = match?.[1] || '';

    const classes: string[] = [];
    this.currentLine++;

    while (this.currentLine < this.lines.length) {
      const currentLine = this.lines[this.currentLine];
      if (!currentLine) {
        this.currentLine++;
        continue;
      }
      if (currentLine === '}') {
        this.currentLine++;
        break;
      }

      if (currentLine.startsWith('class ')) {
        const className = currentLine.match(/class\s+(\w+)/)?.[1];
        if (className) classes.push(className);
      }
      this.currentLine++;
    }

    return { name, classes };
  }

  private parseClass(): ClassDefinition {
    const line = this.lines[this.currentLine];
    if (!line) {
      return { id: '', name: '', members: [] };
    }
    let match = line.match(/class\s+(\w+)(?:~([^~]+)~)?\s*{?/);

    if (!match) {
      match = line.match(/class\s+(\w+)/);
    }

    const name = match?.[1] || '';
    const generics = match?.[2];

    const classData: ClassDefinition = {
      id: name,
      name,
      members: [],
    };

    if (generics) {
      classData.generics = generics;
    }

    this.currentLine++;

    // Check if class has body
    if (!line.endsWith('{') && !this.lines[this.currentLine]?.trim()) {
      return classData;
    }

    // Parse class body
    while (this.currentLine < this.lines.length) {
      const currentLine = this.lines[this.currentLine];
      if (!currentLine) {
        this.currentLine++;
        continue;
      }

      if (currentLine === '}') {
        this.currentLine++;
        break;
      }

      // Annotation
      if (currentLine.startsWith('<<') && currentLine.endsWith('>>')) {
        const annotation = currentLine.slice(2, -2) as ClassAnnotation;
        classData.annotation = annotation;
        this.currentLine++;
        continue;
      }

      // Member
      const member = this.parseClassMember(currentLine);
      if (member) {
        classData.members.push(member);
      }

      this.currentLine++;
    }

    return classData;
  }

  private parseClassMember(line: string): ClassMember | null {
    if (!line || line === '}' || line === '{') return null;

    const visibilityMatch = line.match(/^([+\-#~])/);
    const visibility = visibilityMatch?.[1] as ClassVisibility | undefined;

    let content = visibility ? line.slice(1).trim() : line.trim();

    // Check for static/abstract modifiers
    const isStatic = content.includes('$');
    const isAbstract = content.includes('*');
    content = content.replace(/[$*]/g, '').trim();

    // Method: contains ()
    if (content.includes('(')) {
      const methodMatch = content.match(/(\w+)\s*\(([^)]*)\)(?:\s+(.+))?/);
      if (methodMatch) {
        return {
          type: 'method',
          visibility,
          name: methodMatch[1] || '',
          parameters: methodMatch[2] || '',
          returnType: methodMatch[3],
          isStatic,
          isAbstract,
        };
      }
    }

    // Attribute
    const attrMatch = content.match(/(\w+)\s+(\w+)/);
    if (attrMatch) {
      return {
        type: 'attribute',
        visibility,
        name: attrMatch[2] || '',
        returnType: attrMatch[1] || '',
        isStatic,
        isAbstract,
      };
    }

    // Simple attribute or method without type
    const simpleMatch = content.match(/^(\w+)(\(\))?$/);
    if (simpleMatch) {
      return {
        type: simpleMatch[2] ? 'method' : 'attribute',
        visibility,
        name: simpleMatch[1] || '',
        isStatic,
        isAbstract,
      };
    }

    return null;
  }

  private isRelationLine(line: string): boolean {
    const relationPatterns = ['<|--', '*--', 'o--', '-->', '--', '..|>', '..>', '..'];
    return relationPatterns.some((pattern) => line.includes(pattern));
  }

  private parseRelation(line: string): ClassRelation {
    // Extract cardinality and labels

    let from = '';
    let to = '';
    let relationType = '--';
    let label: string | undefined;
    let cardinalityFrom: string | undefined;
    let cardinalityTo: string | undefined;

    // Pattern: ClassA "1" --> "*" ClassB : label
    // Pattern: ClassA <|-- ClassB
    // Pattern: ClassA --|> ClassB : Inheritance

    // Find relation operator
    const relationMatch = line.match(
      /([<|*o.-]+)([|>o*-]+)|(<\|--|--\*|--o|-->|--|\.\.\|>|\.\.>|\.\.)/
    );
    if (relationMatch) {
      relationType = relationMatch[0];
    }

    const [left, right] = line.split(relationType);

    // Parse left side
    const leftParts = left?.trim().split(/\s+/) || [];
    from = leftParts[0] || '';
    if (leftParts.length > 1 && leftParts[1]?.match(/^["'].*["']$/)) {
      cardinalityFrom = leftParts[1].slice(1, -1);
    }

    // Parse right side
    if (right) {
      const rightParts = right.trim().split(/\s+/);
      if (rightParts[0]?.match(/^["'].*["']$/)) {
        cardinalityTo = rightParts[0].slice(1, -1);
        to = rightParts[1] || '';
      } else {
        to = rightParts[0] || '';
      }

      // Extract label after :
      const colonIndex = right.indexOf(':');
      if (colonIndex !== -1) {
        label = right.slice(colonIndex + 1).trim();
      }
    }

    return {
      from,
      to,
      relationType: relationType as ClassRelation['relationType'],
      label,
      cardinalityFrom,
      cardinalityTo,
    };
  }
}
