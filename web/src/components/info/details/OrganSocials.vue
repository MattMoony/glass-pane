<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import type { OrganSocials } from '@/api/organ';
import * as lib from '@/lib/socials';
import Organ from '@/models/Organ';
import SocialsPlatforms, { icons } from '@/models/SocialsPlatform';

const props = defineProps<{
  /**
   * The organ whose bio to display.
   */
  organ: Organ|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const socials: Ref<OrganSocials[]> = ref([]);
const newSocial: Ref<OrganSocials> = ref({ id: -1, platform: SocialsPlatforms.OTHER, url: '', });

const addSocial = async () => {
  if (!newSocial.value.url.trim()) return;
  const res = await props.organ?.socials.add(+newSocial.value.platform, newSocial.value.url);
  if (!res) return;
  socials.value.push(res);
  newSocial.value = { id: -1, platform: SocialsPlatforms.OTHER, url: '', };
};

const updateSocial = async (social: OrganSocials) => {
  if (!social.url.trim()) return;
  social.platform = +social.platform;
  await props.organ?.socials.update(social.id, social.platform, social.url);
};

const removeSocial = async (social: OrganSocials) => {
  await props.organ?.socials.remove(social.id);
  socials.value = socials.value.filter(s => s.id !== social.id);
};

watch(() => props.organ, async () => {
  if (!props.organ) return;
  socials.value = await props.organ.socials.get();
}, { immediate: true, });
</script>

<template>
  <div class="socials">
    <ul>
      <li v-for="social in socials" :key="social.id">
        <a 
          v-if="!edit"
          :href="social.url"
          target="_blank"
        >
          <font-awesome-icon :icon="icons[social.platform].icon" />
          <span>{{ social.url }}</span>
        </a>
        <div v-else>
          <font-awesome-icon :icon="icons[social.platform].icon" />
          <input v-model="social.url" />
          <button @click="updateSocial(social)">
            <font-awesome-icon icon="save" />
          </button>
          <button @click="removeSocial(social)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </li>
      <li v-if="edit">
        <div>
          <select
            v-model="newSocial.platform"
          >
            <option 
              v-for="icon in Object.keys(icons)" 
              :value="icon"
            >
              {{ icons[icon].title }}
            </option>
          </select>
          <input 
            v-model="newSocial.url" 
            @keyup="e => e.key === 'Enter' ? addSocial() : (newSocial.platform = lib.recognize_platform(newSocial.url))"
          />
          <button @click="addSocial">
            <font-awesome-icon icon="plus" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.socials {
  word-wrap: break-word;
}

ul {
  padding: 0 1.2em;
}

a {
  color: var(--color-text);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .3em;
}

li > div {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .3em;
}

li > div > svg {
  width: 2em;
}

input,
button,
select {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

button,
select {
  width: auto;
  cursor: pointer;
}

input:focus,
button:focus,
select:focus {
  outline: none
}

.button-wrapper {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .4em;
  margin-top: .4em;
}
</style>
