<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter, type Router } from 'vue-router';

import Person from '@/models/Person';
import { type OrganSource } from '@/api/organ';

import NavBarNew from '@/components/NavBarNew.vue';
import PersonBanner from '@/components/PersonBanner.vue';
import PersonDetails from '@/components/PersonDetails.vue';

const router: Router = useRouter();
const person: Ref<Person> = ref(new Person(-1, '', '', ''));
const sources: Ref<OrganSource[]> = ref([]); 

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
  router.push(`/p/${newPerson.id}`);
};
</script>

<template>
  <main>
    <NavBarNew />
    <article class="gp-scroll">
      <section>
        <PersonBanner
          :person="person"
          edit
        />
        <PersonDetails
          :person="person"
          edit
          hide-relations
          hide-memberships
          :updated-sources="sources"
        />
        <button @click="createPerson">
          <font-awesome-icon icon="save" />
          Save
        </button>
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
  padding: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
}

section {
  width: 60vw;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

section button {
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

section button:hover {
  background-position: 100% 0;
}
</style>