import type { ClassDefinition, ClassDiagram, ClassMember, ClassRelation } from '@lyric-js/core';
import type React from 'react';
import { measureText } from '@lyric-js/renderer-core';
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

  // Dynamic sizing based on text measurement
  const headerFontSize = 16;
  const memberFontSize = 12;
  const padding = 20;
  const classHeaderHeight = 40;
  const itemHeight = 25;
  const spacing = 100;
  const leftMargin = 50;
  const topMargin = 50;

  // Measure each class's required width
  const classWidths = classes.map((cls) => {
    const className = cls.name || cls.id;
    const headerMetrics = measureText(className, headerFontSize, 'sans-serif', 'bold');

    const members = cls.members || [];
    const memberWidths = members.map((member) => {
      const memberText = `${member.visibility || '+'} ${member.name}: ${member.returnType || 'any'}`;
      const metrics = measureText(memberText, memberFontSize, 'sans-serif', 'normal');
      return metrics.width;
    });

    const maxMemberWidth = memberWidths.length > 0 ? Math.max(...memberWidths) : 0;
    return Math.max(headerMetrics.width, maxMemberWidth) + padding * 2;
  });

  const classWidth = Math.max(...classWidths, 200); // Min width: 200px

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {classes.map((cls: ClassDefinition, index: number) => {
        const x = leftMargin + (index % 3) * (classWidth + spacing);
        const y = topMargin + Math.floor(index / 3) * 300;

        const members = cls.members || [];
        const totalHeight = classHeaderHeight + members.length * itemHeight + 10;

        return (
          <g key={cls.id || index}>
            <rect
              x={x}
              y={y}
              width={classWidth}
              height={totalHeight}
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
              x={x + classWidth / 2}
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

      {relationships.map((rel: ClassRelation, index: number) => {
        const fromClass = classes.find((c: ClassDefinition) => c.id === rel.from);
        const toClass = classes.find((c: ClassDefinition) => c.id === rel.to);

        if (!fromClass || !toClass) return null;

        const fromIndex = classes.indexOf(fromClass);
        const toIndex = classes.indexOf(toClass);

        const x1 = leftMargin + (fromIndex % 3) * (classWidth + spacing) + classWidth;
        const y1 = topMargin + Math.floor(fromIndex / 3) * 300 + classHeaderHeight / 2;
        const x2 = leftMargin + (toIndex % 3) * (classWidth + spacing);
        const y2 = topMargin + Math.floor(toIndex / 3) * 300 + classHeaderHeight / 2;

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
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
