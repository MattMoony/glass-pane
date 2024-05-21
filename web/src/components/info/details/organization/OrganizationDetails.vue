<script setup lang="ts">
import Organization from '@/models/Organization';

import OrganDetails from '@/components/info/details/OrganDetails.vue';
import OrganizationMembers from './OrganizationMembers.vue';

const props = defineProps<{
  /**
   * The organization to display.
   */
  organization: Organization|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
  /**
   * Hide the bio?
   */
  hideBio?: boolean;
  /**
   * Hide the memberships?
   */
  hideMemberships?: boolean;
  /**
   * Hide the sources?
   */
  hideSources?: boolean;
  /**
   * Hide the socials?
   */
  hideSocials?: boolean;
  /**
   * Hide the members?
   */
  hideMembers?: boolean;
}>();
</script>

<template>
  <OrganDetails
    v-if="organization"
    :organ="organization"
    :edit="edit"
    :hide-bio="hideBio"
    :hide-memberships="hideMemberships"
    :hide-sources="hideSources"
    :hide-socials="hideSocials"
  >
    <template #members v-if="!hideMembers">
      <div>
        <h2>Members</h2>
        <OrganizationMembers
          :organization="organization"
          :edit="edit"
        />
      </div>
    </template>
  </OrganDetails>
</template>

<style scoped>
h2 {
  background-color: var(--color-background-soft);
  padding: .5em;
  border: 2px solid var(--color-border);
  border-radius: 5px 5px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 > span {
  font-weight: normal;
  font-size: .7em;
  font-style: italic;
  background-color: var(--color-background-mute);
  padding: .2em .5em;
  border-radius: 5px;
}

h2 + div {
  padding: 1em;
  border: 2px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 5px 5px;
}
</style>
