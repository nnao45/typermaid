/**
 * @typermaid/builders
 *
 * Type-safe builders for creating Mermaid diagrams with compile-time validation
 */

export { ClassDiagramBuilder } from './class-builder.js';
// Converters (AST to Builder)
export {
  classASTToBuilder,
  erASTToBuilder,
  flowchartASTToBuilder,
  ganttASTToBuilder,
  sequenceASTToBuilder,
  stateASTToBuilder,
} from './converters/index.js';
export { ERDiagramBuilder } from './er-builder.js';
// Builders
export { FlowchartDiagramBuilder } from './flowchart-builder.js';
export { GanttDiagramBuilder } from './gantt-builder.js';
export { SequenceDiagramBuilder } from './sequence-builder.js';
export { StateDiagramBuilder } from './state-builder.js';

// Branded types
export type {
  ClassDefID,
  ClassID,
  EntityID,
  NodeID,
  ParticipantID,
  SectionID,
  StateID,
  SubgraphID,
  TaskID,
} from './types.js';
export {
  isReservedWord,
  isValidIDFormat,
  RESERVED_WORDS,
  ValidationError,
  ValidationErrorCode,
} from './types.js';

export {
  detectCircularReference,
  type GraphNode,
  wouldCreateCycle,
} from './validators/graph-validator.js';
// Validators
export {
  getReservedWords,
  validateNotReservedWord,
} from './validators/reserved-words.js';
