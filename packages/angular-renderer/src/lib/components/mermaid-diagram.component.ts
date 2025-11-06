import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, inject, Output, signal } from '@angular/core';
import type { ProgramAST } from '@typermaid/parser';
import { ParserService } from '../services/parser.service';
import { darkTheme, lightTheme, type Theme, ThemeService } from '../services/theme.service';
import { ClassRendererComponent } from './class-renderer.component';
import { ERRendererComponent } from './er-renderer.component';
import { FlowchartRendererComponent } from './flowchart-renderer.component';
import { GanttRendererComponent } from './gantt-renderer.component';
import { SequenceRendererComponent } from './sequence-renderer.component';
import { StateRendererComponent } from './state-renderer.component';

@Component({
  selector: 'lyric-mermaid-diagram',
  standalone: true,
  imports: [
    CommonModule,
    FlowchartRendererComponent,
    SequenceRendererComponent,
    ClassRendererComponent,
    ERRendererComponent,
    StateRendererComponent,
    GanttRendererComponent,
  ],
  template: `
		<div class="lyric-diagram-container">
			@if (diagramType() === 'FlowchartDiagram') {
				<lyric-flowchart-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
					[interactive]="interactive()"
					(nodeClick)="nodeClick.emit($event)"
					(edgeClick)="edgeClick.emit($event)"
				/>
			} @else if (diagramType() === 'SequenceDiagram') {
				<lyric-sequence-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
				/>
			} @else if (diagramType() === 'ClassDiagram') {
				<lyric-class-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
				/>
			} @else if (diagramType() === 'ERDiagram') {
				<lyric-er-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
				/>
			} @else if (diagramType() === 'StateDiagram') {
				<lyric-state-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
				/>
			} @else if (diagramType() === 'GanttDiagram') {
				<lyric-gantt-renderer
					[diagram]="diagram()"
					[theme]="currentTheme()"
				/>
			} @else {
				<div class="error">
					Unsupported diagram type: {{ diagramType() }}
				</div>
			}
		</div>
	`,
  styles: `
		.lyric-diagram-container {
			display: inline-block;
			width: 100%;
			height: 100%;
		}

		.error {
			color: red;
			padding: 20px;
		}
	`,
})
export class MermaidDiagramComponent {
  @Input() set code(value: string | undefined) {
    this._code.set(value);
  }
  @Input() set ast(value: ProgramAST | undefined) {
    this._ast.set(value);
  }
  @Input() set theme(value: 'light' | 'dark' | undefined) {
    this._theme.set(value);
  }
  @Input() set interactive(value: boolean) {
    this._interactive.set(value);
  }

  @Output() nodeClick = new EventEmitter<unknown>();
  @Output() edgeClick = new EventEmitter<unknown>();

  private _code = signal<string | undefined>(undefined);
  private _ast = signal<ProgramAST | undefined>(undefined);
  private _theme = signal<'light' | 'dark' | undefined>(undefined);
  private _interactive = signal<boolean>(false);

  private parser = inject(ParserService);
  private themeService = inject(ThemeService);

  parsedAst = computed(() => {
    const ast = this._ast();
    if (ast) return ast;
    const code = this._code();
    if (code) return this.parser.parse(code);
    return null;
  });

  currentTheme = computed<Theme>(() => {
    const themeName = this._theme();
    if (themeName) {
      return themeName === 'light' ? lightTheme : darkTheme;
    }
    return this.themeService.theme();
  });

  diagramType = computed(() => {
    const ast = this.parsedAst();
    if (!ast?.body?.[0]) return null;
    return ast.body[0].type;
  });

  diagram = computed(() => {
    const ast = this.parsedAst();
    if (!ast?.body?.[0]) return null;
    return ast.body[0];
  });

  get interactive(): boolean {
    return this._interactive();
  }
}
