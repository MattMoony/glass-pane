<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import Organ from '@/models/Organ';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';
import Person from '@/models/Person';
import Role from '@/models/Role';

import MembershipInfo from '@/components/info/MembershipInfo.vue';
import SelectSearch from '@/components/SelectSearch.vue';

const props = defineProps<{
  /**
   * The organization to display.
   */
  organization: Organization|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const members: Ref<Membership[]> = ref([]);
const newMember: Ref<Membership|null> = ref(null);

const addMember = async () => {
  if (!props.organization || !newMember.value || newMember.value.role.id < 0) return;
  await props.organization.members.add(newMember.value, [ 'none', ]);
  members.value.push(newMember.value);
  newMember.value = null;
  // @ts-ignore
  props.organization._vref = Math.floor(Math.random() * 1000);
};

const updateMember = async (member: Membership) => {
  if (!props.organization) return;
  await props.organization.memberships.update(member);
  // @ts-ignore
  props.organization._vref = Math.floor(Math.random() * 1000);
};

const removeMember = async (member: Membership) => {
  if (!props.organization) return;
  await props.organization.members.remove(member);
  members.value = members.value.filter(m => m.id !== member.id);
  // @ts-ignore
  props.organization._vref = Math.floor(Math.random() * 1000);
};

watch(() => props.organization, async () => {
  if (!props.organization) return;
  members.value = await props.organization.members.get();
}, { immediate: true, });
</script>

<template>
  <div class="members">
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
            @change="member => updateMember(member)"
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
        <SelectSearch
          @select="organ => {
            if (organization)
              newMember = new Membership(-1, organ, organization, new Role(-1, ''));
          }"
        />
      </template>
      <template v-else>
        <MembershipInfo
          :membership="newMember"
          organization-members
          edit
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
</template>

<style scoped>
.members * {
  text-decoration: none;
  color: inherit;
}

button {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
}

button:focus {
  outline: none
}

.button-wrapper {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .4em;
  margin-top: .4em;
}
</style>
