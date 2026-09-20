// 覆盖分类请求参数校验及 includeEmpty 默认行为。
import { isCategoryIdsInput, isCategoryInput, parseCategoryQuery } from '../src/modules/category/category.dto';

describe('category DTO validation', () => {
  it('defaults includeEmpty to false', () => expect(parseCategoryQuery({})).toEqual({ includeEmpty: false }));
  it('accepts an explicit true includeEmpty', () => expect(parseCategoryQuery({ includeEmpty: 'true' }).includeEmpty).toBe(true));
  it('trims and validates names', () => {
    expect(isCategoryInput({ name: ' 动态规划 ' })).toBe(true);
    expect(isCategoryInput({ name: '   ' })).toBe(false);
  });
  it('rejects duplicate category IDs', () => expect(isCategoryIdsInput({ categoryIds: ['a', 'a'] })).toBe(false));
});
