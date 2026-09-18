<!-- Note detail page showing wrongs returned from the wrong list endpoint. -->
<script setup lang="ts">
import { onMounted } from 'vue'; import { useRoute } from 'vue-router'; import { useNoteStore } from '../stores/note';
const route = useRoute(); const store = useNoteStore(); onMounted(() => store.fetch(String(route.params.noteId)));
</script>
<template><main class="grid gap-4 p-6 md:grid-cols-[1fr_280px]"><article><h1 class="text-2xl">{{ store.note?.title ?? '题解笔记' }}</h1><div class="mt-4 whitespace-pre-wrap">{{ store.note?.content }}</div></article><aside class="border p-4"><h2>关联错题</h2><ul class="mt-2 space-y-2"><li v-for="wrong in store.wrongs" :key="wrong.id"><RouterLink :to="`/wrongs/${wrong.id}`">{{ wrong.title }}</RouterLink></li><li v-if="!store.wrongs.length">暂无关联错题</li></ul></aside></main></template>
