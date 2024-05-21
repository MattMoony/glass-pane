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
  organ: Organ;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const memberships: Ref<Membership[]> = ref([]);
const newMembership: Ref<Membership|null> = ref(null);

const addMembership = async () => {
  if (!props.organ || !newMembership.value || newMembership.value.role.id < 0 || isNaN(newMembership.value.since.getTime())) return;
  await newMembership.value.create([ 'none', ]);
  memberships.value.push(newMembership.value);
  newMembership.value = null;
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeMembership = async (membership: Membership) => {
  await membership.remove();
  const index = memberships.value.findIndex(m => 
    m.organ.id === membership.organ.id &&
    m.organization.id === membership.organization.id &&
    m.role.id === membership.role.id &&
    m.since === membership.since);
  memberships.value.splice(index, 1);
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

watch(() => props.organ, async (newOrgan: Organ|null) => {
  if (!newOrgan) return;
  memberships.value = await Membership.get(new Organ(props.organ.id, props.organ.bio));
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
        <SelectSearch
          type="organization"
          @select="(org: Organ) => {
            if (organ)
              newMembership = new Membership(organ, org as Organization, new Role(-1, ''), new Date());
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
</style>