<script setup lang="ts">
import { useUserStore } from '@/stores/user';

import SearchBarNew from '@/components/SearchBarNew.vue';

const user = useUserStore();
</script>

<template>
  <div class="container">
    <h1>
      Gl<img class="logo" src="/pane.png" alt="pane" />ss
      P<img class="logo" src="/pane.png" alt="pane" />ne
    </h1>
    <p v-if="user.user" class="welcome">
      What are you looking for, <span class="username">{{ user.user.username }}</span>?
    </p>
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

.welcome {
  font-size: 1rem;
  margin-bottom: 1em;
  font-style: italic;
}

.welcome .username {
  background-color: var(--color-background-mute);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  margin: 0 0.25rem;
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