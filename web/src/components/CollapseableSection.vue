<script setup lang="ts">
import { type Ref, nextTick, ref } from 'vue';
import anime from 'animejs/lib/anime.es.js';

const props = defineProps<{
  /**
   * The title of the section.
   */
  title: string;
  /**
   * Whether the section is initially open.
   */
  open?: boolean;
}>();

const isOpen: Ref<boolean> = ref(props.open || false);
const content = ref<HTMLElement|null>(null);

const doOpenClose = () => {
  isOpen.value = !isOpen.value;
  nextTick(() => {
    if (!content.value) return;
    const anim = anime({
      targets: content.value,
      height: 0,
      opacity: 0,
      duration: 300,
      autoplay: false,
      easing: 'easeInOutQuad',
      direction: 'reverse',
    });
    if (isOpen.value)
      anim.play();
    else
      anim.reverse();
  });
};

</script>

<template>
  <div>
    <div class="section-title" @click="() => doOpenClose()">
      <span class="icon">
        <i :class="['fas', isOpen ? 'fa-chevron-up' : 'fa-chevron-right']"></i>
      </span>
      <span>{{ title }}</span>
    </div>
    <div ref="content" v-if="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  background-color: var(--color-background-soft);
  user-select: none;
  border: 2px solid var(--color-border);
}
</style>
