/**
 * Branded Types for type-safe ID references
 *
 * Branded Typesを使うことで、文字列IDの誤用を型レベルで防止するわよ💅
 * 例: NodeIDとParticipantIDを混同できなくなる✨
 */
/**
 * Type guard: string to NodeID
 */
export function nodeId(id) {
    return id;
}
/**
 * Type guard: string to ParticipantID
 */
export function participantId(id) {
    return id;
}
/**
 * Type guard: string to StateID
 */
export function stateId(id) {
    return id;
}
/**
 * Type guard: string to EntityID
 */
export function entityId(id) {
    return id;
}
/**
 * Type guard: string to ClassID
 */
export function classId(id) {
    return id;
}
/**
 * Type guard: string to TaskID
 */
export function taskId(id) {
    return id;
}
/**
 * Validation: NodeID exists check
 */
export function validateNodeId(id, existingNodes) {
    const nid = nodeId(id);
    if (!existingNodes.has(nid)) {
        throw new Error(`Node '${id}' does not exist`);
    }
    return nid;
}
/**
 * Validation: ParticipantID exists check
 */
export function validateParticipantId(id, existingParticipants) {
    const pid = participantId(id);
    if (!existingParticipants.has(pid)) {
        throw new Error(`Participant '${id}' does not exist`);
    }
    return pid;
}
/**
 * Validation: StateID exists check
 */
export function validateStateId(id, existingStates) {
    const sid = stateId(id);
    if (!existingStates.has(sid)) {
        throw new Error(`State '${id}' does not exist`);
    }
    return sid;
}
/**
 * Validation: EntityID exists check
 */
export function validateEntityId(id, existingEntities) {
    const eid = entityId(id);
    if (!existingEntities.has(eid)) {
        throw new Error(`Entity '${id}' does not exist`);
    }
    return eid;
}
/**
 * Validation: ClassID exists check
 */
export function validateClassId(id, existingClasses) {
    const cid = classId(id);
    if (!existingClasses.has(cid)) {
        throw new Error(`Class '${id}' does not exist`);
    }
    return cid;
}
/**
 * Validation: TaskID exists check
 */
export function validateTaskId(id, existingTasks) {
    const tid = taskId(id);
    if (!existingTasks.has(tid)) {
        throw new Error(`Task '${id}' does not exist`);
    }
    return tid;
}
//# sourceMappingURL=branded.js.map