<script setup lang="ts">
const props = defineProps<{
  show: boolean,
}>()
</script>

<template>
  <div :class="['full-screen-modal', $props.show ? 'show' : '',]" @click="$emit('close')">
    <div class="modal-content" @click="e => e.stopImmediatePropagation()">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.full-screen-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  justify-content: center;
  align-items: center;
}

.full-screen-modal.show {
  display: flex;
}

.modal-content {
  background-color: var(--color-background);
  padding: 1em;
  border-radius: 0.5em;
  border: 2px solid var(--color-border);
  min-width: 50vw;
}
</style>