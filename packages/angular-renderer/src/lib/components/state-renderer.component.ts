import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import type { StateDiagramAST } from '@typermaid/parser';
import { computeUnifiedDagreLayout } from '@typermaid/renderer-core';
import type { Theme } from '../services/theme.service';

@Component({
  selector: 'lyric-state-renderer',
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
						[attr.marker-end]="'url(#arrowhead)'"
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

				@for (state of states(); track state.id) {
					<g [attr.transform]="'translate(' + state.x + ',' + state.y + ')'">
						@if (state.type === 'START' || state.type === 'END') {
							<circle
								[attr.r]="15"
								[attr.fill]="state.type === 'START' ? theme.colors.node.fill : theme.colors.node.stroke"
								[attr.stroke]="theme.colors.node.stroke"
								[attr.stroke-width]="theme.colors.node.strokeWidth"
							/>
						} @else {
							<rect
								[attr.x]="-state.width / 2"
								[attr.y]="-state.height / 2"
								[attr.width]="state.width"
								[attr.height]="state.height"
								[attr.rx]="5"
								[attr.fill]="theme.colors.node.fill"
								[attr.stroke]="theme.colors.node.stroke"
								[attr.stroke-width]="theme.colors.node.strokeWidth"
							/>
							<text
								[attr.x]="0"
								[attr.y]="0"
								[attr.text-anchor]="'middle'"
								[attr.dominant-baseline]="'middle'"
								[attr.fill]="theme.colors.text"
								[style.font-family]="theme.fonts.primary"
							>
								{{ state.label || state.id }}
							</text>
						}
					</g>
				}

				<defs>
					<marker
						id="arrowhead"
						markerWidth="10"
						markerHeight="10"
						refX="9"
						refY="3"
						orient="auto"
					>
						<polygon
							points="0 0, 10 3, 0 6"
							[attr.fill]="theme.colors.edge.stroke"
						/>
					</marker>
				</defs>
			</g>
		</svg>
	`,
})
export class StateRendererComponent {
  @Input({ required: true }) diagram!: StateDiagramAST;
  @Input({ required: true }) theme!: Theme;

  layout = computed(() => {
    const stateDiagram = this.diagram.diagram;
    const nodes = stateDiagram.states.map((state) => ({
      id: state.id,
      label: typeof state.label === 'string' ? state.label : state.id,
      width: state.type === 'START' || state.type === 'END' ? 30 : 120,
      height: state.type === 'START' || state.type === 'END' ? 30 : 60,
    }));

    const edges = stateDiagram.transitions.map((trans) => {
      const label = typeof trans.label === 'string' ? trans.label : undefined;
      return {
        from: trans.from,
        to: trans.to,
        ...(label ? { label } : {}),
      };
    });

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'LR',
      ranksep: 80,
      nodesep: 60,
    });
  });

  states = computed(() => {
    const stateDiagram = this.diagram.diagram;
    return stateDiagram.states.map((state) => {
      const pos = this.layout().nodes.find((n) => n.id === state.id);
      return {
        id: state.id,
        type: state.type,
        label: typeof state.label === 'string' ? state.label : state.id,
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
        width: pos?.width ?? 120,
        height: pos?.height ?? 60,
      };
    });
  });

  edges = computed(() => {
    const stateDiagram = this.diagram.diagram;
    return stateDiagram.transitions.map((trans, i: number) => {
      const edgePoints = this.layout().edges.find(
        (e) => e.from === trans.from && e.to === trans.to
      );
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
        id: `${trans.from}-${trans.to}-${i}`,
        path,
        label: typeof trans.label === 'string' ? trans.label : undefined,
        labelX,
        labelY,
      };
    });
  });

  viewBox = computed(() => `0 0 ${this.layout().width} ${this.layout().height}`);
}
