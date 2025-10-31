import { describe, it, expect } from 'vitest';
import { validateDiagram, validateDiagramSafe, ValidationError } from './validator.js';
import type { Diagram } from './schema.js';

describe('validateDiagram', () => {
  it('should validate a valid flowchart diagram', () => {
    const validDiagram: Diagram = {
      id: 'test-1',
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', label: 'Start' },
        { id: 'n2', type: 'process', label: 'Process' },
        { id: 'n3', type: 'end', label: 'End' },
      ],
      edges: [
        { id: 'e1', from: 'n1', to: 'n2' },
        { id: 'e2', from: 'n2', to: 'n3', label: 'Next' },
      ],
      config: {
        theme: 'light',
        direction: 'TB',
        nodeSpacing: 50,
        edgeSpacing: 30,
      },
    };

    expect(() => validateDiagram(validDiagram)).not.toThrow();
    const result = validateDiagram(validDiagram);
    expect(result.id).toBe('test-1');
    expect(result.nodes).toHaveLength(3);
  });

  it('should throw ValidationError for invalid diagram', () => {
    const invalidDiagram = {
      id: '',
      type: 'invalid-type',
      nodes: [],
      edges: [],
    };

    expect(() => validateDiagram(invalidDiagram)).toThrow(ValidationError);
  });

  it('should validate diagram without optional config', () => {
    const diagram = {
      id: 'test-2',
      type: 'sequence',
      nodes: [{ id: 'n1', type: 'start', label: 'Start' }],
      edges: [],
    };

    const result = validateDiagram(diagram);
    expect(result.config).toBeUndefined();
  });
});

describe('validateDiagramSafe', () => {
  it('should return success for valid diagram', () => {
    const validDiagram = {
      id: 'test-3',
      type: 'class',
      nodes: [],
      edges: [],
    };

    const result = validateDiagramSafe(validDiagram);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-3');
    }
  });

  it('should return error for invalid diagram', () => {
    const invalidDiagram = {
      id: 'test-4',
      nodes: [],
      edges: [],
    };

    const result = validateDiagramSafe(invalidDiagram);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });
});
