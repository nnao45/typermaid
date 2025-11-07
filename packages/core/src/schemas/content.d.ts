import { z } from 'zod';
/**
 * HTML Content Schema
 *
 * HTMLタグを含むコンテンツを表現するわよ💅
 * サニタイズ前のrawと、サニタイズ後のsanitizedを持つの✨
 */
export declare const HTMLContentSchema: z.ZodObject<
  {
    type: z.ZodLiteral<'html'>;
    raw: z.ZodString;
    sanitized: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type HTMLContent = z.infer<typeof HTMLContentSchema>;
/**
 * Markdown Content Schema
 *
 * Markdown記法のコンテンツを表現するわよ💖
 * 将来的にMarkdown → HTMLパース機能を追加予定✨
 */
export declare const MarkdownContentSchema: z.ZodObject<
  {
    type: z.ZodLiteral<'markdown'>;
    raw: z.ZodString;
    parsed: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type MarkdownContent = z.infer<typeof MarkdownContentSchema>;
/**
 * Plain Text Content Schema
 */
export declare const PlainContentSchema: z.ZodString;
export type PlainContent = z.infer<typeof PlainContentSchema>;
/**
 * Content Schema (Union Type)
 *
 * プレーンテキスト、HTML、Markdownのいずれかを表現するわよ💅
 * Discriminated Unionで型安全に判定できるの✨
 */
export declare const ContentSchema: z.ZodUnion<
  readonly [
    z.ZodObject<
      {
        type: z.ZodLiteral<'html'>;
        raw: z.ZodString;
        sanitized: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >,
    z.ZodObject<
      {
        type: z.ZodLiteral<'markdown'>;
        raw: z.ZodString;
        parsed: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >,
    z.ZodString,
  ]
>;
export type Content = z.infer<typeof ContentSchema>;
/**
 * Type guard: check if content is HTML
 */
export declare function isHTMLContent(content: Content): content is HTMLContent;
/**
 * Type guard: check if content is Markdown
 */
export declare function isMarkdownContent(content: Content): content is MarkdownContent;
/**
 * Type guard: check if content is plain text
 */
export declare function isPlainContent(content: Content): content is PlainContent;
/**
 * Helper: extract text from any content type
 */
export declare function extractText(content: Content): string;
//# sourceMappingURL=content.d.ts.map
