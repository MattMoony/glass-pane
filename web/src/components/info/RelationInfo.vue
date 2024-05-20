<script setup lang="ts">
import Relation from '@/models/Relation';
import RelationType from '@/models/RelationTypes';

const props = defineProps<{
  /**
   * The relation to display in the details.
   */
  relation: Relation | null;
  /**
   * Whether to show the relation type.
   */
  showType?: boolean;
  /**
   * Whether to allow editing the relation.
   */
  edit?: boolean;
  /**
   * Whether to use this for creating a new relation.
   */
  create?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when the relation is updated.
   */
  (e: 'change', relation: Relation): void;
}>();

</script>

<template>
  <div 
    :class="['relation-info', edit ? 'edit' : '']"
    v-if="relation"  
  >
    <div class="relation-details">
      <h3>
        <span class="other">
          {{ relation.other.firstname + ' ' + relation.other.lastname }}
        </span>
        <span class="type" v-if="showType">
          ({{ RelationType[relation.type].toString().toLowerCase() }})
        </span>
      </h3>
      <div class="dates">
        <span class="start" v-if="!create">
          {{ new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(relation.since) }}
        </span>
        <input
          v-else
          type="date"
          :value="relation.since ? relation.since.toISOString().split('T')[0] : ''"
          @change="e => {
            const d = new Date((e.target as HTMLInputElement).value);
            if (!isNaN(d.getTime()) && relation) {
              relation.since = d;
              $emit('change', relation);
            }
          }"
        />
        -
        <span class="end" v-if="!edit">
          {{ relation.until 
             ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(relation.until)
             : 'present' }}
        </span>
        <input
          v-else
          type="date"
          :value="relation.until ? relation.until.toISOString().split('T')[0] : ''"
          @change="e => {
            const d = new Date((e.target as HTMLInputElement).value);
            if (!isNaN(d.getTime()) && relation) {
              relation.until = d;
              $emit('change', relation);
            }
          }"
        />
      </div>
    </div>
    <div class="pic">
      <img
        :src="relation.other.pic.src()" 
        alt="Person"
      />
    </div>
  </div>
</template>

<style scoped>
.relation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid var(--color-border);
  user-select: none;
}

.dates {
  margin-top: .2em;
  font-size: .9em;
}

.pic img {
  height: 4em;
}

.edit input {
  padding: .5em;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: none;
}
</style>
