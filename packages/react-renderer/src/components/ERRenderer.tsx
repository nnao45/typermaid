import type { ERAttribute, ERDiagram, EREntity, ERRelationship } from '@lyric-js/core';
import type React from 'react';
import { measureText } from '@lyric-js/renderer-core';
import type { Theme } from '../themes/types';

interface ERRendererProps {
  diagram: ERDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const ERRenderer: React.FC<ERRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
}) => {
  // Extract entities and relationships from diagram structure
  const explicitEntities = diagram.entities || [];
  const relationships = diagram.relationships || [];

  // Create entities from relationships if not explicitly defined
  const entityMap = new Map<string, EREntity>();

  // Add explicit entities
  for (const entity of explicitEntities) {
    entityMap.set(entity.name, entity);
  }

  // Add implicit entities from relationships
  for (const rel of relationships) {
    if (!entityMap.has(rel.from)) {
      entityMap.set(rel.from, { name: rel.from, attributes: [] });
    }
    if (!entityMap.has(rel.to)) {
      entityMap.set(rel.to, { name: rel.to, attributes: [] });
    }
  }

  const entities = Array.from(entityMap.values());

  // Dynamic sizing based on text measurement
  const headerFontSize = 14;
  const attributeFontSize = 11;
  const padding = 20;
  const entityHeaderHeight = 35;
  const attributeHeight = 22;
  const spacing = 120;
  const leftMargin = 50;
  const topMargin = 50;

  // Measure each entity's required width
  const entityWidths = entities.map((entity) => {
    const headerMetrics = measureText(entity.name, headerFontSize, 'sans-serif', 'bold');

    const attributes = entity.attributes || [];
    const attrWidths = attributes.map((attr) => {
      const attrText = `${attr.key ? '🔑 ' : ''}${attr.name} ${attr.type ? `(${attr.type})` : ''}`;
      const metrics = measureText(attrText, attributeFontSize, 'sans-serif', 'normal');
      return metrics.width;
    });

    const maxAttrWidth = attrWidths.length > 0 ? Math.max(...attrWidths) : 0;
    return Math.max(headerMetrics.width, maxAttrWidth) + padding * 2;
  });

  const entityWidth = Math.max(...entityWidths, 180); // Min width: 180px

  return (
    <svg
      width={width}
      height={height}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {entities.map((entity: EREntity, index: number) => {
        const x = leftMargin + (index % 3) * (entityWidth + spacing);
        const y = topMargin + Math.floor(index / 3) * 250;

        const attributes = entity.attributes || [];
        const totalHeight = entityHeaderHeight + attributes.length * attributeHeight + 10;

        return (
          <g key={entity.name || index}>
            <rect
              x={x}
              y={y}
              width={entityWidth}
              height={totalHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <rect
              x={x}
              y={y}
              width={entityWidth}
              height={entityHeaderHeight}
              fill={theme.colors.node.stroke}
              opacity={0.3}
              rx={5}
            />
            <text
              x={x + entityWidth / 2}
              y={y + entityHeaderHeight / 2}
              fill={theme.colors.text}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {entity.name}
            </text>

            {attributes.map((attr: ERAttribute, i: number) => (
              <g key={`${entity.name}-attr-${i}`}>
                <text
                  x={x + 10}
                  y={y + entityHeaderHeight + (i + 1) * attributeHeight}
                  fill={theme.colors.text}
                  fontSize={11}
                >
                  {attr.key ? '🔑 ' : ''}
                  {attr.name} {attr.type ? `(${attr.type})` : ''}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {relationships.map((rel: ERRelationship, index: number) => {
        const fromEntity = entities.find((e: EREntity) => e.name === rel.from);
        const toEntity = entities.find((e: EREntity) => e.name === rel.to);

        if (!fromEntity || !toEntity) return null;

        const fromIndex = entities.indexOf(fromEntity);
        const toIndex = entities.indexOf(toEntity);

        const x1 = leftMargin + (fromIndex % 3) * (entityWidth + spacing) + entityWidth / 2;
        const y1 = topMargin + Math.floor(fromIndex / 3) * 250 + entityHeaderHeight;
        const x2 = leftMargin + (toIndex % 3) * (entityWidth + spacing) + entityWidth / 2;
        const y2 = topMargin + Math.floor(toIndex / 3) * 250 + entityHeaderHeight;

        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.colors.edge.stroke}
              strokeWidth={2}
            />
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 - 5}
              fill={theme.colors.text}
              fontSize={11}
              textAnchor="middle"
            >
              {rel.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
