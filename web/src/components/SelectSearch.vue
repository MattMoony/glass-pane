<script setup lang="ts">
import type { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
  qry?: string,
  result?: {
    id: string,
    firstname: string,
    lastname: string,
    type: string,
  }
}>()

const container = ref(null)
const input = ref(null)
const text = ref(props.qry || '')
const results = ref([])
const cuResult  = ref(props.result)
const hideRes = ref(true)
const resShown = computed(() => !hideRes.value && results.value.length > 0)

var timeout = null
const search = t => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    if(t.trim().length <= 3) {
      results.value = [];
      return
    }

    fetch(`http://localhost:8888/api/search?q=${t}`)
      .then(r => r.json())
      .then(r => {
        if (!r.success) {
          results.value = [];
          return
        }
        results.value = r.people.map(p => ({ ...p, type: 'person', }));
      })
  }, 500)
}

const startSearch = () => {
  input.value.focus();
  cuResult.value = null;
}

const doSearch = () => {
  hideRes.value = true
  text.value = ''
  results.value = []
}

onClickOutside(container, () => {
  hideRes.value = true
})

</script>

<template>
  <div 
    tabindex="-1"
    class="search-container"
    ref="container"
  >
    <div class="bar" @click.stop="startSearch()">
      <div v-if="cuResult" :class="['result', cuResult ? cuResult.type : '', ]">
        <font-awesome-icon icon="fa-solid fa-user" />
        {{ (cuResult ? cuResult.firstname : '') + " " + (cuResult ? cuResult.lastname : '') }}
      </div>
      <input 
        v-model="text"
        @keyup="search(text)"
        ref="input"
        type="text"
        placeholder="Search..."
        @focus="hideRes = false"
      />
    </div>
    <div class="results" v-if="resShown">
      <div v-for="r in results" :key="r.id" @click.stop="doSearch()">
        <div :class="['result', r.type, ]" @click="cuResult = r; $emit('select', r)">
          <font-awesome-icon icon="fa-solid fa-user" />
          {{ r.firstname + " " + r.lastname }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  width: 100%;
  user-select: none;
}

.bar {
  width: 100%;
  height: 3rem;
  background-color: var(--color-background-soft);
  border: 1.5px solid var(--color-border);
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  position: relative;
  padding: 0.5rem;
  box-sizing: border-box;
}

.bar > .result {
  margin-right: 0.5rem;
}

input {
  height: 100%;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  outline: none;
  color: var(--color-text);
}

.results {
  width: 100%;
  background-color: var(--color-background-soft);
  border: 1.5px solid var(--color-border);
  border-top: none;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  max-height: 30vh;
  overflow-y: auto;
  padding: 0.5rem;
  box-sizing: border-box;
  position: absolute;
  top: 3rem;
  z-index: 99;
}

.results::-webkit-scrollbar {
  width: 0.5rem;
}

.results::-webkit-scrollbar-track {
  background-color: var(--color-background-soft);
}

.results::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 0.5rem;
}

.results::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-hover);
}

.results::-webkit-scrollbar-corner {
  background-color: var(--color-background-soft);
}

.results::-webkit-scrollbar-button {
  display: none;
}

.results a {
  text-decoration: none;
  color: var(--color-text);
}

.result {
  background-color: var(--color-background-mute);
  padding: 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.results .result {
  margin: 0.2rem 0;
  transition: 0.2s ease;
}

.results .result:hover {
  opacity: 0.6;
  cursor: pointer;
}

.result svg {
  margin-right: 0.5rem;
}

.result.person {
  background-color: #237AFF;
}
</style>