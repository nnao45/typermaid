import { Injectable } from '@angular/core';
import type { ProgramAST } from '@lyric-js/parser';
import { parse } from '@lyric-js/parser';

@Injectable({ providedIn: 'root' })
export class ParserService {
  parse(code: string): ProgramAST {
    return parse(code);
  }
}
