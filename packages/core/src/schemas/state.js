import { z } from 'zod';
import { ContentSchema } from './content.js';
// State types
export const StateType = z.enum([
    'STATE', // Normal state
    'CHOICE', // <<choice>>
    'FORK', // <<fork>>
    'JOIN', // <<join>>
    'START', // [*]
    'END', // [*]
]);
// State direction
export const StateDirection = z.enum(['TB', 'TD', 'BT', 'LR', 'RL']);
export const StateSchema = z.object({
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
// Note
export const StateNoteSchema = z.object({
    state: z.string(),
    note: ContentSchema, // HTML support for notes
    position: z.enum(['left', 'right']).optional(),
});
// Concurrency region (separated by --)
export const ConcurrencyRegionSchema = z.object({
    states: z.array(StateSchema),
    transitions: z.array(StateTransitionSchema),
});
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
//# sourceMappingURL=state.js.map