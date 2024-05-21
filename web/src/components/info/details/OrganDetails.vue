<script setup lang="ts">
import { useSlots, watch } from 'vue';

import Organ from '@/models/Organ';

import OrganBio from '@/components/info/details/OrganBio.vue';

const props = defineProps<{
  /**
   * The organ to display.
   */
  organ: Organ|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const slots = useSlots();
</script>

<template>
  <section v-if="organ" :class="[edit ? 'edit' : '']">
    <OrganBio 
      #bio 
      :organ="organ"
    />
    <slot 
      v-for="(_, name) in slots" 
      :name="name"
    />
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}
</style>
