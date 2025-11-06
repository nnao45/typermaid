import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import type { ClassDiagram, ClassRelation } from '@typermaid/core';
import type { ClassDiagramAST } from '@typermaid/parser';
import { computeUnifiedDagreLayout } from '@typermaid/renderer-core';
import type { Theme } from '../services/theme.service';

@Component({
  selector: 'lyric-class-renderer',
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
						[attr.marker-end]="getMarker(edge.type)"
					/>
				}

				@for (cls of classes(); track cls.id) {
					<g [attr.transform]="'translate(' + cls.x + ',' + cls.y + ')'">
						<rect
							[attr.width]="cls.width"
							[attr.height]="cls.height"
							[attr.fill]="theme.colors.node.fill"
							[attr.stroke]="theme.colors.node.stroke"
							[attr.stroke-width]="theme.colors.node.strokeWidth"
						/>
						<text
							[attr.x]="cls.width / 2"
							[attr.y]="20"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-weight]="'bold'"
						>
							{{ cls.name }}
						</text>
						<line
							[attr.x1]="0"
							[attr.y1]="30"
							[attr.x2]="cls.width"
							[attr.y2]="30"
							[attr.stroke]="theme.colors.node.stroke"
						/>
						@for (member of cls.members; track $index; let i = $index) {
							<text
								[attr.x]="10"
								[attr.y]="45 + i * 15"
								[attr.fill]="theme.colors.text"
								[style.font-family]="theme.fonts.monospace"
								[style.font-size.px]="11"
							>
								{{ member }}
							</text>
						}
					</g>
				}

				<defs>
					<marker id="inheritance" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
						<polygon points="0 0, 10 3, 0 6" [attr.fill]="'none'" [attr.stroke]="theme.colors.edge.stroke" />
					</marker>
					<marker id="composition" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
						<polygon points="0 3, 5 0, 10 3, 5 6" [attr.fill]="theme.colors.edge.stroke" />
					</marker>
				</defs>
			</g>
		</svg>
	`,
})
export class ClassRendererComponent {
  @Input({ required: true }) diagram!: ClassDiagramAST;
  @Input({ required: true }) theme!: Theme;

  layout = computed(() => {
    const nodes = this.diagram.diagram.classes.map((cls: ClassDiagram['classes'][0]) => ({
      id: cls.name,
      label: cls.name,
      width: 180,
      height: 80 + cls.members.length * 15,
    }));

    const edges = this.diagram.diagram.relations.map((rel) => ({
      from: rel.from,
      to: rel.to,
      ...(rel.label ? { label: rel.label } : {}),
    }));

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'TB',
      ranksep: 100,
      nodesep: 80,
    });
  });

  classes = computed(() => {
    return this.diagram.diagram.classes.map((cls: ClassDiagram['classes'][0]) => {
      const pos = this.layout().nodes.find((n) => n.id === cls.name);
      return {
        id: cls.name,
        name: cls.name,
        members: cls.members,
        x: pos?.x || 0,
        y: pos?.y || 0,
        width: pos?.width || 180,
        height: pos?.height || 80,
      };
    });
  });

  edges = computed(() => {
    return this.diagram.diagram.relations.map((rel: ClassRelation, i: number) => {
      const edgePoints = this.layout().edges.find((e) => e.from === rel.from && e.to === rel.to);
      const points = edgePoints?.points || [];
      const path =
        points.length > 0 && points[0]
          ? `M ${points[0].x} ${points[0].y} ${points.map((p: { x: number; y: number }, idx: number) => (idx > 0 ? `L ${p.x} ${p.y}` : '')).join(' ')}`
          : '';
      return {
        id: `${rel.from}-${rel.to}-${i}`,
        path,
        type: rel.relationType,
      };
    });
  });

  viewBox = computed(() => `0 0 ${this.layout().width} ${this.layout().height}`);

  getMarker(type: string): string {
    if (type === 'inheritance') return 'url(#inheritance)';
    if (type === 'composition') return 'url(#composition)';
    return '';
  }
}
