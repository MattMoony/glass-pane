<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';

import Event from '@/models/Event';
import Organ from '@/models/Organ';
import Person from '@/models/Person';
import Organization from '@/models/Organization';

import PersonBanner from '@/components/info/person/PersonBanner.vue';

const props = defineProps<{
  event: Event|null;
}>();

const particpants: Ref<Organ[]> = ref([]);

watch(
  () => props.event,
  async () => {
    if (!props.event) return;
    particpants.value = await props.event.participants();
    console.log(particpants.value);
  },
  { immediate: true },
);
</script>

<template>
  <div class="event-box">
    <template v-if="event">
      <h3>
        {{ event.name }}
      </h3>
      <div>
        {{ event.location?.name }}
      </div>
      <v-expansion-panels>
        <v-expansion-panel>
          <template v-slot:title>
            <div class="participants-title">
              <div class="participant-cnt">
                {{ particpants.length }} participant{{ particpants.length === 1 ? '' : 's' }}
              </div>
              <div class="participant-imgs">
                <img 
                  v-for="participant in particpants"
                  :key="participant.id"
                  :src="participant.pic.src()"
                  :alt="participant.fullName"
                />
              </div>
            </div>
          </template>
          <template v-slot:text>
            <div class="participants">
              <template v-for="participant in particpants">
                <router-link 
                  v-if="(participant instanceof Person)"
                  :to="`/p/${participant.id}`"
                >
                  <PersonBanner
                    :person="participant"
                    small
                  />
                </router-link>
                <router-link
                  v-else-if="(participant instanceof Organization)"
                  :to="`/o/${participant.id}`"
                >
                  <OrganizationBanner
                    :organization="participant"
                    small
                  />
                </router-link>
              </template>
            </div>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
    <template v-else>
      Loading ...
    </template>
  </div>
</template>

<style scoped>
.event-box {
  padding: 1rem;
  background-color: var(--color-background-soft);
}

.event-box h3 {
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.event-box .participants-title {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1rem;
}

.event-box .participant-cnt {
  font-weight: bold;
}

.event-box .participant-imgs {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.event-box .participant-imgs img {
  object-fit: cover;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.participants a {
  text-decoration: none;
  color: var(--color-text);
}
</style>
