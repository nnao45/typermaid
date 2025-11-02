import type { LayoutEdge, LayoutNode } from '@lyric-js/renderer-core';
import type React from 'react';
import { useMermaidParser } from '../hooks/useMermaidParser';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../themes/types';
import { ClassRenderer } from './ClassRenderer';
import { ERRenderer } from './ERRenderer';
import { FlowchartRenderer } from './FlowchartRenderer';
import { GanttRenderer } from './GanttRenderer';
import { SequenceRenderer } from './SequenceRenderer';
import { StateRenderer } from './StateRenderer';

export interface MermaidDiagramProps {
  code: string;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark' | Theme;
  interactive?: boolean;
  onNodeClick?: (node: LayoutNode) => void;
  onEdgeClick?: (edge: LayoutEdge) => void;
  onError?: (error: Error) => void;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  width,
  height,
  theme: customTheme = 'light',
  interactive = false,
  onNodeClick,
  onEdgeClick,
  onError,
}) => {
  const ast = useMermaidParser(code);
  const theme = useTheme(customTheme);

  if (!ast) {
    const error = new Error('Failed to parse Mermaid code');
    onError?.(error);
    return (
      <div style={{ padding: '20px', color: '#dc3545', border: '1px solid #dc3545' }}>
        Failed to parse diagram
      </div>
    );
  }

  if (!ast.body || ast.body.length === 0) {
    const error = new Error('No diagram found in AST');
    onError?.(error);
    return (
      <div style={{ padding: '20px', color: '#dc3545', border: '1px solid #dc3545' }}>
        No diagram found
      </div>
    );
  }

  const diagram = ast.body[0];

  switch (diagram.type) {
    case 'FlowchartDiagram': {
      const flowchartProps = {
        diagram,
        theme,
        width,
        height,
        interactive,
        onNodeClick: interactive ? onNodeClick : undefined,
        onEdgeClick: interactive ? onEdgeClick : undefined,
      };

      return <FlowchartRenderer {...flowchartProps} />;
    }

    case 'SequenceDiagram':
      return (
        <SequenceRenderer
          diagram={diagram}
          theme={theme}
          {...(width !== undefined && { width })}
          {...(height !== undefined && { height })}
          {...(interactive !== undefined && { interactive })}
        />
      );

    case 'ClassDiagram':
      return (
        <ClassRenderer
          diagram={diagram}
          theme={theme}
          {...(width !== undefined && { width })}
          {...(height !== undefined && { height })}
          {...(interactive !== undefined && { interactive })}
        />
      );

    case 'ERDiagram':
      return (
        <ERRenderer
          diagram={diagram}
          theme={theme}
          {...(width !== undefined && { width })}
          {...(height !== undefined && { height })}
          {...(interactive !== undefined && { interactive })}
        />
      );

    case 'GanttDiagram':
      return (
        <GanttRenderer
          diagram={diagram}
          theme={theme}
          {...(width !== undefined && { width })}
          {...(height !== undefined && { height })}
          {...(interactive !== undefined && { interactive })}
        />
      );

    case 'StateDiagram':
      return (
        <StateRenderer
          diagram={diagram}
          theme={theme}
          {...(width !== undefined && { width })}
          {...(height !== undefined && { height })}
          {...(interactive !== undefined && { interactive })}
        />
      );

    default:
      return (
        <div style={{ padding: '20px', color: '#ffc107', border: '1px solid #ffc107' }}>
          Unsupported diagram type: {diagram.type}
        </div>
      );
  }
};
