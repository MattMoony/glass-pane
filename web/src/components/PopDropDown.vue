<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  shown: boolean;
}>();
</script>

<template>
  <div v-if="props.shown" class="pop-drop-down">
    <slot></slot>
  </div>
</template>

<style scoped>
.pop-drop-down {
  position: absolute;
  display: inline-block;
  bottom: 0;
  left: 0;
  background-color: var(--color-background-mute);
  padding: .5em;
  transform: translateY(100%);
  max-width: 40vw;
  word-break: break-all;
  box-shadow: 0 5px 5px rgba(0, 0, 0, .2);
  border-radius: 0 0 5px 5px;
}
</style>