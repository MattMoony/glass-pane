<script setup lang="ts">
import { type Ref, ref } from 'vue';

const props = defineProps<{
  /**
   * The label to display in the select.
   */
  label?: string;
  /**
   * The model to display in the select.
   */
  initModel?: Object|null;
  /**
   * The search function.
   */
  search: (query: string) => Promise<Object[]>;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a role is selected.
   */
  (e: 'select', object: Object|null): void;
}>();

const loading: Ref<boolean> = ref(false);
const selectedObject: Ref<Object|null> = ref(props.initModel || null);
const suggestions: Ref<Object[]> = ref([]);

const doQuery = async (query: string): Promise<void> => {
  loading.value = true;
  if (!query.trim()) return;
  suggestions.value = await props.search(query);
  loading.value = false;
};
</script>

<template>
  <v-autocomplete
    v-model="selectedObject"
    item-title="name"
    :items="suggestions"
    chips
    :loading="loading"
    return-object
    :label="label || 'Select'"
    clearable
    clear-icon="fas fa-times"
    @update:search="doQuery"
    @update:model-value="() => {
      if (!selectedObject) return;
      $emit('select', selectedObject)
    }"
    @click:clear="() => $emit('select', null)"
  />
</template>

<style scoped>
</style>
