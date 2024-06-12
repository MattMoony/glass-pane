<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type Router } from 'vue-router';

import Person from '@/models/Person';

import SearchNavBar from '@/components/SearchNavBar.vue';
import PersonBanner from '@/components/info/person/PersonBanner.vue';
import PersonDetails from '@/components/info/details/person/PersonDetails.vue';

const router: Router = useRouter();
const route: RouteLocationNormalized = useRoute();
const pid: ComputedRef<number> = computed(() => +route.params.pid);
const person: Ref<Person | null> = ref(null);
const editing: ComputedRef<boolean> = computed(() => Object.keys(route.query).includes('edit'));

watch(pid, async (newPid: number) => {
  person.value = await Person.get(newPid);
}, { immediate: true });
</script>

<template>
  <main>
    <SearchNavBar />
    <article class="gp-scroll">
      <div class="main-content">
        <PersonBanner 
          :person="person" 
          :edit="editing"
          show-socials
          extended
          @change="async (newPerson) => await newPerson.update()"
        />
        <PersonDetails 
          :person="person"
          :edit="editing"
        />
      </div>
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
  align-items: center;
}

.main-content {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  gap: 2em;
  max-width: 80vw;
  padding: 2em;
}
</style>
