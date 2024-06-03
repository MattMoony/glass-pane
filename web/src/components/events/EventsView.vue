<script setup lang="ts">
import Event from '@/models/Event';
import { ref, watch, type Ref } from 'vue';

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
    <div class="event-spacing">
      <div></div>
    </div>
    <template v-for="[_, info] in months">
      <div class="event-tl-heading">
        {{ info.date.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
      </div>
      <template v-for="[_, events] in info.events">
        <div class="event new-date">
          <div>
            <div class="event-box">
              <h3>{{ events[0].name }}</h3>
              <div>
                {{ events[0].location?.name }}
              </div>
            </div>
          </div>
          <div class="event-spacing">
            <div></div>
          </div>
          <div>
            {{ events[0].date?.toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', }) }}
          </div>
        </div>
        <template v-for="event in events.slice(1)">
          <div class="event">
            <div>
              <div class="event-box">
                <h3>{{ event.name }}</h3>
                <div>
                  {{ event.location?.name }}
                </div>
              </div>
            </div>
            <div class="event-spacing">
              <div></div>
            </div>
            <div>
            </div>
          </div>
        </template>
      </template>
    </template>
    <div class="event-spacing">
      <div></div>
    </div>
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

.event-spacing {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.event-spacing > div {
  width: 2px;
  min-height: 1rem;
  height: 100%;
  background-color: var(--color-border);
}

.event-tl-heading {
  font-weight: bold;
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
}

.event {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr .3fr 1fr;
}

.event > div:first-child {
  padding-top: .6rem;
}

.event.new-date > div:first-child,
.event.new-date > div:last-child {
  padding-top: 3rem;
}

.event .event-box {
  padding: 1rem;
  background-color: var(--color-background-soft);
}

.event .event-box h3 {
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.event > div:last-child {
  font-style: italic;
  letter-spacing: 0.1em;
  font-size: .9em;
}
</style>
