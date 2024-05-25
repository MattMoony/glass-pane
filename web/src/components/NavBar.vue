<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const user = useUserStore();
</script>

<template>
  <nav>
    <RouterLink class="logo-wrap" to="/">
      <img class="logo" src="/pane.png" alt="Glass Pane Logo" />
    </RouterLink>
    <div class="custom-content">
      <slot></slot>
    </div>
    <div class="social">
      <div v-if="user.user" class="user">
        {{ user.user.username }}
      </div>
      <RouterLink v-else to="/login">
        <div class="user">
          <font-awesome-icon icon="fa-solid fa-sign-in-alt" />
          Login
        </div>
      </RouterLink>
      <a class="github" href="//github.com/MattMoony/glass-pane">
        <font-awesome-icon icon="fa-brands fa-github" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: var(--color-background);
  border-bottom: 4px solid var(--color-border);
  gap: 1em;
  padding: .5em 1em;
}

.logo-wrap {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 100%;
  max-height: 2.5em;
}

.custom-content {
  flex: 1;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.social {
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 2px solid var(--color-border);
  padding-left: 1em;
  margin-left: 1em;
}

.social .user {
  font-size: 1em;
  background-color: var(--color-background-mute);
  border-radius: 0.5em;
  padding: 0.25em 0.5em;
  margin-right: 1em;
  user-select: none;
}

.social a {
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
}

.social .github {
  font-size: 2em;
}

@media only screen and (max-width: 600px) {
  nav {
    height: 6rem;
    align-items: center;
  }

  .logo {
    max-height: 3rem;
  }
}
</style>