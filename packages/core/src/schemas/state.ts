import { z } from 'zod';
import { type Content, ContentSchema } from './content.js';

// State types
export const StateType = z.enum([
  'STATE', // Normal state
  'CHOICE', // <<choice>>
  'FORK', // <<fork>>
  'JOIN', // <<join>>
  'START', // [*]
  'END', // [*]
]);

export type StateType = z.infer<typeof StateType>;

// State direction
export const StateDirection = z.enum(['TB', 'TD', 'BT', 'LR', 'RL']);
export type StateDirection = z.infer<typeof StateDirection>;

// State definition
export type State = {
  id: string;
  type: StateType;
  label?: Content | undefined; // HTML support for state labels
  description?: Content | undefined; // HTML support for state descriptions
  compositeStates?: State[] | undefined;
};

export const StateSchema: z.ZodType<State> = z.object({
  id: z.string(),
  type: StateType.default('STATE'),
  label: ContentSchema.optional(),
  description: ContentSchema.optional(),
  compositeStates: z.lazy(() => z.array(StateSchema)).optional(),
});

// State transition
export const StateTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: ContentSchema.optional(), // HTML support for transition labels
});

export type StateTransition = z.infer<typeof StateTransitionSchema>;

// Note
export const StateNoteSchema = z.object({
  state: z.string(),
  note: ContentSchema, // HTML support for notes
  position: z.enum(['left', 'right']).optional(),
});

export type StateNote = z.infer<typeof StateNoteSchema>;

// Concurrency region (separated by --)
export const ConcurrencyRegionSchema = z.object({
  states: z.array(StateSchema),
  transitions: z.array(StateTransitionSchema),
});

export type ConcurrencyRegion = z.infer<typeof ConcurrencyRegionSchema>;

// State diagram
export const StateDiagramSchema = z.object({
  type: z.literal('state'),
  version: z.enum(['v1', 'v2']).default('v2'),
  direction: StateDirection.optional(),
  states: z.array(StateSchema),
  transitions: z.array(StateTransitionSchema),
  notes: z.array(StateNoteSchema).default([]),
  concurrencyRegions: z.array(ConcurrencyRegionSchema).optional(),
});

export type StateDiagram = z.infer<typeof StateDiagramSchema>;
