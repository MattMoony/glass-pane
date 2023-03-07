<script setup lang="ts">
import { ref } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import { useRouter } from 'vue-router';

const router = useRouter()
const props = defineProps<{
  person: {
    uid: string
    name: string

    familyMembers: {
      uid: string
      name: string
    }[]
    acquaintances: {
      uid: string
      name: string
    }[]
  }
}>()

const nodes = {
  [props.person.uid]: {
    name: props.person.name,
  },
  ...Object.fromEntries(props.person.familyMembers.map(p => [p.uid, {
    name: p.name,
    color: 'rgba(255, 86, 86, .5)',
  }])),
  ...Object.fromEntries(props.person.acquaintances.map(p => [p.uid, {
    name: p.name,
  }])),
}

const edges = [...props.person.familyMembers, ...props.person.acquaintances,].map((person) => ({
  source: props.person.uid,
  target: person.uid,
}))

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
    :event-handlers="eventHandlers" />
</template>