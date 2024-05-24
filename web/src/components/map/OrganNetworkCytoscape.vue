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
    nodes.value[0] = [new PersonNode(props.organ),];
  else if (props.organ instanceof Organization)
    nodes.value[0] = [new OrganizationNode(props.organ),];

  nodes.value[1] = [];
  edges.value[1] = [];
  // props.memberships?.forEach((m) => {
  //   nodes.value[1].push(new OrganizationNode(m.organization));
  //   edges.value[1].push(new MembershipEdge(m));
  // });
  const memberships = groupMemberships(props.memberships || []);
  nodes.value[1].push(...memberships[0]);
  edges.value[1].push(...memberships[1]);
  // props.members?.forEach((m) => {
  //   nodes.value[1].push(
  //     m.organ instanceof Person
  //     ? new PersonNode(m.organ)
  //     : new OrganizationNode(m.organ as Organization),
  //   );
  //   edges.value[1].push(new MembershipEdge(m));
  // });
  const members = groupMembers(props.members || []);
  nodes.value[1].push(...members[0]);
  edges.value[1].push(...members[1]);
  // props.relations?.forEach((r) => {
  //   nodes.value[1].push(new PersonNode(r.other));
  //   edges.value[1].push(new RelationEdge(r, props.organ as Person));
  // });
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

  for (const n of prevNodes) {
    const memberships = await Membership.get(new Organ(n.id, n.bio));
    for (const m of memberships) {
      if (nodes.value[depth-2].find((p) => p.id === m.organization.id)) continue;
      nodes.value[depth].push(new OrganizationNode(m.organization));
      edges.value[depth].push(new MembershipEdge(m));
    }
    
    if (n instanceof Person) {
      const relations = await n.relations.get();
      for (const r of relations) {
        if (nodes.value[depth-2].find((p) => p.id === r.other.id)) continue;
        nodes.value[depth].push(new PersonNode(r.other));
        edges.value[depth].push(new RelationEdge(r, n));
      }
    } 
    else if (n instanceof Organization) {
      const members = await Membership.get(n);
      for (const m of members) {
        if (nodes.value[depth-2].find((p) => p.id === m.organ.id)) continue;
        nodes.value[depth].push(
          m.organ instanceof Person
          ? new PersonNode(m.organ)
          : new OrganizationNode(m.organ as Organization),
        );
        edges.value[depth].push(new MembershipEdge(m));
      }
    }
  }
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
    wheelSensitivity: .1,
    style: [
      {
        selector: 'node[type]',
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
      {
        selector: 'node:parent',
        css: {
          'content': 'data(label)',
          'color': 'data(color)',
          'font-size': '.5em',
          'background-opacity': 0.2,
          'background-color': 'data(color)',
          'border-color': 'data(color)',
        },
      },
      {
        selector: 'node.highlight',
        style: {
        },
      },
      {
        selector: 'node.semitransp',
        style: {
          opacity: .5,
        },
      },
      {
        selector: 'edge',
        style: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          "line-color": 'data(color)',
          "target-arrow-color": 'data(color)',
          "font-size": ".6em",
          width: "1.5px",
          "text-rotation": "autorotate",
        },
      },
      {
        selector: 'edge[label]',
        style: {
          content: 'data(label)',
        },
      },
      {
        selector: 'edge.highlight',
        style: {
        },
      },
      {
        selector: 'edge.semitransp',
        style: {
          opacity: .2,
        },
      },
    ],
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
