<script setup lang="ts">
import anime from 'animejs';
import { onMounted } from 'vue';

const props = defineProps<{
  /**
   * The stats to display.
   */
  stats: ('people'|'organizations'|'relations'|'memberships')[];
}>();

const statValues = {
  people: 71,
  organizations: 83,
  relations: 53,
  memberships: 101,
};

onMounted(() => {
  anime({
    targets: '.stats > div',
    translateY: [-50, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
  });
});
</script>

<template>
  <div class="stats">
    <div v-for="stat in stats" :key="stat">
      <h2>{{ statValues[stat] }}</h2>
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
