<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import cytoscape from 'cytoscape';
// @ts-ignore
import cola from 'cytoscape-cola';
import fcose from 'cytoscape-fcose';
import avsdf from 'cytoscape-avsdf';
import euler from 'cytoscape-euler';
// @ts-ignore
import spread from 'cytoscape-spread';
// @ts-ignore
import BounceLoader from 'vue-spinner/src/BounceLoader.vue';

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
  groupMembers,
  groupMemberships,
  groupRelations,
  GRAPH_STYLE,
} from '@/lib/cytoscape';
import { useRouter } from 'vue-router';

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
  /**
   * The layout algorithm to
   * use for the graph.
   */
  layout?: 'cola'|'fcose'|'avsdf'|'euler'|'spread';
}>();

const router = useRouter();
const cy = ref<cytoscape.Core>();
const container = ref<HTMLDivElement>();
const nodes: Ref<(PersonNode|OrganizationNode)[][]> = ref([]);
const edges: Ref<(RelationEdge|MembershipEdge)[][]> = ref([]);
const distance: Ref<number> = ref(1);
const loading: Ref<boolean> = ref(true);

cytoscape.use(cola);
cytoscape.use(fcose);
cytoscape.use(avsdf);
cytoscape.use(euler);
cytoscape.use(spread);

const layoutConfigs = {
  cola: {
    name: 'cola',
    nodeDimensionsIncludeLabels: true,
  },
  fcose: {
    name: 'fcose',
    nodeDimensionsIncludeLabels: true,
    packComponents: true,
  },
  avsdf: {
    name: 'avsdf',
  },
  euler: {
    name: 'euler',
  },
  spread: {
    name: 'spread',
    prelayout: {
      name: 'fcose',
    },
  },
};

const refreshData = async () => {
  if (props.organ instanceof Person)
    nodes.value[0] = [new PersonNode(props.organ, undefined, true),];
  else if (props.organ instanceof Organization)
    nodes.value[0] = [new OrganizationNode(props.organ, undefined, true),];

  nodes.value[1] = [];
  edges.value[1] = [];
  const memberships = groupMemberships(props.memberships || []);
  nodes.value[1].push(...memberships[0]);
  edges.value[1].push(...memberships[1]);
  const members = groupMembers(props.members || []);
  nodes.value[1].push(...members[0]);
  edges.value[1].push(...members[1]);
  const relations = groupRelations(props.relations || [], props.organ as Person)
  nodes.value[1].push(...relations[0]);
  edges.value[1].push(...relations[1]);
};

const refreshLayout = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // max loading ...
    window.setTimeout(() => resolve(), 2000);
    cy.value?.layout({
      ...layoutConfigs[props.layout || 'fcose'],
      stop: () => {
        resolve();
      },
    }).run()
  });
}

const refresh = async () => {
  if (!cy.value) return;
  loading.value = true;
  cy.value.elements().remove();
  
  await refreshData();
  for (const n of nodes.value.flat()) {
    if (cy.value.getElementById(n.data.id).length) continue;
    cy.value.add(n);
  }
  for (const e of edges.value.flat()) {
    if (cy.value.getElementById(e.data.id).length) continue;
    cy.value.add(e);
  }
  await refreshLayout();
};

const refreshDeep = async (
  depth: number,
  maxDepth: number,
  prevNodes: (PersonNode|OrganizationNode)[],
) => {
  if (!cy.value || depth - 2 < 0 || depth > maxDepth) return;

  nodes.value[depth] = [];
  edges.value[depth] = [];

  await Promise.all(prevNodes.map(async n => {
    // ignore parent nodes
    if (!(n instanceof Person || n instanceof Organization)) return;

    const memberships = groupMemberships(
      (await n.memberships.get())
      .filter(m => !nodes.value[depth-2].find(p => p.id === m.organization.id)),
      prevNodes
    );
    nodes.value[depth].push(...memberships[0]);
    edges.value[depth].push(...memberships[1]);

    if (n instanceof Person) {
      const relations = groupRelations(
        (await n.relations.get())
        .filter(r => !nodes.value[depth-2].find(p => p.id === r.other.id)),
        n as Person,
        prevNodes
      );
      nodes.value[depth].push(...relations[0]);
      edges.value[depth].push(...relations[1]);
    } 
    else if (n instanceof Organization) {
      const members = groupMembers(
        (await n.members.get())
        .filter(m => !nodes.value[depth-2].find(p => p.id === m.organ.id)),
        prevNodes
      );
      nodes.value[depth].push(...members[0]);
      edges.value[depth].push(...members[1]);
    }
  }));
  for (const n of nodes.value[depth]) {
    if (cy.value.getElementById(n.data.id).length) continue;
    cy.value.add(n);
  }
  for (const e of edges.value[depth]) {
    if (cy.value.getElementById(e.data.id).length) continue;
    cy.value.add(e);
  }

  await refreshDeep(depth+1, maxDepth, nodes.value[depth]);
};

onMounted(async () => {
  loading.value = true;
  cy.value = cytoscape({
    container: container.value,
    ...GRAPH_STYLE,
  });
  cy.value.on('mouseover', 'node', e => {
    const edges = e.target.connectedEdges();
    cy.value!.elements().difference(edges.union(edges.connectedNodes())).addClass('semitransp');
    edges.addClass('highlight').connectedNodes().addClass('highlight');
  });
  cy.value.on('mouseout', 'node', e => {
    const edges = e.target.connectedEdges();
    cy.value!.elements().removeClass('semitransp');
    edges.removeClass('highlight').connectedNodes().removeClass('highlight');
  });
  cy.value.on('click', 'node', e => {
    const node = e.target;
    if (node.data().type === 'person') {
      router.push(`/p/${node.data().id}`);
    } else if (node.data().type === 'organization') {
      router.push(`/o/${node.data().id}`);
    }
  });
  await refresh();
  loading.value = false;
});

watch(
  distance,
  async () => {
    loading.value = true;
    nodes.value.splice(+distance.value);
    edges.value.splice(+distance.value);
    await refreshDeep(
      nodes.value.length, 
      +distance.value, 
      nodes.value[+distance.value-1]
    );
    await refresh();
    loading.value = false;
  }
)

watch(
  // @ts-ignore
  () => [
    props.organ, 
    props.organ?._vref, 
    props.memberships, 
    props.members, 
    props.relations,
  ], 
  async () => {
    loading.value = true;
    await refresh();
    loading.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <div class="controls">
    <label for="distance">Distance</label>
    <span>{{ distance }}</span>
    <input id="distance" v-model="distance" type="range" min="1" max="3" step="1" />
  </div>
  <div
    ref="container"
    class="container"
  >
  </div>
  <div :class="['loading', loading ? '' : 'hidden']">
    <BounceLoader color="#fff" />
    Loading ...
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: .5em;
  gap: 1em;
  border-bottom: 2px dashed var(--color-border);
  z-index: 98;
  backdrop-filter: blur(10px);
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: 2em;
  color: var(--color-text);
  z-index: 99;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .2em;
}

.loading.hidden {
  display: none;
}
</style>
