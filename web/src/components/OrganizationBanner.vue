<script setup lang="ts">
import { ref, type Ref } from 'vue';

import Organization from '../models/Organization';

import OrganBanner from './OrganBanner.vue';

const props = defineProps<{
  /**
   * The organization to display in the banner.
   */
  organization: Organization|null;
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
   * Whether to allow editing the organization.
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
   * Emitted when the organization changes.
   */
  (e: 'change', organization: Organization): void;
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
    :organ="organization"
    :name="organization ? organization.name : ''"
    :from="organization?.established"
    :to="organization?.dissolved"
    :socials="socials"
    :showSocials="props.socials"
    :small="props.small"
    :extraSmall="props.extraSmall"
    :edit="props.edit"
    :updated="props.updated"
    @change="newOrganization => emits('change', newOrganization as Organization)"
  />
</template>

<style scoped>

</style>