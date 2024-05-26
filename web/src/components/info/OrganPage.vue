<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';

import Organ from '@/models/Organ';
import { useUserStore } from '@/stores/user';

import SearchNavBar from '@/components/SearchNavBar.vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  /**
   * The organ to display.
   */
  organ: Organ|null;
  /**
   * Whether to be able to be able to hide
   * and reveal sections.
   */
  switchable?: boolean;
  /**
   * Icon for the left section.
   */
  leftIcon?: string;
  /**
   * Icon for the right section.
   */
  rightIcon?: string;
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
const shown = ref({ left: true, right: true, });
const router = useRouter();

const toggleShown = (side: 'left'|'right') => {
  if (Object.values(shown.value).filter(x=>x).length <= 1 && shown.value[side]) return;
  shown.value[side] = !shown.value[side];
  localStorage.setItem('organ-page-shown', JSON.stringify(shown.value));
};

onMounted(() => {
  const stored = localStorage.getItem('organ-page-shown');
  if (stored) {
    const parsed = JSON.parse(stored);
    shown.value = { left: parsed.left, right: parsed.right, };
  }
});

watch(() => props.edit, (newEdit: boolean) => {
  editing.value = newEdit;
}, { immediate: true });
</script>

<template>
  <main>
    <SearchNavBar 
      :result="organ ? organ : undefined"
    />
    <article>
      <div 
        class="controls"
        v-if="user.user || switchable"
      >
        <div class="section-switch" v-if="switchable">
          <button 
            :title="`${shown.left ? 'Hide' : 'Show'} left section`" 
            @click="() => toggleShown('left')"
          >
            <font-awesome-icon :class="shown.left ? '' : 'hidden'" :icon="leftIcon || 'fa-book'" />
          </button>
          <button 
            :title="`${shown.right ? 'Hide' : 'Show'} right section`" 
            @click="() => toggleShown('right')"
          >
            <font-awesome-icon :class="shown.right ? '' : 'hidden'" :icon="rightIcon || 'fa-diagram-project'" />
          </button>
        </div>
        <button 
          v-if="user.user"
          title="Edit" 
          @click="() => { editing = !editing; $emit('edit', editing); }"
        >
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
      <section :class="['slots', 'gp-scroll', editing ? 'edit' : '',]">
        <div :class="['left-slot', shown['right'] ? 'constrained' : '']" v-if="shown.left">
          <slot name="left"></slot>
        </div>
        <div class="right-slot" v-if="shown.right">
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
  justify-content: space-between;
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

.controls .section-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5em;
}

.controls .section-switch svg {
  transition: .2s ease;
}

.controls .section-switch .hidden {
  opacity: .5;
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
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  gap: 1em;
}

.slots .left-slot.constrained {
  max-width: 60vw;
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

  .slots.edit .left-slot.constrained {
    max-width: 100vw;
  }

  .slots .right-slot {
    border-left: none;
    border-bottom: 2px solid var(--color-border);
    min-height: 50vh;
  }
}
</style>