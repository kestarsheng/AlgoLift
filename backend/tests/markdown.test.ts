// 覆盖 Markdown 源码清洗：保留语法符号、剥离危险 HTML 标签与属性，实体编码注入不被反转义复用。
import { cleanMarkdown } from '../src/config/markdown';

describe('cleanMarkdown', () => {
  it('保留 Markdown 语法符号', () => {
    expect(cleanMarkdown('# 标题')).toBe('# 标题');
    expect(cleanMarkdown('**加粗**')).toBe('**加粗**');
    expect(cleanMarkdown('- 列表项')).toBe('- 列表项');
    expect(cleanMarkdown('> 引用')).toBe('> 引用');
  });
  it('剥离 script 标签及内容', () => {
    expect(cleanMarkdown('正文<script>alert(1)</script>')).toBe('正文');
  });
  it('剥离 on* 属性但保留安全 href', () => {
    const out = cleanMarkdown('<a href="http://x.com" onclick="alert(1)">x</a>');
    expect(out).not.toContain('onclick');
    expect(out).toContain('href="http://x.com"');
  });
  it('剥离 iframe', () => {
    expect(cleanMarkdown('<iframe src="x"></iframe>')).not.toContain('<iframe');
  });
  it('剥离 javascript: 协议链接', () => {
    expect(cleanMarkdown('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
  });
  it('保留图片标签的安全属性', () => {
    const out = cleanMarkdown('<img src="http://x.com/a.png" alt="图">');
    expect(out).toContain('src="http://x.com/a.png"');
    expect(out).toContain('alt="图"');
  });
  it('实体编码的 script 不会因反转义而被复用', () => {
    expect(cleanMarkdown('&lt;script&gt;alert(1)&lt;/script&gt;')).not.toContain('<script');
    expect(cleanMarkdown('&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;')).not.toContain('<script');
  });
  it('实体编码的注入属性不会因反转义而被复用', () => {
    expect(cleanMarkdown('&lt;img src=x onerror=alert(1)&gt;')).not.toContain('onerror');
    expect(cleanMarkdown('&lt;iframe src=x&gt;')).not.toContain('iframe');
    expect(cleanMarkdown('&lt;a href="javascript:alert(1)"&gt;x&lt;/a&gt;')).not.toContain('javascript');
  });
  it('双重编码的实体保持编码，不二次解码还原', () => {
    expect(cleanMarkdown('&amp;lt;script&amp;gt;')).not.toContain('<script');
  });
});