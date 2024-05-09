<script setup lang="ts">
import Organ from '../models/Organ';

import SearchBarNew from './SearchBarNew.vue';

const props = defineProps<{
  /**
   * The query string to display in the search bar.
   */
  qry?: string;
  /**
   * The result to display in the search bar.
   */
  result?: Organ;
}>();
</script>

<template>
  <nav>
    <RouterLink to="/">
      <img class="logo" src="/pane.png" alt="Glass Pane Logo" />
    </RouterLink>
    <form>
      <SearchBarNew
        :qry="props.qry"
        :result="props.result"
      />
    </form>
    <div class="social">
      <a href="//github.com/MattMoony/glass-pane">
        <font-awesome-icon icon="fa-brands fa-github" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: start;
  align-items: stretch;
  background-color: var(--color-background);
  border-bottom: 4px solid var(--color-border);
  padding: 1em;
  height: 4rem;
}

.logo {
  height: 100%;
  margin-right: 1em;
}

form {
  flex: 1;
  display: flex;
  justify-content: start;
  align-items: center;
}

.social {
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 2px solid var(--color-border);
  padding-left: 1em;
  margin-left: 1em;
}

.social a {
  font-size: 2em;
  color: var(--color-text);
  text-decoration: none;
}
</style>