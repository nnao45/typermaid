import type { EdgeOptions, EdgePath } from './types.js';
/**
 * Normal arrow edge: A --> B
 */
export declare function arrow(options: EdgeOptions): EdgePath;
/**
 * Open arrow edge: A --o B
 */
export declare function open(options: EdgeOptions): EdgePath;
/**
 * Cross arrow edge: A --x B
 */
export declare function cross(options: EdgeOptions): EdgePath;
/**
 * Dotted arrow edge: A -.-> B
 */
export declare function dotted_arrow(options: EdgeOptions): EdgePath;
/**
 * Dotted open edge: A -.-o B
 */
export declare function dotted_open(options: EdgeOptions): EdgePath;
/**
 * Dotted cross edge: A -.-x B
 */
export declare function dotted_cross(options: EdgeOptions): EdgePath;
/**
 * Thick arrow edge: A ==> B
 */
export declare function thick_arrow(options: EdgeOptions): EdgePath;
/**
 * Thick open edge: A ==o B
 */
export declare function thick_open(options: EdgeOptions): EdgePath;
/**
 * Thick cross edge: A ==x B
 */
export declare function thick_cross(options: EdgeOptions): EdgePath;
/**
 * Invisible edge: A ~~~ B
 */
export declare function invisible(options: EdgeOptions): EdgePath;
/**
 * Normal line (no arrow): A --- B
 */
export declare function normal(options: EdgeOptions): EdgePath;
//# sourceMappingURL=generators.d.ts.map
