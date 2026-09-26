// 覆盖 Markdown 源码清洗：保留语法符号、剥离危险 HTML 标签与属性。
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
});