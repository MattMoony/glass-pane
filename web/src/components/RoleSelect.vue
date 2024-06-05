<script setup lang="ts">
import { ref, type Ref } from 'vue';

import Role from '@/models/Role';

import Autocomplete from '@/components/Autocomplete.vue';

const props = defineProps<{
  /**
   * The role to display in the select.
   */
  initRole?: Role;
}>();
const emits = defineEmits<{
  /**
   * Emitted when a role is selected.
   */
  (e: 'select', role: Role): void;
}>();

const qry: Ref<string> = ref('');
const selectedRole: Ref<Role|null> = ref(props.initRole || null);

const queryRoles = async (query: string): Promise<Role[]> => {
  if (!query.trim()) return [];
  return Role.search(query);
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
  <Autocomplete
    label="Role"
    :init-model="selectedRole"
    :search="queryRoles"
    @select="o => emits('select', o as Role)"
  />
</template>

<style scoped>
</style>