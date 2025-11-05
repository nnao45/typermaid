import type { ClassDiagram, ClassMember } from '@lyric-js/core';
import {
  computeUnifiedDagreLayout,
  measureTextCanvas,
  type UnifiedLayoutEdge,
  type UnifiedLayoutNode,
} from '@lyric-js/renderer-core';
import type React from 'react';
import { useMemo } from 'react';
import type { Theme } from '../themes/types';

interface ClassRendererProps {
  diagram: ClassDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const ClassRenderer: React.FC<ClassRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
}) => {
  const classes = diagram.classes || [];
  const relationships = diagram.relations || [];

  // Font settings
  const headerFontSize = 16;
  const memberFontSize = 12;
  const padding = 20;
  const classHeaderHeight = 40;
  const itemHeight = 25;

  // Calculate class dimensions dynamically
  const classData = useMemo(() => {
    return classes.map((cls) => {
      const className = cls.name || cls.id;
      const headerMetrics = measureTextCanvas(className, headerFontSize, 'sans-serif', 'bold');

      const members = cls.members || [];
      const memberWidths = members.map((member) => {
        const memberText = `${member.visibility || '+'} ${member.name}: ${member.returnType || 'any'}`;
        const metrics = measureTextCanvas(memberText, memberFontSize, 'sans-serif', 'normal');
        return metrics.width;
      });

      const maxMemberWidth = memberWidths.length > 0 ? Math.max(...memberWidths) : 0;
      const classWidth = Math.max(headerMetrics.width, maxMemberWidth) + padding * 2;
      const classHeight = classHeaderHeight + members.length * itemHeight + 10;

      return {
        cls,
        width: Math.max(classWidth, 200),
        height: classHeight,
      };
    });
  }, [classes]);

  // Prepare nodes and edges for Dagre layout
  const layout = useMemo(() => {
    const nodes: UnifiedLayoutNode[] = classData.map(({ cls, width, height }) => ({
      id: cls.id,
      label: cls.name || cls.id,
      width,
      height,
    }));

    const edges: UnifiedLayoutEdge[] = relationships
      .map((rel): UnifiedLayoutEdge | null => {
        if (rel.label === undefined) {
          return {
            from: rel.from,
            to: rel.to,
          };
        }
        return {
          from: rel.from,
          to: rel.to,
          label: rel.label,
        };
      })
      .filter((edge): edge is UnifiedLayoutEdge => edge !== null);

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'TB',
      ranksep: 100,
      nodesep: 80,
      marginx: 50,
      marginy: 50,
    });
  }, [classData, relationships]);

  // Generate path from points (polyline routing)
  const generatePath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    if (!first) return '';
    const pathParts = [`M ${first.x} ${first.y}`];
    for (const point of rest) {
      pathParts.push(`L ${point.x} ${point.y}`);
    }
    return pathParts.join(' ');
  };

  return (
    <svg
      width={Math.max(width, layout.width)}
      height={Math.max(height, layout.height)}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {/* Render classes with Dagre positions */}
      {classData.map(({ cls, width: classWidth, height: classHeight }) => {
        const position = layout.nodes.find((n) => n.id === cls.id);
        if (!position) return null;

        const x = position.x - classWidth / 2;
        const y = position.y - classHeight / 2;
        const members = cls.members || [];

        return (
          <g key={cls.id}>
            <rect
              x={x}
              y={y}
              width={classWidth}
              height={classHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
            />
            <rect
              x={x}
              y={y}
              width={classWidth}
              height={classHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.2}
            />
            <text
              x={position.x}
              y={y + classHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={16}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {cls.name || cls.id}
            </text>

            <line
              x1={x}
              y1={y + classHeaderHeight}
              x2={x + classWidth}
              y2={y + classHeaderHeight}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
            />

            {members.map((member: ClassMember, i: number) => (
              <text
                key={`${cls.id}-member-${i}`}
                x={x + 10}
                y={y + classHeaderHeight + (i + 1) * itemHeight}
                fill={theme.colors.text}
                fontSize={12}
              >
                {member.visibility || '+'} {member.name}: {member.returnType || 'any'}
              </text>
            ))}
          </g>
        );
      })}

      {/* Render relationships with Dagre-routed edges */}
      {layout.edges.map((edge, index) => {
        const rel = relationships.find((r) => r.from === edge.from && r.to === edge.to);
        if (!rel) return null;

        const pathData = generatePath(edge.points);

        return (
          <path
            key={`${edge.from}-${edge.to}-${index}`}
            d={pathData}
            fill="none"
            stroke={theme.colors.edge.stroke}
            strokeWidth={2}
            markerEnd={rel.relationType === '<|--' ? 'url(#triangle)' : 'url(#arrow)'}
          />
        );
      })}

      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
        <marker id="triangle" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <polygon
            points="0 0, 10 5, 0 10"
            fill="none"
            stroke={theme.colors.edge.stroke}
            strokeWidth={2}
          />
        </marker>
      </defs>
    </svg>
  );
};
