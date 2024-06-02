<script setup lang="ts">
import { ref } from 'vue';

import FullScreenModal from '@/components/FullScreenModal.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import CollapseableSection from '@/components/CollapseableSection.vue';

const show = ref(false);
</script>

<template>
  <button
    @click="show = true"
  >
    <font-awesome-icon icon="map-marker-alt" />
  </button>
  <FullScreenModal
    :show="show"
    @close="show = false"
  >
    <h2>Pick a location</h2>
    <CollapseableSection
      title="New location"
    >
      <div class="map-wrapper">      
        <BaseMap />
      </div>
    </CollapseableSection>
  </FullScreenModal>
</template>

<style scoped>
button {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.5em;
  padding: 0.5em;
}

.map-wrapper {
  width: 80vw;
  height: 40vh;
}
</style>
