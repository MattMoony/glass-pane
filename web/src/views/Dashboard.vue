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
      <template v-slot:title>
        <v-btn
          icon="fas fa-bars"
          @click="drawer = !drawer"
        >
        </v-btn>
      </template>
      <template v-slot:append>
        <a class="github" href="//github.com/MattMoony/glass-pane">
          <font-awesome-icon icon="fa-brands fa-github" />
        </a>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :style="{
        'border-right': '4px solid var(--color-border)',
      }"
      class="drawer"
      temporary
    >
      <v-list nav>
        <v-list-item
          prepend-icon="fas fa-home"
        >
          <router-link
            to="/dashboard"
          >  
            Dashboard
          </router-link>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list nav>
        <v-list-item
          prepend-icon="fas fa-person"
        >
          <router-link
            to="/dashboard/new-person"
          >
            New person
          </router-link>
        </v-list-item>
        <v-list-item
          prepend-icon="fas fa-building"
        >
          <router-link
            to="/dashboard/new-organization"
          >
            New organization
          </router-link>
        </v-list-item>
        <v-list-item
          prepend-icon="fas fa-calendar"
        >
          <router-link
            to="/dashboard/new-event"
          >
            New event
          </router-link>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </v-navigation-drawer>
   
    <v-main>
      <div class="gp-scroll router-container">
        <router-view />
      </div>
    </v-main>
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

.drawer a {
  text-decoration: none;
  color: var(--color-text);
}

.router-container {
  padding: 2em;
}

.github {
  font-size: 2em;
  color: var(--color-text);
  text-decoration: none;
  padding: 0 .5em;
}
</style>
