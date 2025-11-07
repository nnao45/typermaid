import { z } from 'zod';

/**
 * Branded Types for type-safe ID references
 *
 * Zodのbrand機能を使って compile-time と runtime の両方で型安全性を保証するわよ✨
 * これで型レベルでも実行時でもIDの誤用を防止できる💪
 */

/**
 * Base ID format validation (must start with letter, contain only alphanumeric, underscore, hyphen)
 */
const BaseIDSchema = z
  .string()
  .min(1, 'ID must not be empty')
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    'ID must start with a letter and contain only alphanumeric characters, underscores, and hyphens'
  );

/**
 * Flowchart Node ID (Zod branded type with runtime validation)
 */
export const NodeIDSchema = BaseIDSchema.brand<'NodeID'>();
export type NodeID = z.infer<typeof NodeIDSchema>;

/**
 * Sequence Diagram Participant ID (Zod branded type with runtime validation)
 */
export const ParticipantIDSchema = BaseIDSchema.brand<'ParticipantID'>();
export type ParticipantID = z.infer<typeof ParticipantIDSchema>;

/**
 * State Diagram State ID (Zod branded type with runtime validation)
 */
export const StateIDSchema = BaseIDSchema.brand<'StateID'>();
export type StateID = z.infer<typeof StateIDSchema>;

/**
 * ER Diagram Entity ID (Zod branded type with runtime validation)
 */
export const EntityIDSchema = BaseIDSchema.brand<'EntityID'>();
export type EntityID = z.infer<typeof EntityIDSchema>;

/**
 * Class Diagram Class ID (Zod branded type with runtime validation)
 */
export const ClassIDSchema = BaseIDSchema.brand<'ClassID'>();
export type ClassID = z.infer<typeof ClassIDSchema>;

/**
 * Gantt Chart Task ID (Zod branded type with runtime validation)
 */
export const TaskIDSchema = BaseIDSchema.brand<'TaskID'>();
export type TaskID = z.infer<typeof TaskIDSchema>;

/**
 * Subgraph ID (Zod branded type with runtime validation)
 */
export const SubgraphIDSchema = BaseIDSchema.brand<'SubgraphID'>();
export type SubgraphID = z.infer<typeof SubgraphIDSchema>;

/**
 * ClassDef ID (Zod branded type with runtime validation)
 */
export const ClassDefIDSchema = BaseIDSchema.brand<'ClassDefID'>();
export type ClassDefID = z.infer<typeof ClassDefIDSchema>;

/**
 * Section ID for Gantt charts (Zod branded type with runtime validation)
 */
export const SectionIDSchema = BaseIDSchema.brand<'SectionID'>();
export type SectionID = z.infer<typeof SectionIDSchema>;

/**
 * Helper functions for creating branded IDs with runtime validation
 */

/**
 * Create and validate a NodeID
 */
export function createNodeID(id: string): NodeID {
  return NodeIDSchema.parse(id);
}

/**
 * Create and validate a ParticipantID
 */
export function createParticipantID(id: string): ParticipantID {
  return ParticipantIDSchema.parse(id);
}

/**
 * Create and validate a StateID
 */
export function createStateID(id: string): StateID {
  return StateIDSchema.parse(id);
}

/**
 * Create and validate an EntityID
 */
export function createEntityID(id: string): EntityID {
  return EntityIDSchema.parse(id);
}

/**
 * Create and validate a ClassID
 */
export function createClassID(id: string): ClassID {
  return ClassIDSchema.parse(id);
}

/**
 * Create and validate a TaskID
 */
export function createTaskID(id: string): TaskID {
  return TaskIDSchema.parse(id);
}

/**
 * Create and validate a SubgraphID
 */
export function createSubgraphID(id: string): SubgraphID {
  return SubgraphIDSchema.parse(id);
}

/**
 * Create and validate a ClassDefID
 */
export function createClassDefID(id: string): ClassDefID {
  return ClassDefIDSchema.parse(id);
}

/**
 * Create and validate a SectionID
 */
export function createSectionID(id: string): SectionID {
  return SectionIDSchema.parse(id);
}

/**
 * Validation: NodeID exists check
 */
export function validateNodeIdExists(id: string, existingNodes: Set<NodeID>): NodeID {
  const nid = NodeIDSchema.parse(id);
  if (!existingNodes.has(nid)) {
    throw new Error(`Node '${id}' does not exist`);
  }
  return nid;
}

/**
 * Validation: ParticipantID exists check
 */
export function validateParticipantIdExists(
  id: string,
  existingParticipants: Set<ParticipantID>
): ParticipantID {
  const pid = ParticipantIDSchema.parse(id);
  if (!existingParticipants.has(pid)) {
    throw new Error(`Participant '${id}' does not exist`);
  }
  return pid;
}

/**
 * Validation: StateID exists check
 */
export function validateStateIdExists(id: string, existingStates: Set<StateID>): StateID {
  const sid = StateIDSchema.parse(id);
  if (!existingStates.has(sid)) {
    throw new Error(`State '${id}' does not exist`);
  }
  return sid;
}

/**
 * Validation: EntityID exists check
 */
export function validateEntityIdExists(id: string, existingEntities: Set<EntityID>): EntityID {
  const eid = EntityIDSchema.parse(id);
  if (!existingEntities.has(eid)) {
    throw new Error(`Entity '${id}' does not exist`);
  }
  return eid;
}

/**
 * Validation: ClassID exists check
 */
export function validateClassIdExists(id: string, existingClasses: Set<ClassID>): ClassID {
  const cid = ClassIDSchema.parse(id);
  if (!existingClasses.has(cid)) {
    throw new Error(`Class '${id}' does not exist`);
  }
  return cid;
}

/**
 * Validation: TaskID exists check
 */
export function validateTaskIdExists(id: string, existingTasks: Set<TaskID>): TaskID {
  const tid = TaskIDSchema.parse(id);
  if (!existingTasks.has(tid)) {
    throw new Error(`Task '${id}' does not exist`);
  }
  return tid;
}
