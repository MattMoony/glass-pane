<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter, type Router } from 'vue-router';

import Organization from '@/models/Organization';
import { type OrganSource } from '@/api/organ';

import NavBarNew from '@/components/NavBarNew.vue';
import OrganizationBanner from '@/components/OrganizationBanner.vue';
import OrganizationDetails from '@/components/OrganizationDetails.vue';

const router: Router = useRouter();
const organization: Ref<Organization> = ref(new Organization(-1, '', ''));
const sources: Ref<OrganSource[]> = ref([]);

const createOrganization = async () => {
  if (!organization.value.name.trim()) return;
  const newOrganization = await Organization.create(
    organization.value.name,
    organization.value.bio,
    organization.value.established,
    organization.value.dissolved
  );
  if (!newOrganization) return;
  for (const source of sources.value) {
    await newOrganization.sources.add(source.url);
  }
  // TODO: upload image as well
  router.push(`/o/${newOrganization.id}`);
};
</script>

<template>
  <main>
    <NavBarNew />
    <article class="gp-scroll">
      <section>
        <OrganizationBanner
          :organization="organization"
          edit
        />
        <OrganizationDetails
          :organization="organization"
          edit
          hide-memberships
          hide-members
          :updated-sources="sources"
        />
        <button @click="createOrganization">
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