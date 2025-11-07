import { z } from 'zod';
// Cardinality: ||, }|, }o, o{, |{
export const ERCardinality = z.enum([
  'ZERO_OR_ONE', // |o
  'EXACTLY_ONE', // ||
  'ZERO_OR_MORE', // }o
  'ONE_OR_MORE', // }|
]);
// Identification: -- (non-identifying), .. (identifying)
export const ERIdentification = z.enum(['IDENTIFYING', 'NON_IDENTIFYING']);
// Attribute type
export const ERAttributeType = z.string();
// Attribute key type
export const ERAttributeKey = z.enum(['PK', 'FK', 'UK']);
// Entity attribute
export const ERAttribute = z.object({
  type: ERAttributeType,
  name: z.string(),
  key: ERAttributeKey.optional(),
  comment: z.string().optional(),
});
// Entity
export const EREntity = z.object({
  name: z.string(),
  attributes: z.array(ERAttribute),
});
// Relationship between entities
export const ERRelationship = z.object({
  from: z.string(),
  to: z.string(),
  fromCardinality: ERCardinality,
  toCardinality: ERCardinality,
  identification: ERIdentification,
  label: z.string().optional(),
});
// ER Diagram
export const ERDiagram = z.object({
  type: z.literal('er'),
  entities: z.array(EREntity),
  relationships: z.array(ERRelationship),
  styles: z.record(z.string(), z.custom()).optional(),
});
//# sourceMappingURL=er.js.map
