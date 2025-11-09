import type { Content } from '@typermaid/core';

/**
 * Extract raw string from Content type
 * Handles string, HTML, Markdown, and PlainText content
 */
export function extractContentString(content: Content | string | undefined): string {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if ('raw' in content) {
    return content.raw;
  }
  
  return '';
}

/**
 * Check if content matches a pattern
 */
export function contentMatches(content: Content | string | undefined, pattern: string): boolean {
  const str = extractContentString(content);
  return str.includes(pattern);
}
