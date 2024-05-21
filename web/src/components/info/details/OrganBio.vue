<script setup lang="ts">
import { type Ref, ref, shallowRef, watch } from 'vue';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

import { API } from '@/api';
import * as api from '@/api/organ';
import Organ from '@/models/Organ';

const props = defineProps<{
  /**
   * The organ whose bio to display.
   */
  organ: Organ;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const bio: Ref<string|undefined> = ref(undefined);
const bioEditorState = shallowRef(null);
const bioEditorView = shallowRef(null);

const bioKeyDown = (e: KeyboardEvent) => {
  if (e.key === 's' && e.ctrlKey) {
    console.log(e.key, e.ctrlKey, e.metaKey, e.shiftKey, e.altKey);
    e.preventDefault();
    (async () => props.organ && await props.organ.update())();
    return false;
  }
  else if (e.key === 'v' && e.ctrlKey) {
    (async () => {
      if (!props.organ) return;
      const raw: ClipboardItem[] = await navigator.clipboard.read();
      const img: ClipboardItem|null = raw.find(item => item.types.some(t => t.includes('image/'))) || null;
      if (!bioEditorView.value || !img) return;
      const type: string = img.types.find(t => t.includes('image/')) || '';
      const blob: Blob = await img.getType(type as 'image/png').catch(() => new Blob());
      if (!blob.size) return;
      const res = await api.uploadBioPic(props.organ.id, blob);
      if (!res.success) return;
      // @ts-ignore
      bioEditorView.value.dispatch({
        changes: { 
          // @ts-ignore
          from: bioEditorView.value.state.selection.ranges[0].anchor, 
          insert: `![](${API}${res.url})`, 
        }
      });
    })();
  }
};

const editorReady = (payload: any) => {
  bioEditorState.value = payload.state;
  bioEditorView.value = payload.view;
};

watch(() => props.organ, async (newOrgan: Organ|null) => {
  if (!newOrgan) return;
  bio.value = await newOrgan.bioHTML();
}, { immediate: true });

watch(() => props.organ?.bio, async () => {
  if (!props.organ) return;
  bio.value = await props.organ.bioHTML();
});
</script>

<template>
  <div
    v-if="!edit && organ"
    class="md-bio"
    v-dompurify-html="bio"
  ></div>
  <div
    v-else-if="edit && organ"
    class="md-bio"
  >
    <codemirror 
      ref="bioEditor"
      v-model="organ.bio"
      :extensions="[markdown(), oneDark,]"
      @keydown="bioKeyDown"
      @blur="async () => organ && await organ.update()"
      @ready="editorReady"
    />
  </div>
</template>

<style scoped>
.md-bio {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: .3em;
}
</style>

<style>
/* 
for markdown bio 
*/

.md-bio > * {
  box-sizing: border-box;
  flex-grow: 1;
  flex-basis: 0;
  width: 100%;
}

.md-bio table {
  border-collapse: collapse;
}

.md-bio table td, 
.md-bio table th {
  border: 2px solid var(--color-border);
  padding: .2em 1em;
}

.md-bio table th {
  background: var(--color-background-soft);
  font-weight: bold;
}

.md-bio a {
  color: var(--color-highlight);
}

.md-bio .md-img {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .5em;
}

.md-bio .md-img img {
  max-width: 100%;
  max-height: 50vh;
}

.md-bio blockquote,
.md-bio .md-alert {
  border-left: 5px solid var(--color-border);
  margin-left: 0;
  background-color: var(--color-background-soft);
  padding: .5em;
  padding-left: 1em;
}

.md-bio .md-alert .md-alert-title {
  font-weight: bold;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .3em;
  padding: .5em 0;
}

.md-bio .md-alert .md-alert-title {
  font-size: 1.05em;
}

.md-bio .md-alert-note {
  border-color: var(--color-note);
}

.md-bio .md-alert-note .md-alert-title {
  color: var(--color-note);
}

.md-bio .md-alert-tip {
  border-color: var(--color-tip);
}

.md-bio .md-alert-tip .md-alert-title {
  color: var(--color-tip);
}

.md-bio .md-alert-important {
  border-color: var(--color-important);
}

.md-bio .md-alert-important .md-alert-title {
  color: var(--color-important);
}

.md-bio .md-alert-warning {
  border-color: var(--color-warning);
}

.md-bio .md-alert-warning .md-alert-title {
  color: var(--color-warning);
}

.md-bio .md-alert-caution {
  border-color: var(--color-caution);
}

.md-bio .md-alert-caution .md-alert-title {
  color: var(--color-caution);
}
</style>
