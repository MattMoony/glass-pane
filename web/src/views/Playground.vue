<script setup lang="ts">
import { ref } from 'vue';
import Person from '@/models/Person';

import PersonBanner from '@/components/PersonBanner.vue';
import PersonNetworkNew from '@/components/PersonNetworkNew.vue';

const person = ref<Person | null>(null);

(async () => {
  const p = await Person.get(6);
  person.value = p;
})();

window.Person = Person;
</script>

<template>
  <div class="playground">
    <div class="controls">
      <h1>Playground</h1>
      <input 
        type="text"
        placeholder="person id"
        @keyup="async (e) => {
          const p = await Person.get(parseInt((e.target! as HTMLInputElement).value));
          person = p;
        }"
        autofocus
      />
    </div>
    <div>
      <PersonBanner 
        :person="person" 
        socials
      />
    </div>
    <div class="netw-wrapper">
      <PersonNetworkNew
        :person="person"
      />
    </div>
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
}
</style>
