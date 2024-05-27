<script setup lang="ts">
// @ts-ignore
import anime from 'animejs/lib/anime.es.js';
import { nextTick, onMounted, ref } from 'vue';

import * as api from '@/api';

const props = defineProps<{
  /**
   * The stats to display.
   */
  stats: ('people'|'organizations'|'relations'|'memberships')[];
}>();

const statsValues = ref<{ [stat: string]: number }>({});

onMounted(async () => {
  const res = await api.stats();
  if (!res.success) return;
  statsValues.value = res.stats!;
  nextTick(() => {
    anime({
      targets: '.stats > div',
      translateY: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
    });
  });
});
</script>

<template>
  <div class="stats">
    <div 
      v-for="stat of Object.keys(statsValues)" 
      :key="stat"
    >
      <h2>{{ statsValues[stat] }}</h2>
      <p>{{ stat[0].toUpperCase() + stat.slice(1) }}</p>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1em;
  flex-wrap: wrap;
}

.stats > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  background-color: var(--color-background-soft);
  padding: 1em;
  border-radius: 0.5em;
}
</style>
