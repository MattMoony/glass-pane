<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter, type Router } from 'vue-router';

import Person from '@/models/Person';
import { type OrganSource } from '@/api/organ';

import SearchNavBar from '@/components/SearchNavBar.vue';
import PersonBanner from '@/components/info/person/PersonBanner.vue';
import PersonDetails from '@/components/info/details/person/PersonDetails.vue';
import OrganSources from '@/components/info/details/OrganSources.vue';
import RoutesNavBar from '@/components/RoutesNavBar.vue';

const router: Router = useRouter();
// @ts-ignore
const person: Ref<Person> = ref(new Person(-1, '', '', ''));
const sources: Ref<OrganSource[]> = ref([]);
const bannerUpdated = ref({ pic: undefined, });

const createPerson = async () => {
  if (!person.value.firstname.trim() || !person.value.lastname.trim()) return;
  const newPerson = await Person.create(
    person.value.firstname,
    person.value.lastname,
    person.value.bio,
    person.value.birthdate,
    person.value.deathdate
  );
  if (!newPerson) return;
  for (const source of sources.value) {
    await newPerson.sources.add(source.url);
  }
  if (bannerUpdated.value.pic)
    await newPerson.pic.set(bannerUpdated.value.pic);
  router.push(`/p/${newPerson.id}`);
};
</script>

<template>
  <h1>New person</h1>
  <PersonBanner
    :person="person"
    edit
    :updated="bannerUpdated"
  />
  <PersonDetails
    :person="person"
    edit
    hide-memberships
    hide-relations
    hide-sources
    hide-socials
  />
  <div>
    <h2>Sources</h2>
    <OrganSources
      :organ="person"
      edit
      :updatedSources="sources"
    />
  </div>
  <button @click="createPerson">
    <font-awesome-icon icon="save" />
    Save
  </button>
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

button {
  width: 100%;
  padding: .8em;
  margin-bottom: 1em;
  background: linear-gradient(to right, var(--color-background-soft) 0%, var(--color-background-soft) 50%, var(--color-background-mute) 50%, var(--color-background-mute) 100%);
  background-size: 200% auto;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.2em;
  cursor: pointer;
  transition: .2s ease;
}

button:hover {
  background-position: 100% 0;
}

h2 {
  margin: .5em;
}
</style>