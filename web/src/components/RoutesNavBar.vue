<script setup lang="ts">
import { useUserStore } from '@/stores/user';

import NavBar from '@/components/NavBar.vue';

const user = useUserStore();
</script>

<template>
  <NavBar>
    <div class="nav-links">
      <RouterLink to="/dashboard" v-if="user.user">
        <font-awesome-icon :icon="['fas', 'home']" />
        Dashboard
      </RouterLink>
      <RouterLink to="/map">
        <font-awesome-icon :icon="['fas', 'map-location']" />
        Map
      </RouterLink>
      <RouterLink to="/events">
        <font-awesome-icon :icon="['fas', 'timeline']" />
        Events
      </RouterLink>
    </div>
  </NavBar>
</template>

<style scoped>
.nav-links {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .5rem;
  border-left: 2px solid var(--color-border);
  padding-left: 1rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 2px solid var(--color-border);
  padding: .2rem .5rem;
}
</style>
