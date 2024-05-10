<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, type RouteLocationNormalized } from 'vue-router';

import Organization from '../models/Organization';

import OrganPage from '@/components/OrganPage.vue';
import OrganizationBanner from '@/components/OrganizationBanner.vue';
import OrganizationDetails from '@/components/OrganizationDetails.vue';
import OrganizationNetwork from '@/components/OrganizationNetwork.vue';

const route: RouteLocationNormalized = useRoute();
const oid: ComputedRef<number> = computed(() => +route.params.oid);
const organization: Ref<Organization | null> = ref(null);

watch(oid, async (newOid: number) => {
  organization.value = await Organization.get(newOid);
}, { immediate: true });
</script>

<template>
  <OrganPage :organ="organization">
    <template #left>
      <OrganizationBanner
        :organization="organization"
      />
      <div class="organization-details gp-scroll">
        <OrganizationDetails 
          :organization="organization"
        />
      </div>
    </template>
    <template #right>
      <OrganizationNetwork
        :organization="organization"
      />
    </template>
  </OrganPage>
</template>

<style scoped>
.organization-details {
  flex-grow: 1;
  flex-basis: 0;
  overflow-y: auto;
  padding: 1.5em;
}
</style>