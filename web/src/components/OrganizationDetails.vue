<script setup lang="ts">
import { type Ref, ref, watch, popScopeId } from 'vue';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

import type { OrganSource } from '@/api/organ';
import Organ from '@/models/Organ';
import Person from '@/models/Person';
import Organization from '../models/Organization';
import Membership from '@/models/Membership';
import Role from '@/models/Role';

import MembershipInfo from './MembershipInfo.vue';
import SelectSearchNew from './SelectSearchNew.vue';

const props = defineProps<{
  /**
   * The organization to display.
   */
  organization: Organization|null;
  /**
   * Whether to allow editing the person.
   */
  edit?: boolean;
  /**
   * Whether to hide memberships.
   */
  hideMemberships?: boolean;
  /**
   * Whether to hide members.
   */
  hideMembers?: boolean;
  /**
   * If you want to receive updated sources.
   */
  updatedSources?: OrganSource[];
}>();

const bio: Ref<string|undefined> = ref(undefined);
const sources: Ref<OrganSource[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);
const members: Ref<Membership[]> = ref([]);
const newSource: Ref<string> = ref('');
const newMembership: Ref<Membership|null> = ref(null);
const newMember: Ref<Membership|null> = ref(null);

const addSource = async () => {
  if (!newSource.value.trim()) return;
  if (!props.updatedSources) {
    const source = await props.organization?.sources.add(newSource.value);
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
    await props.organization?.sources.update(source.sid, source.url);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index >= 0) {
      props.updatedSources[index].url = source.url;
    }
  }
};

const removeSource = async (source: OrganSource) => {
  if (!props.updatedSources) {
    await props.organization?.sources.remove(source.sid);
    sources.value = sources.value.filter(s => s.sid !== source.sid);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index >= 0) {
      props.updatedSources.splice(index, 1);
    }
  }
};

const addMembership = async () => {
  if (!props.organization || !newMembership.value || newMembership.value.role.id < 0) return;
  await newMembership.value.create([ 'none', ]);
  memberships.value.push(newMembership.value);
  newMembership.value = null;
  props.organization._vref = Math.floor(Math.random() * 1000);
};

const removeMembership = async (membership: Membership) => {
  await membership.remove();
  const index = memberships.value.findIndex(m => 
    m.organ.id === membership.organ.id && 
    m.organization.id === membership.organization.id &&
    m.role.id === membership.role.id &&
    m.since === membership.since);
  memberships.value.splice(index);
  props.organization._vref = Math.floor(Math.random() * 1000);
};

const addMember = async () => {
  if (!props.organization || !newMember.value || newMember.value.role.id < 0) return;
  await newMember.value.create([ 'none', ]);
  members.value.push(newMember.value);
  newMember.value = null;
  props.organization._vref = Math.floor(Math.random() * 1000);
};

const removeMember = async (member: Membership) => {
  await member.remove();
  const index = members.value.findIndex(m => 
    m.organ.id === member.organ.id && 
    m.organization.id === member.organization.id &&
    m.role.id === member.role.id &&
    m.since === member.since);
  members.value.splice(index);
  props.organization._vref = Math.floor(Math.random() * 1000);
};

watch(
  () => [ props.organization, props.organization?._vref, ], 
  async () => {
    if (!props.organization) return;
    bio.value = await props.organization.bioHTML();
    sources.value = await props.organization.sources.get();
    if (!props.hideMemberships)
      memberships.value = await Membership.get(new Organ(props.organization.id, props.organization.bio));
    if (!props.hideMembers)
      members.value = await Membership.get(props.organization);
  }, 
  { immediate: true }
);

watch(() => props.organization?.bio, async () => {
  if (!props.organization) return;
  bio.value = await props.organization.bioHTML();
});
</script>

<template>
  <section v-if="organization" :class="[edit ? 'edit' : '',]">
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
          v-model="organization.bio"
          :extensions="[markdown(), oneDark,]"
          @keydown="(e: KeyboardEvent) => {
            if (e.key === 's' && e.ctrlKey) {
              console.log(e.key, e.ctrlKey, e.metaKey, e.shiftKey, e.altKey);
              e.preventDefault();
              (async () => organization && await organization.update())();
              return false;
            }
          }"
          @blur="async () => organization && await organization.update()"
        />
      </div>
    </div>
    <div v-if="!hideMemberships" class="memberships">
      <h2>Memberships</h2>
      <div>
        <template v-if="memberships && memberships.length">
          <template v-if="!edit">
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
          </template>
          <template v-else>
            <div 
              v-for="membership in memberships" 
              :key="membership.organization.id"
            >
              <MembershipInfo
                :membership="membership"
                organ-membership
                edit
                @change="async () => await membership.update()"
              />
              <div class="button-wrapper">
                <button @click="() => removeMembership(membership)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known memberships.</i>
        </template>
        <template v-if="edit">
          <h3>New Membership</h3>
          <template v-if="!newMembership">
            <SelectSearchNew
              type="organization"
              @select="org => {
                if (organization)
                  newMembership = new Membership(organization, org as Organization, new Role(-1, ''), new Date());
              }"
            />
          </template>
          <template v-else>
            <MembershipInfo
              :membership="newMembership"
              organ-membership
              edit
              create
            />
            <div class="button-wrapper">
              <button
                @click="newMembership = null"
              >
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button
                @click="addMembership"
              >
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div v-if="!hideMembers" class="members">
      <h2>Members</h2>
      <div>
        <template v-if="members && members.length">
          <template v-if="!edit">
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
                organization-members
              />
            </RouterLink>
          </template>
          <template v-else>
            <div 
              v-for="member in members" 
              :key="member.organization.id"
            >
              <MembershipInfo
                :membership="member"
                organization-members
                edit
                @change="async () => await member.update()"
              />
              <div class="button-wrapper">
                <button @click="() => removeMember(member)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known members.</i>
        </template>
        <template v-if="edit">
          <h3>New Member</h3>
          <template v-if="!newMember">
            <SelectSearchNew
              @select="organ => {
                if (organization)
                  newMember = new Membership(organ, organization, new Role(-1, ''), new Date());
              }"
            />
          </template>
          <template v-else>
            <MembershipInfo
              :membership="newMember"
              organization-members
              edit
              create
            />
            <div class="button-wrapper">
              <button
                @click="newMember = null"
              >
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button
                @click="addMember"
              >
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
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

.edit .memberships .button-wrapper,
.edit .members .button-wrapper {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .4em;
  margin-top: .4em;
}

.edit .memberships button,
.edit .members button {
  width: 100%;
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
