<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';

import type { OrganSource } from '@/api/organ';
import Person from '../models/Person';
import type Relation from '@/models/Relation';
import Membership from '@/models/Membership';

import PersonBanner from './PersonBanner.vue';
import MembershipInfo from './MembershipInfo.vue';

const props = defineProps<{
  /**
   * The person to display in the details.
   */
  person: Person|null;
}>();

const bio: Ref<string|undefined> = ref(undefined);
const sources: Ref<OrganSource[]> = ref([]);
const parents: Ref<Relation[]> = ref([]);
const romantic: Ref<Relation[]> = ref([]);
const children: Ref<Relation[]> = ref([]);
const friends: Ref<Relation[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);

watch(() => props.person, async (newPerson: Person|null) => {
  if (!newPerson) return;
  bio.value = await newPerson.bioHTML();
  sources.value = await newPerson.sources.get();
  parents.value = await newPerson.parents.get();
  children.value = await newPerson.children.get();
  romantic.value = await newPerson.romantic.get();
  friends.value = await newPerson.friends.get();
  memberships.value = await Membership.get(newPerson);
}, { immediate: true });
</script>

<template>
  <section v-if="person">
    <div class="bio">
      <h2>Biography</h2>
      <div
        class="md-bio"
        v-dompurify-html="bio"
      ></div>
    </div>
    <div class="connections">
      <h2>Relations</h2>
      <div>
        <template v-if="parents.length">
          <h3>Parents</h3>
          <div>
            <RouterLink
              class="connection-wrapper"
              v-for="parent in parents"
              :key="parent.other.id"
              :to="`/p/${parent.other.id}`"
            >
              <PersonBanner
                :person="parent.other"
                small
              />
            </RouterLink>
          </div>
        </template>
        <template v-if="romantic.length">
          <h3>Romantic</h3>
          <div>
            <RouterLink
              class="connection-wrapper"
              v-for="partner in romantic"
              :key="partner.other.id"
              :to="`/p/${partner.other.id}`"
            >
              <PersonBanner
                :person="partner.other"
                small
              />
            </RouterLink>
          </div>
        </template>
        <template v-if="children.length">
          <h3>Children</h3>
          <div>
            <RouterLink
              class="connection-wrapper"
              v-for="child in children"
              :key="child.other.id"
              :to="`/p/${child.other.id}`"
            >
              <PersonBanner
                :person="child.other"
                small
              />
            </RouterLink>
          </div>
        </template>
        <template v-if="friends.length">
          <h3>Friends</h3>
          <div>
            <RouterLink
              class="connection-wrapper"
              v-for="friend in friends"
              :key="friend.other.id"
              :to="`/p/${friend.other.id}`"
            >
              <PersonBanner
                :person="friend.other"
                small
              />
            </RouterLink>
          </div>
        </template>
      </div>
    </div>
    <div class="memberships">
      <h2>Memberships</h2>
      <div>
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
    </div>
    <div class="sources">
      <h2>Sources</h2>
      <div>
        <ul>
          <li v-for="source in sources" :key="source.sid">
            <a :href="source.url" target="_blank">{{ source.url }}</a>
          </li>
        </ul>
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

.connections h3 {
  margin: 1.5em 0 .5em;
  padding: .5em 0;
  border-top: 2px dashed var(--color-border);
  border-bottom: 2px dashed var(--color-border);
}

.connections h3:first-of-type {
  margin-top: 0;
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
