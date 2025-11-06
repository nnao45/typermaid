import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import type { GanttDiagramAST } from '@lyric-js/parser';
import {
  calculateTimelineRange,
  calculateTimelineTasks,
  generateTimelineAxis,
  type TimelineConfig,
  type TimelineTask,
} from '@lyric-js/renderer-core';
import type { Theme } from '../services/theme.service';

@Component({
  selector: 'lyric-gantt-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
		<svg
			[attr.width]="width"
			[attr.height]="totalHeight()"
			[attr.viewBox]="viewBox()"
		>
			<g>
				<!-- Timeline axis background -->
				<rect
					[attr.x]="0"
					[attr.y]="0"
					[attr.width]="width"
					[attr.height]="topMargin"
					[attr.fill]="'#f9f9f9'"
				/>

				<!-- Timeline grid lines -->
				@for (day of timelineAxis(); track day.date.getTime()) {
					<line
						[attr.x1]="leftMargin() + day.x"
						[attr.y1]="topMargin"
						[attr.x2]="leftMargin() + day.x"
						[attr.y2]="totalHeight()"
						[attr.stroke]="isWeekend(day.date) ? '#f0f0f0' : theme.colors.grid"
						[attr.stroke-width]="isWeekend(day.date) ? 3 : 1"
					/>
					@if (!isWeekend(day.date)) {
						<text
							[attr.x]="leftMargin() + day.x"
							[attr.y]="topMargin - 10"
							[attr.text-anchor]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-size.px]="10"
						>
							{{ day.label }}
						</text>
					}
				}

				<!-- Task rows -->
				@for (timelineTask of timelineTasks(); track timelineTask.task.id; let i = $index) {
					<g>
						<!-- Task name -->
						<text
							[attr.x]="10"
							[attr.y]="topMargin + i * rowHeight + taskHeight / 2"
							[attr.dominant-baseline]="'middle'"
							[attr.fill]="theme.colors.text"
							[style.font-family]="theme.fonts.primary"
							[style.font-size.px]="12"
						>
							{{ timelineTask.task.name || timelineTask.task.id }}
						</text>

						<!-- Task bar -->
						<rect
							[attr.x]="leftMargin() + timelineTask.x"
							[attr.y]="topMargin + i * rowHeight"
							[attr.width]="timelineTask.width"
							[attr.height]="taskHeight"
							[attr.fill]="getTaskColor(timelineTask.task)"
							[attr.stroke]="theme.colors.node.stroke"
							[attr.stroke-width]="1"
							[attr.rx]="3"
						/>

						<!-- Task duration label -->
						<text
							[attr.x]="leftMargin() + timelineTask.x + timelineTask.width / 2"
							[attr.y]="topMargin + i * rowHeight + taskHeight / 2"
							[attr.text-anchor]="'middle'"
							[attr.dominant-baseline]="'middle'"
							[attr.fill]="'white'"
							[style.font-family]="theme.fonts.primary"
							[style.font-size.px]="10"
						>
							{{ timelineTask.task.duration }}
						</text>
					</g>
				}

				<!-- Dependency arrows -->
				@for (arrow of dependencyArrows(); track arrow.id) {
					<path
						[attr.d]="arrow.path"
						[attr.stroke]="theme.colors.edge.stroke"
						[attr.stroke-width]="1.5"
						[attr.stroke-dasharray]="'5,5'"
						[attr.fill]="'none'"
						[attr.marker-end]="'url(#arrow)'"
					/>
				}

				<defs>
					<marker
						id="arrow"
						markerWidth="10"
						markerHeight="10"
						refX="9"
						refY="3"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<path
							d="M0,0 L0,6 L9,3 z"
							[attr.fill]="theme.colors.edge.stroke"
						/>
					</marker>
				</defs>
			</g>
		</svg>
	`,
})
export class GanttRendererComponent {
  @Input({ required: true }) diagram!: GanttDiagramAST;
  @Input({ required: true }) theme!: Theme;
  @Input() width = 1200;

  readonly topMargin = 100;
  readonly taskHeight = 30;
  readonly taskSpacing = 10;
  readonly rowHeight = this.taskHeight + this.taskSpacing;

  tasks = computed(() => {
    const ganttDiagram = this.diagram.diagram;
    const sections = ganttDiagram.sections ?? [];
    return sections.flatMap((section) => section.tasks ?? []);
  });

  leftMargin = computed(() => 250);

  timelineConfig = computed<TimelineConfig>(() => {
    const timelineWidth = this.width - this.leftMargin() - 50;
    return calculateTimelineRange(this.tasks(), timelineWidth);
  });

  timelineTasks = computed<TimelineTask[]>(() => {
    return calculateTimelineTasks(this.tasks(), this.timelineConfig());
  });

  timelineAxis = computed(() => {
    const totalDays = this.timelineConfig().totalDays;
    const step = totalDays > 60 ? 'week' : 'day';
    return generateTimelineAxis(this.timelineConfig(), step);
  });

  totalHeight = computed(() => {
    const count = this.tasks().length;
    return this.topMargin + count * this.rowHeight + 40;
  });

  viewBox = computed(() => `0 0 ${this.width} ${this.totalHeight()}`);

  dependencyArrows = computed(() => {
    const arrows: Array<{ id: string; path: string }> = [];
    const taskMap = new Map<string, { index: number; x: number; width: number }>();

    this.timelineTasks().forEach((tt, i) => {
      if (tt.task.id) {
        taskMap.set(tt.task.id, { index: i, x: tt.x, width: tt.width });
      }
    });

    this.timelineTasks().forEach((tt) => {
      if (!tt.task.dependencies) return;

      for (const depId of tt.task.dependencies) {
        const from = taskMap.get(depId);
        const to = taskMap.get(tt.task.id || '');

        if (!from || !to) continue;

        const x1 = this.leftMargin() + from.x + from.width;
        const y1 = this.topMargin + from.index * this.rowHeight + this.taskHeight / 2;
        const x2 = this.leftMargin() + to.x;
        const y2 = this.topMargin + to.index * this.rowHeight + this.taskHeight / 2;

        const midX = (x1 + x2) / 2;
        const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

        arrows.push({
          id: `${depId}-${tt.task.id}`,
          path,
        });
      }
    });

    return arrows;
  });

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  getTaskColor(task: { status?: string }): string {
    if (task.status === 'done') return '#5cb85c';
    if (task.status === 'active') return '#5bc0de';
    if (task.status === 'crit') return '#d9534f';
    return this.theme.colors.node.fill;
  }
}
