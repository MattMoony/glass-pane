<script setup lang="ts">
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type Router } from 'vue-router';

import Organization from '../models/Organization';

import OrganPage from '@/components/OrganPage.vue';
import OrganizationBanner from '@/components/OrganizationBanner.vue';
import OrganizationDetails from '@/components/OrganizationDetails.vue';
import OrganizationNetwork from '@/components/OrganizationNetwork.vue';

const router: Router = useRouter();
const route: RouteLocationNormalized = useRoute();
const oid: ComputedRef<number> = computed(() => +route.params.oid);
const organization: Ref<Organization | null> = ref(null);
const editing: ComputedRef<boolean> = computed(() => Object.keys(route.query).includes('edit'));

watch(oid, async (newOid: number) => {
  organization.value = await Organization.get(newOid);
}, { immediate: true });
</script>

<template>
  <OrganPage 
    :organ="organization"
    :edit="editing"
    @edit="st => { 
      if (organization) {
        router.push(`/o/${organization.id}${st ? '?edit' : ''}`);
        // the following is weird code, but it seems to be the only
        // way to get the behaviour I want?
        // TODO: maybe look at this again later
        if (!st)
          organization._vref = Math.floor(Math.random() * 1000);
      }
    }"
  >
    <template #left>
      <OrganizationBanner
        :organization="organization"
        :edit="editing"
        show-socials
        @change="async (newOrganization) => await newOrganization.update()"
      />
      <div class="organization-details gp-scroll">
        <OrganizationDetails 
          :organization="organization"
          :edit="editing"
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