import { DirectionSchema } from '@lyric-js/core';
import { z } from 'zod';
/**
 * AST Node types
 */
export declare const ASTNodeTypeSchema: z.ZodEnum<{
    Program: "Program";
    FlowchartDiagram: "FlowchartDiagram";
    SequenceDiagram: "SequenceDiagram";
    ClassDiagram: "ClassDiagram";
    ERDiagram: "ERDiagram";
    StateDiagram: "StateDiagram";
    GanttDiagram: "GanttDiagram";
    Node: "Node";
    Edge: "Edge";
    Subgraph: "Subgraph";
    ClassDef: "ClassDef";
    StyleDef: "StyleDef";
}>;
/**
 * Base AST Node
 */
export declare const BaseASTNodeSchema: z.ZodObject<{
    type: z.ZodEnum<{
        Program: "Program";
        FlowchartDiagram: "FlowchartDiagram";
        SequenceDiagram: "SequenceDiagram";
        ClassDiagram: "ClassDiagram";
        ERDiagram: "ERDiagram";
        StateDiagram: "StateDiagram";
        GanttDiagram: "GanttDiagram";
        Node: "Node";
        Edge: "Edge";
        Subgraph: "Subgraph";
        ClassDef: "ClassDef";
        StyleDef: "StyleDef";
    }>;
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Flowchart Node AST
 */
export declare const FlowchartNodeASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"Node">;
    id: z.ZodString;
    shape: z.ZodEnum<{
        square: "square";
        round: "round";
        stadium: "stadium";
        subroutine: "subroutine";
        cylindrical: "cylindrical";
        circle: "circle";
        asymmetric: "asymmetric";
        rhombus: "rhombus";
        hexagon: "hexagon";
        parallelogram: "parallelogram";
        parallelogram_alt: "parallelogram_alt";
        trapezoid: "trapezoid";
        trapezoid_alt: "trapezoid_alt";
        double_circle: "double_circle";
    }>;
    label: z.ZodString;
}, z.core.$strip>;
/**
 * Edge AST
 */
export declare const EdgeASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"Edge">;
    from: z.ZodString;
    to: z.ZodString;
    edgeType: z.ZodEnum<{
        arrow: "arrow";
        line: "line";
        dotted_arrow: "dotted_arrow";
        dotted_line: "dotted_line";
        thick_arrow: "thick_arrow";
        thick_line: "thick_line";
        invisible: "invisible";
        circle_arrow: "circle_arrow";
        cross_arrow: "cross_arrow";
        multi_arrow: "multi_arrow";
        multi_line: "multi_line";
    }>;
    label: z.ZodOptional<z.ZodString>;
    length: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Subgraph AST
 */
export type SubgraphAST = z.infer<typeof BaseASTNodeSchema> & {
    type: 'Subgraph';
    id: string;
    label?: string | undefined;
    direction?: z.infer<typeof DirectionSchema> | undefined;
    body: Array<z.infer<typeof FlowchartNodeASTSchema> | z.infer<typeof EdgeASTSchema> | SubgraphAST>;
};
export declare const SubgraphASTSchema: z.ZodType<SubgraphAST>;
/**
 * Flowchart Diagram AST
 */
export declare const FlowchartDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"FlowchartDiagram">;
    direction: z.ZodEnum<{
        TB: "TB";
        BT: "BT";
        LR: "LR";
        RL: "RL";
        TD: "TD";
    }>;
    body: z.ZodLazy<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"Node">;
        id: z.ZodString;
        shape: z.ZodEnum<{
            square: "square";
            round: "round";
            stadium: "stadium";
            subroutine: "subroutine";
            cylindrical: "cylindrical";
            circle: "circle";
            asymmetric: "asymmetric";
            rhombus: "rhombus";
            hexagon: "hexagon";
            parallelogram: "parallelogram";
            parallelogram_alt: "parallelogram_alt";
            trapezoid: "trapezoid";
            trapezoid_alt: "trapezoid_alt";
            double_circle: "double_circle";
        }>;
        label: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"Edge">;
        from: z.ZodString;
        to: z.ZodString;
        edgeType: z.ZodEnum<{
            arrow: "arrow";
            line: "line";
            dotted_arrow: "dotted_arrow";
            dotted_line: "dotted_line";
            thick_arrow: "thick_arrow";
            thick_line: "thick_line";
            invisible: "invisible";
            circle_arrow: "circle_arrow";
            cross_arrow: "cross_arrow";
            multi_arrow: "multi_arrow";
            multi_line: "multi_line";
        }>;
        label: z.ZodOptional<z.ZodString>;
        length: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodType<SubgraphAST, unknown, z.core.$ZodTypeInternals<SubgraphAST, unknown>>]>>>;
}, z.core.$strip>;
/**
 * Sequence Diagram AST
 */
export declare const SequenceDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"SequenceDiagram">;
    diagram: z.ZodObject<{
        type: z.ZodLiteral<"sequence">;
        statements: z.ZodArray<z.ZodLazy<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"participant">;
            id: z.ZodString;
            alias: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"actor">;
            id: z.ZodString;
            alias: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"message">;
            from: z.ZodString;
            to: z.ZodString;
            arrowType: z.ZodEnum<{
                solid: "solid";
                dotted: "dotted";
                solid_arrow: "solid_arrow";
                dotted_arrow: "dotted_arrow";
                solid_cross: "solid_cross";
                dotted_cross: "dotted_cross";
                solid_open: "solid_open";
                dotted_open: "dotted_open";
            }>;
            text: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"activation">;
            actor: z.ZodString;
            activate: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"note">;
            position: z.ZodEnum<{
                left: "left";
                right: "right";
                over: "over";
            }>;
            actors: z.ZodArray<z.ZodString>;
            text: z.ZodString;
        }, z.core.$strip>, z.ZodType<{
            type: "loop";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown, z.core.$ZodTypeInternals<{
            type: "loop";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown>>, z.ZodType<{
            type: "alt";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            elseBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown, z.core.$ZodTypeInternals<{
            type: "alt";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            elseBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown>>, z.ZodType<{
            type: "opt";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown, z.core.$ZodTypeInternals<{
            type: "opt";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown>>, z.ZodType<{
            type: "par";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            andBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown, z.core.$ZodTypeInternals<{
            type: "par";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            andBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown>>, z.ZodType<{
            type: "critical";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            optionBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown, z.core.$ZodTypeInternals<{
            type: "critical";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            optionBlocks: Array<{
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }>;
        }, unknown>>, z.ZodType<{
            type: "break";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown, z.core.$ZodTypeInternals<{
            type: "break";
            condition?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown>>, z.ZodType<{
            type: "rect";
            color?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown, z.core.$ZodTypeInternals<{
            type: "rect";
            color?: string;
            statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
        }, unknown>>, z.ZodObject<{
            type: z.ZodLiteral<"box">;
            label: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            participants: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"participant">;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"actor">;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>]>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"autonumber">;
            start: z.ZodOptional<z.ZodNumber>;
            format: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"create">;
            actor: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"destroy">;
            actor: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"link">;
            actor: z.ZodString;
            url: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"properties">;
            actor: z.ZodString;
            properties: z.ZodRecord<z.ZodString, z.ZodString>;
        }, z.core.$strip>]>>>;
        style: z.ZodOptional<z.ZodObject<{
            fill: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                    black: "black";
                    white: "white";
                    red: "red";
                    green: "green";
                    blue: "blue";
                    yellow: "yellow";
                    cyan: "cyan";
                    magenta: "magenta";
                    gray: "gray";
                    grey: "grey";
                    orange: "orange";
                    purple: "purple";
                    pink: "pink";
                    brown: "brown";
                    transparent: "transparent";
                }>]>>;
                opacity: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            stroke: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                    black: "black";
                    white: "white";
                    red: "red";
                    green: "green";
                    blue: "blue";
                    yellow: "yellow";
                    cyan: "cyan";
                    magenta: "magenta";
                    gray: "gray";
                    grey: "grey";
                    orange: "orange";
                    purple: "purple";
                    pink: "pink";
                    brown: "brown";
                    transparent: "transparent";
                }>]>>;
                width: z.ZodOptional<z.ZodNumber>;
                dasharray: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            font: z.ZodOptional<z.ZodObject<{
                family: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodNumber>;
                weight: z.ZodOptional<z.ZodEnum<{
                    normal: "normal";
                    bold: "bold";
                    100: "100";
                    200: "200";
                    300: "300";
                    400: "400";
                    500: "500";
                    600: "600";
                    700: "700";
                    800: "800";
                    900: "900";
                }>>;
                style: z.ZodOptional<z.ZodEnum<{
                    normal: "normal";
                    italic: "italic";
                    oblique: "oblique";
                }>>;
                color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                    black: "black";
                    white: "white";
                    red: "red";
                    green: "green";
                    blue: "blue";
                    yellow: "yellow";
                    cyan: "cyan";
                    magenta: "magenta";
                    gray: "gray";
                    grey: "grey";
                    orange: "orange";
                    purple: "purple";
                    pink: "pink";
                    brown: "brown";
                    transparent: "transparent";
                }>]>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Class Diagram AST
 */
export declare const ClassDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"ClassDiagram">;
    diagram: z.ZodObject<{
        type: z.ZodLiteral<"classDiagram">;
        direction: z.ZodOptional<z.ZodEnum<{
            TB: "TB";
            BT: "BT";
            LR: "LR";
            RL: "RL";
        }>>;
        classes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            annotation: z.ZodOptional<z.ZodEnum<{
                interface: "interface";
                abstract: "abstract";
                service: "service";
                enumeration: "enumeration";
            }>>;
            members: z.ZodDefault<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    attribute: "attribute";
                    method: "method";
                }>;
                visibility: z.ZodOptional<z.ZodEnum<{
                    "+": "+";
                    "-": "-";
                    "#": "#";
                    "~": "~";
                }>>;
                name: z.ZodString;
                returnType: z.ZodOptional<z.ZodString>;
                parameters: z.ZodOptional<z.ZodString>;
                isStatic: z.ZodDefault<z.ZodBoolean>;
                isAbstract: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>>;
            generics: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            relationType: z.ZodEnum<{
                "<|--": "<|--";
                "*--": "*--";
                "o--": "o--";
                "-->": "-->";
                "--": "--";
                "..|>": "..|>";
                "..>": "..>";
                "..": "..";
            }>;
            label: z.ZodOptional<z.ZodString>;
            cardinalityFrom: z.ZodOptional<z.ZodString>;
            cardinalityTo: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        namespaces: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            classes: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * ER Diagram AST
 */
export declare const ERDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"ERDiagram">;
    diagram: z.ZodObject<{
        type: z.ZodLiteral<"er">;
        entities: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            attributes: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                name: z.ZodString;
                key: z.ZodOptional<z.ZodEnum<{
                    PK: "PK";
                    FK: "FK";
                    UK: "UK";
                }>>;
                comment: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        relationships: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            fromCardinality: z.ZodEnum<{
                ZERO_OR_ONE: "ZERO_OR_ONE";
                EXACTLY_ONE: "EXACTLY_ONE";
                ZERO_OR_MORE: "ZERO_OR_MORE";
                ONE_OR_MORE: "ONE_OR_MORE";
            }>;
            toCardinality: z.ZodEnum<{
                ZERO_OR_ONE: "ZERO_OR_ONE";
                EXACTLY_ONE: "EXACTLY_ONE";
                ZERO_OR_MORE: "ZERO_OR_MORE";
                ONE_OR_MORE: "ONE_OR_MORE";
            }>;
            identification: z.ZodEnum<{
                IDENTIFYING: "IDENTIFYING";
                NON_IDENTIFYING: "NON_IDENTIFYING";
            }>;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        styles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodCustom<{
            fill?: {
                color?: string | undefined;
                opacity?: number | undefined;
            } | undefined;
            stroke?: {
                color?: string | undefined;
                width?: number | undefined;
                dasharray?: string | undefined;
            } | undefined;
            font?: {
                family?: string | undefined;
                size?: number | undefined;
                weight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | undefined;
                style?: "normal" | "italic" | "oblique" | undefined;
                color?: string | undefined;
            } | undefined;
        }, {
            fill?: {
                color?: string | undefined;
                opacity?: number | undefined;
            } | undefined;
            stroke?: {
                color?: string | undefined;
                width?: number | undefined;
                dasharray?: string | undefined;
            } | undefined;
            font?: {
                family?: string | undefined;
                size?: number | undefined;
                weight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | undefined;
                style?: "normal" | "italic" | "oblique" | undefined;
                color?: string | undefined;
            } | undefined;
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * State Diagram AST
 */
export declare const StateDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"StateDiagram">;
    diagram: z.ZodObject<{
        type: z.ZodLiteral<"state">;
        version: z.ZodDefault<z.ZodEnum<{
            v1: "v1";
            v2: "v2";
        }>>;
        direction: z.ZodOptional<z.ZodEnum<{
            TB: "TB";
            TD: "TD";
            BT: "BT";
            LR: "LR";
            RL: "RL";
        }>>;
        states: z.ZodArray<z.ZodType<import("@lyric-js/core").State, unknown, z.core.$ZodTypeInternals<import("@lyric-js/core").State, unknown>>>;
        transitions: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            label: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"html">;
                raw: z.ZodString;
                sanitized: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"markdown">;
                raw: z.ZodString;
                parsed: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodString]>>;
        }, z.core.$strip>>;
        notes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            state: z.ZodString;
            note: z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"html">;
                raw: z.ZodString;
                sanitized: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"markdown">;
                raw: z.ZodString;
                parsed: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodString]>;
            position: z.ZodOptional<z.ZodEnum<{
                left: "left";
                right: "right";
            }>>;
        }, z.core.$strip>>>;
        concurrencyRegions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            states: z.ZodArray<z.ZodType<import("@lyric-js/core").State, unknown, z.core.$ZodTypeInternals<import("@lyric-js/core").State, unknown>>>;
            transitions: z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                label: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"html">;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"markdown">;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodString]>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Gantt Diagram AST
 */
export declare const GanttDiagramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"GanttDiagram">;
    diagram: z.ZodObject<{
        type: z.ZodLiteral<"gantt">;
        config: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            dateFormat: z.ZodString;
            axisFormat: z.ZodOptional<z.ZodString>;
            excludes: z.ZodOptional<z.ZodString>;
            todayMarker: z.ZodOptional<z.ZodEnum<{
                on: "on";
                off: "off";
            }>>;
        }, z.core.$strip>;
        sections: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            tasks: z.ZodArray<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                name: z.ZodString;
                status: z.ZodOptional<z.ZodEnum<{
                    active: "active";
                    done: "done";
                    crit: "crit";
                    milestone: "milestone";
                }>>;
                startDate: z.ZodString;
                duration: z.ZodString;
                dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Program (root) AST
 */
export declare const ProgramASTSchema: z.ZodObject<{
    loc: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line: z.ZodNumber;
            column: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"Program">;
    body: z.ZodLazy<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"FlowchartDiagram">;
        direction: z.ZodEnum<{
            TB: "TB";
            BT: "BT";
            LR: "LR";
            RL: "RL";
            TD: "TD";
        }>;
        body: z.ZodLazy<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            loc: z.ZodOptional<z.ZodObject<{
                start: z.ZodObject<{
                    line: z.ZodNumber;
                    column: z.ZodNumber;
                }, z.core.$strip>;
                end: z.ZodObject<{
                    line: z.ZodNumber;
                    column: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"Node">;
            id: z.ZodString;
            shape: z.ZodEnum<{
                square: "square";
                round: "round";
                stadium: "stadium";
                subroutine: "subroutine";
                cylindrical: "cylindrical";
                circle: "circle";
                asymmetric: "asymmetric";
                rhombus: "rhombus";
                hexagon: "hexagon";
                parallelogram: "parallelogram";
                parallelogram_alt: "parallelogram_alt";
                trapezoid: "trapezoid";
                trapezoid_alt: "trapezoid_alt";
                double_circle: "double_circle";
            }>;
            label: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            loc: z.ZodOptional<z.ZodObject<{
                start: z.ZodObject<{
                    line: z.ZodNumber;
                    column: z.ZodNumber;
                }, z.core.$strip>;
                end: z.ZodObject<{
                    line: z.ZodNumber;
                    column: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"Edge">;
            from: z.ZodString;
            to: z.ZodString;
            edgeType: z.ZodEnum<{
                arrow: "arrow";
                line: "line";
                dotted_arrow: "dotted_arrow";
                dotted_line: "dotted_line";
                thick_arrow: "thick_arrow";
                thick_line: "thick_line";
                invisible: "invisible";
                circle_arrow: "circle_arrow";
                cross_arrow: "cross_arrow";
                multi_arrow: "multi_arrow";
                multi_line: "multi_line";
            }>;
            label: z.ZodOptional<z.ZodString>;
            length: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodType<SubgraphAST, unknown, z.core.$ZodTypeInternals<SubgraphAST, unknown>>]>>>;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"SequenceDiagram">;
        diagram: z.ZodObject<{
            type: z.ZodLiteral<"sequence">;
            statements: z.ZodArray<z.ZodLazy<z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"participant">;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"actor">;
                id: z.ZodString;
                alias: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"message">;
                from: z.ZodString;
                to: z.ZodString;
                arrowType: z.ZodEnum<{
                    solid: "solid";
                    dotted: "dotted";
                    solid_arrow: "solid_arrow";
                    dotted_arrow: "dotted_arrow";
                    solid_cross: "solid_cross";
                    dotted_cross: "dotted_cross";
                    solid_open: "solid_open";
                    dotted_open: "dotted_open";
                }>;
                text: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"activation">;
                actor: z.ZodString;
                activate: z.ZodBoolean;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"note">;
                position: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    over: "over";
                }>;
                actors: z.ZodArray<z.ZodString>;
                text: z.ZodString;
            }, z.core.$strip>, z.ZodType<{
                type: "loop";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown, z.core.$ZodTypeInternals<{
                type: "loop";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown>>, z.ZodType<{
                type: "alt";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                elseBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown, z.core.$ZodTypeInternals<{
                type: "alt";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                elseBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown>>, z.ZodType<{
                type: "opt";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown, z.core.$ZodTypeInternals<{
                type: "opt";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown>>, z.ZodType<{
                type: "par";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                andBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown, z.core.$ZodTypeInternals<{
                type: "par";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                andBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown>>, z.ZodType<{
                type: "critical";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                optionBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown, z.core.$ZodTypeInternals<{
                type: "critical";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                optionBlocks: Array<{
                    condition?: string;
                    statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
                }>;
            }, unknown>>, z.ZodType<{
                type: "break";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown, z.core.$ZodTypeInternals<{
                type: "break";
                condition?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown>>, z.ZodType<{
                type: "rect";
                color?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown, z.core.$ZodTypeInternals<{
                type: "rect";
                color?: string;
                statements: z.infer<typeof import("@lyric-js/core").SequenceStatement>[];
            }, unknown>>, z.ZodObject<{
                type: z.ZodLiteral<"box">;
                label: z.ZodOptional<z.ZodString>;
                color: z.ZodOptional<z.ZodString>;
                participants: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"participant">;
                    id: z.ZodString;
                    alias: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"actor">;
                    id: z.ZodString;
                    alias: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>]>>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"autonumber">;
                start: z.ZodOptional<z.ZodNumber>;
                format: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"create">;
                actor: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"destroy">;
                actor: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"link">;
                actor: z.ZodString;
                url: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"properties">;
                actor: z.ZodString;
                properties: z.ZodRecord<z.ZodString, z.ZodString>;
            }, z.core.$strip>]>>>;
            style: z.ZodOptional<z.ZodObject<{
                fill: z.ZodOptional<z.ZodObject<{
                    color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                        black: "black";
                        white: "white";
                        red: "red";
                        green: "green";
                        blue: "blue";
                        yellow: "yellow";
                        cyan: "cyan";
                        magenta: "magenta";
                        gray: "gray";
                        grey: "grey";
                        orange: "orange";
                        purple: "purple";
                        pink: "pink";
                        brown: "brown";
                        transparent: "transparent";
                    }>]>>;
                    opacity: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
                stroke: z.ZodOptional<z.ZodObject<{
                    color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                        black: "black";
                        white: "white";
                        red: "red";
                        green: "green";
                        blue: "blue";
                        yellow: "yellow";
                        cyan: "cyan";
                        magenta: "magenta";
                        gray: "gray";
                        grey: "grey";
                        orange: "orange";
                        purple: "purple";
                        pink: "pink";
                        brown: "brown";
                        transparent: "transparent";
                    }>]>>;
                    width: z.ZodOptional<z.ZodNumber>;
                    dasharray: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                font: z.ZodOptional<z.ZodObject<{
                    family: z.ZodOptional<z.ZodString>;
                    size: z.ZodOptional<z.ZodNumber>;
                    weight: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        bold: "bold";
                        100: "100";
                        200: "200";
                        300: "300";
                        400: "400";
                        500: "500";
                        600: "600";
                        700: "700";
                        800: "800";
                        900: "900";
                    }>>;
                    style: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        italic: "italic";
                        oblique: "oblique";
                    }>>;
                    color: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
                        black: "black";
                        white: "white";
                        red: "red";
                        green: "green";
                        blue: "blue";
                        yellow: "yellow";
                        cyan: "cyan";
                        magenta: "magenta";
                        gray: "gray";
                        grey: "grey";
                        orange: "orange";
                        purple: "purple";
                        pink: "pink";
                        brown: "brown";
                        transparent: "transparent";
                    }>]>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"ClassDiagram">;
        diagram: z.ZodObject<{
            type: z.ZodLiteral<"classDiagram">;
            direction: z.ZodOptional<z.ZodEnum<{
                TB: "TB";
                BT: "BT";
                LR: "LR";
                RL: "RL";
            }>>;
            classes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                annotation: z.ZodOptional<z.ZodEnum<{
                    interface: "interface";
                    abstract: "abstract";
                    service: "service";
                    enumeration: "enumeration";
                }>>;
                members: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    type: z.ZodEnum<{
                        attribute: "attribute";
                        method: "method";
                    }>;
                    visibility: z.ZodOptional<z.ZodEnum<{
                        "+": "+";
                        "-": "-";
                        "#": "#";
                        "~": "~";
                    }>>;
                    name: z.ZodString;
                    returnType: z.ZodOptional<z.ZodString>;
                    parameters: z.ZodOptional<z.ZodString>;
                    isStatic: z.ZodDefault<z.ZodBoolean>;
                    isAbstract: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strip>>>;
                generics: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                relationType: z.ZodEnum<{
                    "<|--": "<|--";
                    "*--": "*--";
                    "o--": "o--";
                    "-->": "-->";
                    "--": "--";
                    "..|>": "..|>";
                    "..>": "..>";
                    "..": "..";
                }>;
                label: z.ZodOptional<z.ZodString>;
                cardinalityFrom: z.ZodOptional<z.ZodString>;
                cardinalityTo: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            namespaces: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                classes: z.ZodArray<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"ERDiagram">;
        diagram: z.ZodObject<{
            type: z.ZodLiteral<"er">;
            entities: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                attributes: z.ZodArray<z.ZodObject<{
                    type: z.ZodString;
                    name: z.ZodString;
                    key: z.ZodOptional<z.ZodEnum<{
                        PK: "PK";
                        FK: "FK";
                        UK: "UK";
                    }>>;
                    comment: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            relationships: z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                fromCardinality: z.ZodEnum<{
                    ZERO_OR_ONE: "ZERO_OR_ONE";
                    EXACTLY_ONE: "EXACTLY_ONE";
                    ZERO_OR_MORE: "ZERO_OR_MORE";
                    ONE_OR_MORE: "ONE_OR_MORE";
                }>;
                toCardinality: z.ZodEnum<{
                    ZERO_OR_ONE: "ZERO_OR_ONE";
                    EXACTLY_ONE: "EXACTLY_ONE";
                    ZERO_OR_MORE: "ZERO_OR_MORE";
                    ONE_OR_MORE: "ONE_OR_MORE";
                }>;
                identification: z.ZodEnum<{
                    IDENTIFYING: "IDENTIFYING";
                    NON_IDENTIFYING: "NON_IDENTIFYING";
                }>;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            styles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodCustom<{
                fill?: {
                    color?: string | undefined;
                    opacity?: number | undefined;
                } | undefined;
                stroke?: {
                    color?: string | undefined;
                    width?: number | undefined;
                    dasharray?: string | undefined;
                } | undefined;
                font?: {
                    family?: string | undefined;
                    size?: number | undefined;
                    weight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | undefined;
                    style?: "normal" | "italic" | "oblique" | undefined;
                    color?: string | undefined;
                } | undefined;
            }, {
                fill?: {
                    color?: string | undefined;
                    opacity?: number | undefined;
                } | undefined;
                stroke?: {
                    color?: string | undefined;
                    width?: number | undefined;
                    dasharray?: string | undefined;
                } | undefined;
                font?: {
                    family?: string | undefined;
                    size?: number | undefined;
                    weight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | undefined;
                    style?: "normal" | "italic" | "oblique" | undefined;
                    color?: string | undefined;
                } | undefined;
            }>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"StateDiagram">;
        diagram: z.ZodObject<{
            type: z.ZodLiteral<"state">;
            version: z.ZodDefault<z.ZodEnum<{
                v1: "v1";
                v2: "v2";
            }>>;
            direction: z.ZodOptional<z.ZodEnum<{
                TB: "TB";
                TD: "TD";
                BT: "BT";
                LR: "LR";
                RL: "RL";
            }>>;
            states: z.ZodArray<z.ZodType<import("@lyric-js/core").State, unknown, z.core.$ZodTypeInternals<import("@lyric-js/core").State, unknown>>>;
            transitions: z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                label: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"html">;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"markdown">;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodString]>>;
            }, z.core.$strip>>;
            notes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                state: z.ZodString;
                note: z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"html">;
                    raw: z.ZodString;
                    sanitized: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    type: z.ZodLiteral<"markdown">;
                    raw: z.ZodString;
                    parsed: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>, z.ZodString]>;
                position: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    right: "right";
                }>>;
            }, z.core.$strip>>>;
            concurrencyRegions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                states: z.ZodArray<z.ZodType<import("@lyric-js/core").State, unknown, z.core.$ZodTypeInternals<import("@lyric-js/core").State, unknown>>>;
                transitions: z.ZodArray<z.ZodObject<{
                    from: z.ZodString;
                    to: z.ZodString;
                    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                        type: z.ZodLiteral<"html">;
                        raw: z.ZodString;
                        sanitized: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodObject<{
                        type: z.ZodLiteral<"markdown">;
                        raw: z.ZodString;
                        parsed: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>, z.ZodString]>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        loc: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line: z.ZodNumber;
                column: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"GanttDiagram">;
        diagram: z.ZodObject<{
            type: z.ZodLiteral<"gantt">;
            config: z.ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                dateFormat: z.ZodString;
                axisFormat: z.ZodOptional<z.ZodString>;
                excludes: z.ZodOptional<z.ZodString>;
                todayMarker: z.ZodOptional<z.ZodEnum<{
                    on: "on";
                    off: "off";
                }>>;
            }, z.core.$strip>;
            sections: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                tasks: z.ZodArray<z.ZodObject<{
                    id: z.ZodOptional<z.ZodString>;
                    name: z.ZodString;
                    status: z.ZodOptional<z.ZodEnum<{
                        active: "active";
                        done: "done";
                        crit: "crit";
                        milestone: "milestone";
                    }>>;
                    startDate: z.ZodString;
                    duration: z.ZodString;
                    dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>]>>>;
}, z.core.$strip>;
export type ASTNodeType = z.infer<typeof ASTNodeTypeSchema>;
export type BaseASTNode = z.infer<typeof BaseASTNodeSchema>;
export type FlowchartNodeAST = z.infer<typeof FlowchartNodeASTSchema>;
export type EdgeAST = z.infer<typeof EdgeASTSchema>;
export type FlowchartDiagramAST = z.infer<typeof FlowchartDiagramASTSchema>;
export type SequenceDiagramAST = z.infer<typeof SequenceDiagramASTSchema>;
export type ClassDiagramAST = z.infer<typeof ClassDiagramASTSchema>;
export type ERDiagramAST = z.infer<typeof ERDiagramASTSchema>;
export type StateDiagramAST = z.infer<typeof StateDiagramASTSchema>;
export type GanttDiagramAST = z.infer<typeof GanttDiagramASTSchema>;
export type ProgramAST = z.infer<typeof ProgramASTSchema>;
export type ASTNode = ProgramAST | FlowchartDiagramAST | SequenceDiagramAST | ClassDiagramAST | ERDiagramAST | StateDiagramAST | GanttDiagramAST | FlowchartNodeAST | EdgeAST | SubgraphAST;
//# sourceMappingURL=nodes.d.ts.map