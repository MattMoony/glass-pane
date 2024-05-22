<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';

import type Person from '@/models/Person';
import type Relation from '@/models/Relation';
import RelationType from '@/models/RelationTypes';

import PersonOneRelations from '@/components/info/details/person/PersonOneRelations.vue';

const props = defineProps<{
  /**
   * The person to display.
   */
  person: Person|null;
  /**
   * Whether to display in edit mode.
   */
  edit?: boolean;
}>();

const parents: Ref<Relation[]> = ref([]);
const romantic: Ref<Relation[]> = ref([]);
const children: Ref<Relation[]> = ref([]);
const friends: Ref<Relation[]> = ref([]);

watch(() => props.person, async () => {
  if (!props.person) return;
  parents.value = await props.person.parents.get();
  romantic.value = await props.person.romantic.get();
  children.value = await props.person.children.get();
  friends.value = await props.person.friends.get();
}, { immediate: true });
</script>

<template>
  <div class="relations">
    <div>
      <h3>Parents</h3>
      <PersonOneRelations
        :person="person"
        :relations="parents"
        :type="RelationType.PARENT"
        :edit="edit"
      />
    </div>
    <div>
      <h3>Romantic</h3>
      <PersonOneRelations
        :person="person"
        :relations="romantic"
        :type="RelationType.ROMANTIC"
        :edit="edit"
      />
    </div>
    <div>
      <h3>Children</h3>
      <PersonOneRelations
        :person="person"
        :relations="children"
        :type="RelationType.CHILD"
        :edit="edit"
      />
    </div>
    <div>
      <h3>Friends</h3>
      <PersonOneRelations
        :person="person"
        :relations="friends"
        :type="RelationType.FRIEND"
        :edit="edit"
      />
    </div>
  </div>
</template>

<style scoped>
.relations {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

h3 {
  background-color: var(--color-background-soft);
  padding: .5em;
  margin-bottom: .5em;
}

.relations > div h3 + * {
  padding: .5em;
}
</style>
