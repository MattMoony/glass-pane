<script setup lang="ts">

import type { OrganSource } from '@/api/organ';
import Organ from '@/models/Organ';
import { ref, watch, type Ref } from 'vue';

const props = defineProps<{
  /**
   * The organ whose bio to display.
   */
  organ: Organ|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
  /**
   * If you want to receive updated sources.
   */
  updatedSources?: OrganSource[];
}>();

const sources: Ref<OrganSource[]> = ref([]);
const newSource: Ref<string> = ref('');

  const addSource = async () => {
  if (!newSource.value.trim()) return;
  if (!props.updatedSources) {
    const source = await props.organ?.sources.add(newSource.value);
    if (source) {
      sources.value.push(source);
      newSource.value = '';
    }
  } else {
    props.updatedSources.push({ sid: -props.updatedSources.length, url: newSource.value, });
    newSource.value = '';
  }
};

const updateSource = async (source: OrganSource) => {
  if (!source.url.trim()) return;
  if (!props.updatedSources) {
    await props.organ?.sources.update(source.sid, source.url);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources[index].url = source.url;
    }
  }
};

const removeSource = async (source: OrganSource) => {
  if (!props.updatedSources) {
    await props.organ?.sources.remove(source.sid);
    sources.value = sources.value.filter(s => s.sid !== source.sid);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources.splice(index, 1);
    }
  }
};

watch(() => props.organ, async () => {
  if (!props.organ) return;
  sources.value = await props.organ.sources.get();
}, { immediate: true, });
</script>

<template>
  <div class="sources">
    <ul v-if="edit || (sources && sources.length)">
      <li v-for="source in updatedSources||sources" :key="source.sid">
        <a 
          v-if="!edit"
          :href="source.url" 
          target="_blank"
        >{{ source.url }}</a>
        <div v-else>
          <input v-model="source.url" />
          <button @click="updateSource(source)">
            <font-awesome-icon icon="save" />
          </button>
          <button @click="removeSource(source)">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </li>
      <li v-if="edit">
        <div>
          <input 
            v-model="newSource"
            @keyup="e => e.key === 'Enter' && addSource()"
          />
          <button @click="addSource">
            <font-awesome-icon icon="plus" />
          </button>
        </div>
      </li>
    </ul>
    <i v-else>No sources yet.</i>
  </div>
</template>

<style scoped>
.sources {
  word-wrap: break-word;
}

ul {
  padding: 0 1.2em;
}

a {
  color: var(--color-text);
}

li > div {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .3em;
}

input,
button {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

button {
  width: auto;
  cursor: pointer;
}

input:focus,
button:focus {
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
