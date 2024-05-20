<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';

import Organ from '@/models/Organ';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';

import OrganNetwork from '@/components/map/OrganNetwork.vue';

const props = defineProps<{
  /**
   * The organization to show the network for.
   */
  organization: Organization|null;
}>();

const memberships: Ref<Membership[]> = ref([]);
const members: Ref<Membership[]> = ref([]);

const refreshNetwork = async () => {
  if (!props.organization) return;
  memberships.value = await Membership.get(new Organ(props.organization.id, props.organization.bio));
  members.value = await Membership.get(props.organization);
};

watch(
  () => [ props.organization, props.organization?._vref, ], 
  refreshNetwork, 
  { immediate: true }
);
</script>

<template>
  <OrganNetwork
    :organ="props.organization"
    :memberships="memberships"
    :members="members"
  />
</template>

<style scoped>
</style>