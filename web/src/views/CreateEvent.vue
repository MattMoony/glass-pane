<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

import { API } from '@/api';
import * as api from '@/api/media';

import RoutesNavBar from '@/components/RoutesNavBar.vue';
import MarkdownView from '@/components/MarkdownView.vue';
import LocationPicker from '@/components/map/LocationPicker.vue';

const valid: Ref<boolean> = ref(false);
const name: Ref<string> = ref('');
const desc: Ref<string> = ref('');
const location: Ref<Location|null> = ref(null);

</script>

<template>
  <h1>New event</h1>
  <v-form 
    v-model="valid"
    class="create-form"
  >
    <v-text-field
      v-model="name"
      label="Name"
      required
      :rules="[
        (v: string) => !!v || 'Name is required',
        (v: string) => v.length <= 128 || 'Name must be at most 128 characters'
      ]"
    />
    <MarkdownView
      edit
      :content="desc"
      @save="(content: string) => desc = content"
      @upload-image="async (img: Blob) => `${API}${(await api.upload(img)).url}`"
    />
    <div class="event-location">
      <label>Location</label>
      <LocationPicker
        id="location"
        @picked="(l: Location) => location = l"
      />
    </div>
    <v-btn
      :disabled="!valid"
      size="large"
      block
      prepend-icon="fas fa-plus"
      @click="() => console.log('submit', name, desc, location)"
      variant="tonal"
    >Create</v-btn>
  </v-form>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

main > article {
  flex-grow: 1;
  flex-basis: 0;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
}

main > article > section {
  flex-grow: 1;
  flex-basis: 0;
  padding: 1em;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
  width: 30em;
  max-width: 100%;
}

.create-form {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

.event-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5em;
}
</style>
