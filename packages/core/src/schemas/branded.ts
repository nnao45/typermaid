/**
 * Branded Types for type-safe ID references
 *
 * Branded Typesを使うことで、文字列IDの誤用を型レベルで防止するわよ💅
 * 例: NodeIDとParticipantIDを混同できなくなる✨
 */

/**
 * Flowchart Node ID (branded type)
 */
export type NodeID = string & { readonly __brand: 'NodeID' };

/**
 * Sequence Diagram Participant ID (branded type)
 */
export type ParticipantID = string & { readonly __brand: 'ParticipantID' };

/**
 * State Diagram State ID (branded type)
 */
export type StateID = string & { readonly __brand: 'StateID' };

/**
 * ER Diagram Entity ID (branded type)
 */
export type EntityID = string & { readonly __brand: 'EntityID' };

/**
 * Class Diagram Class ID (branded type)
 */
export type ClassID = string & { readonly __brand: 'ClassID' };

/**
 * Gantt Chart Task ID (branded type)
 */
export type TaskID = string & { readonly __brand: 'TaskID' };

/**
 * Type guard: string to NodeID
 */
export function nodeId(id: string): NodeID {
  return id as NodeID;
}

/**
 * Type guard: string to ParticipantID
 */
export function participantId(id: string): ParticipantID {
  return id as ParticipantID;
}

/**
 * Type guard: string to StateID
 */
export function stateId(id: string): StateID {
  return id as StateID;
}

/**
 * Type guard: string to EntityID
 */
export function entityId(id: string): EntityID {
  return id as EntityID;
}

/**
 * Type guard: string to ClassID
 */
export function classId(id: string): ClassID {
  return id as ClassID;
}

/**
 * Type guard: string to TaskID
 */
export function taskId(id: string): TaskID {
  return id as TaskID;
}

/**
 * Validation: NodeID exists check
 */
export function validateNodeId(id: string, existingNodes: Set<NodeID>): NodeID {
  const nid = nodeId(id);
  if (!existingNodes.has(nid)) {
    throw new Error(`Node '${id}' does not exist`);
  }
  return nid;
}

/**
 * Validation: ParticipantID exists check
 */
export function validateParticipantId(
  id: string,
  existingParticipants: Set<ParticipantID>
): ParticipantID {
  const pid = participantId(id);
  if (!existingParticipants.has(pid)) {
    throw new Error(`Participant '${id}' does not exist`);
  }
  return pid;
}

/**
 * Validation: StateID exists check
 */
export function validateStateId(id: string, existingStates: Set<StateID>): StateID {
  const sid = stateId(id);
  if (!existingStates.has(sid)) {
    throw new Error(`State '${id}' does not exist`);
  }
  return sid;
}

/**
 * Validation: EntityID exists check
 */
export function validateEntityId(id: string, existingEntities: Set<EntityID>): EntityID {
  const eid = entityId(id);
  if (!existingEntities.has(eid)) {
    throw new Error(`Entity '${id}' does not exist`);
  }
  return eid;
}

/**
 * Validation: ClassID exists check
 */
export function validateClassId(id: string, existingClasses: Set<ClassID>): ClassID {
  const cid = classId(id);
  if (!existingClasses.has(cid)) {
    throw new Error(`Class '${id}' does not exist`);
  }
  return cid;
}

/**
 * Validation: TaskID exists check
 */
export function validateTaskId(id: string, existingTasks: Set<TaskID>): TaskID {
  const tid = taskId(id);
  if (!existingTasks.has(tid)) {
    throw new Error(`Task '${id}' does not exist`);
  }
  return tid;
}
