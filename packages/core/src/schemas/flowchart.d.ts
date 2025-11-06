import { z } from 'zod';
/**
 * Flowchart node shapes (Mermaid compatible)
 */
export declare const NodeShapeSchema: z.ZodEnum<{
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
/**
 * Flowchart edge/arrow types
 */
export declare const EdgeTypeSchema: z.ZodEnum<{
    line: "line";
    arrow: "arrow";
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
/**
 * Flowchart node definition
 */
export declare const FlowchartNodeSchema: z.ZodObject<{
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
    classes: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Flowchart edge/link definition
 */
export declare const FlowchartEdgeSchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodEnum<{
        line: "line";
        arrow: "arrow";
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
    length: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Flowchart subgraph
 */
export declare const SubgraphSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    direction: z.ZodOptional<z.ZodEnum<{
        TB: "TB";
        TD: "TD";
        BT: "BT";
        LR: "LR";
        RL: "RL";
    }>>;
    nodes: z.ZodArray<z.ZodString>;
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
/**
 * Class definition for styling
 */
export declare const ClassDefSchema: z.ZodObject<{
    name: z.ZodString;
    style: z.ZodObject<{
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
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Complete Flowchart diagram schema
 */
export declare const FlowchartDiagramSchema: z.ZodObject<{
    type: z.ZodLiteral<"flowchart">;
    direction: z.ZodDefault<z.ZodEnum<{
        TB: "TB";
        TD: "TD";
        BT: "BT";
        LR: "LR";
        RL: "RL";
    }>>;
    nodes: z.ZodArray<z.ZodObject<{
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
        classes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    edges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        from: z.ZodString;
        to: z.ZodString;
        type: z.ZodEnum<{
            line: "line";
            arrow: "arrow";
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
        length: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    subgraphs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        direction: z.ZodOptional<z.ZodEnum<{
            TB: "TB";
            TD: "TD";
            BT: "BT";
            LR: "LR";
            RL: "RL";
        }>>;
        nodes: z.ZodArray<z.ZodString>;
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
    }, z.core.$strip>>>;
    classDefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        style: z.ZodObject<{
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
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type NodeShape = z.infer<typeof NodeShapeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type FlowchartNode = z.infer<typeof FlowchartNodeSchema>;
export type FlowchartEdge = z.infer<typeof FlowchartEdgeSchema>;
export type Subgraph = z.infer<typeof SubgraphSchema>;
export type ClassDef = z.infer<typeof ClassDefSchema>;
export type FlowchartDiagram = z.infer<typeof FlowchartDiagramSchema>;
//# sourceMappingURL=flowchart.d.ts.map