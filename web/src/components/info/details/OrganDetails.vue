<script setup lang="ts">
import { useSlots, watch } from 'vue';

import Organ from '@/models/Organ';

import OrganBio from '@/components/info/details/OrganBio.vue';
import OrganMemberships from '@/components/info/details/OrganMemberships.vue';

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
    <div>
      <h2>Biography</h2>
      <OrganBio 
        #bio 
        :organ="organ"
        :edit="edit"
      />
    </div>
    <div>
      <h2>Memberships</h2>
      <OrganMemberships
        #memberships
        :organ="organ"
        :edit="edit"
      />
    </div>
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

h2 {
  background-color: var(--color-background-soft);
  padding: .5em;
  border: 2px solid var(--color-border);
  border-radius: 5px 5px 0 0;
}

h2 + div {
  padding: 1em;
  border: 2px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 5px 5px;
}
</style>
