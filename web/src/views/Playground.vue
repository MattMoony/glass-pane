<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue';

import * as nominatim from '@/lib/nominatim';
import Person from '@/models/Person';
import Organization from '@/models/Organization';

import PersonBanner from '@/components/info/person/PersonBanner.vue';
import PersonNetworkNew from '@/components/net/person/PersonNetwork.vue';
import OrganDetails from '@/components/info/details/OrganDetails.vue';
import PersonDetails from '@/components/info/details/person/PersonDetails.vue';
import OrganizationDetails from '@/components/info/details/organization/OrganizationDetails.vue';
import OrganizationBanner from '@/components/info/organization/OrganizationBanner.vue';
import OrganNetworkCytoscape from '@/components/net/OrganNetworkCytoscape.vue';
import OrganizationNetwork from '@/components/net/organization/OrganizationNetwork.vue';
import BaseMap from '@/components/map/BaseMap.vue';

const person = ref<Person | null>(null);
const organization = ref<Organization | null>(null);
const edit = ref(false);

(async () => {
  // const p = await Person.get(1);
  // person.value = p;
  const o = await Organization.get(4);
  organization.value = o;
})();

window.Person = Person;
window.Organization = Organization;

window.nominatim = nominatim;
</script>

<template>
  <div class="playground">
    <div class="controls">
      <h1>Playground</h1>
      <input 
        type="text"
        placeholder="person id"
        value="4"
        @keyup="async (e) => {
          // const p = await Person.get(parseInt((e.target! as HTMLInputElement).value));
          // person = p;
          const o = await Organization.get(parseInt((e.target! as HTMLInputElement).value));
          organization = o;
        }"
        autofocus
      />
      <input type="button" :value="edit ? 'Stop' : 'Edit'" @click="edit=!edit" />
    </div>
    <!-- <div>
      <PersonBanner 
        :person="person" 
        socials
        :edit="edit"
      />
      <OrganizationBanner
        :organization="organization"
        socials
        :edit="edit"
      />
    </div> -->
    <div class="netw-wrapper">
      <!-- <PersonNetworkNew
        :person="person"
        show-memberships
      />
      <OrganizationNetwork
        :organization="organization"
        cytoscape
      /> -->
      <BaseMap />
    </div>
    <!-- <div class="details-wrapper gp-scroll">
      <PersonDetails
        :person="person"
        :edit="edit"
      >
      </PersonDetails>
      <OrganizationDetails
        :organization="organization"
        :edit="edit"
      /> -->
    <!-- </div> -->
  </div>
</template>

<style scoped>
.playground {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.controls {
  background-color: var(--color-border);
  padding: 1em;
  margin-bottom: 1em;
}

.controls input {
  padding: .5em;
  font-size: 1em;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: .5em;
  background-color: var(--color-background);
  color: var(--color-text);
  margin-top: .5em;
}

.controls input:focus {
  outline: none;
}

.netw-wrapper {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.details-wrapper {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  overflow: auto;
  padding: 1em;
}
</style>
