import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import type { SequenceDiagramAST } from '@lyric-js/parser';
import type { Theme } from '../services/theme.service';

@Component({
  selector: 'lyric-sequence-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
		<svg
			[attr.width]="width()"
			[attr.height]="height()"
			[attr.viewBox]="viewBox()"
		>
			<g>
				@for (participant of participants(); track participant.id; let i = $index) {
					<g>
						<rect
							[attr.x]="getParticipantX(i)"
							[attr.y]="topMargin"
							[attr.width]="participantWidth"
							[attr.height]="participantHeight"
							[attr.fill]="theme.colors.node.fill"
							[attr.stroke]="theme.colors.node.stroke"
							[attr.stroke-width]="theme.colors.node.strokeWidth"
						/>
						<text
							[attr.x]="getParticipantX(i) + participantWidth / 2"
							[attr.y]="topMargin + participantHeight / 2"
							[attr.text-anchor]="'middle'"
							[attr.dominant-baseline]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
						>
							{{ participant.label }}
						</text>
						<line
							[attr.x1]="getParticipantX(i) + participantWidth / 2"
							[attr.y1]="topMargin + participantHeight"
							[attr.x2]="getParticipantX(i) + participantWidth / 2"
							[attr.y2]="totalHeight() - 20"
							[attr.stroke]="theme.colors.edge.stroke"
							[attr.stroke-dasharray]="'5,5'"
						/>
					</g>
				}

				@for (message of messages(); track $index; let i = $index) {
					<g>
						<line
							[attr.x1]="getMessageStartX(message)"
							[attr.y1]="getMessageY(i)"
							[attr.x2]="getMessageEndX(message)"
							[attr.y2]="getMessageY(i)"
							[attr.stroke]="theme.colors.edge.stroke"
							[attr.stroke-width]="theme.colors.edge.strokeWidth"
							[attr.marker-end]="'url(#arrowhead)'"
						/>
						<text
							[attr.x]="(getMessageStartX(message) + getMessageEndX(message)) / 2"
							[attr.y]="getMessageY(i) - 5"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-size.px]="12"
						>
							{{ message.label }}
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
							[attr.fill]="theme.colors.edge.stroke"
						/>
					</marker>
				</defs>
			</g>
		</svg>
	`,
})
export class SequenceRendererComponent {
  @Input({ required: true }) diagram!: SequenceDiagramAST;
  @Input({ required: true }) theme!: Theme;

  readonly topMargin = 50;
  readonly participantWidth = 120;
  readonly participantHeight = 40;
  readonly participantGap = 150;
  readonly messageGap = 60;
  readonly leftMargin = 50;

  participants = computed(() => {
    const seqDiagram = this.diagram.diagram;
    const statements = seqDiagram.statements;
    return statements.filter(
      (s): s is { type: 'participant'; id: string; alias?: string } => s.type === 'participant'
    );
  });
  messages = computed(() => {
    const seqDiagram = this.diagram.diagram;
    const statements = seqDiagram.statements;
    type MessageStatement = {
      type: 'message';
      from: string;
      to: string;
      arrowType:
        | 'solid'
        | 'dotted'
        | 'solid_arrow'
        | 'dotted_arrow'
        | 'solid_cross'
        | 'dotted_cross'
        | 'solid_open'
        | 'dotted_open';
      text?: string;
    };
    return statements.filter((s): s is MessageStatement => s.type === 'message');
  });

  width = computed(() => {
    const count = this.participants().length;
    return this.leftMargin * 2 + count * this.participantWidth + (count - 1) * this.participantGap;
  });

  totalHeight = computed(() => {
    const count = this.messages().length;
    return this.topMargin + this.participantHeight + count * this.messageGap + 40;
  });

  height = computed(() => this.totalHeight());
  viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);

  getParticipantX(index: number): number {
    return this.leftMargin + index * (this.participantWidth + this.participantGap);
  }

  getParticipantIndex(id: string): number {
    return this.participants().findIndex((p: { id: string }) => p.id === id);
  }

  getMessageY(index: number): number {
    return this.topMargin + this.participantHeight + (index + 1) * this.messageGap;
  }

  getMessageStartX(message: { from: string }): number {
    const index = this.getParticipantIndex(message.from);
    return this.getParticipantX(index) + this.participantWidth / 2;
  }

  getMessageEndX(message: { to: string }): number {
    const index = this.getParticipantIndex(message.to);
    return this.getParticipantX(index) + this.participantWidth / 2;
  }
}
