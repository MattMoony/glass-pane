<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import Organ from '@/models/Organ';
import { useUserStore } from '@/stores/user';

import NavBar from '@/components/NavBar.vue';

const props = defineProps<{
  /**
   * The organ to display.
   */
  organ: Organ|null;
  /**
   * Whether to launch in edit mode.
   */
  edit?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when the user wants to edit the organ.
   */
  (e: 'edit', status: boolean): void;
}>();

const editing: Ref<boolean> = ref(Boolean(props.edit));
const user = useUserStore();

watch(() => props.edit, (newEdit: boolean) => {
  editing.value = newEdit;
}, { immediate: true });
</script>

<template>
  <main>
    <NavBar 
      :result="organ ? organ : undefined"
    />
    <article>
      <div class="controls" v-if="user.user">
        <button title="Edit" @click="() => { editing = !editing; $emit('edit', editing); }">
          <template v-if="!editing">
            <font-awesome-icon icon="edit" />
            Edit
          </template>
          <template v-else>
            <font-awesome-icon icon="times" />
            Done
          </template>
        </button>
      </div>
      <section class="slots gp-scroll">
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

.controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: .5em;
  gap: 1em;
  border-bottom: 4px solid var(--color-border);
}

.controls button {
  padding: .2em;
  border-radius: 50%;
  font-size: 1em;
  background-color: transparent;
  color: var(--color-text);
  border: none;
  cursor: pointer;
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

@media only screen and (max-width: 800px) {
  main {
    min-height: 100vh;
  }

  .slots {
    flex-direction: column-reverse;
  }

  .slots .left-slot {
    padding: 1em;
    flex-basis: auto;
    max-width: 100vw;
  }

  .slots .right-slot {
    border-left: none;
    border-bottom: 2px solid var(--color-border);
    min-height: 40vh;
  }
}
</style>