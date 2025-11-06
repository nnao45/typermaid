import type { ProgramAST } from '@typermaid/parser';
import { parse } from '@typermaid/parser';
import { useMemo } from 'react';

export function useMermaidParser(code: string): ProgramAST | null {
  return useMemo(() => {
    try {
      return parse(code);
    } catch (error) {
      console.error('Failed to parse Mermaid code:', error);
      return null;
    }
  }, [code]);
}
