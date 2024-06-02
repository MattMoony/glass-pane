<script setup lang="ts">
import { type Ref, ref, watch, type VNodeRef, nextTick } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { API } from '@/api';
import * as api from '@/api/media';
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
const emits = defineEmits<{
  /**
   * Emitted when the updated content is saving.
   */
  (e: 'startSaving'): void;
  /**
   * Emitted when the updated content is saved.
   */
  (e: 'endSaving'): void;
}>();

const bio: Ref<string|undefined> = ref(undefined);
const bioEditorElement: Ref<HTMLDivElement|undefined> = ref(undefined);

const saveBio = async (editor: monaco.editor.IStandaloneCodeEditor) => {
  if (!props.organ) return;
  emits('startSaving');
  props.organ.bio = editor.getValue();
  await props.organ.update();
  emits('endSaving');
};

watch(() => props.edit, () => {
  if (!props.edit || !props.organ) return;
  nextTick(() => {
    if (!bioEditorElement.value) return;
    const editor = monaco.editor.create(bioEditorElement.value, {
      value: props.organ.bio,
      language: 'markdown',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: true,
        renderCharacters: false,
      },
      wordWrap: 'on',
    });
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
      () => {
        const selection = editor.getSelection();
        if (!selection) return;
        const text = editor.getModel()?.getValueInRange(selection);
        if (!text) return;
        editor.executeEdits('bold', [{
          range: selection,
          text: `**${text}**`,
        }]);
      }
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
      () => {
        const selection = editor.getSelection();
        if (!selection) return;
        const text = editor.getModel()?.getValueInRange(selection);
        if (!text) return;
        editor.executeEdits('italic', [{
          range: selection,
          text: `*${text}*`,
        }]);
      }
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS,
      () => {
        const selection = editor.getSelection();
        if (!selection) return;
        const text = editor.getModel()?.getValueInRange(selection);
        if (!text) return;
        editor.executeEdits('italic', [{
          range: selection,
          text: `~~${text}~~`,
        }]);
      }
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
      async () => {
        const raw: ClipboardItem[] = await navigator.clipboard.read();
        const img: ClipboardItem|null = raw.find(item => item.types.some(t => t.includes('image/'))) || null;
        if (!img) 
          return editor.trigger('source', 'editor.action.clipboardPasteAction', null);
        const selection = editor.getSelection();
        if (!selection) return;
        const type: string = img.types.find(t => t.includes('image/')) || '';
        const blob: Blob = await img.getType(type as 'image/png').catch(() => new Blob());
        if (!blob.size) return;
        const res = await api.upload(blob);
        if (!res.success) return;
        editor.executeEdits('pasteImage', [{
          range: selection,
          text: `![](${API}${res.url})`,
        }]);
      }
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        if (!props.organ) return;
        saveBio(editor);
      }
    );
    editor.getModel()?.onDidChangeContent(() => {
      if (!props.organ) return;
      saveBio(editor);
    });
  });
}, { immediate: true });

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
    ref="bioEditorElement"
    class="md-bio-edit"
  >
  </div>
</template>

<style scoped>
.md-bio,
.md-bio-edit {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: .3em;
  word-wrap: break-word;
}

.md-bio-edit {
  height: 40vh;
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

/*
for bio editor
*/
.md-bio .cm-editor {
  word-wrap: break-word;
}
</style>
