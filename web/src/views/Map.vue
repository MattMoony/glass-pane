<script setup lang="ts">
import RoutesNavBar from '@/components/RoutesNavBar.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import ComingSoon from '@/components/ComingSoon.vue';

</script>

<template>
  <main>
    <RoutesNavBar />
    <article>
      <BaseMap 
        @change="bounds => console.log(bounds)"
      />
    </article>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  flex-direction: column;
}

article {
  flex-basis: 0;
  flex-grow: 1;
}
</style>
