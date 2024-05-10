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

const selectedRole: Ref<Role|null> = ref(props.initRole || null);
const suggestions: Ref<Role[]> = ref([]);

const queryRoles = async (query: string, cb: (hasSuggestions: boolean) => void): Promise<void> => {
  suggestions.value = await Role.search(query);
  cb(suggestions.value.length > 0);
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
    </template>
  </Select>
</template>

<style scoped>
.role-suggestion {
  padding: 0.5em;
  cursor: pointer;
}
</style>