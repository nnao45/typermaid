import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import type { ERDiagramAST } from '@typermaid/parser';
import { computeUnifiedDagreLayout } from '@typermaid/renderer-core';
import type { Theme } from '../services/theme.service';

/**
 * Extract string value from Content type
 */
function contentToString(content: string | { type: string; raw: string } | undefined): string | undefined {
  if (!content) return undefined;
  if (typeof content === 'string') return content;
  return content.raw;
}

@Component({
  selector: 'lyric-er-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
		<svg
			[attr.width]="layout().width"
			[attr.height]="layout().height"
			[attr.viewBox]="viewBox()"
		>
			<g>
				@for (edge of edges(); track edge.id) {
					<path
						[attr.d]="edge.path"
						[attr.stroke]="theme.colors.edge.stroke"
						[attr.stroke-width]="theme.colors.edge.strokeWidth"
						[attr.fill]="'none'"
					/>
					@if (edge.label) {
						<text
							[attr.x]="edge.labelX"
							[attr.y]="edge.labelY"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-size.px]="12"
						>
							{{ edge.label }}
						</text>
					}
				}

				@for (entity of entities(); track entity.id) {
					<g [attr.transform]="'translate(' + entity.x + ',' + entity.y + ')'">
						<rect
							[attr.width]="entity.width"
							[attr.height]="entity.height"
							[attr.fill]="theme.colors.node.fill"
							[attr.stroke]="theme.colors.node.stroke"
							[attr.stroke-width]="theme.colors.node.strokeWidth"
						/>
						<text
							[attr.x]="entity.width / 2"
							[attr.y]="20"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-weight]="'bold'"
						>
							{{ entity.name }}
						</text>
						<line
							[attr.x1]="0"
							[attr.y1]="30"
							[attr.x2]="entity.width"
							[attr.y2]="30"
							[attr.stroke]="theme.colors.node.stroke"
						/>
						@for (attr of entity.attributes; track $index; let i = $index) {
							<text
								[attr.x]="10"
								[attr.y]="45 + i * 15"
								[attr.fill]="theme.colors.text"
								[style.font-family]="theme.fonts.monospace"
								[style.font-size.px]="11"
							>
								{{ attr }}
							</text>
						}
					</g>
				}
			</g>
		</svg>
	`,
})
export class ERRendererComponent {
  @Input({ required: true }) diagram!: ERDiagramAST;
  @Input({ required: true }) theme!: Theme;

  layout = computed(() => {
    const erDiagram = this.diagram.diagram;
    const nodes = erDiagram.entities.map((entity) => ({
      id: entity.name,
      label: entity.name,
      width: 180,
      height: 80 + entity.attributes.length * 15,
    }));

    const edges = erDiagram.relationships.map((rel) => {
      const labelStr = contentToString(rel.label);
      return {
        from: rel.from,
        to: rel.to,
        ...(labelStr ? { label: labelStr } : {}),
      };
    });

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'LR',
      ranksep: 120,
      nodesep: 100,
    });
  });

  entities = computed(() => {
    const erDiagram = this.diagram.diagram;
    return erDiagram.entities.map((entity) => {
      const pos = this.layout().nodes.find((n) => n.id === entity.name);
      return {
        id: entity.name,
        name: entity.name,
        attributes: entity.attributes,
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
        width: pos?.width ?? 180,
        height: pos?.height ?? 80,
      };
    });
  });

  edges = computed(() => {
    const erDiagram = this.diagram.diagram;
    return erDiagram.relationships.map((rel, i: number) => {
      const edgePoints = this.layout().edges.find((e) => e.from === rel.from && e.to === rel.to);
      const points = edgePoints?.points ?? [];
      const firstPoint = points[0];
      const midPoint = points[Math.floor(points.length / 2)];
      const path =
        points.length > 0 && firstPoint
          ? `M ${firstPoint.x} ${firstPoint.y} ${points.map((p, idx: number) => (idx > 0 ? `L ${p.x} ${p.y}` : '')).join(' ')}`
          : '';
      const labelX = midPoint?.x ?? 0;
      const labelY = (midPoint?.y ?? 0) - 10;
      return {
        id: `${rel.from}-${rel.to}-${i}`,
        path,
        label: `${rel.fromCardinality} - ${rel.toCardinality}`,
        labelX,
        labelY,
      };
    });
  });

  viewBox = computed(() => `0 0 ${this.layout().width} ${this.layout().height}`);
}
