<script setup lang="ts">
import { type Ref, ref, type ShallowRef } from 'vue';

import Nation from '@/models/Nation';

import Autocomplete from '@/components/Autocomplete.vue';

const props = defineProps<{
  /**
   * The label to display in the select.
   */
  label?: string;
  /**
   * The nation to display in the select.
   */
  initNation?: Nation;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a nation is selected.
   */
  (e: 'select', nation: Nation|null): void;
}>();

const queryNations = async (query: string): Promise<Nation[]> => {
  if (!query.trim()) return [];
  return Nation.search(query);
};

const createNation = async () => {
};
</script>

<template>
  <Autocomplete
    :label="label || 'Nation'"
    :init-model="initNation"
    :search="queryNations"
    @select="o => emits('select', o as Nation)"
  />
</template>

<style scoped>
</style>
