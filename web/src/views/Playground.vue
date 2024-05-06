<script setup lang="ts">
import Organ from '../models/Organ';

(async () => {
  const o = await Organ.get(6);
  const sources = await o?.sources.get();

  console.log(o);
  console.table(sources);
})();
</script>

<template>
  <div class="about">
    <h1>Playground</h1>
  </div>
</template>

<style scoped>
.about {
  padding: 1em;
}
</style>
