<script setup lang="ts">
import Event from '@/models/Event';

const props = defineProps<{
  event: Event|null;
}>();

</script>

<template>
  <div class="event-box">
    <template v-if="event">
      <h3>
        {{ event.name }}
      </h3>
      <div>
        {{ event.location?.name }}
      </div>
    </template>
    <template v-else>
      Loading ...
    </template>
  </div>
</template>

<style scoped>
.event-box {
  padding: 1rem;
  background-color: var(--color-background-soft);
}

.event-box h3 {
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
