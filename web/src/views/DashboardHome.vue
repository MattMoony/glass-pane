<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const user = useUserStore();

</script>

<template>
  <h1>Dashboard Home</h1>
  <p>Welcome to the Glass Pane dashboard, <span class="user">{{ user.user?.username }}</span>!</p>
  <p>Use the navigation bar to get started.</p>
</template>

<style scoped>
.user {
  font-weight: bold;
  background-color: var(--color-background-soft);
  padding: .1em .3em;
  border-radius: .3em;
}
</style>
