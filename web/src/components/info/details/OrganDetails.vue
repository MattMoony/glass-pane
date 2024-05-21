<script setup lang="ts">
import { ref, useSlots, watch } from 'vue';

import Organ from '@/models/Organ';

import OrganBio from '@/components/info/details/OrganBio.vue';
import OrganMemberships from '@/components/info/details/OrganMemberships.vue';
import OrganSources from '@/components/info/details/OrganSources.vue';
import OrganSocials from '@/components/info/details/OrganSocials.vue'

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
const bioSaving = ref(false);

</script>

<template>
  <section v-if="organ" :class="[edit ? 'edit' : '']">
    <div>
      <h2>
        Biography
        <span class="bio-saving" v-if="bioSaving">
          saving...
        </span>
      </h2>
      <OrganBio 
        #bio 
        :organ="organ"
        :edit="edit"
        @start-saving="bioSaving = true"
        @end-saving="bioSaving = false"
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
    <div>
      <h2>Sources</h2>
      <OrganSources
        #sources
        :organ="organ"
        :edit="edit"
      />
    </div>
    <div>
      <h2>Socials</h2>
      <OrganSocials
        #socials
        :organ="organ"
        :edit="edit"
      />
    </div>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 > span {
  font-weight: normal;
  font-size: .7em;
  font-style: italic;
  background-color: var(--color-background-mute);
  padding: .2em .5em;
  border-radius: 5px;
}

h2 + div {
  padding: 1em;
  border: 2px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 5px 5px;
}
</style>
