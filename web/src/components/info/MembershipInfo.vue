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
   * Whether to hide the role of members.
   */
  hideRole?: boolean;
  /**
   * Whether to allow editing the membership.
   */
  edit?: boolean;
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
        </span>
        <span class="role" v-if="!edit && !hideRole">
          {{ membership.role.name }}
        </span>
        <span class="role" v-else-if="!hideRole">
          <RoleSelect
            :init-role="membership.role"
            @select="role => {
              if (membership) {
                membership.role = role;
                $emit('change', membership);
              }
            }"
          />
        </span>
        <span 
          v-if="!organizationMembers"
          class="organization"
        >
          {{ membership.organization.name }}
        </span>
      </h3>
      <div class="dates">
        <span 
          class="start"
          v-if="!edit"
        >
          {{
            membership.since 
            ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(membership.since)
            : 'unknown'
          }}
        </span>
        <input
          v-else
          type="date"
          :value="membership.since ? membership.since.toISOString().split('T')[0] : ''"
          @change="e => {
            if (!membership) return;
            const v = (e.target as HTMLInputElement).value;
            if (!v) {
              membership.since = null;
              $emit('change', membership);
              return;
            }
            const d = new Date(v);
            if (!isNaN(d.getTime())) {
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
            : 'present' 
          }}
        </span>
        <input
          v-else
          type="date"
          :value="membership.until ? membership.until.toISOString().split('T')[0] : ''"
          @change="e => {
            if (!membership) return;
            const v = (e.target as HTMLInputElement).value;
            if (!v) {
              membership.until = null;
              $emit('change', membership);
              return;
            }
            const d = new Date(v);
            if (!isNaN(d.getTime())) {
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
  flex-wrap: wrap;
}

.membership-details.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.membership-details h3 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: .5em;
}

.role {
  display: inline-block;
  background-color: var(--color-background-soft);
  padding: .3em .5em;
  font-size: .9em;
  font-weight: normal;
}

.dates {
  margin: .2em 0;
  font-size: .9em;
  padding: .3em 0;
}

.edit .dates {
  margin: .5em 0;
}

.pic img {
  object-fit: cover;
  width: 4em;
  height: 4em;
}

.edit input {
  padding: .5em;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: none;
}

@media only screen and (max-width: 600px) {
  .membership-info {
    flex-direction: column-reverse;
    align-items: center;
    gap: 1rem;
  }

  .membership-details h3 {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: .5em;
    font-size: 1em;
    font-weight: bold;
  }

  .dates {
    text-align: center;
  }

  .pic img {
    width: 6em;
    height: 6em;
  }
}
</style>