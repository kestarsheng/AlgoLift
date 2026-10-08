// Markdown 源码清洗：先解码 HTML 实体（暴露真实标签供清洗器识别）再剥离危险标签与属性，作为服务端防御层。
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'em', 'i', 'strong', 'b', 'del', 's', 'a', 'img', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'mark'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title', 'width', 'height'] };

/** 解码一次 HTML 命名/数字实体，让编码后的危险标签（如 `&lt;script&gt;`）还原为真实标签以暴露给清洗器。 */
const decodeEntities = (value: string): string => value
  .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&amp;/g, '&');

/** 清洗 Markdown 源码：先解码实体再剔除危险标签/属性/协议，最后只还原 `>`（blockquote 语法），其余实体保持编码以防二次反转义削弱清洗。 */
export const cleanMarkdown = (value: string): string => sanitizeHtml(decodeEntities(value), { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTRIBUTES, allowedSchemes: ['http', 'https', 'mailto'], disallowedTagsMode: 'discard' })
  .replace(/&gt;/g, '>');