<script setup lang="ts">
</script>

<template>
  <div>
    <h1>Coming Soon</h1>
    <p>This is a work-in-progress... stay tuned</p>
  </div>
</template>

<style scoped>
div {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

h1 {
  color: var(--color-text);
  font-size: 3rem;
}
</style>
