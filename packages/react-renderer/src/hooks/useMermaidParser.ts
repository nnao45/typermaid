import type { ProgramAST } from '@lyric-js/parser';
import { parse } from '@lyric-js/parser';
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
