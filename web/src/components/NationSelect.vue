<script setup lang="ts">
import { type Ref, ref, type ShallowRef } from 'vue';

import Nation from '@/models/Nation';

import Select from './Select.vue';
import { shallowRef } from 'vue';

const props = defineProps<{
  /**
   * The nation to display in the select.
   */
  initNation?: Nation;
  /**
   * Don't display inline.
   */
  notInline?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a nation is selected.
   */
  (e: 'select', nation: Nation): void;
}>();

const qry: Ref<string> = ref('');
const selectedNation: ShallowRef<Nation|null> = shallowRef(props.initNation || null);
const suggestions: Ref<Nation[]> = ref([]);

const queryNations = async (query: string, cb: (hasSuggestions: boolean) => void): Promise<void> => {
  if (!query.trim()) cb(false);
  suggestions.value = await Nation.search(query);
  qry.value = query.trim();
  cb(true);
};

const createNation = async () => {
};
</script>

<template>
  <Select
    placeholder="Nation ..."
    :initResultPlain="selectedNation ? selectedNation.name : ''"
    stretchedResult
    :inline="!notInline"
    @query="queryNations"
  >
    <template #initResult>
      <span v-if="selectedNation">{{ selectedNation.name }}</span>
    </template>
    <template #suggestions>
      <section v-if="suggestions.length">
        <div
          v-for="nation in suggestions" 
          :key="nation.id"
          class="nation-suggestion"
          @click="() => { selectedNation = nation; emits('select', nation); }"
        >
          {{ nation.name }}
        </div>
      </section>
    </template>
  </Select>
</template>

<style scoped>

.nation-suggestion {
  padding: 0.5em;
  cursor: pointer;
}

button {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-text);
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 1em;
}
</style>
