<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';

import Organ from '@/models/Organ';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';

import OrganNetwork from '@/components/net/OrganNetwork.vue';
import OrganNetworkCytoscape from '@/components/net/OrganNetworkCytoscape.vue';

const props = defineProps<{
  /**
   * The organization to show the network for.
   */
  organization: Organization|null;
  /**
   * Whether to use cytoscape for rendering.
   */
  cytoscape?: boolean;
}>();

const memberships: Ref<Membership[]> = ref([]);
const members: Ref<Membership[]> = ref([]);

const refreshNetwork = async () => {
  if (!props.organization) return;
  memberships.value = await props.organization.memberships.get();
  members.value = await props.organization.members.get();
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
    v-if="!cytoscape"
  />
  <OrganNetworkCytoscape
    :organ="props.organization"
    :memberships="memberships"
    :members="members"
    v-else
  />
</template>

<style scoped>
</style>