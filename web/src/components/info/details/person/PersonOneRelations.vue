<script setup lang="ts">
import { type Ref, ref, watch } from 'vue';

import Person from '@/models/Person';
import Relation from '@/models/Relation';
import RelationType from '@/models/RelationTypes';
import type Organ from '@/models/Organ';

import RelationInfo from '@/components/info/RelationInfo.vue';
import SelectSearch from '@/components/SelectSearch.vue';

const props = defineProps<{
  /**
   * The person to display.
   */
  person: Person|null;
  /**
   * The relations to display.
   */
  relations: Relation[];
  /**
   * The relation type to display.
   */
  type: RelationType;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const relations: Ref<Relation[]> = ref([]);
const newRelation: Ref<Relation|null> = ref(null);

const addRelation = async () => {
  if (!props.person || !newRelation.value) return;
  await props.person.relations.add(newRelation.value, [ 'none', ]);
  relations.value.push(newRelation.value);
  newRelation.value = null;
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

const updateRelation = async (relation: Relation) => {
  if (!props.person) return;
  await props.person.relations.update(relation);
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeRelation = async (relation: Relation) => {
  if (!props.person) return;
  await props.person.relations.remove(relation);
  relations.value = relations.value.filter(r => r.id !== relation.id);
  // @ts-ignore
  props.person._vref = Math.floor(Math.random() * 1000);
};

watch(() => props.relations, () => {
  relations.value = props.relations;
}, { immediate: true });
</script>

<template>
  <div class="relations">
    <template v-if="relations && relations.length">
      <template v-if="!edit">
        <RouterLink
          class="connection-wrapper"
          v-for="relation in relations"
          :key="relation.other.id"
          :to="`/p/${relation.other.id}`"
        >
          <RelationInfo
            :relation="relation"
            show-type
          />
        </RouterLink>
      </template>
      <template v-else>
        <div
          v-for="relation in relations"
          :key="relation.other.id"
        >
          <RelationInfo
            :relation="relation"
            edit
            @change="() => updateRelation(relation)"
          />
          <div class="button-wrapper">
            <button @click="() => removeRelation(relation)">
              <font-awesome-icon icon="trash" />
              Remove
            </button>
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="!edit">
      <i>No known relations.</i>
    </template>

    <template v-if="edit">
      <h4>New Relation</h4>
      <template v-if="!newRelation">
        <SelectSearch
          type="person"
          @select="(organ: Organ) => {
            if (organ)
              newRelation = new Relation(-1, type, organ as Person, new Date());
          }"
        />
      </template>
      <template v-else>
        <RelationInfo
          :relation="newRelation"
          edit
          create
        />
        <div class="button-wrapper">
          <button @click="newRelation = null">
            <font-awesome-icon icon="times" />
            Cancel
          </button>
          <button @click="addRelation">
            <font-awesome-icon icon="plus" />
            Add
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.relations a {
  text-decoration: none;
  color: inherit;
}

button {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
}

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

h4 {
  margin-top: .5em;
  border-bottom: 1px solid var(--color-border);
}
</style>
