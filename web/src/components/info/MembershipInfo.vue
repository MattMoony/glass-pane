<script setup lang="ts">
import Person from '@/models/Person';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';

import RoleSelect from '@/components/RoleSelect.vue';

const props = defineProps<{
  /**
   * The membership to display in the details.
   */
  membership: Membership|null;
  /**
   * Whether to show from the organ's perspective.
   */
  organMembership?: boolean;
  /**
   * Whether to show from the organization's perspective.
   */
  organizationMembers?: boolean;
  /**
   * Whether to allow editing the membership.
   */
  edit?: boolean;
  /**
   * Whether to use this for creating a new membership.
   */
  create?: boolean;
}>();
const emits = defineEmits<{
  /**
   * Emitted when the membership is updated.
   */
  (e: 'change', membership: Membership): void;
}>();

</script>

<template>
  <div 
    :class="['membership-info', edit ? 'edit' : '']"
    v-if="membership"  
  >
    <div 
      v-if="!organMembership && !organizationMembers"
      class="pic"
    >
      <img
        :src="membership.organ.pic.src()" 
        alt="Organ member"
      />
    </div>
    <div 
      :class="['membership-details', !organMembership && !organizationMembers ? 'centered' : '']"
    >
      <h3>
        <span 
          v-if="!organMembership"
          class="organ"
        >
          {{ 
            membership.organ instanceof Person 
            ? (membership.organ as Person).firstname + ' ' + (membership.organ as Person).lastname
            : (membership.organ as Organization).name 
          }}
          :
        </span>
        <span class="role" v-if="!create">
          {{ membership.role.name }}
        </span>
        <RoleSelect
          v-else
          @select="role => {
            if (membership) {
              membership.role = role;
              $emit('change', membership);
            }
          }"
        />
        <span 
          v-if="!organizationMembers"
          class="organization"
        >
          @
          {{ membership.organization.name }}
        </span>
      </h3>
      <div class="dates">
        <span 
          class="start"
          v-if="!create"
        >
          {{ new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(membership.since) }}
        </span>
        <input
          v-else
          type="date"
          :value="membership.since ? membership.since.toISOString().split('T')[0] : ''"
          @change="e => {
            const d = new Date((e.target as HTMLInputElement).value);
            if (!isNaN(d.getTime()) && membership) {
              membership.since = d;
              $emit('change', membership);
            }
          }"
        />
        -
        <span 
          class="end"
          v-if="!edit"
        >
          {{ 
            membership.until 
            ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(membership.until) 
            : 'Present' 
          }}
        </span>
        <input
          v-else
          type="date"
          :value="membership.until ? membership.until.toISOString().split('T')[0] : ''"
          @change="e => {
            const d = new Date((e.target as HTMLInputElement).value);
            if (!isNaN(d.getTime()) && membership) {
              membership.until = d;
              $emit('change', membership);
            }
          }"
        />
      </div>
    </div>
    <div class="pic">
      <img 
        v-if="!organizationMembers"
        :src="membership.organization.pic.src()" 
        :alt="membership.organization.name"
      />
      <img 
        v-else
        :src="membership.organ.pic.src()" 
        alt="Organization member"
      />
    </div>
  </div>
</template>

<style scoped>
.membership-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid var(--color-border);
  user-select: none;
}

.membership-details.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.role {
  display: inline-block;
  background-color: var(--color-background-soft);
  padding: .3em .5em;
  border-radius: 5px;
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