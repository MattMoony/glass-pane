<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';

import { useUserStore } from '@/stores/user';

const drawer: Ref<boolean> = ref(true);
const user = useUserStore();
</script>

<template>
  <v-layout>
    <v-app-bar
      :style="{
        'box-shadow': 'none',
        'border-bottom': '4px solid var(--color-border)'
      }"
    >
      <template v-slot:prepend>
        <router-link class="logo-wrap" to="/">
          <img class="logo" src="/pane.png" alt="Glass Pane Logo" />
        </router-link>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      permanent
      :style="{
        'border-right': '4px solid var(--color-border)',
      }"
    >
      <v-divider></v-divider>
      <v-list nav>
        <v-list-item
          prepend-icon="fas fa-person"
        >
          New person
        </v-list-item>
        <v-list-item
          prepend-icon="fas fa-building"
        >
          New organization
        </v-list-item>
        <v-list-item
          prepend-icon="fas fa-calendar"
        >
          New event
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
    </v-navigation-drawer>
  </v-layout>
</template>

<style scoped>
.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  padding: .8em;
}

.logo {
  width: auto;
  height: 100%;
}
</style>
