<script setup lang="ts">
import type Person from '@/models/Person';

import OrganDetails from '@/components/info/details/OrganDetails.vue';
import PersonRelations from './PersonRelations.vue';
import PersonNetwork from '@/components/net/person/PersonNetwork.vue';

const props = defineProps<{
  /**
   * The person to display.
   */
  person: Person|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
  /**
   * Hide the bio?
   */
  hideBio?: boolean;
  /**
   * Hide the network?
   */
  hideNetwork?: boolean;
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
   * Hide the relations?
   */
  hideRelations?: boolean;
}>();
</script>

<template>
  <OrganDetails
    v-if="person"
    :organ="person"
    :edit="edit"
    :hide-bio="hideBio"
    :hide-memberships="hideMemberships"
    :hide-sources="hideSources"
    :hide-socials="hideSocials"
  >
    <template #relations v-if="!hideRelations">
      <div>
        <h2>Relations</h2>
        <PersonRelations
          :person="person"
          :edit="edit"
        />
      </div>
    </template>
    <template #network v-if="!hideNetwork">
      <div class="details-netw-wrapper">
        <h2>Network</h2>
        <div>
          <PersonNetwork
            :person="person"
            :edit="edit"
            show-memberships
            cytoscape
          />
        </div>
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

.details-netw-wrapper {
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.details-netw-wrapper > div {
  flex-grow: 1;
  flex-basis: 0;
  overflow: hidden;
}
</style>
