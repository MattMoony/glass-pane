<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

import Organ from '../models/Organ';
import Person from '../models/Person';
import Organization from '../models/Organization';

import PersonBanner from './PersonBanner.vue';
import OrganizationBanner from './OrganizationBanner.vue';

enum SearchType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
}

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * The result to display in the search bar.
   */
  initResult?: Organ;
  /**
   * The type of search results to display.
   */
  type?: string;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a search result is selected.
   */
  (e: 'select', result: Organ): void;
}>();

const SEARCH_TIMEOUT: number = 500;
const QUERY_MINLEN: number = 3;
const container: Ref<HTMLElement|null> = ref(null);
const searchInput: Ref<HTMLInputElement|null> = ref(null);
const query: Ref<string> = ref(props.qry || '');
const suggestions: Ref<Organ[]> = ref([]);
const open: Ref<boolean> = ref(false);
const timeout: Ref<number|undefined> = ref(undefined);

const selectAndClose = (organ: Organ) => {
  open.value = false;
  suggestions.value = [];
  query.value = '';
  emits('select', organ);
};

watch(query, async () => {
  if (query.value.trim().length < QUERY_MINLEN) return;
  window.clearTimeout(timeout.value);
  timeout.value = window.setTimeout(async () => {
    const people = !props.type || !Object.values(SearchType).includes(props.type as SearchType) || props.type === SearchType.PERSON ? await Person.search(query.value.trim()) : [];
    const orgs = !props.type || !Object.values(SearchType).includes(props.type as SearchType) || props.type === SearchType.ORGANIZATION ? await Organization.search(query.value.trim()) : [];
    suggestions.value = (people as Organ[]).concat(orgs);
    open.value = true;
  }, SEARCH_TIMEOUT);
}, { immediate: true });

onClickOutside(container, () => {
  open.value = false;
});
</script>

<template>
  <div
    tabindex="-1"
    class="search"
    ref="container"
    @click="searchInput?.focus()"
  >
    <div 
      :class="['bar', open && suggestions.length ? 'open' : '',]"
    >
      <div
        v-if="props.initResult"
        :class="[
          'init-result', 
          props.initResult instanceof Person ? 'person' : '',
          props.initResult instanceof Organization ? 'organization' : '',
        ]"
      >
        {{ 
          initResult instanceof Person 
          ? initResult.firstname + ' ' + initResult.lastname
          : initResult instanceof Organization
          ? initResult.name
          : ''
        }}
      </div>
      <input 
        ref="searchInput"
        type="text"
        v-model="query"
        placeholder="Search for anything! (e.g. Max Mustermann, Muster GmbH)"
        @focus="open = true"
      />
    </div>
    <div 
      v-if="open && suggestions.length"
      class="suggestions gp-scroll"
    >
    <div
      v-for="s in suggestions"
      :key="s.id"
      :class="[
        'suggestion',
        s instanceof Person ? 'person' : '',
        s instanceof Organization ? 'organization' : '',
      ]"
      @click="selectAndClose(s)"
    >
      <span class="suggestion-type">
        {{ s instanceof Person ? 'Person' : 'Organization' }}
      </span>
      <PersonBanner
        v-if="(s instanceof Person)"
        :person="s"
        extra-small
      />
      <OrganizationBanner
        v-if="(s instanceof Organization)"
        :organization="s"
        extra-small
      />
    </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  width: 100%;
  user-select: none;
}

.init-result {
  font-size: .8em;
  padding: 0.5em;
  border-radius: 4px;
  text-decoration: underline;
}

.init-result.person {
  background-color: var(--color-person);
}

.init-result.organization {
  background-color: var(--color-organization);
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
