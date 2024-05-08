<script setup lang="ts">
import Organ from '../models/Organ';

import SelectSearchNew from './SelectSearchNew.vue';

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * The result to display in the search bar.
   */
  result?: Organ;
}>()

</script>

<template>
  <SelectSearchNew
    :qry="props.qry"
    :init-result="props.result"
  />
</template>

<style scoped>

</style>
