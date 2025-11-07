import { z } from 'zod';
export declare const ERCardinality: z.ZodEnum<{
  ZERO_OR_ONE: 'ZERO_OR_ONE';
  EXACTLY_ONE: 'EXACTLY_ONE';
  ZERO_OR_MORE: 'ZERO_OR_MORE';
  ONE_OR_MORE: 'ONE_OR_MORE';
}>;
export type ERCardinality = z.infer<typeof ERCardinality>;
export declare const ERIdentification: z.ZodEnum<{
  IDENTIFYING: 'IDENTIFYING';
  NON_IDENTIFYING: 'NON_IDENTIFYING';
}>;
export type ERIdentification = z.infer<typeof ERIdentification>;
export declare const ERAttributeType: z.ZodString;
export type ERAttributeType = z.infer<typeof ERAttributeType>;
export declare const ERAttributeKey: z.ZodEnum<{
  PK: 'PK';
  FK: 'FK';
  UK: 'UK';
}>;
export type ERAttributeKey = z.infer<typeof ERAttributeKey>;
export declare const ERAttribute: z.ZodObject<
  {
    type: z.ZodString;
    name: z.ZodString;
    key: z.ZodOptional<
      z.ZodEnum<{
        PK: 'PK';
        FK: 'FK';
        UK: 'UK';
      }>
    >;
    comment: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type ERAttribute = z.infer<typeof ERAttribute>;
export declare const EREntity: z.ZodObject<
  {
    name: z.ZodString;
    attributes: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          name: z.ZodString;
          key: z.ZodOptional<
            z.ZodEnum<{
              PK: 'PK';
              FK: 'FK';
              UK: 'UK';
            }>
          >;
          comment: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type EREntity = z.infer<typeof EREntity>;
export declare const ERRelationship: z.ZodObject<
  {
    from: z.ZodString;
    to: z.ZodString;
    fromCardinality: z.ZodEnum<{
      ZERO_OR_ONE: 'ZERO_OR_ONE';
      EXACTLY_ONE: 'EXACTLY_ONE';
      ZERO_OR_MORE: 'ZERO_OR_MORE';
      ONE_OR_MORE: 'ONE_OR_MORE';
    }>;
    toCardinality: z.ZodEnum<{
      ZERO_OR_ONE: 'ZERO_OR_ONE';
      EXACTLY_ONE: 'EXACTLY_ONE';
      ZERO_OR_MORE: 'ZERO_OR_MORE';
      ONE_OR_MORE: 'ONE_OR_MORE';
    }>;
    identification: z.ZodEnum<{
      IDENTIFYING: 'IDENTIFYING';
      NON_IDENTIFYING: 'NON_IDENTIFYING';
    }>;
    label: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type ERRelationship = z.infer<typeof ERRelationship>;
export declare const ERDiagram: z.ZodObject<
  {
    type: z.ZodLiteral<'er'>;
    entities: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          attributes: z.ZodArray<
            z.ZodObject<
              {
                type: z.ZodString;
                name: z.ZodString;
                key: z.ZodOptional<
                  z.ZodEnum<{
                    PK: 'PK';
                    FK: 'FK';
                    UK: 'UK';
                  }>
                >;
                comment: z.ZodOptional<z.ZodString>;
              },
              z.core.$strip
            >
          >;
        },
        z.core.$strip
      >
    >;
    relationships: z.ZodArray<
      z.ZodObject<
        {
          from: z.ZodString;
          to: z.ZodString;
          fromCardinality: z.ZodEnum<{
            ZERO_OR_ONE: 'ZERO_OR_ONE';
            EXACTLY_ONE: 'EXACTLY_ONE';
            ZERO_OR_MORE: 'ZERO_OR_MORE';
            ONE_OR_MORE: 'ONE_OR_MORE';
          }>;
          toCardinality: z.ZodEnum<{
            ZERO_OR_ONE: 'ZERO_OR_ONE';
            EXACTLY_ONE: 'EXACTLY_ONE';
            ZERO_OR_MORE: 'ZERO_OR_MORE';
            ONE_OR_MORE: 'ONE_OR_MORE';
          }>;
          identification: z.ZodEnum<{
            IDENTIFYING: 'IDENTIFYING';
            NON_IDENTIFYING: 'NON_IDENTIFYING';
          }>;
          label: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    styles: z.ZodOptional<
      z.ZodRecord<
        z.ZodString,
        z.ZodCustom<
          {
            fill?:
              | {
                  color?: string | undefined;
                  opacity?: number | undefined;
                }
              | undefined;
            stroke?:
              | {
                  color?: string | undefined;
                  width?: number | undefined;
                  dasharray?: string | undefined;
                }
              | undefined;
            font?:
              | {
                  family?: string | undefined;
                  size?: number | undefined;
                  weight?:
                    | 'normal'
                    | 'bold'
                    | '100'
                    | '200'
                    | '300'
                    | '400'
                    | '500'
                    | '600'
                    | '700'
                    | '800'
                    | '900'
                    | undefined;
                  style?: 'normal' | 'italic' | 'oblique' | undefined;
                  color?: string | undefined;
                }
              | undefined;
          },
          {
            fill?:
              | {
                  color?: string | undefined;
                  opacity?: number | undefined;
                }
              | undefined;
            stroke?:
              | {
                  color?: string | undefined;
                  width?: number | undefined;
                  dasharray?: string | undefined;
                }
              | undefined;
            font?:
              | {
                  family?: string | undefined;
                  size?: number | undefined;
                  weight?:
                    | 'normal'
                    | 'bold'
                    | '100'
                    | '200'
                    | '300'
                    | '400'
                    | '500'
                    | '600'
                    | '700'
                    | '800'
                    | '900'
                    | undefined;
                  style?: 'normal' | 'italic' | 'oblique' | undefined;
                  color?: string | undefined;
                }
              | undefined;
          }
        >
      >
    >;
  },
  z.core.$strip
>;
export type ERDiagram = z.infer<typeof ERDiagram>;
//# sourceMappingURL=er.d.ts.map
