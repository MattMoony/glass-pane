<script setup lang="ts">
import { ref, useSlots, watch } from 'vue';
import wtf from 'wtf_wikipedia';
// @ts-ignore
import wtfhtml from 'wtf-plugin-html';

import Organ from '@/models/Organ';

import OrganBio from '@/components/info/details/OrganBio.vue';
import OrganMemberships from '@/components/info/details/OrganMemberships.vue';
import OrganSources from '@/components/info/details/OrganSources.vue';
import OrganSocials from '@/components/info/details/OrganSocials.vue';

wtf.extend(wtfhtml);

const props = defineProps<{
  /**
   * The organ to display.
   */
  organ: Organ|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
  /**
   * Hide the bio?
   */
  hideBio?: boolean;
  /**
   * Hide external bios?
   */
  hideExternalBios?: boolean;
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
}>();

const slots = useSlots();
const bioSaving = ref(false);
const extBioTab = ref(0);
const extBios = ref<{ [name: string]: string, }>({});

watch(
  () => props.organ,
  async () => {
    if (!props.organ) return;
    extBios.value = {};
    extBioTab.value = 0;
    const sources = await props.organ.sources.get();
    sources.forEach(s => {
      if (s.url.match(/https:\/\/(?:\w*\.)wikipedia\.org\//)) {
        const u = new URL(s.url);
        wtf.fetch(s.url, {}, (err, doc) => {
          if (err) return;
          // @ts-ignore
          const bio = doc?.sections()[0].text();
          if (bio) extBios.value[u.hostname] = bio;
        });
      }
    });
  },
  { immediate: true, },
);
</script>

<template>
  <section v-if="organ" :class="[edit ? 'edit' : '']">
    <div v-if="!hideBio">
      <h2>
        Biography
        <span class="bio-saving" v-if="bioSaving">
          saving...
        </span>
      </h2>
      <OrganBio 
        #bio 
        :organ="organ"
        :edit="edit"
        @start-saving="bioSaving = true"
        @end-saving="bioSaving = false"
      />
    </div>
    <div v-if="!hideExternalBios && Object.keys(extBios).length">
      <h2>External Bios</h2>
      <div class="details-ext-bio-wrapper gp-scroll">
        <v-card
          variant="flat"
        >
          <v-tabs
            v-model="extBioTab"
            align-tabs="start"
            mandatory
          >
            <v-tab 
              v-for="(bio, name, i) in extBios" 
              :value="i"
            >
              {{ name }}
            </v-tab>
          </v-tabs>
          <v-tabs-window
            v-model="extBioTab"
          >
            <v-tabs-window-item 
              v-for="(bio, name, i) in extBios" 
              :value="i"
            >
              <v-container fluid>
                <div class="details-ext-bio-content">
                  {{ bio }}
                </div>
              </v-container>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </div>
    </div>
    <div v-if="!hideMemberships">
      <h2>Memberships</h2>
      <OrganMemberships
        #memberships
        :organ="organ"
        :edit="edit"
      />
    </div>
    <slot 
      v-for="(_, name) in slots" 
      :name="name"
    />
    <div v-if="!hideSources">
      <h2>Sources</h2>
      <OrganSources
        #sources
        :organ="organ"
        :edit="edit"
      />
    </div>
    <div v-if="!hideSocials">
      <h2>Social Media</h2>
      <OrganSocials
        #socials
        :organ="organ"
        :edit="edit"
      />
    </div>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

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

.details-ext-bio-wrapper {
  max-height: 80vh;
}

.details-ext-bio-content {
  color: var(--color-text);
}
</style>
