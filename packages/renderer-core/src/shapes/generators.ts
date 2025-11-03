import { calculateTextBox } from './text-measure.js';
import type { ShapeGenerator, ShapeOptions, ShapePath } from './types.js';
import { DEFAULT_SHAPE_OPTIONS } from './types.js';

/**
 * Generate rectangle (square) shape
 * Mermaid: A[Text]
 */
export const square: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  // Simple rectangle path
  const path = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`;

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate rounded rectangle
 * Mermaid: A(Text)
 */
export const round: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const radius = Math.min(height / 2, 20);

  // Rounded rectangle path
  const path = `
    M ${radius},0
    L ${width - radius},0
    Q ${width},0 ${width},${radius}
    L ${width},${height - radius}
    Q ${width},${height} ${width - radius},${height}
    L ${radius},${height}
    Q 0,${height} 0,${height - radius}
    L 0,${radius}
    Q 0,0 ${radius},0
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate stadium shape (pill)
 * Mermaid: A([Text])
 */
export const stadium: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding * 1.5, // More padding for curved ends
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const radius = height / 2;

  // Stadium path
  const path = `
    M ${radius},0
    L ${width - radius},0
    A ${radius},${radius} 0 0,1 ${width - radius},${height}
    L ${radius},${height}
    A ${radius},${radius} 0 0,1 ${radius},0
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate subroutine shape (double vertical lines)
 * Mermaid: A[[Text]]
 */
export const subroutine: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding * 1.5, // More padding for inner lines
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const lineOffset = 10;

  // Rectangle with double vertical lines
  const path = `
    M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z
    M ${lineOffset},0 L ${lineOffset},${height}
    M ${width - lineOffset},0 L ${width - lineOffset},${height}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate cylindrical shape (database)
 * Mermaid: A[(Text)]
 */
export const cylindrical: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const ellipseHeight = height * 0.15;

  // Cylinder path
  const path = `
    M 0,${ellipseHeight}
    A ${width / 2},${ellipseHeight} 0 0,1 ${width},${ellipseHeight}
    L ${width},${height - ellipseHeight}
    A ${width / 2},${ellipseHeight} 0 0,1 0,${height - ellipseHeight}
    Z
    M 0,${ellipseHeight}
    A ${width / 2},${ellipseHeight} 0 0,0 ${width},${ellipseHeight}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate circle shape
 * Mermaid: A((Text))
 */
export const circle: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const textMetrics = calculateTextBox(opts.text, opts.fontSize, opts.padding, opts.fontFamily, 'normal');

  // Circle diameter is the larger of width/height
  const diameter = Math.max(textMetrics.width, textMetrics.height, opts.minWidth, opts.minHeight);
  const radius = diameter / 2;

  // Circle path
  const path = `
    M ${radius},0
    A ${radius},${radius} 0 0,1 ${radius},${diameter}
    A ${radius},${radius} 0 0,1 ${radius},0
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width: diameter,
    height: diameter,
    labelPosition: {
      x: radius,
      y: radius,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate rhombus (diamond) shape
 * Mermaid: A{Text}
 */
export const rhombus: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const textMetrics = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding * 2, // More padding for angled sides
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const width = textMetrics.width * 1.5; // Wider for diamond shape
  const height = textMetrics.height;

  // Diamond path
  const path = `
    M ${width / 2},0
    L ${width},${height / 2}
    L ${width / 2},${height}
    L 0,${height / 2}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate hexagon shape
 * Mermaid: A{{Text}}
 */
export const hexagon: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width: baseWidth, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const sideWidth = height / 2;
  const width = baseWidth + sideWidth * 2;

  // Hexagon path
  const path = `
    M ${sideWidth},0
    L ${width - sideWidth},0
    L ${width},${height / 2}
    L ${width - sideWidth},${height}
    L ${sideWidth},${height}
    L 0,${height / 2}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate parallelogram shape (leaning right)
 * Mermaid: A[/Text/]
 */
export const parallelogram: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width: baseWidth, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const skew = height * 0.3;
  const width = baseWidth + skew;

  // Parallelogram path (leaning right)
  const path = `
    M ${skew},0
    L ${width},0
    L ${width - skew},${height}
    L 0,${height}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate parallelogram_alt shape (leaning left)
 * Mermaid: A[\Text\]
 */
export const parallelogram_alt: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width: baseWidth, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const skew = height * 0.3;
  const width = baseWidth + skew;

  // Parallelogram path (leaning left)
  const path = `
    M 0,0
    L ${width - skew},0
    L ${width},${height}
    L ${skew},${height}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate trapezoid shape (wider at bottom)
 * Mermaid: A[/Text\]
 */
export const trapezoid: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const inset = width * 0.15;

  // Trapezoid path (wider at bottom)
  const path = `
    M ${inset},0
    L ${width - inset},0
    L ${width},${height}
    L 0,${height}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate trapezoid_alt shape (wider at top)
 * Mermaid: A[\Text/]
 */
export const trapezoid_alt: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const inset = width * 0.15;

  // Trapezoid path (wider at top)
  const path = `
    M 0,0
    L ${width},0
    L ${width - inset},${height}
    L ${inset},${height}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate double circle shape
 * Mermaid: A(((Text)))
 */
export const double_circle: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const textMetrics = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding * 1.5, // More padding for double circle
    opts.fontFamily,
    'normal'
  );

  const diameter = Math.max(textMetrics.width, textMetrics.height, opts.minWidth, opts.minHeight);
  const outerRadius = diameter / 2;
  const innerRadius = outerRadius - 5;

  // Double circle path
  const path = `
    M ${outerRadius},0
    A ${outerRadius},${outerRadius} 0 0,1 ${outerRadius},${diameter}
    A ${outerRadius},${outerRadius} 0 0,1 ${outerRadius},0
    M ${outerRadius},5
    A ${innerRadius},${innerRadius} 0 0,0 ${outerRadius},${diameter - 5}
    A ${innerRadius},${innerRadius} 0 0,0 ${outerRadius},5
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width: diameter,
    height: diameter,
    labelPosition: {
      x: outerRadius,
      y: outerRadius,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};

/**
 * Generate asymmetric shape
 * Mermaid: A>Text]
 */
export const asymmetric: ShapeGenerator = (options: ShapeOptions): ShapePath => {
  const opts = { ...DEFAULT_SHAPE_OPTIONS, ...options };
  const { width: baseWidth, height } = calculateTextBox(
    opts.text,
    opts.fontSize,
    opts.padding,
    opts.fontFamily,
    'normal',
    opts.minWidth,
    opts.minHeight
  );

  const pointWidth = height * 0.3;
  const width = baseWidth + pointWidth;

  // Asymmetric shape path
  const path = `
    M 0,0
    L ${width - pointWidth},0
    L ${width},${height / 2}
    L ${width - pointWidth},${height}
    L 0,${height}
    Z
  `
    .trim()
    .replace(/\s+/g, ' ');

  return {
    path,
    width,
    height,
    labelPosition: {
      x: width / 2 - pointWidth / 2,
      y: height / 2,
    },
    textAnchor: 'middle',
    dominantBaseline: 'central',
  };
};
