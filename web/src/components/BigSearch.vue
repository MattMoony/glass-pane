<script setup lang="ts">
import { onMounted, ref } from 'vue';
import anime from 'animejs';

import { useUserStore } from '@/stores/user';

import SearchBar from '@/components/SearchBar.vue';

const user = useUserStore();
const heading = ref<HTMLHeadingElement>();
const welcome = ref<HTMLParagraphElement>();

onMounted(() => {
  anime({
    targets: [heading.value, welcome.value,],
    translateX: [-50, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
  });
});
</script>

<template>
  <h1 ref="heading">
    Gl<img class="logo" src="/pane.png" alt="pane" />ss
    P<img class="logo" src="/pane.png" alt="pane" />ne
  </h1>
  <p ref="welcome" class="welcome">
    What are you looking for
    <template v-if="user.user">
      <span class="username">{{ user.user.username }}</span>
    </template>
    ...?
  </p>
  <div class="bar-container">
    <SearchBar />
  </div>
</template>

<style scoped>
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
</style>
