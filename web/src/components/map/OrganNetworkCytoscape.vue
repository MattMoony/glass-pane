<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import cytoscape from 'cytoscape';
// @ts-ignore
import cola from 'cytoscape-cola';

import Organ from '@/models/Organ';
import Person from '@/models/Person';
import Relation from '@/models/Relation';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';
import { 
  PersonNode,
  RelationEdge,
  OrganizationNode,
  MembershipEdge,
} from '@/lib/cytoscape';

const props = defineProps<{
  /**
   * The organ to display the network
   * graph for.
   */
  organ: Organ|null;
  /**
   * The relations of the organ.
   */
  relations?: Relation[];
  /**
   * The memberships of the organ.
   */
  memberships?: Membership[];
  /**
   * The members of the organ.
   */
  members?: Membership[];
}>();

const cy = ref<cytoscape.Core>();
const container = ref<HTMLDivElement>();
const nodes = ref<(PersonNode|OrganizationNode)[][]>();
const edges = ref<(RelationEdge|MembershipEdge)[][]>();

cytoscape.use(cola);

const refresh = async (
  [ newOrgan, newVref, newMemberships, newMembers, newRelations, ]: [
    Organ|null, 
    number|null, 
    Membership[]|undefined, 
    Membership[]|undefined, 
    Relation[]|undefined, 
  ],
  oldValues?: [
    Organ|null, 
    number|null, 
    Membership[]|undefined, 
    Membership[]|undefined, 
    Relation[]|undefined, 
  ],
) => {
  let oldOrgan: Organ|null = oldValues ? oldValues[0] : null;
  let oldVref: number|null = oldValues ? oldValues[1] : null;
  let oldMemberships: Membership[] = oldValues ? oldValues[2]||[] : [];
  let oldMembers: Membership[] = oldValues ? oldValues[3]||[] : [];
  let oldRelations: Relation[] = oldValues ? oldValues[4]||[] : [];
  if (!props.organ || !cy.value) return;
  
  if (!oldOrgan) {
    if (newOrgan instanceof Person)
      cy.value.add(new PersonNode(newOrgan as Person));
    else if (newOrgan instanceof Organization)
      cy.value.add(new OrganizationNode(newOrgan as Organization));
  }
  else if (newOrgan !== oldOrgan) {
    cy.value.remove(cy.value.getElementById(oldOrgan.id.toString()));
    if (newOrgan instanceof Person)
      cy.value.add(new PersonNode(newOrgan as Person));
    else if (newOrgan instanceof Organization)
      cy.value.add(new OrganizationNode(newOrgan as Organization));
  }

  for (const membership of oldMemberships) {
    if (!newMemberships?.find(m => m.id === membership.id))
      cy.value.remove(cy.value.getElementById(membership.id.toString()));
  }
  for (const membership of newMemberships || []) {
    if (!oldMemberships.find(m => m.id === membership.id)) {
      cy.value.add(new OrganizationNode(membership.organization));
      cy.value.add(new MembershipEdge(membership));
    }
  }

  for (const member of oldMembers) {
    if (!newMembers?.find(m => m.id === member.id))
      cy.value.remove(cy.value.getElementById(member.id.toString()));
  }
  for (const member of newMembers || []) {
    if (!oldMembers.find(m => m.id === member.id)) {
      cy.value.add(member.organ instanceof Person 
                   ? new PersonNode(member.organ) 
                   : new OrganizationNode(member.organ as Organization));
      cy.value.add(new MembershipEdge(member));
    }
  }

  for (const relation of oldRelations) {
    if (!newRelations?.find(r => r.id === relation.id))
      cy.value.remove(cy.value.getElementById(relation.id.toString()));
  }
  for (const relation of newRelations || []) {
    if (!oldRelations.find(r => r.id === relation.id)) {
      cy.value.add(new RelationEdge(relation, props.organ as Person));
    }
  }

  cy.value.layout({ name: 'cola' }).run();
};

onMounted(() => {
  cy.value = cytoscape({
    container: container.value,
    layout: {
      name: 'cola',
    },
    style: [
      {
        selector: 'node',
        style: {
          content: 'data(label)',
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
          "background-image": 'data(image)',
          "background-repeat": 'no-repeat',
          "background-fit": 'cover',
          "background-color": getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
          "border-color": getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
          "border-width": "1.5px",
          "font-size": ".6em",
        },
      },
    ],
  });
  refresh([
    props.organ, 
    props.organ?._vref.value||null, 
    props.memberships, 
    props.members, 
    props.relations,
  ]);
});

watch(
  // @ts-ignore
  () => [
    props.organ, 
    props.organ?._vref, 
    props.memberships, 
    props.members, 
    props.relations,
  ], 
  refresh,
  { immediate: true },
);
</script>

<template>
  <div
    ref="container"
    class="container"
  >
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
