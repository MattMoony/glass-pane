<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import * as vNG from 'v-network-graph';
import { ForceLayout } from 'v-network-graph/lib/force-layout';
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout';

import Organ from '@/models/Organ';
import Person from '@/models/Person';
import Organization from '@/models/Organization';
import Relation from '@/models/Relation';
import Membership from '@/models/Membership';
import RelationType, { COLORS } from '@/models/RelationTypes';

// @ts-ignore
import BounceLoader from 'vue-spinner/src/BounceLoader.vue';

const router = useRouter();
const props = defineProps<{
  /**
   * The organ to show the network for.
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

class PersonNode extends Person {
  public name: string;
  public color: string;

  public constructor(person: Person, color?: string) {
    super(
      person.id, 
      person.bio, 
      person.firstname, 
      person.lastname, 
      person.birthdate,
      person.deathdate,
    );
    this.name = `${person.firstname} ${person.lastname}${person.birthdate ? '\n*' + person.birthdate.getUTCFullYear() : ''}`;
    this.color = color || getComputedStyle(document.body).getPropertyValue('--color-person');
  }
}

class RelationEdge extends Relation {
  public source: string;
  public target: string;
  public label: string;
  public direction: string;
  public color: string;

  public constructor(relation: Relation, person: Person) {
    super(
      relation.type,
      relation.other,
      relation.since,
      relation.until,
    );

    if (relation.type === RelationType.CHILD) {
      this.source = relation.other.id.toString();
      this.target = person.id.toString();
    } else {
      this.source = person.id.toString();
      this.target = relation.other.id.toString();
    }
    this.direction = 'out';
    this.label = `${RelationType[relation.type].toLowerCase()}${relation.since||relation.until ? (' ('+(relation.since?.getUTCFullYear() ?? '') + '-' + (relation.until?.getUTCFullYear() ?? '')+')') : ''}`;
    this.color = COLORS[relation.type];
  }
}

class OrganizationNode extends Organization {
  public name: string;
  public color: string;

  public constructor(organization: Organization, color?: string) {
    super(
      organization.id,
      organization.bio,
      organization.name,
      organization.established,
      organization.dissolved,
    );
    this.name = `${organization.name}${organization.established ? '\n*' + organization.established.getUTCFullYear() : ''}`;
    this.color = color || getComputedStyle(document.body).getPropertyValue('--color-border');
  }
}

class MembershipEdge extends Membership {
  public source: string;
  public target: string;
  public label: string;
  public direction: string;
  public color: string;

  public constructor(membership: Membership) {
    super(
      membership.organ,
      membership.organization,
      membership.role,
      membership.since,
      membership.until,
    );

    this.source = this.organ.id.toString();
    this.target = this.organization.id.toString();
    this.direction = 'out';
    this.label = `${this.role.name}${membership.since||membership.until ? (' ('+(membership.since?.getUTCFullYear() ?? '') + '-' + (membership.until?.getUTCFullYear() ?? '')+')') : ''}`;
    this.color = getComputedStyle(document.body).getPropertyValue('--color-border');
  }
}

const graph = ref<vNG.VNetworkGraphInstance>();
const nodes: Ref<{[id: string]: PersonNode|OrganizationNode}> = ref({});
const edges: Ref<(RelationEdge|MembershipEdge)[]> = ref([]);
const configs = ref(
  vNG.defineConfigs({
    view: {
      autoPanAndZoomOnLoad: 'center-content',
      layoutHandler: new ForceLayout({
        positionFixedByDrag: true,
        positionFixedByClickWithAltKey: false,
        createSimulation: (d3, nodes, edges) => {
          const forceLink = d3
            .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
            .id((d: ForceNodeDatum) => d.id);
          // Specify your own d3-force parameters
          return d3
            .forceSimulation(nodes)
            .force("edge", forceLink.distance(50).strength(.5))
            .force("charge", d3.forceManyBody().strength(-8_000))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .stop() // tick manually
            .tick(100);
        },
      }),
    },
    node: {
      normal: {
        radius: 30,
        color: node => node.color || getComputedStyle(document.body).getPropertyValue('--color-text'),
      },
      label: {
        color: getComputedStyle(document.body).getPropertyValue('--color-text'),
      },
    },
    edge: {
      normal: {
        color: edge => edge.color || getComputedStyle(document.body).getPropertyValue('--color-border'),
      },
      label: {
        color: getComputedStyle(document.body).getPropertyValue('--color-text'),
      },
      marker: {
        source: {
          type: e => e[0].direction === 'in' ? 'arrow' : 'none',
          width: 8,
          height: 8,
          margin: -1,
          units: 'strokeWidth',
          color: null,
        },
        target: {
          type: e => e[0].direction === 'out' ? 'arrow' : 'none',
          width: 8,
          height: 8,
          margin: -1,
          units: 'strokeWidth',
          color: null,
        },
      },
    },
  })
);
const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    const n = nodes.value[node];
    if (n instanceof PersonNode)
      router.push(`/p/${n.id}`);
    else if (n instanceof OrganizationNode)
      router.push(`/o/${n.id}`);
  },
}
const loading: Ref<boolean> = ref(true);
  
const distance: Ref<number> = ref(1);
const deeperNodes: Ref<{[id: string]: PersonNode|OrganizationNode}[]> = ref([]);
const deeperEdges: Ref<(RelationEdge|MembershipEdge)[][]> = ref([]);

const refreshNodes = async (
  organ: Organ,
  relations: Relation[],
  memberships: Membership[],
  members: Membership[]
) => ({
  [organ.id.toString()]: (
    organ instanceof Person 
    ? new PersonNode(organ as Person) 
    : new OrganizationNode(organ as Organization)),
  ...relations.map(r => ({
    [r.other.id.toString()]: new PersonNode(r.other)
  })).reduce((a, b) => ({ ...a, ...b }), {}),
  ...memberships.map(m => ({
    [m.organization.id.toString()]: new OrganizationNode(m.organization)
  })).reduce((a, b) => ({ ...a, ...b }), {}),
  ...members.map(m => ({
    [m.organ.id.toString()]: (
      m.organ instanceof Person 
      ? new PersonNode(m.organ as Person) 
      : new OrganizationNode(m.organ as Organization)),
  })).reduce((a, b) => ({ ...a, ...b }), {}),
});

const refreshesEdges = async (
  organ: Organ,
  relations: Relation[],
  memberships: Membership[],
  members: Membership[]
) => [
  ...relations.map(r => new RelationEdge(r, (organ as Person))),
  ...memberships.map(m => new MembershipEdge(m)),
  ...members.map(m => new MembershipEdge(m)),
];

const refreshNetwork = async () => {
  loading.value = true;
  if (!props.organ) return;
  nodes.value = {
    ...await refreshNodes(
      props.organ, 
      props.relations||[], 
      props.memberships||[],
      props.members||[]
    ),
    ...deeperNodes.value.slice(2).reduce((a, b) => ({ ...a, ...b }), {}),
  };
  edges.value = [
    ...await refreshesEdges(
      props.organ, 
      props.relations||[], 
      props.memberships||[],
      props.members||[]
    ),
    ...deeperEdges.value.slice(2).reduce((a, b) => [...a, ...b], []),
  ];
  window.setTimeout(() => loading.value=false, 500);
};

const refreshDeepNetwork = async (
  depth: number,
  maxDepth: number,
  nodes: {[id: string]: PersonNode|OrganizationNode},
) => {
  if (depth-2 < 0 || depth > maxDepth) return;
  for (const n of Object.values(nodes)) {
    const memberships = await n.memberships.get();
    deeperNodes.value[depth] = {
      ...deeperNodes.value[depth]||{},
      ...memberships
         .filter(m => !Object.keys(deeperNodes.value[depth-2]).includes(m.organ.id.toString())
                      && !Object.keys(deeperNodes.value[depth-2]).includes(m.organization.id.toString()))
         .map(m => ({
        [(m.organ.id !== n.id ? m.organ.id : m.organization.id).toString()]: (
          m.organ.id !== n.id
          ? (
            m.organ instanceof Person 
            ? new PersonNode(m.organ as Person) 
            : new OrganizationNode(m.organ as Organization)
          )
          : new OrganizationNode(m.organization)
        ),
      })).reduce((a, b) => ({ ...a, ...b }), {}),
    };
    deeperEdges.value[depth] = [
      ...deeperEdges.value[depth]||[],
      ...memberships
         .filter(m => !Object.keys(deeperNodes.value[depth-2]).includes(m.organ.id.toString())
                      && !Object.keys(deeperNodes.value[depth-2]).includes(m.organization.id.toString()))
         .map(m => new MembershipEdge(m)),
    ];
    if (n instanceof PersonNode) {
      const parents = await n.parents.get();
      const romantic = await n.romantic.get();
      const children = await n.children.get();
      const friends = await n.friends.get();
      deeperNodes.value[depth] = {
        ...deeperNodes.value[depth]||{},
        ...([...parents, ...romantic, ...children, ...friends]
            .filter(r => !Object.keys(deeperNodes.value[depth-2]).includes(r.other.id.toString()))
            .map(r => ({
          [r.other.id.toString()]: new PersonNode(r.other),
        })).reduce((a, b) => ({ ...a, ...b }), {})),
      };
      deeperEdges.value[depth] = [
        ...deeperEdges.value[depth]||[],
        ...([...parents, ...romantic, ...children, ...friends]
            .filter(r => !Object.keys(deeperNodes.value[depth-2]).includes(r.other.id.toString()))
            .map(r => new RelationEdge(r, n))
        ),
      ];
    }
    else if (n instanceof OrganizationNode) {
      const members = await n.members.get();
      deeperNodes.value[depth] = {
        ...deeperNodes.value[depth]||{},
        ...members
           .filter(m => !Object.keys(deeperNodes.value[depth-2]).includes(m.organ.id.toString()))
           .map(m => ({
          [m.organ.id.toString()]: (
            m.organ instanceof Person 
            ? new PersonNode(m.organ as Person) 
            : new OrganizationNode(m.organ as Organization)
          ),
        })).reduce((a, b) => ({ ...a, ...b }), {}),
      };
      deeperEdges.value[depth] = [
        ...deeperEdges.value[depth]||[],
        ...members
           .filter(m => !Object.keys(deeperNodes.value[depth-2]).includes(m.organ.id.toString()))
           .map(m => new MembershipEdge(m)),
      ];
    }
  }
  await refreshDeepNetwork(depth+1, maxDepth, deeperNodes.value[depth]);
};

watch(
  distance,
  async () => {
    loading.value = true;
    deeperNodes.value.splice(+distance.value);
    deeperEdges.value.splice(+distance.value);
    await refreshDeepNetwork(+distance.value, +distance.value, deeperNodes.value[distance.value-1]); 
    await refreshNetwork();
  },
);

watch(
  () => [props.organ, props.organ?._vref, props.memberships, props.members, props.relations,], 
  async () => {
    if (!props.organ) return;
    await refreshNetwork();
    deeperNodes.value[0] = { [props.organ.id.toString()]: nodes.value[props.organ.id.toString()], };
    deeperNodes.value[1] = Object.values(nodes.value).filter(n => n.id !== props.organ!.id).reduce((a, b) => ({ ...a, [b.id]: b, }), {});
  },
  { immediate: true }
);
</script>

<template>
  <div class="controls">
    <label for="distance">Distance</label>
    <span>{{ distance }}</span>
    <input id="distance" v-model="distance" type="range" min="1" max="3" step="1" />
  </div>
  <v-network-graph
    ref="graph"
    :nodes="nodes"
    :edges="edges"
    :configs="configs"
    :event-handlers="eventHandlers"
  >
  <defs>
      <!--
        Define the path for clipping the face image.
        To change the size of the applied node as it changes,
        add the `clipPathUnits="objectBoundingBox"` attribute
        and specify the relative size (0.0~1.0).
      -->
      <clipPath id="faceCircle" clipPathUnits="objectBoundingBox">
        <circle cx="0.5" cy="0.5" r="0.5" />
      </clipPath>
    </defs>
    <!-- Replace the node component -->
    <template #override-node="{ nodeId, scale, config, ...slotProps }">
      <!-- circle for filling background -->
      <circle
        class="face-circle"
        :r="config.radius * scale"
        fill="#ffffff"
        v-bind="slotProps"
      />
      <!--
        The base position of the <image /> is top left. The node's
        center should be (0,0), so slide it by specifying x and y.
      -->
      <image
        class="face-picture"
        :x="-config.radius * scale"
        :y="-config.radius * scale"
        :width="config.radius * scale * 2"
        :height="config.radius * scale * 2"
        :xlink:href="nodes[nodeId].pic.src()"
        clip-path="url(#faceCircle)"
      />
      <!-- circle for drawing stroke -->
      <circle
        class="face-circle"
        :r="config.radius * scale"
        fill="none"
        :stroke="`${nodes[nodeId].color}`"
        :stroke-width="4 * scale"
        v-bind="slotProps"
      />
    </template>
    <template #edge-label="{ edge, ...slotProps }">
      <v-edge-label :text="edge.label ?? '-'" align="center" vertical-align="above" v-bind="slotProps" />
    </template>
  </v-network-graph>
  <div :class="['loading', loading ? '' : 'hidden']">
    <BounceLoader color="#fff" />
    Loading ...
  </div>
</template>

<style scoped>
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