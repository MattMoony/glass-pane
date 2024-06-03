<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <NavBar>
    <div class="nav-links">
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
  background-color: var(--color-background-mute);
  padding: .5rem 1rem;
  border-radius: .5rem;
}
</style>
