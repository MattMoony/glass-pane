<script setup lang="ts">
import Person from '../models/Person';
import Organization from '../models/Organization';
import Membership from '../models/Membership';

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
}>();

</script>

<template>
  <div 
    class="membership-info"
    v-if="membership"  
  >
    <div 
      v-if="!organMembership"
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
        <span class="role">
          {{ membership.role.name }}
        </span>
        @
        <span 
          v-if="!organizationMembers"
          class="organization"
        >
          {{ membership.organization.name }}
        </span>
      </h3>
      <div class="dates">
        <span class="start">
          {{ new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', }).format(membership.since) }}
        </span>
        -
        <span class="end">
          {{ membership.until ? membership.until : 'Present' }}
        </span>
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
</style>