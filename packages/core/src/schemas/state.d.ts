import { z } from 'zod';
import { type Content } from './content.js';
export declare const StateType: z.ZodEnum<{
  END: 'END';
  STATE: 'STATE';
  CHOICE: 'CHOICE';
  FORK: 'FORK';
  JOIN: 'JOIN';
  START: 'START';
}>;
export type StateType = z.infer<typeof StateType>;
export declare const StateDirection: z.ZodEnum<{
  TB: 'TB';
  TD: 'TD';
  BT: 'BT';
  LR: 'LR';
  RL: 'RL';
}>;
export type StateDirection = z.infer<typeof StateDirection>;
export type State = {
  id: string;
  type: StateType;
  label?: Content | undefined;
  description?: Content | undefined;
  compositeStates?: State[] | undefined;
};
export declare const StateSchema: z.ZodType<State>;
export declare const StateTransitionSchema: z.ZodObject<
  {
    from: z.ZodString;
    to: z.ZodString;
    label: z.ZodOptional<
      z.ZodUnion<
        readonly [
          z.ZodObject<
            {
              type: z.ZodLiteral<'html'>;
              raw: z.ZodString;
              sanitized: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >,
          z.ZodObject<
            {
              type: z.ZodLiteral<'markdown'>;
              raw: z.ZodString;
              parsed: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >,
          z.ZodString,
        ]
      >
    >;
  },
  z.core.$strip
>;
export type StateTransition = z.infer<typeof StateTransitionSchema>;
export declare const StateNoteSchema: z.ZodObject<
  {
    state: z.ZodString;
    note: z.ZodUnion<
      readonly [
        z.ZodObject<
          {
            type: z.ZodLiteral<'html'>;
            raw: z.ZodString;
            sanitized: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >,
        z.ZodObject<
          {
            type: z.ZodLiteral<'markdown'>;
            raw: z.ZodString;
            parsed: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >,
        z.ZodString,
      ]
    >;
    position: z.ZodOptional<
      z.ZodEnum<{
        left: 'left';
        right: 'right';
      }>
    >;
  },
  z.core.$strip
>;
export type StateNote = z.infer<typeof StateNoteSchema>;
export declare const ConcurrencyRegionSchema: z.ZodObject<
  {
    states: z.ZodArray<z.ZodType<State, unknown, z.core.$ZodTypeInternals<State, unknown>>>;
    transitions: z.ZodArray<
      z.ZodObject<
        {
          from: z.ZodString;
          to: z.ZodString;
          label: z.ZodOptional<
            z.ZodUnion<
              readonly [
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'html'>;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'markdown'>;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodString,
              ]
            >
          >;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type ConcurrencyRegion = z.infer<typeof ConcurrencyRegionSchema>;
export declare const StateDiagramSchema: z.ZodObject<
  {
    type: z.ZodLiteral<'state'>;
    version: z.ZodDefault<
      z.ZodEnum<{
        v1: 'v1';
        v2: 'v2';
      }>
    >;
    direction: z.ZodOptional<
      z.ZodEnum<{
        TB: 'TB';
        TD: 'TD';
        BT: 'BT';
        LR: 'LR';
        RL: 'RL';
      }>
    >;
    states: z.ZodArray<z.ZodType<State, unknown, z.core.$ZodTypeInternals<State, unknown>>>;
    transitions: z.ZodArray<
      z.ZodObject<
        {
          from: z.ZodString;
          to: z.ZodString;
          label: z.ZodOptional<
            z.ZodUnion<
              readonly [
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'html'>;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'markdown'>;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodString,
              ]
            >
          >;
        },
        z.core.$strip
      >
    >;
    notes: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            state: z.ZodString;
            note: z.ZodUnion<
              readonly [
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'html'>;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodObject<
                  {
                    type: z.ZodLiteral<'markdown'>;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                  },
                  z.core.$strip
                >,
                z.ZodString,
              ]
            >;
            position: z.ZodOptional<
              z.ZodEnum<{
                left: 'left';
                right: 'right';
              }>
            >;
          },
          z.core.$strip
        >
      >
    >;
    concurrencyRegions: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            states: z.ZodArray<z.ZodType<State, unknown, z.core.$ZodTypeInternals<State, unknown>>>;
            transitions: z.ZodArray<
              z.ZodObject<
                {
                  from: z.ZodString;
                  to: z.ZodString;
                  label: z.ZodOptional<
                    z.ZodUnion<
                      readonly [
                        z.ZodObject<
                          {
                            type: z.ZodLiteral<'html'>;
                            raw: z.ZodString;
                            sanitized: z.ZodOptional<z.ZodString>;
                          },
                          z.core.$strip
                        >,
                        z.ZodObject<
                          {
                            type: z.ZodLiteral<'markdown'>;
                            raw: z.ZodString;
                            parsed: z.ZodOptional<z.ZodString>;
                          },
                          z.core.$strip
                        >,
                        z.ZodString,
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
      >
    >;
  },
  z.core.$strip
>;
export type StateDiagram = z.infer<typeof StateDiagramSchema>;
//# sourceMappingURL=state.d.ts.map
