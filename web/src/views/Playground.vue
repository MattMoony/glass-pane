<script setup lang="ts">
import { ref } from 'vue';
import Person from '@/models/Person';

import PersonBanner from '@/components/PersonBanner.vue';

const person = ref<Person | null>(null);

(async () => {
  const p = await Person.get(6);
  person.value = p;
})();
</script>

<template>
  <div class="about">
    <div class="controls">
      <h1>Playground</h1>
      <input 
        type="text"
        placeholder="person id"
        @keyup="async (e) => {
          console.log(e.target.value);
          const p = await Person.get(parseInt((e.target! as HTMLInputElement).value));
          console.log(p);
          person = p;
          console.log(person);
        }"
        autofocus
      />
    </div>
    <PersonBanner 
      :person="person" 
      socials
    />
  </div>
</template>

<style scoped>
.about {
  padding: 1em;
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
</style>
