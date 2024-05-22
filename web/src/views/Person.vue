<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type Router } from 'vue-router';

import Person from '@/models/Person';

import OrganPage from '@/components/info/OrganPage.vue';
import PersonNetwork from '@/components/map/person/PersonNetwork.vue';
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
  <OrganPage 
    :organ="person" 
    :edit="editing"
    @edit="st => { 
      if (person) {
        router.push(`/p/${person.id}${st ? '?edit' : ''}`);
        if (!st)
          // @ts-ignore ... also kinda necessary to do it like this, idk...
          person._vref = Math.floor(Math.random() * 1000);
      }
    }"
    switchable
  >
    <template #left>
      <PersonBanner 
        :person="person" 
        :edit="editing"
        show-socials
        @change="async (newPerson) => await newPerson.update()"
      />
      <div class="person-details gp-scroll">
        <PersonDetails 
          :person="person"
          :edit="editing"
        />
      </div>
    </template>
    <template #right>
      <PersonNetwork 
        :person="person" 
        show-memberships
      />
    </template>
  </OrganPage>
</template>

<style scoped>
.person-details {
  flex-grow: 1;
  flex-basis: 0;
  overflow-y: auto;
  padding: 1.5em;
}

@media only screen and (max-width: 800px) {
  .person-details {
    padding: 1em;
    overflow: unset;
  }
}
</style>