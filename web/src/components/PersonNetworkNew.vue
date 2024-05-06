<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import * as vNG from 'v-network-graph';
import { ForceLayout } from 'v-network-graph/lib/force-layout';

import Person from '../models/Person';

class PersonNode extends Person {
  public name: string;
  public color: string;

  public constructor(person: Person) {
    super(
      person.id, 
      person.bio, 
      person.firstname, 
      person.lastname, 
      person.birthdate,
      person.deathdate,
    );
    this.name = `${person.firstname} ${person.lastname}${person.birthdate ? '\n*' + person.birthdate.getUTCFullYear() : ''}`;
    this.color = getComputedStyle(document.body).getPropertyValue('--color-primary');
  }
}

const router = useRouter();
const props = defineProps<{
  person?: Person;
}>();

const nodes: Ref<{[id: string]: PersonNode}> = computed(() => {
  const n: {[id: string]: PersonNode} = {};
  if (props.person) {
    n[props.person.id.toString()] = new PersonNode(props.person);
  }
  return n;
});
const edges: Ref<any[]> = ref([]);
const configs = ref(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout(),
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
    router.push(`/p/${node}`);
  },
}
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