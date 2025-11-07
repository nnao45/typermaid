/**
 * Branded Types for type-safe ID references
 *
 * Branded Typesを使うことで、文字列IDの誤用を型レベルで防止するわよ💅
 * 例: NodeIDとParticipantIDを混同できなくなる✨
 */
/**
 * Flowchart Node ID (branded type)
 */
export type NodeID = string & {
  readonly __brand: 'NodeID';
};
/**
 * Sequence Diagram Participant ID (branded type)
 */
export type ParticipantID = string & {
  readonly __brand: 'ParticipantID';
};
/**
 * State Diagram State ID (branded type)
 */
export type StateID = string & {
  readonly __brand: 'StateID';
};
/**
 * ER Diagram Entity ID (branded type)
 */
export type EntityID = string & {
  readonly __brand: 'EntityID';
};
/**
 * Class Diagram Class ID (branded type)
 */
export type ClassID = string & {
  readonly __brand: 'ClassID';
};
/**
 * Gantt Chart Task ID (branded type)
 */
export type TaskID = string & {
  readonly __brand: 'TaskID';
};
/**
 * Type guard: string to NodeID
 */
export declare function nodeId(id: string): NodeID;
/**
 * Type guard: string to ParticipantID
 */
export declare function participantId(id: string): ParticipantID;
/**
 * Type guard: string to StateID
 */
export declare function stateId(id: string): StateID;
/**
 * Type guard: string to EntityID
 */
export declare function entityId(id: string): EntityID;
/**
 * Type guard: string to ClassID
 */
export declare function classId(id: string): ClassID;
/**
 * Type guard: string to TaskID
 */
export declare function taskId(id: string): TaskID;
/**
 * Validation: NodeID exists check
 */
export declare function validateNodeId(id: string, existingNodes: Set<NodeID>): NodeID;
/**
 * Validation: ParticipantID exists check
 */
export declare function validateParticipantId(
  id: string,
  existingParticipants: Set<ParticipantID>
): ParticipantID;
/**
 * Validation: StateID exists check
 */
export declare function validateStateId(id: string, existingStates: Set<StateID>): StateID;
/**
 * Validation: EntityID exists check
 */
export declare function validateEntityId(id: string, existingEntities: Set<EntityID>): EntityID;
/**
 * Validation: ClassID exists check
 */
export declare function validateClassId(id: string, existingClasses: Set<ClassID>): ClassID;
/**
 * Validation: TaskID exists check
 */
export declare function validateTaskId(id: string, existingTasks: Set<TaskID>): TaskID;
//# sourceMappingURL=branded.d.ts.map
