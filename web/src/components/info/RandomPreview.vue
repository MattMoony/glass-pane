<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

import Person from '@/models/Person';
import Organization from '@/models/Organization';

import PersonBanner from '@/components/info/person/PersonBanner.vue';
import OrganizationBanner from '@/components/info/organization/OrganizationBanner.vue';

const person: Ref<Person|null> = ref(null);
const organization: Ref<Organization|null> = ref(null);

onMounted(async () => {
  person.value = await Person.random();
  organization.value = await Organization.random();
});
</script>

<template>
  <div class="random">
    <div>
      <h3>Random Person</h3>
      <RouterLink
        v-if="person"
        :to="`/p/${person.id}`"
      >
        <PersonBanner
          :person="person"
        />
      </RouterLink>
    </div>
    <div>
      <h3>Random Organization</h3>
      <RouterLink
        v-if="organization"
        :to="`/o/${organization.id}`"
      >
        <OrganizationBanner
          :organization="organization"
        />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.random {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
}

.random * {
  color: inherit;
  text-decoration: none;
}

.random h3 {
  text-align: center;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: .5rem;
}

@media only screen and (max-width: 800px) {
  .random {
    grid-template-columns: 1fr;
  }
}
</style>
