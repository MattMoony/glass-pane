<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import Organ from '@/models/Organ';
import Membership from '@/models/Membership';
import Organization from '@/models/Organization';
import Role from '@/models/Role';

import MembershipInfo from '@/components/info/MembershipInfo.vue';
import SelectSearch from '@/components/SelectSearch.vue';

const props = defineProps<{
  /**
   * The organ whose bio to display.
   */
  organ: Organ|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const memberships: Ref<Membership[]> = ref([]);
const newMembership: Ref<Membership|null> = ref(null);

const addMembership = async () => {
  if (!props.organ || !newMembership.value || newMembership.value.role.id < 0) return;
  await props.organ.memberships.add(newMembership.value, [ 'none', ]);
  memberships.value.push(newMembership.value);
  newMembership.value = null;
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeMembership = async (membership: Membership) => {
  if (!props.organ) return;
  await props.organ.memberships.remove(membership);
  const index = memberships.value.findIndex(m => 
    m.organ.id === membership.organ.id &&
    m.organization.id === membership.organization.id &&
    m.role.id === membership.role.id &&
    m.since === membership.since);
  memberships.value.splice(index, 1);
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

watch(() => props.organ, async () => {
  if (!props.organ) return;
  memberships.value = await props.organ.memberships.get();
}, { immediate: true });
</script>

<template>
  <div class="memberships">
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
            @change="async () => organ && await organ.memberships.update(membership)"
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
        <SelectSearch
          type="organization"
          @select="(org: Organ) => {
            if (organ)
              newMembership = new Membership(organ, org as Organization, new Role(-1, ''));
          }"
        />
      </template>
      <template v-else>
        <MembershipInfo
          :membership="newMembership"
          organ-membership
          edit
        />
        <div class="button-wrapper">
          <button @click="newMembership = null">
            <font-awesome-icon icon="times" />
            Cancel
          </button>
          <button @click="addMembership">
            <font-awesome-icon icon="plus" />
            Add
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.memberships * {
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