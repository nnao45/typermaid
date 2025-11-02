import type { ClassDiagram } from '@lyric-js/core';
export declare class ClassParser {
  private lines;
  private currentLine;
  constructor();
  parse(input: string): ClassDiagram;
  private parseNamespace;
  private parseClass;
  private parseClassMember;
  private isRelationLine;
  private parseRelation;
}
//# sourceMappingURL=class.d.ts.map
