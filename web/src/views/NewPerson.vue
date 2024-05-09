<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type Router } from 'vue-router';

import Person from '@/models/Person';

import OrganPage from '@/components/OrganPage.vue';
import PersonNetworkNew from '@/components/PersonNetworkNew.vue';
import PersonBanner from '@/components/PersonBanner.vue';
import PersonDetails from '@/components/PersonDetails.vue';

const route: RouteLocationNormalized = useRoute();
const pid: ComputedRef<number> = computed(() => +route.params.pid);
const person: Ref<Person | null> = ref(null);

watch(pid, async (newPid: number) => {
  person.value = await Person.get(newPid);
}, { immediate: true });
</script>

<template>
  <OrganPage :organ="person">
    <template #left>
      <PersonBanner :person="person" />
      <div class="person-details gp-scroll">
        <PersonDetails 
          :person="person" 
        />
      </div>
    </template>
    <template #right>
      <PersonNetworkNew 
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
</style>