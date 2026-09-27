import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

function makeEditor(): Editor {
  let editor: Editor;
  editor = new Editor({
    extensions: [StarterKit],
    content: '<p>hello</p>',
    onBlur: () => {
      if (editor.state.storedMarks?.length) {
        editor.view.dispatch(editor.state.tr.setStoredMarks(null));
      }
    },
  });
  return editor;
}

function dispatchBlur(editor: Editor): void {
  editor.view.dom.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
}

describe('storedMarks blur 清除', () => {
  it('blur 后 storedMarks 被清除', () => {
    const editor = makeEditor();
    editor.commands.focus('end');
    editor.commands.toggleBold();
    expect(editor.isActive('bold')).toBe(true);

    dispatchBlur(editor);
    expect(editor.isActive('bold')).toBe(false);

    editor.commands.focus('end');
    expect(editor.isActive('bold')).toBe(false);
    editor.destroy();
  });

  it('无 storedMarks 时 blur 不改变状态', () => {
    const editor = makeEditor();
    editor.commands.focus('end');
    const marksBefore = editor.state.storedMarks;
    dispatchBlur(editor);
    expect(editor.state.storedMarks).toEqual(marksBefore);
    editor.destroy();
  });
});
