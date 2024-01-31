<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import { useRouter } from 'vue-router';
import type { Edge } from 'v-network-graph';
import FullScreenModal from './FullScreenModal.vue'
import SelectSearch from './SelectSearch.vue'

interface Connection {
  edges: {
    type: string
    node: {
      id: number
      firstname: string
      lastname: string
      birthdate?: Date
      deathdate?: Date
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
  },
  editPerson: boolean,
}>()

/*const nodes = computed(() => (props.person ? {
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
} : {}))*/
const nodes = computed(() => (props.person ? {
  [props.person.id]: {
    name: `${props.person.name}${props.person.birthdate ? '\n* ' + props.person.birthdate.getFullYear() : ''}`,
    color: getComputedStyle(document.body).getPropertyValue('--color-text'),
  },
} : {}));

/*const edges = computed(() => props.person ? [
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
] : [])*/
const edges = computed(() => [])

const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    router.push(`/p/${node}`)
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

const addRelation = ref(false);
const selectPerson = ref(false);
const adding = ref('parent');
const selectedPerson = ref(null);
const relationSource = ref(null);

const createRelation = () => {
  if (!selectedPerson.value || !relationSource.value.value.trim()) return;
  console.log(selectedPerson.value, relationSource.value.value.trim());
}

</script>

<template>
  <div class="network-wrapper">
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
    <div :class="['netw-edit-overlay', $props.editPerson ? 'show' : '',]">
      <div v-if="addRelation" class="netw-new-options">
        <div @click="selectPerson = true; adding = 'parent'">
          <font-awesome-icon icon="fa-solid fa-baby" />
          Parent
        </div>
        <div @click="selectPerson = true; adding = 'partner'">
          <font-awesome-icon icon="fa-solid fa-face-kiss" />
          Partner
        </div>
        <div @click="selectPerson = true; adding = 'friend'">
          <font-awesome-icon icon="fa-solid fa-handshake" />
          Friend
        </div>
      </div>
      <button @click.stop="addRelation = !addRelation">
        <font-awesome-icon :icon="['fa-solid', !addRelation ? 'fa-plus' : 'fa-close',]" />
      </button>
    </div>
  </div>
  <FullScreenModal :show="selectPerson" @close="selectPerson = false">
    <div class="relation-modal">
      <h1 class="add-a-title">Add a {{ adding }}</h1>
      <SelectSearch @select="r => selectedPerson = r" />
      <input type="text" ref="relationSource" placeholder="Source ... " />
      <input type="submit" value="Add" @click="createRelation()" />
    </div>
  </FullScreenModal>
</template>

<style scoped>
.network-wrapper {
  flex: 1;
  position: relative;
}

.netw-edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  user-select: none;
  display: none;
  padding: 1em;
}

.netw-edit-overlay.show {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}

.netw-edit-overlay button {
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  width: 2em;
  height: 2em;
  color: var(--color-text);
  font-size: 1.2em;
  transition: .2s ease;
  margin-top: .5em;
}

.netw-edit-overlay button:hover {
  background: var(--color-border);
  color: var(--color-bg);
  cursor: pointer;
}

.netw-new-options {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.netw-new-options > div {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5em;
  padding: .2em .5em;
  box-sizing: border-box;
  margin: .1em 0;
  background-color: var(--color-background-soft);
  transition: .2s ease;
}

.netw-new-options > div:hover {
  background-color: var(--color-background);
  cursor: pointer;
}

.add-a-title {
  margin-bottom: .2em;
}

.relation-modal {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: .5em;
  padding: 1em;
  box-sizing: border-box;
}

.relation-modal input {
  background-color: var(--color-background-soft);
  border: 1.5px solid var(--color-border);
  padding: 0.5rem;
  box-sizing: border-box;
  color: var(--color-text);
  font-size: 1em;
  transition: .2s ease;
}

.relation-modal input:focus {
  outline: none;
  border-color: var(--color-border-hover);
}

.relation-modal input[type="submit"] {
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-size: 1em;
  transition: .2s ease;
}

.relation-modal input[type="submit"]:hover {
  background-color: var(--color-border);
  color: var(--color-bg);
  cursor: pointer;
}
</style>