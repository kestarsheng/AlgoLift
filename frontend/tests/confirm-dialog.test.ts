import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ConfirmDialog from '../src/components/ConfirmDialog.vue';
describe('ConfirmDialog', () => {
  it('renders nothing when closed, then title/message and buttons when open', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: false, title: '删除待办' } });
    expect(wrapper.text()).not.toContain('删除待办');
    await wrapper.setProps({ open: true, message: '确认删除「复习二分」吗？' });
    expect(wrapper.text()).toContain('删除待办');
    expect(wrapper.text()).toContain('确认删除「复习二分」吗？');
    expect(wrapper.text()).toContain('确认删除');
    expect(wrapper.text()).toContain('取消');
  });
  it('emits confirm and cancel', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true, title: '删除待办' } });
    await wrapper.findAll('button').find((button) => button.text() === '确认删除')!.trigger('click');
    expect(wrapper.emitted().confirm).toHaveLength(1);
    await wrapper.findAll('button').find((button) => button.text() === '取消')!.trigger('click');
    expect(wrapper.emitted().cancel).toHaveLength(1);
  });
  it('shows loading state, disables buttons and ignores backdrop click while loading', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true, title: '删除待办', loading: true } });
    expect(wrapper.text()).toContain('删除中…');
    const confirm = wrapper.findAll('button').find((button) => button.text() === '删除中…')!;
    expect((confirm.element as HTMLButtonElement).disabled).toBe(true);
    await wrapper.find('.fixed').trigger('click');
    expect(wrapper.emitted().cancel).toBeUndefined();
    await wrapper.setProps({ loading: false });
    await wrapper.find('.fixed').trigger('click');
    expect(wrapper.emitted().cancel).toHaveLength(1);
  });
  it('renders slot content instead of message when slot is provided', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: true, title: '删除分类', message: '默认文案' },
      slots: { default: '<p class="slot-note">该分类下的 3 道题目不会被删除</p>' },
    });
    expect(wrapper.text()).not.toContain('默认文案');
    expect(wrapper.text()).toContain('该分类下的 3 道题目不会被删除');
  });
});