<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import { useRouter } from 'vue-router';
import type { Edge } from 'v-network-graph';

interface Connection {
  edges: {
    type: string
    node: {
      uid: string
      name: string
      birthdate: string
    }
  }[]
}

const router = useRouter()
const props = defineProps<{
  person: {
    uid: string
    name: string
    birthdate: string

    familyInConnection: Connection
    familyOutConnection: Connection
    acquaintancesConnection: Connection
  }
}>()

const nodes = computed(() => (props.person ? {
  [props.person.uid]: {
    name: `${props.person.name}\n* ${new Date(props.person.birthdate).getFullYear()}`,
    color: 'rgba(255, 86, 86, .8)',
  },
  ...Object.fromEntries(props.person.familyInConnection.edges.map(p => [p.node.uid, {
    name: `${p.node.name}\n* ${new Date(p.node.birthdate).getFullYear()}`,
    color: 'rgba(255, 200, 86, .4)',
  }])),
  ...Object.fromEntries(props.person.familyOutConnection.edges.map(p => [p.node.uid, {
    name: `${p.node.name}\n* ${new Date(p.node.birthdate).getFullYear()}`,
    color: 'rgba(255, 86, 86, .4)',
  }])),
  ...Object.fromEntries(props.person.acquaintancesConnection.edges.map(p => [p.node.uid, {
    name: `${p.node.name}\n* ${new Date(p.node.birthdate).getFullYear()}`,
    color: getComputedStyle(document.body).getPropertyValue('--color-text'),
  }])),
} : {}))

const edges = computed(() => props.person ? [
  ...props.person.familyInConnection.edges.map(fam => ({ 
    source: props.person.uid, 
    target: fam.node.uid, 
    label: fam.type,
    direction: 'in',
  })),
  ...props.person.familyOutConnection.edges.map(fam => ({ 
    source: props.person.uid, 
    target: fam.node.uid, 
    label: fam.type,
    direction: 'out',
  })),
  ...props.person.acquaintancesConnection.edges.map(fam => ({ 
    source: props.person.uid, 
    target: fam.node.uid, 
    label: fam.type,
  })),
] : [])

const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    router.push(`/person/${node}`)
  },
}

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
        color: getComputedStyle(document.body).getPropertyValue('--color-border'),
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
)
</script>

<template>
  <v-network-graph 
    class="graph" 
    zoom-level="2" 
    :nodes="nodes" 
    :edges="edges" 
    :configs="configs"
    :event-handlers="eventHandlers"
  >
    <template #edge-label="{ edge, ...slotProps }">
      <v-edge-label :text="edge.label ?? '-'" align="center" vertical-align="above" v-bind="slotProps" />
    </template>
  </v-network-graph>
</template>