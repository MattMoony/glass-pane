<script setup lang="ts">
import SearchBarNew from '@/components/SearchBarNew.vue';
</script>

<template>
  <div class="container">
    <h1>
      Gl<img class="logo" src="/pane.png" alt="pane" />ss
      P<img class="logo" src="/pane.png" alt="pane" />ne
    </h1>
    <div class="bar-container">
      <SearchBarNew />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

h1 {
  user-select: none;
  font-family: 'Comfortaa', sans-serif;
  font-size: 3rem;
}

.logo {
  height: 3rem;
}

.bar-container {
  width: 80vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>