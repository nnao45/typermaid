import { z } from 'zod';
export declare const ClassVisibility: z.ZodEnum<{
  '+': '+';
  '-': '-';
  '#': '#';
  '~': '~';
}>;
export declare const ClassMemberType: z.ZodEnum<{
  attribute: 'attribute';
  method: 'method';
}>;
export declare const ClassMember: z.ZodObject<
  {
    type: z.ZodEnum<{
      attribute: 'attribute';
      method: 'method';
    }>;
    visibility: z.ZodOptional<
      z.ZodEnum<{
        '+': '+';
        '-': '-';
        '#': '#';
        '~': '~';
      }>
    >;
    name: z.ZodString;
    returnType: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodString>;
    isStatic: z.ZodDefault<z.ZodBoolean>;
    isAbstract: z.ZodDefault<z.ZodBoolean>;
  },
  z.core.$strip
>;
export declare const ClassAnnotation: z.ZodEnum<{
  interface: 'interface';
  abstract: 'abstract';
  service: 'service';
  enumeration: 'enumeration';
}>;
export declare const ClassDefinition: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    annotation: z.ZodOptional<
      z.ZodEnum<{
        interface: 'interface';
        abstract: 'abstract';
        service: 'service';
        enumeration: 'enumeration';
      }>
    >;
    members: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodEnum<{
              attribute: 'attribute';
              method: 'method';
            }>;
            visibility: z.ZodOptional<
              z.ZodEnum<{
                '+': '+';
                '-': '-';
                '#': '#';
                '~': '~';
              }>
            >;
            name: z.ZodString;
            returnType: z.ZodOptional<z.ZodString>;
            parameters: z.ZodOptional<z.ZodString>;
            isStatic: z.ZodDefault<z.ZodBoolean>;
            isAbstract: z.ZodDefault<z.ZodBoolean>;
          },
          z.core.$strip
        >
      >
    >;
    generics: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const ClassRelationType: z.ZodEnum<{
  '<|--': '<|--';
  '*--': '*--';
  'o--': 'o--';
  '-->': '-->';
  '--': '--';
  '..|>': '..|>';
  '..>': '..>';
  '..': '..';
}>;
export declare const ClassRelation: z.ZodObject<
  {
    from: z.ZodString;
    to: z.ZodString;
    relationType: z.ZodEnum<{
      '<|--': '<|--';
      '*--': '*--';
      'o--': 'o--';
      '-->': '-->';
      '--': '--';
      '..|>': '..|>';
      '..>': '..>';
      '..': '..';
    }>;
    label: z.ZodOptional<z.ZodString>;
    cardinalityFrom: z.ZodOptional<z.ZodString>;
    cardinalityTo: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const ClassNamespace: z.ZodObject<
  {
    name: z.ZodString;
    classes: z.ZodArray<z.ZodString>;
  },
  z.core.$strip
>;
export declare const ClassDiagram: z.ZodObject<
  {
    type: z.ZodLiteral<'classDiagram'>;
    direction: z.ZodOptional<
      z.ZodEnum<{
        TB: 'TB';
        BT: 'BT';
        LR: 'LR';
        RL: 'RL';
      }>
    >;
    classes: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            name: z.ZodString;
            annotation: z.ZodOptional<
              z.ZodEnum<{
                interface: 'interface';
                abstract: 'abstract';
                service: 'service';
                enumeration: 'enumeration';
              }>
            >;
            members: z.ZodDefault<
              z.ZodArray<
                z.ZodObject<
                  {
                    type: z.ZodEnum<{
                      attribute: 'attribute';
                      method: 'method';
                    }>;
                    visibility: z.ZodOptional<
                      z.ZodEnum<{
                        '+': '+';
                        '-': '-';
                        '#': '#';
                        '~': '~';
                      }>
                    >;
                    name: z.ZodString;
                    returnType: z.ZodOptional<z.ZodString>;
                    parameters: z.ZodOptional<z.ZodString>;
                    isStatic: z.ZodDefault<z.ZodBoolean>;
                    isAbstract: z.ZodDefault<z.ZodBoolean>;
                  },
                  z.core.$strip
                >
              >
            >;
            generics: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >
      >
    >;
    relations: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            from: z.ZodString;
            to: z.ZodString;
            relationType: z.ZodEnum<{
              '<|--': '<|--';
              '*--': '*--';
              'o--': 'o--';
              '-->': '-->';
              '--': '--';
              '..|>': '..|>';
              '..>': '..>';
              '..': '..';
            }>;
            label: z.ZodOptional<z.ZodString>;
            cardinalityFrom: z.ZodOptional<z.ZodString>;
            cardinalityTo: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >
      >
    >;
    namespaces: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            classes: z.ZodArray<z.ZodString>;
          },
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
export type ClassVisibility = z.infer<typeof ClassVisibility>;
export type ClassMemberType = z.infer<typeof ClassMemberType>;
export type ClassMember = z.infer<typeof ClassMember>;
export type ClassAnnotation = z.infer<typeof ClassAnnotation>;
export type ClassDefinition = z.infer<typeof ClassDefinition>;
export type ClassRelationType = z.infer<typeof ClassRelationType>;
export type ClassRelation = z.infer<typeof ClassRelation>;
export type ClassNamespace = z.infer<typeof ClassNamespace>;
export type ClassDiagram = z.infer<typeof ClassDiagram>;
//# sourceMappingURL=class.d.ts.map
