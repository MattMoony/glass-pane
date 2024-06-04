<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import Event from '@/models/Event';

import EventBanner from '@/components/events/EventBanner.vue';

const props = defineProps<{
  events: Event[];
}>();

const months: Ref<Map<string, { date: Date, events: Map<number, Event[]>}>> = ref(new Map());

watch(
  () => props.events,
  (events) => {
    months.value = new Map();
    events.forEach((event) => {
      if (!event.date) return;
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!months.value.has(key)) {
        months.value.set(key, {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          events: new Map(),
        });
      }
      const month = months.value.get(key);
      if (!month) return;
      if (!month.events.has(date.getDate())) {
        month.events.set(date.getDate(), []);
      }
      month.events.get(date.getDate())?.push(event);
    });
  },
  { immediate: true },
);
</script>

<template>
  <section class="event-wrap">
    <v-timeline 
      align="center"
      line-color="var(--color-border)"
    >
      <template
        v-for="([_, info], key) in months"
        :key="key"
      >
        <v-timeline-item
          dot-color="var(--color-background)"
          hide-dot
        >
          <div class="event-tl-heading">
            {{ info.date.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
          </div>
        </v-timeline-item>
        <template
          v-for="([_, events], key) in info.events"
          :key="key"
        >
          <v-timeline-item      
            dot-color="var(--color-background-soft)"
            icon-color="var(--color-text)"
            size="small"
          >
            <template
              v-slot:opposite
            >
              {{ events[0].date!.toLocaleString('default', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', }) }}
            </template>
            <EventBanner
              :event="events[0]"
            />
          </v-timeline-item>
          <v-timeline-item
            v-for="event in events.slice(1)"
            :key="event.id"      
            dot-color="var(--color-background-soft)"
            icon-color="var(--color-text)"
            size="small"
          >
            <EventBanner
              :event="event"
            />
          </v-timeline-item>
        </template>
      </template>
    </v-timeline>
  </section>
</template>

<style scoped>
.event-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0;
}

.event-tl-heading {
  font-weight: bold;
  text-align: center;
  font-size: 1.4rem;
  margin: 2rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}
</style>
