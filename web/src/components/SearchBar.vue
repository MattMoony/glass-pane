<script setup lang="ts">
import { useRouter, type Router } from 'vue-router';

import Organ from '../models/Organ';
import Person from '../models/Person';
import Organization from '../models/Organization';

import SelectSearch from '@/components/SelectSearch.vue';

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

const router: Router = useRouter();

const onSelect = (organ: Organ) => {
  if (organ instanceof Person)
    router.push(`/p/${organ.id}`);
  if (organ instanceof Organization)
    router.push(`/o/${organ.id}`);
};
</script>

<template>
  <SelectSearch
    :qry="props.qry"
    :init-result="props.result"
    @select="onSelect"
  />
</template>

<style scoped>

</style>
