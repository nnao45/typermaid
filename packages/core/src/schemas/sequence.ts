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

export type ArrowType = z.infer<typeof ArrowType>;

// Note position
export const NotePosition = z.enum(['left', 'right', 'over']);
export type NotePosition = z.infer<typeof NotePosition>;

// Participant
export const Participant = z.object({
  type: z.literal('participant'),
  id: z.string().min(1),
  alias: z.string().optional(),
});

export type Participant = z.infer<typeof Participant>;

// Actor
export const Actor = z.object({
  type: z.literal('actor'),
  id: z.string().min(1),
  alias: z.string().optional(),
});

export type Actor = z.infer<typeof Actor>;

// Message
export const Message = z.object({
  type: z.literal('message'),
  from: z.string().min(1),
  to: z.string().min(1),
  arrowType: ArrowType,
  text: z.string().optional(),
});

export type Message = z.infer<typeof Message>;

// Activation
export const Activation = z.object({
  type: z.literal('activation'),
  actor: z.string().min(1),
  activate: z.boolean(),
});

export type Activation = z.infer<typeof Activation>;

// Note
export const Note = z.object({
  type: z.literal('note'),
  position: NotePosition,
  actors: z.array(z.string().min(1)).min(1),
  text: z.string(),
});

export type Note = z.infer<typeof Note>;

// Loop
export const Loop: z.ZodType<{
  type: 'loop';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}> = z.object({
  type: z.literal('loop'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
}) as z.ZodType<{
  type: 'loop';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;

export type Loop = z.infer<typeof Loop>;

// Alt/Else
export const Alt: z.ZodType<{
  type: 'alt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  elseBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}> = z.object({
  type: z.literal('alt'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
  elseBlocks: z.array(
    z.object({
      condition: z.string().optional(),
      statements: z.array(z.lazy(() => SequenceStatement)),
    })
  ),
}) as z.ZodType<{
  type: 'alt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  elseBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}>;

export type Alt = z.infer<typeof Alt>;

// Opt
export const Opt: z.ZodType<{
  type: 'opt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}> = z.object({
  type: z.literal('opt'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
}) as z.ZodType<{
  type: 'opt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;

export type Opt = z.infer<typeof Opt>;

// Par
export const Par: z.ZodType<{
  type: 'par';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  andBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}> = z.object({
  type: z.literal('par'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
  andBlocks: z.array(
    z.object({
      condition: z.string().optional(),
      statements: z.array(z.lazy(() => SequenceStatement)),
    })
  ),
}) as z.ZodType<{
  type: 'par';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  andBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}>;

export type Par = z.infer<typeof Par>;

// Critical
export const Critical: z.ZodType<{
  type: 'critical';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  optionBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}> = z.object({
  type: z.literal('critical'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
  optionBlocks: z.array(
    z.object({
      condition: z.string().optional(),
      statements: z.array(z.lazy(() => SequenceStatement)),
    })
  ),
}) as z.ZodType<{
  type: 'critical';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  optionBlocks: Array<{ condition?: string; statements: z.infer<typeof SequenceStatement>[] }>;
}>;

export type Critical = z.infer<typeof Critical>;

// Break
export const Break: z.ZodType<{
  type: 'break';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}> = z.object({
  type: z.literal('break'),
  condition: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
}) as z.ZodType<{
  type: 'break';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;

export type Break = z.infer<typeof Break>;

// Rect
export const Rect: z.ZodType<{
  type: 'rect';
  color?: string;
  statements: z.infer<typeof SequenceStatement>[];
}> = z.object({
  type: z.literal('rect'),
  color: z.string().optional(),
  statements: z.array(z.lazy(() => SequenceStatement)),
}) as z.ZodType<{
  type: 'rect';
  color?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;

export type Rect = z.infer<typeof Rect>;

// Box
export const Box = z.object({
  type: z.literal('box'),
  label: z.string().optional(),
  color: z.string().optional(),
  participants: z.array(z.union([Participant, Actor])),
});

export type Box = z.infer<typeof Box>;

// Autonumber
export const Autonumber = z.object({
  type: z.literal('autonumber'),
  start: z.number().int().optional(),
  format: z.string().optional(),
});

export type Autonumber = z.infer<typeof Autonumber>;

// Create/Destroy
export const Create = z.object({
  type: z.literal('create'),
  actor: z.string().min(1),
});

export type Create = z.infer<typeof Create>;

export const Destroy = z.object({
  type: z.literal('destroy'),
  actor: z.string().min(1),
});

export type Destroy = z.infer<typeof Destroy>;

// Links
export const Link = z.object({
  type: z.literal('link'),
  actor: z.string().min(1),
  url: z.string().url(),
  label: z.string().optional(),
});

export type Link = z.infer<typeof Link>;

// Properties
export const Properties = z.object({
  type: z.literal('properties'),
  actor: z.string().min(1),
  properties: z.record(z.string(), z.string()),
});

export type Properties = z.infer<typeof Properties>;

// Sequence statement (union of all possible statements)
export const SequenceStatement: z.ZodLazy<
  z.ZodUnion<
    [
      typeof Participant,
      typeof Actor,
      typeof Message,
      typeof Activation,
      typeof Note,
      typeof Loop,
      typeof Alt,
      typeof Opt,
      typeof Par,
      typeof Critical,
      typeof Break,
      typeof Rect,
      typeof Box,
      typeof Autonumber,
      typeof Create,
      typeof Destroy,
      typeof Link,
      typeof Properties,
    ]
  >
> = z.lazy(() =>
  z.union([
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
  ])
);

export type SequenceStatement = z.infer<typeof SequenceStatement>;

// Sequence Diagram
export const SequenceDiagram = z.object({
  type: z.literal('sequence'),
  statements: z.array(SequenceStatement),
  style: StyleSchema.optional(),
});

export type SequenceDiagram = z.infer<typeof SequenceDiagram>;
