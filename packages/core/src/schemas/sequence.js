import { z } from 'zod';
import { StyleSchema } from './common.js';
// Arrow types
export const ArrowType = z.enum([
    'solid', // ->
    'dotted', // -->
    'solid_arrow', // ->>
    'dotted_arrow', // -->>
    'solid_cross', // -x
    'dotted_cross', // --x
    'solid_open', // -)
    'dotted_open', // --)
]);
// Note position
export const NotePosition = z.enum(['left', 'right', 'over']);
// Participant
export const Participant = z.object({
    type: z.literal('participant'),
    id: z.string().min(1),
    alias: z.string().optional(),
});
// Actor
export const Actor = z.object({
    type: z.literal('actor'),
    id: z.string().min(1),
    alias: z.string().optional(),
});
// Message
export const Message = z.object({
    type: z.literal('message'),
    from: z.string().min(1),
    to: z.string().min(1),
    arrowType: ArrowType,
    text: z.string().optional(),
});
// Activation
export const Activation = z.object({
    type: z.literal('activation'),
    actor: z.string().min(1),
    activate: z.boolean(),
});
// Note
export const Note = z.object({
    type: z.literal('note'),
    position: NotePosition,
    actors: z.array(z.string().min(1)).min(1),
    text: z.string(),
});
// Loop
export const Loop = z.object({
    type: z.literal('loop'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
});
// Alt/Else
export const Alt = z.object({
    type: z.literal('alt'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
    elseBlocks: z.array(z.object({
        condition: z.string().optional(),
        statements: z.array(z.lazy(() => SequenceStatement)),
    })),
});
// Opt
export const Opt = z.object({
    type: z.literal('opt'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
});
// Par
export const Par = z.object({
    type: z.literal('par'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
    andBlocks: z.array(z.object({
        condition: z.string().optional(),
        statements: z.array(z.lazy(() => SequenceStatement)),
    })),
});
// Critical
export const Critical = z.object({
    type: z.literal('critical'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
    optionBlocks: z.array(z.object({
        condition: z.string().optional(),
        statements: z.array(z.lazy(() => SequenceStatement)),
    })),
});
// Break
export const Break = z.object({
    type: z.literal('break'),
    condition: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
});
// Rect
export const Rect = z.object({
    type: z.literal('rect'),
    color: z.string().optional(),
    statements: z.array(z.lazy(() => SequenceStatement)),
});
// Box
export const Box = z.object({
    type: z.literal('box'),
    label: z.string().optional(),
    color: z.string().optional(),
    participants: z.array(z.union([Participant, Actor])),
});
// Autonumber
export const Autonumber = z.object({
    type: z.literal('autonumber'),
    start: z.number().int().optional(),
    format: z.string().optional(),
});
// Create/Destroy
export const Create = z.object({
    type: z.literal('create'),
    actor: z.string().min(1),
});
export const Destroy = z.object({
    type: z.literal('destroy'),
    actor: z.string().min(1),
});
// Links
export const Link = z.object({
    type: z.literal('link'),
    actor: z.string().min(1),
    url: z.string().url(),
    label: z.string().optional(),
});
// Properties
export const Properties = z.object({
    type: z.literal('properties'),
    actor: z.string().min(1),
    properties: z.record(z.string(), z.string()),
});
// Sequence statement (union of all possible statements)
export const SequenceStatement = z.lazy(() => z.union([
    Participant,
    Actor,
    Message,
    Activation,
    Note,
    Loop,
    Alt,
    Opt,
    Par,
    Critical,
    Break,
    Rect,
    Box,
    Autonumber,
    Create,
    Destroy,
    Link,
    Properties,
]));
// Sequence Diagram
export const SequenceDiagram = z.object({
    type: z.literal('sequence'),
    statements: z.array(SequenceStatement),
    style: StyleSchema.optional(),
});
//# sourceMappingURL=sequence.js.map