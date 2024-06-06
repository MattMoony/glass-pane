<script setup lang="ts">
import { type Ref, ref, watch, type VNodeRef, nextTick } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { API } from '@/api';
import * as api from '@/api/media';
import Organ from '@/models/Organ';

import MarkdownView from '@/components/MarkdownView.vue';

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

const saveBio = async (content: string) => {
  if (!props.organ) return;
  emits('startSaving');
  props.organ.bio = content;
  await props.organ.update();
  emits('endSaving');
};

const uploadImage = async (img: Blob): Promise<string|null> => {
  const res = await api.upload(img);
  return `${API}${res.url}`;
};
</script>

<template>
  <MarkdownView
    v-if="organ"
    :edit="edit"
    :content="organ.bio"
    @save="saveBio"
    @upload-image="uploadImage"
  />
</template>

<style scoped>
</style>
