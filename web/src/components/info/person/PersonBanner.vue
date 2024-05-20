<script setup lang="ts">
import { ref, type Ref } from 'vue';

import Person from '@/models/Person';

import OrganBanner from '@/components/info/OrganBanner.vue';

const props = defineProps<{
  /**
   * The person to display in the banner.
   */
  person: Person|null;
  /**
   * Whether to show social media links.
   */
  socials?: boolean;
  /**
   * Whether to show the banner in a small size.
   */
  small?: boolean;
  /**
   * Whether to show the banner in an extra small size.
   */
  extraSmall?: boolean;
  /**
   * Whether to allow editing the person.
   */
  edit?: boolean;
  /**
   * Updates to export to the parent.
   */
  updated?: {
    /**
     * If the image shouldn't be updated automatically,
     * but exported to the parent component.
     */
    pic?: File;
  }
}>();
const emits = defineEmits<{
  /**
   * Emitted when the person changes.
   */
  (e: 'change', person: Person): void;
}>();

// mock for now
const socials: Ref<{[name: string]: string[]}> = ref({
  phone: [ '+1234567890', ],
  email: [ 'test@asdf.com', 'second@asdf.com', ],
  facebook: [ 'https://facebook.com/test', ],
  instagram: [ 'https://instagram.com/test', ],
  twitter: [ 'https://twitter.com/test', ],
  telegram: [ 'https://t.me/test', ],
  linkedin: [ 'https://linkedin.com/test', ],
  xing: [ 'https://xing.com/test', ],
  youtube: [ 'https://youtube.com/test', ],
  tiktok: [ 'https://tiktok.com/test', ],
  website: [ 'https://test.com', 'https://another.com', ],
  other: [ 'https://other.com', ],
});
</script>

<template>
  <OrganBanner
    :organ="person"
    :name="person ? person.firstname + ' ' + person.lastname : ''"
    :from="person?.birthdate"
    :to="person?.deathdate"
    :socials="socials"
    :showSocials="props.socials"
    :small="props.small"
    :extraSmall="props.extraSmall"
    :edit="props.edit"
    :updated="props.updated"
    @change="newPerson => $emit('change', newPerson as Person)"
  />
</template>

<style scoped>

</style>