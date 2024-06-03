<script setup lang="ts">

const RANGE_MIN = 0;
const RANGE_MAX = 9;
const RAND_IMG = Math.floor(Math.random() * (RANGE_MAX - RANGE_MIN + 1)) + RANGE_MIN;

</script>

<template>
  <img 
    :src="`/404/${RAND_IMG}.gif`"
    alt="Just bullshit, you're not missing out on much here."
  />
</template>

<style scoped>
img {
  max-width: 100%;
  width: 100%;
  max-height: 100%;
}
</style>
