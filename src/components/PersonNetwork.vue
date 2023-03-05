<script setup lang="ts">
import { ref } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'

const nodes = {
    node1: { name: "Node 1" },
    node2: { name: "Node 2" },
    node3: { name: "Node 3" },
    node4: { name: "Node 4" },
}

const edges = {
    edge1: { source: "node1", target: "node2" },
    edge2: { source: "node2", target: "node3" },
    edge3: { source: "node3", target: "node4" },
}

const configs = ref(
    vNG.defineConfigs({
        view:  {
            layoutHandler: new ForceLayout(),
        },
        node: {
            normal: {
                radius: 30,
                color: getComputedStyle(document.body).getPropertyValue('--color-text'),
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
    />
</template>