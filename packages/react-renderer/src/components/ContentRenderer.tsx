import type { Content } from '@lyric-js/core';
import DOMPurify from 'isomorphic-dompurify';
import type React from 'react';

interface ContentRendererProps {
  content: Content;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className,
  x = 0,
  y = 0,
  width = 200,
  height = 30,
}) => {
  if (typeof content === 'string') {
    return <>{content}</>;
  }

  // HTML content - sanitize for XSS protection
  const sanitizedHTML = DOMPurify.sanitize(content.raw, {
    ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'code', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style'],
  });

  // Use foreignObject to render HTML inside SVG
  return (
    <foreignObject x={x - width / 2} y={y - height / 2} width={width} height={height}>
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          textAlign: 'center',
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content is sanitized by DOMPurify
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </foreignObject>
  );
};
