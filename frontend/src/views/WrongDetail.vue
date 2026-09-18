<!-- Wrong detail page with note association management. -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWrongNoteStore } from '../stores/wrongNote';
const route = useRoute(); const store = useWrongNoteStore(); const selected = ref<string[]>([]); const wrongId = String(route.params.wrongId); const selectedText = ref('');
onMounted(async () => { await store.fetch(wrongId); selected.value = store.notes.map((note) => note.id); selectedText.value = selected.value.join('\n'); });
async function replace(): Promise<void> { selected.value = selectedText.value.split('\n').map((id) => id.trim()).filter(Boolean); await store.replace(wrongId, selected.value); }
async function clear(): Promise<void> { selected.value = []; await replace(); }
async function remove(noteId: string): Promise<void> { await store.remove(wrongId, noteId); selected.value = selected.value.filter((id) => id !== noteId); }
</script>
<template><main class="grid gap-4 p-6 md:grid-cols-[1fr_280px]"><section><h1 class="text-2xl">错题详情</h1><p class="mt-4">关联题解笔记</p><p v-if="store.loading">加载中…</p><p v-else-if="store.error" class="text-red-700">{{ store.error }}</p><ul v-else class="mt-2 space-y-2"><li v-for="note in store.notes" :key="note.id" class="flex justify-between border p-3"><RouterLink :to="`/notes/${note.id}`">{{ note.title }}</RouterLink><button type="button" @click="remove(note.id)">解除</button></li><li v-if="!store.notes.length">暂无关联笔记</li></ul></section><aside class="border p-4"><label class="block">笔记 ID（每行一个）<textarea v-model="selectedText" class="mt-2 w-full border p-2" rows="6" /></label><button class="mt-3 border px-3 py-2" @click="replace">整体替换</button><button class="ml-2 border px-3 py-2" @click="clear">清空</button></aside></main></template>
