import { z } from 'zod';
import { EntityIDSchema } from './branded.js';
import type { Style } from './common.js';
import { ContentSchema } from './content.js';

// Cardinality: ||, }|, }o, o{, |{
export const ERCardinality = z.enum([
  'ZERO_OR_ONE', // |o
  'EXACTLY_ONE', // ||
  'ZERO_OR_MORE', // }o
  'ONE_OR_MORE', // }|
]);
export type ERCardinality = z.infer<typeof ERCardinality>;

// Identification: -- (non-identifying), .. (identifying)
export const ERIdentification = z.enum(['IDENTIFYING', 'NON_IDENTIFYING']);
export type ERIdentification = z.infer<typeof ERIdentification>;

// Attribute type
export const ERAttributeType = z.string();
export type ERAttributeType = z.infer<typeof ERAttributeType>;

// Attribute key type
export const ERAttributeKey = z.enum(['PK', 'FK', 'UK']);
export type ERAttributeKey = z.infer<typeof ERAttributeKey>;

// Entity attribute
export const ERAttribute = z.object({
  type: ERAttributeType,
  name: z.string(),
  key: ERAttributeKey.optional(),
  comment: ContentSchema.optional(), // HTML/Markdown/PlainText support 💅
});
export type ERAttribute = z.infer<typeof ERAttribute>;

// Entity
export const EREntity = z.object({
  name: EntityIDSchema,
  attributes: z.array(ERAttribute),
});
export type EREntity = z.infer<typeof EREntity>;

// Relationship between entities
export const ERRelationship = z.object({
  from: EntityIDSchema,
  to: EntityIDSchema,
  fromCardinality: ERCardinality,
  toCardinality: ERCardinality,
  identification: ERIdentification,
  label: ContentSchema.optional(), // HTML/Markdown/PlainText support 💅
});
export type ERRelationship = z.infer<typeof ERRelationship>;

// ER Diagram
export const ERDiagram = z.object({
  type: z.literal('er'),
  entities: z.array(EREntity),
  relationships: z.array(ERRelationship),
  styles: z.record(z.string(), z.custom<Style>()).optional(),
});
export type ERDiagram = z.infer<typeof ERDiagram>;
