<script setup lang="ts">
import RoutesNavBar from '@/components/RoutesNavBar.vue';
import RandomMeme from '@/components/RandomMeme.vue';
</script>

<template>
  <main>
    <RoutesNavBar />
    <article>
      <font-awesome-icon icon="flushed" class="embarrassed" />
      <h1>Sorry, not found...</h1>
      <p>
        This is kind of embarrassing, let's just hope that nothing broke.<br/>
        Here, a GIF to distract you in case something actually broke.
      </p>
      <hr />
      <div class="meme">
        <RandomMeme />
      </div>
    </article>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
}

article {
  flex-basis: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  box-sizing: border-box;
  padding: 2rem;
}

.embarrassed {
  font-size: 2rem;
  color: var(--color-text);
}

h1, p {
  text-align: center;
}

hr {
  width: 100%;
  background-color: var(--color-border);
  border: 0;
  height: 2px;
}

.meme {
  width: 80vw;
  max-height: 50vh;
}
</style>
