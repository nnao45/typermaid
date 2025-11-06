import { z } from 'zod';

/**
 * HTML Content Schema
 *
 * HTMLタグを含むコンテンツを表現するわよ💅
 * サニタイズ前のrawと、サニタイズ後のsanitizedを持つの✨
 */
export const HTMLContentSchema = z.object({
  type: z.literal('html'),
  raw: z.string(),
  sanitized: z.string().optional(),
});

export type HTMLContent = z.infer<typeof HTMLContentSchema>;

/**
 * Markdown Content Schema
 *
 * Markdown記法のコンテンツを表現するわよ💖
 * 将来的にMarkdown → HTMLパース機能を追加予定✨
 */
export const MarkdownContentSchema = z.object({
  type: z.literal('markdown'),
  raw: z.string(),
  parsed: z.string().optional(),
});

export type MarkdownContent = z.infer<typeof MarkdownContentSchema>;

/**
 * Plain Text Content Schema
 */
export const PlainContentSchema = z.string();

export type PlainContent = z.infer<typeof PlainContentSchema>;

/**
 * Content Schema (Union Type)
 *
 * プレーンテキスト、HTML、Markdownのいずれかを表現するわよ💅
 * Discriminated Unionで型安全に判定できるの✨
 */
export const ContentSchema = z.union([
  HTMLContentSchema,
  MarkdownContentSchema,
  PlainContentSchema,
]);

export type Content = z.infer<typeof ContentSchema>;

/**
 * Type guard: check if content is HTML
 */
export function isHTMLContent(content: Content): content is HTMLContent {
  return typeof content === 'object' && content.type === 'html';
}

/**
 * Type guard: check if content is Markdown
 */
export function isMarkdownContent(content: Content): content is MarkdownContent {
  return typeof content === 'object' && content.type === 'markdown';
}

/**
 * Type guard: check if content is plain text
 */
export function isPlainContent(content: Content): content is PlainContent {
  return typeof content === 'string';
}

/**
 * Helper: extract text from any content type
 */
export function extractText(content: Content): string {
  if (isHTMLContent(content)) {
    return content.sanitized || content.raw;
  }
  if (isMarkdownContent(content)) {
    return content.parsed || content.raw;
  }
  return content;
}
