import type { ERAttribute, ERDiagram, EREntity } from '@typermaid/core';
import {
  computeUnifiedDagreLayout,
  measureTextCanvas,
  type UnifiedLayoutEdge,
  type UnifiedLayoutNode,
} from '@typermaid/renderer-core';
import type React from 'react';
import { useMemo } from 'react';
import type { Theme } from '../themes/types';

/**
 * Extract string value from Content type
 */
function contentToString(
  content: string | { type: string; raw: string } | undefined
): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

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
  const entities = useMemo(() => {
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

    return Array.from(entityMap.values());
  }, [explicitEntities, relationships]);

  // Font settings
  const headerFontSize = 14;
  const attributeFontSize = 11;
  const padding = 20;
  const entityHeaderHeight = 35;
  const attributeHeight = 22;

  // Calculate entity dimensions dynamically
  const entityData = useMemo(() => {
    return entities.map((entity) => {
      const headerMetrics = measureTextCanvas(entity.name, headerFontSize, 'sans-serif', 'bold');

      const attributes = entity.attributes || [];
      const attrWidths = attributes.map((attr) => {
        const attrText = `${attr.key ? '🔑 ' : ''}${attr.name} ${attr.type ? `(${attr.type})` : ''}`;
        const metrics = measureTextCanvas(attrText, attributeFontSize, 'sans-serif', 'normal');
        return metrics.width;
      });

      const maxAttrWidth = attrWidths.length > 0 ? Math.max(...attrWidths) : 0;
      const entityWidth = Math.max(headerMetrics.width, maxAttrWidth) + padding * 2;
      const entityHeight = entityHeaderHeight + attributes.length * attributeHeight + 10;

      return {
        entity,
        width: Math.max(entityWidth, 180),
        height: entityHeight,
      };
    });
  }, [entities]);

  // Prepare nodes and edges for Dagre layout
  const layout = useMemo(() => {
    const nodes: UnifiedLayoutNode[] = entityData.map(({ entity, width, height }) => ({
      id: entity.name,
      label: entity.name,
      width,
      height,
    }));

    const edges: UnifiedLayoutEdge[] = relationships
      .map((rel): UnifiedLayoutEdge | null => {
        const labelStr = contentToString(rel.label);
        if (labelStr === undefined) {
          return {
            from: rel.from,
            to: rel.to,
          };
        }
        return {
          from: rel.from,
          to: rel.to,
          label: labelStr,
        };
      })
      .filter((edge): edge is UnifiedLayoutEdge => edge !== null);

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'LR', // ER diagrams typically flow left-to-right
      ranksep: 120,
      nodesep: 100,
      marginx: 50,
      marginy: 50,
    });
  }, [entityData, relationships]);

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
      {/* Render entities with Dagre positions */}
      {entityData.map(({ entity, width: entityWidth, height: entityHeight }) => {
        const position = layout.nodes.find((n) => n.id === entity.name);
        if (!position) return null;

        const x = position.x - entityWidth / 2;
        const y = position.y - entityHeight / 2;
        const attributes = entity.attributes || [];

        return (
          <g key={entity.name}>
            <rect
              x={x}
              y={y}
              width={entityWidth}
              height={entityHeight}
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
              x={position.x}
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
              <text
                key={`${entity.name}-attr-${i}`}
                x={x + 10}
                y={y + entityHeaderHeight + (i + 1) * attributeHeight}
                fill={theme.colors.text}
                fontSize={11}
              >
                {attr.key ? '🔑 ' : ''}
                {attr.name} {attr.type ? `(${attr.type})` : ''}
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
        const midPoint = edge.points[Math.floor(edge.points.length / 2)];
        if (!midPoint) return null;

        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <path d={pathData} fill="none" stroke={theme.colors.edge.stroke} strokeWidth={2} />
            {edge.label && (
              <text
                x={midPoint.x}
                y={midPoint.y - 5}
                fill={theme.colors.text}
                fontSize={11}
                textAnchor="middle"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
