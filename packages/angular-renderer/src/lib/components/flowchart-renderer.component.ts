import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import type { FlowchartDiagramAST } from '@typermaid/parser';
import type { LayoutEdge, LayoutNode } from '@typermaid/renderer-core';
import { astToSchema, createLayout } from '@typermaid/renderer-core';
import type { Theme } from '../services/theme.service';

@Component({
  selector: 'lyric-flowchart-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
		<svg
			[attr.width]="width()"
			[attr.height]="height()"
			[attr.viewBox]="viewBox()"
		>
			<g>
				@for (edge of layout().edges; track edge.id) {
					<path
						[attr.d]="edge.path"
						[attr.stroke]="theme().colors.edge.stroke"
						[attr.stroke-width]="theme().colors.edge.strokeWidth"
						[attr.fill]="'none'"
						[attr.marker-end]="getMarkerEnd(edge)"
						(click)="onEdgeClick(edge)"
					/>
					@if (edge.label) {
						<text
							[attr.x]="edge.labelPosition?.x"
							[attr.y]="edge.labelPosition?.y"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme().colors.text"
							[style.font-family]="theme().fonts.primary"
							[style.font-size.px]="12"
						>
							{{ edge.label }}
						</text>
					}
				}

				@for (node of layout().nodes; track node.id) {
					<g
						[attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
						(click)="onNodeClick(node)"
					>
						<path
							[attr.d]="node.shapePath"
							[attr.fill]="theme().colors.node.fill"
							[attr.stroke]="theme().colors.node.stroke"
							[attr.stroke-width]="theme().colors.node.strokeWidth"
						/>
						<text
							[attr.x]="0"
							[attr.y]="0"
							[attr.text-anchor]="'middle'"
							[attr.dominant-baseline]="'middle'"
							[attr.fill]="theme().colors.text"
							[style.font-family]="theme().fonts.primary"
							[style.font-size.px]="14"
						>
							{{ node.label }}
						</text>
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
							[attr.fill]="theme().colors.edge.stroke"
						/>
					</marker>
				</defs>
			</g>
		</svg>
	`,
  styles: `
		:host {
			display: block;
		}
	`,
})
export class FlowchartRendererComponent {
  @Input({ required: true }) diagram!: FlowchartDiagramAST;
  @Input({ required: true }) theme!: Theme;
  @Input() width = 800;
  @Input() height = 600;
  @Input() interactive = false;

  @Output() nodeClick = new EventEmitter<LayoutNode>();
  @Output() edgeClick = new EventEmitter<LayoutEdge>();

  layout = computed(() => {
    const schemaDiagram = astToSchema({ type: 'Program', body: [this.diagram] });
    const direction = this.diagram.direction === 'TD' ? 'TB' : this.diagram.direction;
    return createLayout(schemaDiagram, {
      rankdir: direction || 'TB',
      nodesep: 50,
      ranksep: 100,
      marginx: 20,
      marginy: 20,
    });
  });

  viewBox = computed(() => {
    const l = this.layout();
    return `0 0 ${l.bbox.width} ${l.bbox.height}`;
  });

  getMarkerEnd(_edge: LayoutEdge): string {
    return 'url(#arrowhead)';
  }

  onNodeClick(node: LayoutNode): void {
    if (this.interactive) {
      this.nodeClick.emit(node);
    }
  }

  onEdgeClick(edge: LayoutEdge): void {
    if (this.interactive) {
      this.edgeClick.emit(edge);
    }
  }
}
