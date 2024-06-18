<script setup lang="ts">
import { ref } from 'vue';

import FullScreenModal from '@/components/FullScreenModal.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import CollapseableSection from '@/components/CollapseableSection.vue';

const emits = defineEmits<{
  /**
   * Emitted when the user picks a location.
   */
  ( e: 'picked', location: Location): void;
}>();

const show = ref(false);
</script>

<template>
  <v-btn
    icon="fas fa-map-marker-alt"
    variant="tonal"
    size="small"
    @click="show = true"
  >
  </v-btn>
  <FullScreenModal
    :show="show"
    @close="show = false"
  >
    <h2>Pick a location</h2>
    <div class="map-wrapper">      
      <BaseMap />
    </div>
  </FullScreenModal>
</template>

<style scoped>
.map-wrapper {
  width: 80vw;
  height: 60vh;
}
</style>
