// Markdown 源码清洗：保留 Markdown 语法符号，剥离内联 HTML 中的危险标签与属性，作为服务端防御层。
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'em', 'i', 'strong', 'b', 'del', 's', 'a', 'img', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'mark'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title', 'width', 'height'] };

/** 清洗 Markdown 源码中可能内联的危险 HTML，反转义 HTML 实体以保留 Markdown 语法符号，返回安全的 Markdown 文本。 */
export const cleanMarkdown = (value: string): string => sanitizeHtml(value, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTRIBUTES, allowedSchemes: ['http', 'https', 'mailto'], disallowedTagsMode: 'discard' })
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&');