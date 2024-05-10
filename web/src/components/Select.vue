<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * Minimum query length.
   */
  minlen?: number;
  /**
   * How long to wait before querying.
   */
  timeout?: number;
  /**
   * A placeholder for the search bar.
   */
  placeholder?: string;
  /**
   * Whether to display inline.
   */
  inline?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted, when a new query is entered.
   */
  (e: 'query', query: string, cb: (hasSuggestions: boolean) => void): void;
}>();

const container: Ref<HTMLElement|null> = ref(null);
const searchInput: Ref<HTMLInputElement|null> = ref(null);
const query: Ref<string> = ref(props.qry || '');
const open: Ref<boolean> = ref(false);
const timeout: Ref<number|undefined> = ref(undefined);
const hasSuggestions: Ref<boolean> = ref(false);

watch(query, async () => {
  if (query.value.trim().length < (props.minlen||3)) return;
  window.clearTimeout(timeout.value);
  timeout.value = window.setTimeout(async () => {
    emits('query', query.value.trim(), (_sug: boolean) => {
      hasSuggestions.value = _sug;
      open.value = hasSuggestions.value;
    });
  }, props.timeout||500);
}, { immediate: true });

onClickOutside(container, () => {
  open.value = false;
});
</script>

<template>
  <div
    tabindex="-1"
    :class="['search', inline ? 'inline' : '',]"
    ref="container"
    @click="searchInput?.focus()"
  >
    <div 
      :class="['bar', open && hasSuggestions ? 'open' : '',]"
    >
      <div class="init-result">
        <slot 
          name="initResult" 
        ></slot>
      </div>
      <input 
        ref="searchInput"
        type="text"
        v-model="query"
        :placeholder="placeholder||'Search for anything! (e.g. Max Mustermann, Muster GmbH)'"
        @focus="open = true"
      />
    </div>
    <div 
      v-if="open && hasSuggestions"
      class="suggestions gp-scroll"
    >
      <slot name="suggestions"></slot>
    </div>
  </div>
</template>

<style scoped>
.search {
  user-select: none;
  width: 100%;
}

.search.inline {
  display: inline-block;
  width: auto;
}

.init-result {
  font-size: .8em;
  padding: 0.5em;
  border-radius: 4px;
  text-decoration: underline;
  background-color: var(--color-background-soft);
}

.bar {
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.5em;
}

.bar.open {
  border-radius: 4px 4px 0 0;
  border-bottom: none;
}

.bar > .init-result {
  margin-right: 0.5em;
}

.bar input {
  flex: 1;
  border: none;
  background-color: transparent;
  font-size: 1.1em;
  outline: none;
  color: var(--color-text);
}

.bar input::placeholder {
  font-size: .9em;
}

.suggestions {
  position: absolute;
  top: 100%;
  z-index: 99;
  width: 100%;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0 0 4px 4px;
  max-height: 30vh;
  overflow-y: auto;
}

.suggestion {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: 1em;
  padding: 0 1em;
  background-color: var(--color-background-soft);
  cursor: pointer;
}

.suggestion .suggestion-type {
  font-size: 0.8em;
  color: var(--color-text-soft);
  background-color: var(--color-background);
  padding: .5em;
  border-radius: 4px;
}

.suggestion.person .suggestion-type {
  background-color: var(--color-person);
}

.suggestion.organization .suggestion-type {
  background-color: var(--color-organization);
}
</style>
