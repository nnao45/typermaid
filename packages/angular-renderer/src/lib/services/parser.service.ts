import { Injectable } from '@angular/core';
import type { ProgramAST } from '@typermaid/parser';
import { parse } from '@typermaid/parser';

@Injectable({ providedIn: 'root' })
export class ParserService {
  parse(code: string): ProgramAST {
    return parse(code);
  }
}
