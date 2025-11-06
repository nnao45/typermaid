/**
 * Graph Validator
 * Detects circular references in graph structures
 */

export interface GraphNode {
  id: string;
  dependencies: string[];
}

/**
 * Detect circular references in a directed graph
 * @returns Array of node IDs involved in circular reference, or null if no cycle found
 */
export function detectCircularReference(nodes: GraphNode[]): string[] | null {
  const nodeMap = new Map<string, GraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string, path: string[]): string[] | null {
    if (visiting.has(nodeId)) {
      // Found a cycle - return the cycle path
      const cycleStart = path.indexOf(nodeId);
      return path.slice(cycleStart);
    }

    if (visited.has(nodeId)) {
      return null;
    }

    visiting.add(nodeId);
    const node = nodeMap.get(nodeId);

    if (node) {
      for (const depId of node.dependencies) {
        const cycle = dfs(depId, [...path, nodeId]);
        if (cycle) {
          return cycle;
        }
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return null;
  }

  for (const node of nodes) {
    const cycle = dfs(node.id, []);
    if (cycle) {
      return cycle;
    }
  }

  return null;
}

/**
 * Check if adding an edge would create a circular reference
 */
export function wouldCreateCycle(nodes: GraphNode[], from: string, to: string): boolean {
  const testNodes: GraphNode[] = nodes.map((node) =>
    node.id === from ? { ...node, dependencies: [...node.dependencies, to] } : node
  );

  return detectCircularReference(testNodes) !== null;
}
