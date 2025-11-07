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
/**
 * Plain Text Content Schema
 */
export const PlainContentSchema = z.string();
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
/**
 * Type guard: check if content is HTML
 */
export function isHTMLContent(content) {
  return typeof content === 'object' && content.type === 'html';
}
/**
 * Type guard: check if content is Markdown
 */
export function isMarkdownContent(content) {
  return typeof content === 'object' && content.type === 'markdown';
}
/**
 * Type guard: check if content is plain text
 */
export function isPlainContent(content) {
  return typeof content === 'string';
}
/**
 * Helper: extract text from any content type
 */
export function extractText(content) {
  if (isHTMLContent(content)) {
    return content.sanitized || content.raw;
  }
  if (isMarkdownContent(content)) {
    return content.parsed || content.raw;
  }
  return content;
}
//# sourceMappingURL=content.js.map
