<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type Router } from 'vue-router';

import Person from '@/models/Person';

import PersonNetworkNew from '@/components/PersonNetworkNew.vue';
import PersonBanner from '@/components/PersonBanner.vue';
import PersonDetails from '@/components/PersonDetails.vue';
import NavBarNew from '@/components/NavBarNew.vue';

const router: Router = useRouter();
const route: RouteLocationNormalized = useRoute();
const pid: Ref<number> = computed(() => +route.params.pid);
const person: Ref<Person | null> = ref(null);

watch(pid, async (newPid: number) => {
  person.value = await Person.get(newPid);
}, { immediate: true });
</script>

<template>
  <main>
    <NavBarNew />
    <article>
      <div class="controls">

      </div>
      <section class="details">
        <div class="person-desc">
          <PersonBanner 
            :person="person" 
            socials
          />
          <div class="person-details gp-scroll">
            <PersonDetails
              :person="person"
            />
          </div>
        </div>
        <div class="person-netw">
          <PersonNetworkNew
            :person="person"
            show-memberships
          />
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

.details {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.details .person-desc {
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

.details .person-details {
  flex-grow: 1;
  flex-basis: 0;
  overflow-y: auto;
  padding: 1.5em;
}

.details .person-netw {
  flex-grow: 1;
  flex-basis: 0;
  overflow: hidden;
  border-left: 2px solid var(--color-border);
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}
</style>