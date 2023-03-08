<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import { useRouter } from 'vue-router';

const router = useRouter()
const props = defineProps<{
  person: {
    uid: string
    name: string

    familyMembersConnection: {
      edges: {
        type: string
        source: string
        node: {
          uid: string
          name: string
        }
      }[]
    }
    acquaintancesConnection: {
      edges: {
        type: string
        notes: string
        source: string
        node: {
          uid: string
          name: string
        }
      }[]
    }
  }
}>()

const nodes = computed(() => ({
  [props.person.uid]: {
    name: props.person.name,
    color: 'rgba(255, 86, 86, .8)',
  },
  ...Object.fromEntries(props.person.familyMembersConnection.edges.map(p => [p.node.uid, {
    name: p.node.name,
    color: 'rgba(255, 86, 86, .4)',
  }])),
  ...Object.fromEntries(props.person.acquaintancesConnection.edges.map(p => [p.node.uid, {
    name: p.node.name,
    color: getComputedStyle(document.body).getPropertyValue('--color-text'),
  }])),
}))

const edges = computed(() => [
  ...props.person.familyMembersConnection.edges.concat(props.person.acquaintancesConnection.edges).map(fam => ({ 
    source: props.person.uid, 
    target: fam.node.uid, 
    label: fam.type,
  })),
])

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
      }
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