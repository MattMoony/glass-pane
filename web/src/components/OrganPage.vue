<script setup lang="ts">

import Organ from '../models/Organ';

import NavBarNew from './NavBarNew.vue';

const props = defineProps<{
  /**
   * The organ to display.
   */
  organ: Organ|null;
}>();

</script>

<template>
  <main>
    <NavBarNew 
      :result="organ ? organ : undefined"
    />
    <article>
      <div class="controls">
      </div>
      <section class="slots">
        <div class="left-slot">
          <slot name="left"></slot>
        </div>
        <div class="right-slot">
          <slot name="right"></slot>
        </div>
      </section>
    </article>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

article {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.slots {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.slots .left-slot {
  flex-grow: 1;
  flex-basis: 0;
  box-sizing: border-box;
  padding: 2em;
  max-width: 60vw;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  gap: 1em;
}

.slots .right-slot {
  flex-grow: 1;
  flex-basis: 0;
  overflow: hidden;
  border-left: 2px solid var(--color-border);
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}
</style>