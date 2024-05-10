<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

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
  /**
   * Whether to allow editing the person.
   */
  edit?: boolean;
  /**
   * Whether to hide relations.
   */
  hideRelations?: boolean;
  /**
   * Whether to hide memberships.
   */
  hideMemberships?: boolean;
  /**
   * If you want to receive updated sources.
   */
  updatedSources?: OrganSource[];
}>();

const bio: Ref<string|undefined> = ref(undefined);
const sources: Ref<OrganSource[]> = ref([]);
const parents: Ref<Relation[]> = ref([]);
const romantic: Ref<Relation[]> = ref([]);
const children: Ref<Relation[]> = ref([]);
const friends: Ref<Relation[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);
const newSource: Ref<string> = ref('');

const addSource = async () => {
  if (!newSource.value.trim()) return;
  if (!props.updatedSources) {
    const source = await props.person?.sources.add(newSource.value);
    if (source) {
      sources.value.push(source);
      newSource.value = '';
    }
  } else {
    props.updatedSources.push({ sid: -props.updatedSources.length, url: newSource.value, });
    newSource.value = '';
  }
};

const updateSource = async (source: OrganSource) => {
  if (!source.url.trim()) return;
  if (!props.updatedSources) {
    await props.person?.sources.update(source.sid, source.url);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources[index].url = source.url;
    }
  }
};

const removeSource = async (source: OrganSource) => {
  if (!props.updatedSources) {
    await props.person?.sources.remove(source.sid);
    sources.value = sources.value.filter(s => s.sid !== source.sid);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources.splice(index, 1);
    }
  }
};

watch(() => props.person, async (newPerson: Person|null) => {
  if (!newPerson) return;
  bio.value = await newPerson.bioHTML();
  sources.value = await newPerson.sources.get();
  if (!props.hideRelations) {
    parents.value = await newPerson.parents.get();
    children.value = await newPerson.children.get();
    romantic.value = await newPerson.romantic.get();
    friends.value = await newPerson.friends.get();
  }
  if (!props.hideMemberships) {
    memberships.value = await Membership.get(newPerson);
  }
  props.updatedSources?.splice(0, props.updatedSources.length, ...sources.value);
}, { immediate: true });

watch(() => props.person?.bio, async () => {
  if (!props.person) return;
  bio.value = await props.person.bioHTML();
});
</script>

<template>
  <section v-if="person" :class="[edit ? 'edit' : '',]">
    <div class="bio">
      <h2>Biography</h2>
      <div
        v-if="!edit"
        class="md-bio"
        v-dompurify-html="bio"
      ></div>
      <div
        v-else
        class="md-bio"
      >
        <codemirror 
          v-model="person.bio"
          :extensions="[markdown(), oneDark,]"
          @keydown="(e: KeyboardEvent) => {
            if (e.key === 's' && e.ctrlKey) {
              console.log(e.key, e.ctrlKey, e.metaKey, e.shiftKey, e.altKey);
              e.preventDefault();
              (async () => person && await person.update())();
              return false;
            }
          }"
          @blur="async () => person && await person.update()"
        />
      </div>
    </div>
    <div class="connections" v-if="!hideRelations">
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
    <div class="memberships" v-if="!hideMemberships">
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
          <li v-for="source in updatedSources||sources" :key="source.sid">
            <a 
              v-if="!edit"
              :href="source.url" 
              target="_blank"
            >{{ source.url }}</a>
            <div v-else>
              <input v-model="source.url" />
              <button @click="updateSource(source)">
                <font-awesome-icon icon="save" />
              </button>
              <button @click="removeSource(source)">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </li>
          <li v-if="edit">
            <div>
              <input 
                v-model="newSource"
                @keyup="e => e.key === 'Enter' && addSource()"
              />
              <button @click="addSource">
                <font-awesome-icon icon="plus" />
              </button>
            </div>
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

.edit li > div {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .3em;
}

.edit input,
.edit button {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.edit button {
  width: auto;
  cursor: pointer;
}

.edit input:focus,
.edit button:focus {
  outline: none;
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
