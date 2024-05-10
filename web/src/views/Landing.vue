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
    <div class="tools">
      <router-link to="/p">
        <button>
          <font-awesome-icon :icon="['fas', 'plus']" />
          New Person
        </button>
      </router-link>
      <router-link to="/o">
        <button>
          <font-awesome-icon :icon="['fas', 'plus']" />
          New Organization
        </button>
      </router-link>
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

.tools {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
}

.tools a {
  text-decoration: none;
  color: var(--color-text);
}

.tools button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  background-color: var(--color-background-mute);
  color: var(--color-text);
}
</style>