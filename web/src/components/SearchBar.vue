<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  qry?: string
}>()

const input = ref(null)
const text = ref(props.qry || '')
var timeout = null
const search = t => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    if(!t.trim()) return
    console.log(t)
  }, 500)
}

</script>

<template>
  <div class="bar" @click.stop="input.focus()">
    <input v-model="text" @keyup="search(text)" ref="input" type="text" placeholder="Search..." />
  </div>
</template>

<style scoped>
.bar {
  width: 100%;
  height: 3rem;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  border-radius: 0.5rem;
}

input {
  height: 100%;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0 1rem;
  outline: none;
  color: var(--color-text);
}
</style>