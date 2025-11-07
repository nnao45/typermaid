import { z } from 'zod';
export const ClassVisibility = z.enum([
  '+', // public
  '-', // private
  '#', // protected
  '~', // package/internal
]);
export const ClassMemberType = z.enum(['attribute', 'method']);
export const ClassMember = z.object({
  type: ClassMemberType,
  visibility: ClassVisibility.optional(),
  name: z.string(),
  returnType: z.string().optional(),
  parameters: z.string().optional(),
  isStatic: z.boolean().default(false),
  isAbstract: z.boolean().default(false),
});
export const ClassAnnotation = z.enum(['interface', 'abstract', 'service', 'enumeration']);
export const ClassDefinition = z.object({
  id: z.string(),
  name: z.string(),
  annotation: ClassAnnotation.optional(),
  members: z.array(ClassMember).default([]),
  generics: z.string().optional(),
});
export const ClassRelationType = z.enum([
  '<|--', // Inheritance (solid line with closed arrow)
  '*--', // Composition (solid line with filled diamond)
  'o--', // Aggregation (solid line with empty diamond)
  '-->', // Association (solid line with arrow)
  '--', // Link (solid line)
  '..|>', // Realization (dotted line with closed arrow)
  '..>', // Dependency (dotted line with arrow)
  '..', // Link (dotted line)
]);
export const ClassRelation = z.object({
  from: z.string(),
  to: z.string(),
  relationType: ClassRelationType,
  label: z.string().optional(),
  cardinalityFrom: z.string().optional(),
  cardinalityTo: z.string().optional(),
});
export const ClassNamespace = z.object({
  name: z.string(),
  classes: z.array(z.string()),
});
export const ClassDiagram = z.object({
  type: z.literal('classDiagram'),
  direction: z.enum(['TB', 'BT', 'LR', 'RL']).optional(),
  classes: z.array(ClassDefinition).default([]),
  relations: z.array(ClassRelation).default([]),
  namespaces: z.array(ClassNamespace).default([]),
});
//# sourceMappingURL=class.js.map
