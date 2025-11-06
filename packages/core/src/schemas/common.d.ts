import { z } from 'zod';
/**
 * Direction for diagram layout
 */
export declare const DirectionSchema: z.ZodEnum<{
    TB: "TB";
    TD: "TD";
    BT: "BT";
    LR: "LR";
    RL: "RL";
}>;
/**
 * Color value (hex, rgb, named color)
 */
export declare const ColorSchema: z.ZodUnion<readonly [z.ZodString, z.ZodString, z.ZodString, z.ZodEnum<{
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
}>]>;
/**
 * Position in 2D space
 */
export declare const PositionSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strip>;
/**
 * Size (width and height)
 */
export declare const SizeSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, z.core.$strip>;
/**
 * Font style
 */
export declare const FontStyleSchema: z.ZodObject<{
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
}, z.core.$strip>;
/**
 * Stroke style
 */
export declare const StrokeStyleSchema: z.ZodObject<{
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
}, z.core.$strip>;
/**
 * Fill style
 */
export declare const FillStyleSchema: z.ZodObject<{
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
}, z.core.$strip>;
/**
 * Common style properties
 */
export declare const StyleSchema: z.ZodObject<{
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
/**
 * Text alignment
 */
export declare const TextAlignSchema: z.ZodEnum<{
    left: "left";
    right: "right";
    center: "center";
    justify: "justify";
}>;
/**
 * Vertical alignment
 */
export declare const VerticalAlignSchema: z.ZodEnum<{
    top: "top";
    middle: "middle";
    bottom: "bottom";
}>;
/**
 * Theme preset
 */
export declare const ThemeSchema: z.ZodEnum<{
    default: "default";
    dark: "dark";
    neutral: "neutral";
    forest: "forest";
    base: "base";
}>;
export type Direction = z.infer<typeof DirectionSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Size = z.infer<typeof SizeSchema>;
export type FontStyle = z.infer<typeof FontStyleSchema>;
export type StrokeStyle = z.infer<typeof StrokeStyleSchema>;
export type FillStyle = z.infer<typeof FillStyleSchema>;
export type Style = z.infer<typeof StyleSchema>;
export type TextAlign = z.infer<typeof TextAlignSchema>;
export type VerticalAlign = z.infer<typeof VerticalAlignSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
//# sourceMappingURL=common.d.ts.map