<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

import Event from '@/models/Event';

import RoutesNavBar from '@/components/RoutesNavBar.vue';
import EventsView from '@/components/events/EventsView.vue';

const BATCH_SIZE: number = 5;
const events: Ref<Event[]> = ref([]);
const nextDate: Ref<Date> = ref(new Date());

const fetchMoreEvents = async () => {
  events.value = [...events.value, ...await Event.searchByDate(nextDate.value, BATCH_SIZE)];
  const tmp = events.value.map(e => e.date).sort((a, b) => a!.getTime() - b!.getTime())[0];
  if (!tmp) return;
  nextDate.value = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate());
  nextDate.value = new Date(nextDate.value.getTime() - 1000 * 60 * 60 * 24);
};

const checkFetch = async (event: MouseEvent) => {
  const section = event.target as HTMLDivElement;
  if (section.scrollHeight - section.scrollTop < section.clientHeight + 100)
    await fetchMoreEvents();
};

onMounted(async () => {
  fetchMoreEvents();
});
</script>

<template>
  <main>
    <RoutesNavBar />
    <article>
      <section 
        class="gp-scroll"
        @scroll="checkFetch"
      >
        <EventsView
          :events="events"
        />
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
  flex-basis: 0;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
}

section {
  flex-grow: 1;
  flex-basis: 0;
  padding: 1em;
  word-wrap: break-word;
  width: 100%;
}
</style>
