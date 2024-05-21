<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter, type Router } from 'vue-router';

import Organization from '@/models/Organization';
import { type OrganSource } from '@/api/organ';

import NavBar from '@/components/NavBar.vue';
import OrganizationBanner from '@/components/info/organization/OrganizationBanner.vue';
import OrganizationDetails from '@/components/info/details/organization/OrganizationDetails.vue';
import OrganSources from '@/components/info/details/OrganSources.vue';

const router: Router = useRouter();
// @ts-ignore
const organization: Ref<Organization> = ref(new Organization(-1, '', ''));
const sources: Ref<OrganSource[]> = ref([]);
const bannerUpdated = ref({ pic: undefined, });

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
  if (bannerUpdated.value.pic)
    await newOrganization.pic.set(bannerUpdated.value.pic);
  router.push(`/o/${newOrganization.id}`);
};
</script>

<template>
  <main>
    <NavBar />
    <article>
      <section class="gp-scroll">
        <OrganizationBanner
          :organization="organization"
          edit
          :updated="bannerUpdated"
        />
        <OrganizationDetails
          :organization="organization"
          edit
          hide-memberships
          hide-members
          hide-sources
          hide-socials
        />
        <div>
          <h2>Sources</h2>
          <OrganSources
            :organ="organization"
            edit
            :updatedSources="sources"
          />
        </div>
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

h2 {
  margin: .5em;
}
</style>