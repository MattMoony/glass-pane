<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import User from '@/models/User';
import { useUserStore } from '@/stores/user';

import SearchNavBar from '@/components/SearchNavBar.vue';

const router = useRouter();
const userStore = useUserStore();
const user = ref({ username: '', password: '', });

const signIn = async (e: Event) => {
  e.preventDefault();
  if (!user.value.username.trim() || !user.value.password) return;
  userStore.user = await User.login(user.value.username, user.value.password);
  if (!userStore.user) return;
  router.push('/');
};

</script>

<template>
  <main>
    <SearchNavBar />
    <article class="gp-scroll">
      <section>
        <h1>Login</h1>
        <label for="username">Username</label>
        <input 
          v-model="user.username" 
          id="username" 
          type="text" 
          placeholder="Username" 
          @keyup="e => e.key === 'Enter' && signIn(e)"
        />
        <label for="password">Password</label>
        <input 
          v-model="user.password" 
          id="password" 
          type="password" 
          placeholder="Password"
          @keyup="e => e.key === 'Enter' && signIn(e)"
        />
        <button @click="signIn">
          Sign in
        </button>
      </section>
    </article>
  </main>
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

article {
  padding: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
}

section {
  width: 60vw;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

section h1 {
  font-size: 2em;
}

section label {
  font-size: 1.1em;
}

section input {
  padding: .5em;
  font-size: 1.1em;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

section button {
  width: 100%;
  padding: .8em;
  margin-bottom: 1em;
  background: linear-gradient(to right, var(--color-background-soft) 0%, var(--color-background-soft) 50%, var(--color-background-mute) 50%, var(--color-background-mute) 100%);
  background-size: 200% auto;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.2em;
  cursor: pointer;
}

section input:focus,
section button:focus {
  outline: none;
}
</style>