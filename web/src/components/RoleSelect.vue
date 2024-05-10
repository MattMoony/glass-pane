<script setup lang="ts">
import Role from '@/models/Role';

import Select from './Select.vue';
import { ref, type Ref } from 'vue';

const props = defineProps<{
  /**
   * The role to display in the select.
   */
  initRole?: Role;
  /**
   * Don't display inline.
   */
  notInline?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a role is selected.
   */
  (e: 'select', role: Role): void;
}>();

const qry: Ref<string> = ref('');
const selectedRole: Ref<Role|null> = ref(props.initRole || null);
const suggestions: Ref<Role[]> = ref([]);

const queryRoles = async (query: string, cb: (hasSuggestions: boolean) => void): Promise<void> => {
  if (!query.trim()) cb(false);
  suggestions.value = await Role.search(query);
  qry.value = query.trim();
  cb(true);
};

const createRole = async () => {
  if (!qry.value.trim()) return;
  const role = await Role.create(qry.value);
  if (role) {
    selectedRole.value = role;
    emits('select', role);
  }
};
</script>

<template>
  <Select
    placeholder="Role ..."
    :inline="!notInline"
    @query="queryRoles"
  >
    <template #initResult>
      <span v-if="selectedRole">{{ selectedRole.name }}</span>
    </template>
    <template #suggestions>
      <section v-if="suggestions.length">
        <div
          v-for="role in suggestions" 
          :key="role.id"
          class="role-suggestion"
          @click="() => {
            selectedRole = role;
            $emit('select', role);
          }"
        >
          {{ role.name }}
        </div>
      </section>
      <section v-if="qry">
        <button 
          class="role-suggestion"
          @click="createRole"
        >
          <font-awesome-icon icon="plus" />
          Create "{{ qry }}"
        </button>
      </section>
    </template>
  </Select>
</template>

<style scoped>
.role-suggestion {
  padding: 0.5em;
  cursor: pointer;
}

button {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-text);
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 1em;
}
</style>