// 覆盖题目关联笔记请求参数校验。
import { isNoteIdsInput } from '../src/modules/problem-notes/problem-notes.dto';

describe('problem notes DTO', () => {
  it('accepts a unique note ID list, including empty list', () => {
    expect(isNoteIdsInput({ noteIds: ['note-1', 'note-2'] })).toBe(true);
    expect(isNoteIdsInput({ noteIds: [] })).toBe(true);
  });

  it.each([{}, { noteIds: 'note-1' }, { noteIds: [''] }, { noteIds: ['note-1', 'note-1'] }, { noteIds: [1] }])('rejects invalid input: %j', (input) => {
    expect(isNoteIdsInput(input)).toBe(false);
  });
});
