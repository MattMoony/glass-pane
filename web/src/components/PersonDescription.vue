<script setup lang="ts">
defineProps<{
  person: {
    uid: string
    name: string
  }
}>()
</script>

<template>
  <div class="banner">
    <div class="facts">
      <h1>{{ $props.person?.name }}</h1>
      <p>Some short description / introduction, idk</p>
    </div>
    <img src="/john-doe.png" alt="Person's face." />
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  justify-content: stretch;
  align-items: center;
  border-bottom: 2px solid var(--color-border);
  padding: 1.5em;
}

.banner img {
  height: 12em;
}

.banner .facts {
  flex: 1;
}

h1 {
  font-size: 2em;
}

img {
  margin-left: 1em;
}
</style>