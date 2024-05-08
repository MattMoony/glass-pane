<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import Organ from '../models/Organ';
import Person from '../models/Person';
import Organization from '../models/Organization';

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * The result to display in the search bar.
   */
  initResult?: Organ;
}>()

const SEARCH_TIMEOUT: number = 500;
const QUERY_MINLEN: number = 3;
const result: Ref<Organ|undefined> = ref(props.initResult);
const query: Ref<string> = ref(props.qry || '');
const suggestions: Ref<Organ[]> = ref([]);
const timeout: Ref<number|undefined> = ref(undefined);

watch(query, async () => {
  if (query.value.trim().length < QUERY_MINLEN) return;
  window.clearTimeout(timeout.value);
  timeout.value = window.setTimeout(async () => {
    const people = await Person.search(query.value.trim());
    const orgs = await Organization.search(query.value.trim());
    suggestions.value = (people as Organ[]).concat(orgs);
    console.log(suggestions.value);
  }, SEARCH_TIMEOUT);
}, { immediate: true });
</script>

<template>
  <div
    tabindex="-1"
    class="search"
  >
    <div class="bar">
      <div
        class="result"
      >
      </div>
      <input 
        type="text"
        v-model="query"
      />
    </div>
    <div class="results">

    </div>
  </div>
</template>

<style scoped>
.search {
  width: 100%;
  user-select: none;
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

.bar > .result {
  margin-right: 0.5em;
}

input {
  flex: 1;
  border: none;
  background-color: transparent;
  font-size: 1.1em;
  outline: none;
  color: var(--color-text);
}
</style>
