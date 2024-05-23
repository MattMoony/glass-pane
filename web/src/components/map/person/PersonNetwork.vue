<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';

import Person from '@/models/Person';
import Relation from '@/models/Relation';
import Membership from '@/models/Membership';

import OrganNetwork from '@/components/map/OrganNetwork.vue';
import OrganNetworkCytoscape from '@/components/map/OrganNetworkCytoscape.vue';

const props = defineProps<{
  /**
   * The person to show the network for.
   */
  person: Person|null;
  /**
   * Whether to show memberships in organizations.
   */
  showMemberships?: boolean;
  /**
   * Whether to use cytoscape for rendering.
   */
  cytoscape?: boolean;
}>();

const relations: Ref<Relation[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);

const refreshNetwork = async () => {
  if (!props.person) return;
  relations.value = await props.person.relations.get();
  if (props.showMemberships) memberships.value = await Membership.get(props.person);
};

watch(() => props.showMemberships, refreshNetwork);
watch(() => [props.person, props.person?._vref,], refreshNetwork, { immediate: true });
</script>

<template>
  <OrganNetwork
    :organ="props.person"
    :relations="relations"
    :memberships="memberships"
    v-if="!cytoscape"
  />
  <OrganNetworkCytoscape
    :organ="props.person"
    :relations="relations"
    :memberships="memberships"
    v-else
  />
</template>

<style scoped>
</style>