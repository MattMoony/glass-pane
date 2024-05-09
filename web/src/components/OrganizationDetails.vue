<script setup lang="ts">
import { type Ref, ref, watch } from 'vue';

import type { OrganSource } from '@/api/organ';
import Organ from '@/models/Organ';
import Person from '@/models/Person';
import Organization from '../models/Organization';
import Membership from '@/models/Membership';

import MembershipInfo from './MembershipInfo.vue';

const props = defineProps<{
  /**
   * The organization to display.
   */
  organization: Organization|null;
}>();

const bio: Ref<string|undefined> = ref(undefined);
const sources: Ref<OrganSource[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);
const members: Ref<Membership[]> = ref([]);

watch(() => props.organization, async (newOrganization: Organization|null) => {
  if (!newOrganization) return;
  bio.value = await newOrganization.bioHTML();
  sources.value = await newOrganization.sources.get();
  memberships.value = await Membership.get(new Organ(newOrganization.id, newOrganization.bio));
  members.value = await Membership.get(newOrganization);
}, { immediate: true });
</script>

<template>
  <section v-if="organization">
    <div class="bio">
      <h2>Biography</h2>
      <div
        class="md-bio"
        v-dompurify-html="bio"
      ></div>
    </div>
    <div class="memberships">
      <h2>Memberships</h2>
      <div v-if="memberships && memberships.length">
        <RouterLink
          class="connection-wrapper"
          v-for="membership in memberships"
          :key="membership.organization.id"
          :to="`/o/${membership.organization.id}`"
        >
          <MembershipInfo
            :membership="membership"
            organ-membership
          />
        </RouterLink>
      </div>
      <div v-else>
        <i>No known memberships.</i>
      </div>
    </div>
    <div class="members">
      <h2>Members</h2>
      <div v-if="members && members.length">
        <RouterLink
          class="connection-wrapper"
          v-for="member in members"
          :key="member.organ.id"
          :to="
            member.organ instanceof Person
            ? `/p/${member.organ.id}`
            : `/o/${member.organ.id}`
          "
        >
          <MembershipInfo
            :membership="member"
            organization-membership
          />
        </RouterLink>
      </div>
      <div v-else>
        <i>No known members.</i>
      </div>
    </div>
    <div class="sources">
      <h2>Sources</h2>
      <div v-if="sources && sources.length">
        <ul>
          <li v-for="source in sources" :key="source.sid">
            <a :href="source.url">{{ source.url }}</a>
          </li>
        </ul>
      </div>
      <div v-else>
        <i>No sources found.</i>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

h2 {
  background-color: var(--color-background-soft);
  padding: .5em;
  border: 2px solid var(--color-border);
  border-radius: 5px 5px 0 0;
}

h2 + div {
  padding: 1em;
  border: 2px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 5px 5px;
}

.connection-wrapper {
  color: var(--color-text);
  text-decoration: none;
}

.sources ul {
  padding: 0 1.2em;
}

.sources a {
  color: var(--color-text);
}
</style>

<style>
/* 
for markdown bio 
*/

.md-bio img {
  max-width: 100%;
  height: auto;
}

.md-bio table {
  border-collapse: collapse;
}

.md-bio table td, 
.md-bio table th {
  border: 2px solid var(--color-border);
  padding: .2em 1em;
}

.md-bio table th {
  background: var(--color-background-soft);
  font-weight: bold;
}

.md-bio a {
  color: var(--color-highlight);
}
</style>