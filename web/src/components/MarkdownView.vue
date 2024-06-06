<script setup lang="ts">
import { type Ref, ref, watch, type VNodeRef, nextTick } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { marked } from '@/lib/markdown';

const props = defineProps<{
  /**
   * The markdown content to display (& edit).
   */
  content: string;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when user wants to save changes.
   */
  (e: 'save', content: string): void;
  /**
   * Emitted when the user wants to upload an image.
   */
  (e: 'uploadImage', img: Blob): Promise<string|null>;
}>();

const cuContent: Ref<string> = ref(props.content);
const renderedContent: Ref<string> = ref('');
const editorElement: Ref<HTMLDivElement|undefined> = ref(undefined);

const save = async (editor: monaco.editor.IStandaloneCodeEditor) => {
  cuContent.value = editor.getValue();
  emits('save', cuContent.value);
};

watch(() => props.edit, () => {
  if (!props.edit) return;
  nextTick(() => {
    if (!editorElement.value) return;
    const editor = monaco.editor.create(editorElement.value, {
      value: cuContent.value,
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
        const res = await emits('uploadImage', blob);
        if (!res) return;
        editor.executeEdits('pasteImage', [{
          range: selection,
          text: `![](${res})`,
        }]);
      }
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        save(editor);
      }
    );
    editor.getModel()?.onDidChangeContent(() => {
      save(editor);
    });
  });
}, { immediate: true });

watch(
  () => cuContent.value, 
  async () => {
    renderedContent.value = await marked(cuContent.value);
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-if="!edit"
    class="md-view"
    v-dompurify-html="renderedContent"
  ></div>
  <div
    v-else-if="edit"
    ref="editorElement"
    class="md-view-edit"
  >
  </div>
</template>

<style scoped>
.md-view,
.md-view-edit {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: .3em;
  word-wrap: break-word;
}

.md-view-edit {
  height: 40vh;
}
</style>

<style>
/* 
for markdown bio 
*/

.md-view > * {
  box-sizing: border-box;
  flex-grow: 1;
  flex-basis: 0;
  width: 100%;
}

.md-view table {
  border-collapse: collapse;
}

.md-view table td, 
.md-view table th {
  border: 2px solid var(--color-border);
  padding: .2em 1em;
}

.md-view table th {
  background: var(--color-background-soft);
  font-weight: bold;
}

.md-view a {
  color: var(--color-highlight);
}

.md-view .md-img {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .5em;
}

.md-view .md-img img {
  max-width: 100%;
  max-height: 50vh;
}

.md-view blockquote,
.md-view .md-alert {
  border-left: 5px solid var(--color-border);
  margin-left: 0;
  background-color: var(--color-background-soft);
  padding: .5em;
  padding-left: 1em;
}

.md-view .md-alert .md-alert-title {
  font-weight: bold;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .3em;
  padding: .5em 0;
}

.md-view .md-alert .md-alert-title {
  font-size: 1.05em;
}

.md-view .md-alert-note {
  border-color: var(--color-note);
}

.md-view .md-alert-note .md-alert-title {
  color: var(--color-note);
}

.md-view .md-alert-tip {
  border-color: var(--color-tip);
}

.md-view .md-alert-tip .md-alert-title {
  color: var(--color-tip);
}

.md-view .md-alert-important {
  border-color: var(--color-important);
}

.md-view .md-alert-important .md-alert-title {
  color: var(--color-important);
}

.md-view .md-alert-warning {
  border-color: var(--color-warning);
}

.md-view .md-alert-warning .md-alert-title {
  color: var(--color-warning);
}

.md-view .md-alert-caution {
  border-color: var(--color-caution);
}

.md-view .md-alert-caution .md-alert-title {
  color: var(--color-caution);
}

/*
for bio editor
*/
.md-view .cm-editor {
  word-wrap: break-word;
}
</style>
