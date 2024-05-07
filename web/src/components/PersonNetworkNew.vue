<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import * as vNG from 'v-network-graph';
import { ForceLayout } from 'v-network-graph/lib/force-layout';
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout';

import Person from '../models/Person';
import Relation from '../models/Relation';
import RelationType, { COLORS } from '../models/RelationTypes';
import Organization from '@/models/Organization';
import Membership from '@/models/Membership';

const router = useRouter();
const props = defineProps<{
  person?: Person;
  showMemberships?: boolean;
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
    this.color = color || getComputedStyle(document.body).getPropertyValue('--color-text');
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
    this.label = `${RelationType[relation.type].toLowerCase()} (${relation.since.getUTCFullYear()} ~ ${relation.until?.getUTCFullYear() ?? '-'})`;
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
    this.label = `${this.role.name} (${membership.since.getUTCFullYear()} ~ ${membership.until?.getUTCFullYear() ?? '-'})`;
    this.color = getComputedStyle(document.body).getPropertyValue('--color-border');
  }
}

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

const refreshNodes = async (
  person: Person,
  relations: Relation[],
  memberships: Membership[]
) => ({
  [person.id.toString()]: new PersonNode(person),
  ...relations.map(r => ({
    [r.other.id.toString()]: new PersonNode(r.other)
  })).reduce((a, b) => ({ ...a, ...b }), {}),
  ...memberships.map(m => ({
    [m.organization.id.toString()]: new OrganizationNode(m.organization)
  })).reduce((a, b) => ({ ...a, ...b }), {}),
});

const refreshesEdges = async (
  person: Person,
  relations: Relation[],
  memberships: Membership[]
) => [
  ...relations.map(r => new RelationEdge(r, person)),
  ...memberships.map(m => new MembershipEdge(m)),
];

const refreshNetwork = async () => {
  if (!props.person) return;
  const relations = await props.person.relations.get();
  let memberships: Membership[];
  if (props.showMemberships) memberships = await Membership.get(props.person);
  else memberships = [] as Membership[];
  nodes.value = await refreshNodes(props.person, relations, memberships);
  edges.value = await refreshesEdges(props.person, relations, memberships);
};

watch(() => props.person, refreshNetwork, { immediate: true });
</script>

<template>
  <v-network-graph
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
</template>

<style scoped>
</style>