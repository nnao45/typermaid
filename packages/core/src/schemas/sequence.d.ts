import { z } from 'zod';
export declare const ArrowType: z.ZodEnum<{
  dotted_arrow: 'dotted_arrow';
  solid: 'solid';
  dotted: 'dotted';
  solid_arrow: 'solid_arrow';
  solid_cross: 'solid_cross';
  dotted_cross: 'dotted_cross';
  solid_open: 'solid_open';
  dotted_open: 'dotted_open';
}>;
export type ArrowType = z.infer<typeof ArrowType>;
export declare const NotePosition: z.ZodEnum<{
  left: 'left';
  right: 'right';
  over: 'over';
}>;
export type NotePosition = z.infer<typeof NotePosition>;
export declare const Participant: z.ZodObject<
  {
    type: z.ZodLiteral<'participant'>;
    id: z.ZodString;
    alias: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Participant = z.infer<typeof Participant>;
export declare const Actor: z.ZodObject<
  {
    type: z.ZodLiteral<'actor'>;
    id: z.ZodString;
    alias: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Actor = z.infer<typeof Actor>;
export declare const Message: z.ZodObject<
  {
    type: z.ZodLiteral<'message'>;
    from: z.ZodString;
    to: z.ZodString;
    arrowType: z.ZodEnum<{
      dotted_arrow: 'dotted_arrow';
      solid: 'solid';
      dotted: 'dotted';
      solid_arrow: 'solid_arrow';
      solid_cross: 'solid_cross';
      dotted_cross: 'dotted_cross';
      solid_open: 'solid_open';
      dotted_open: 'dotted_open';
    }>;
    text: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Message = z.infer<typeof Message>;
export declare const Activation: z.ZodObject<
  {
    type: z.ZodLiteral<'activation'>;
    actor: z.ZodString;
    activate: z.ZodBoolean;
  },
  z.core.$strip
>;
export type Activation = z.infer<typeof Activation>;
export declare const Note: z.ZodObject<
  {
    type: z.ZodLiteral<'note'>;
    position: z.ZodEnum<{
      left: 'left';
      right: 'right';
      over: 'over';
    }>;
    actors: z.ZodArray<z.ZodString>;
    text: z.ZodString;
  },
  z.core.$strip
>;
export type Note = z.infer<typeof Note>;
export declare const Loop: z.ZodType<{
  type: 'loop';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;
export type Loop = z.infer<typeof Loop>;
export declare const Alt: z.ZodType<{
  type: 'alt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  elseBlocks: Array<{
    condition?: string;
    statements: z.infer<typeof SequenceStatement>[];
  }>;
}>;
export type Alt = z.infer<typeof Alt>;
export declare const Opt: z.ZodType<{
  type: 'opt';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;
export type Opt = z.infer<typeof Opt>;
export declare const Par: z.ZodType<{
  type: 'par';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  andBlocks: Array<{
    condition?: string;
    statements: z.infer<typeof SequenceStatement>[];
  }>;
}>;
export type Par = z.infer<typeof Par>;
export declare const Critical: z.ZodType<{
  type: 'critical';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
  optionBlocks: Array<{
    condition?: string;
    statements: z.infer<typeof SequenceStatement>[];
  }>;
}>;
export type Critical = z.infer<typeof Critical>;
export declare const Break: z.ZodType<{
  type: 'break';
  condition?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;
export type Break = z.infer<typeof Break>;
export declare const Rect: z.ZodType<{
  type: 'rect';
  color?: string;
  statements: z.infer<typeof SequenceStatement>[];
}>;
export type Rect = z.infer<typeof Rect>;
export declare const Box: z.ZodObject<
  {
    type: z.ZodLiteral<'box'>;
    label: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    participants: z.ZodArray<
      z.ZodUnion<
        readonly [
          z.ZodObject<
            {
              type: z.ZodLiteral<'participant'>;
              id: z.ZodString;
              alias: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >,
          z.ZodObject<
            {
              type: z.ZodLiteral<'actor'>;
              id: z.ZodString;
              alias: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >,
        ]
      >
    >;
  },
  z.core.$strip
>;
export type Box = z.infer<typeof Box>;
export declare const Autonumber: z.ZodObject<
  {
    type: z.ZodLiteral<'autonumber'>;
    start: z.ZodOptional<z.ZodNumber>;
    format: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Autonumber = z.infer<typeof Autonumber>;
export declare const Create: z.ZodObject<
  {
    type: z.ZodLiteral<'create'>;
    actor: z.ZodString;
  },
  z.core.$strip
>;
export type Create = z.infer<typeof Create>;
export declare const Destroy: z.ZodObject<
  {
    type: z.ZodLiteral<'destroy'>;
    actor: z.ZodString;
  },
  z.core.$strip
>;
export type Destroy = z.infer<typeof Destroy>;
export declare const Link: z.ZodObject<
  {
    type: z.ZodLiteral<'link'>;
    actor: z.ZodString;
    url: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Link = z.infer<typeof Link>;
export declare const Properties: z.ZodObject<
  {
    type: z.ZodLiteral<'properties'>;
    actor: z.ZodString;
    properties: z.ZodRecord<z.ZodString, z.ZodString>;
  },
  z.core.$strip
>;
export type Properties = z.infer<typeof Properties>;
export declare const SequenceStatement: z.ZodLazy<
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
>;
export type SequenceStatement = z.infer<typeof SequenceStatement>;
export declare const SequenceDiagram: z.ZodObject<
  {
    type: z.ZodLiteral<'sequence'>;
    statements: z.ZodArray<
      z.ZodLazy<
        z.ZodUnion<
          [
            z.ZodObject<
              {
                type: z.ZodLiteral<'participant'>;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'actor'>;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'message'>;
                from: z.ZodString;
                to: z.ZodString;
                arrowType: z.ZodEnum<{
                  dotted_arrow: 'dotted_arrow';
                  solid: 'solid';
                  dotted: 'dotted';
                  solid_arrow: 'solid_arrow';
                  solid_cross: 'solid_cross';
                  dotted_cross: 'dotted_cross';
                  solid_open: 'solid_open';
                  dotted_open: 'dotted_open';
                }>;
                text: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'activation'>;
                actor: z.ZodString;
                activate: z.ZodBoolean;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'note'>;
                position: z.ZodEnum<{
                  left: 'left';
                  right: 'right';
                  over: 'over';
                }>;
                actors: z.ZodArray<z.ZodString>;
                text: z.ZodString;
              },
              z.core.$strip
            >,
            z.ZodType<
              {
                type: 'loop';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'loop';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'alt';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
                elseBlocks: Array<{
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                }>;
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'alt';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                  elseBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof SequenceStatement>[];
                  }>;
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'opt';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'opt';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'par';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
                andBlocks: Array<{
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                }>;
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'par';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                  andBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof SequenceStatement>[];
                  }>;
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'critical';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
                optionBlocks: Array<{
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                }>;
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'critical';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                  optionBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof SequenceStatement>[];
                  }>;
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'break';
                condition?: string;
                statements: z.infer<typeof SequenceStatement>[];
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'break';
                  condition?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                },
                unknown
              >
            >,
            z.ZodType<
              {
                type: 'rect';
                color?: string;
                statements: z.infer<typeof SequenceStatement>[];
              },
              unknown,
              z.core.$ZodTypeInternals<
                {
                  type: 'rect';
                  color?: string;
                  statements: z.infer<typeof SequenceStatement>[];
                },
                unknown
              >
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'box'>;
                label: z.ZodOptional<z.ZodString>;
                color: z.ZodOptional<z.ZodString>;
                participants: z.ZodArray<
                  z.ZodUnion<
                    readonly [
                      z.ZodObject<
                        {
                          type: z.ZodLiteral<'participant'>;
                          id: z.ZodString;
                          alias: z.ZodOptional<z.ZodString>;
                        },
                        z.core.$strip
                      >,
                      z.ZodObject<
                        {
                          type: z.ZodLiteral<'actor'>;
                          id: z.ZodString;
                          alias: z.ZodOptional<z.ZodString>;
                        },
                        z.core.$strip
                      >,
                    ]
                  >
                >;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'autonumber'>;
                start: z.ZodOptional<z.ZodNumber>;
                format: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'create'>;
                actor: z.ZodString;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'destroy'>;
                actor: z.ZodString;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'link'>;
                actor: z.ZodString;
                url: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >,
            z.ZodObject<
              {
                type: z.ZodLiteral<'properties'>;
                actor: z.ZodString;
                properties: z.ZodRecord<z.ZodString, z.ZodString>;
              },
              z.core.$strip
            >,
          ]
        >
      >
    >;
    style: z.ZodOptional<
      z.ZodObject<
        {
          fill: z.ZodOptional<
            z.ZodObject<
              {
                color: z.ZodOptional<
                  z.ZodUnion<
                    readonly [
                      z.ZodString,
                      z.ZodString,
                      z.ZodString,
                      z.ZodEnum<{
                        black: 'black';
                        white: 'white';
                        red: 'red';
                        green: 'green';
                        blue: 'blue';
                        yellow: 'yellow';
                        cyan: 'cyan';
                        magenta: 'magenta';
                        gray: 'gray';
                        grey: 'grey';
                        orange: 'orange';
                        purple: 'purple';
                        pink: 'pink';
                        brown: 'brown';
                        transparent: 'transparent';
                      }>,
                    ]
                  >
                >;
                opacity: z.ZodOptional<z.ZodNumber>;
              },
              z.core.$strip
            >
          >;
          stroke: z.ZodOptional<
            z.ZodObject<
              {
                color: z.ZodOptional<
                  z.ZodUnion<
                    readonly [
                      z.ZodString,
                      z.ZodString,
                      z.ZodString,
                      z.ZodEnum<{
                        black: 'black';
                        white: 'white';
                        red: 'red';
                        green: 'green';
                        blue: 'blue';
                        yellow: 'yellow';
                        cyan: 'cyan';
                        magenta: 'magenta';
                        gray: 'gray';
                        grey: 'grey';
                        orange: 'orange';
                        purple: 'purple';
                        pink: 'pink';
                        brown: 'brown';
                        transparent: 'transparent';
                      }>,
                    ]
                  >
                >;
                width: z.ZodOptional<z.ZodNumber>;
                dasharray: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >
          >;
          font: z.ZodOptional<
            z.ZodObject<
              {
                family: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
                weight: z.ZodOptional<
                  z.ZodEnum<{
                    normal: 'normal';
                    bold: 'bold';
                    100: '100';
                    200: '200';
                    300: '300';
                    400: '400';
                    500: '500';
                    600: '600';
                    700: '700';
                    800: '800';
                    900: '900';
                  }>
                >;
                style: z.ZodOptional<
                  z.ZodEnum<{
                    normal: 'normal';
                    italic: 'italic';
                    oblique: 'oblique';
                  }>
                >;
                color: z.ZodOptional<
                  z.ZodUnion<
                    readonly [
                      z.ZodString,
                      z.ZodString,
                      z.ZodString,
                      z.ZodEnum<{
                        black: 'black';
                        white: 'white';
                        red: 'red';
                        green: 'green';
                        blue: 'blue';
                        yellow: 'yellow';
                        cyan: 'cyan';
                        magenta: 'magenta';
                        gray: 'gray';
                        grey: 'grey';
                        orange: 'orange';
                        purple: 'purple';
                        pink: 'pink';
                        brown: 'brown';
                        transparent: 'transparent';
                      }>,
                    ]
                  >
                >;
              },
              z.core.$strip
            >
          >;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type SequenceDiagram = z.infer<typeof SequenceDiagram>;
//# sourceMappingURL=sequence.d.ts.map
