<script setup lang="ts">
import Organ from '../models/Organ';

import SearchBar from '@/components/SearchBar.vue';
import NavBar from '@/components/NavBar.vue';

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * The result to display in the search bar.
   */
  result?: Organ;
}>();
</script>

<template>
  <NavBar>
    <form>
      <SearchBar
        :qry="props.qry"
        :result="props.result"
      />
    </form>
  </NavBar>
</template>

<style scoped>
form {
  flex: 1;
  display: flex;
  justify-content: start;
  align-items: center;
}
</style>
