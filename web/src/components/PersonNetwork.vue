<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Ref } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import { useRouter } from 'vue-router';
import type { Edge } from 'v-network-graph';
import FullScreenModal from './FullScreenModal.vue'
import SelectSearch from './SelectSearch.vue'
import { RouterLink } from 'vue-router'

interface Relation {
  to: {
    id: number,
    bio: string,
    firstname: string,
    lastname: string,
    birthdate?: Date,
    deathdate?: Date,
  },
  since: Date,
  until?: Date,
}

interface RelationSource {
  sid: number,
  url: string,
}

interface ShownSources {
  from: {
    id: number,
    firstname: string,
    lastname: string,
  },
  to: {
    id: number,
    firstname: string,
    lastname: string,
  },
  type: string,
  since: Date,
  until?: Date,
  sources: RelationSource[],
}

const router = useRouter()
const props = defineProps<{
  person: {
    id: number,
    bio: string,
    firstname: string,
    lastname: string,
    birthdate?: Date,
    deathdate?: Date,
  },
  editPerson: boolean,
}>();

const nodes: Ref<{ [id: number]: any }> = ref({});
const edges: Ref<any[]> = ref([]);

const refreshNetwork = async () => {
  if (!props.person || !props.person.id) return;

  const _2dates = (rs: any[]) => rs.map(r => ({
    to: {
      ...r.to,
      birthdate: r.to.birthdate ? new Date(r.to.birthdate) : null,
      deathdate: r.to.deathdate ? new Date(r.to.deathdate) : null,
    },
    since: new Date(r.since),
    until: r.until ? new Date(r.until) : null,
  }));
  const parents: Relation[] = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/parents`).then(r => r.json())).parents);
  const children: Relation[] = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/children`).then(r => r.json())).children);
  const romantic: Relation[] = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/romantic`).then(r => r.json())).romantic);
  const friends: Relation[] = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/friends`).then(r => r.json())).friends);

  nodes.value = {
    [props.person.id]: {
      name: `${props.person.name}${props.person.birthdate ? '\n* ' + props.person.birthdate.getFullYear() : ''}`,
      firstname: props.person.firstname,
      lastname: props.person.lastname,
      color: getComputedStyle(document.body).getPropertyValue('--color-text'),
    },
    ...[...parents, ...children, ...romantic, ...friends].map(f => ({
      [f.to.id]: {
        name: `${f.to.firstname} ${f.to.lastname}${f.to.birthdate ? '\n* ' + f.to.birthdate.getFullYear() : ''}`,
        firstname: f.to.firstname,
        lastname: f.to.lastname,
        color: '#237AFF',
      },
    })).reduce((a, b) => ({ ...a, ...b }), {}),
  };

  edges.value = [
    ...parents.map(p => ({ 
      source: props.person.id, 
      target: p.to.id, 
      label: `parent (${p.since.getFullYear()})`,
      direction: 'in',
      color: '#23FF2D',
      since: p.since,
      until: p.until,
      type: 'parent',
    })),
    ...children.map(p => ({ 
      source: p.to.id, 
      target: props.person.id, 
      label: `parent (${p.since.getFullYear()})`,
      direction: 'in',
      color: '#23FF2D',
      since: p.since,
      until: p.until,
      type: 'parent',
    })),
    ...romantic.map(p => ({ 
      source: props.person.id, 
      target: p.to.id, 
      label: `romantic (${p.since.getFullYear()}${p.until ? ' - ' + p.until.getFullYear() : ''})`,
      direction: 'out',
      color: '#FF3423',
      since: p.since,
      until: p.until,
      type: 'romantic',
    })),
    ...friends.map(p => ({ 
      source: props.person.id, 
      target: p.to.id, 
      label: `friends (${p.since.getFullYear()}${p.until ? ' - ' + p.until.getFullYear() : ''})`,
      direction: 'out',
      color: '#FFD023',
      since: p.since,
      until: p.until,
      type: 'friend',
    })),
  ];
};

watch(() => props.person, refreshNetwork);

const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    router.push(`/p/${node}`)
  },
  'edge:click': async ({ edge }) => {
    const e = edges.value[edge];
    const res = await fetch(`http://localhost:8888/api/person/${e.source}/relation/sources?to=${e.target}&since=${e.since}`).then(r => r.json());
    shownSources.value = {
      from: {
        id: +e.source,
        ...nodes.value[+e.source],
      },
      to: {
        id: +e.target,
        ...nodes.value[+e.target],
      },
      since: e.since,
      until: e.until,
      type: e.type,
      sources: res.sources.map(s => ({ sid: +s.sid, url: s.url })),
    };
    editSourceSince.value = e.since.toISOString().split('T')[0];
    editSourceTil.value = e.until ? e.until.toISOString().split('T')[0] : '';
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
)

const addRelation = ref(false);
const selectPerson = ref(false);
const adding = ref('parent');
const selectedPerson = ref(null);
const relationSource = ref(null);
const relSince = ref(null);
const relTil = ref(null);

const shownSources: Ref<ShownSources|{}> = ref({});
const newSource: Ref<RelationSource> = ref({ sid: 0, url: '', });
const editSourceSince: Ref<string> = ref('');
const editSourceTil: Ref<string> = ref('');
const editedSource = ref(false);

const createRelation = () => {
  if (!selectedPerson.value || !relationSource.value.value.trim() || !relSince.value.value) return;
  fetch(`http://localhost:8888/api/person/${props.person.id}/relation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: adding.value === 'parent'
            ? 'parent'
            : adding.value === 'partner'
            ? 'romantic'
            : 'friend',
      personId: selectedPerson.value.id,
      source: relationSource.value.value,
      since: relSince.value.value,
      til: relTil.value.value,
    }),
  }).then(r => r.json()).then(r => {
    relationSource.value.value = '';
    relSince.value.value = '';
    relTil.value.value = '';
    selectPerson.value = false;
    refreshNetwork();
  })
}

const addRelationSource = () => {
  if (!shownSources.value || !('from' in shownSources.value)) return;
  editedSource.value = true;
  fetch(`http://localhost:8888/api/person/${shownSources.value.from.id}/relation/sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: shownSources.value.to.id,
      since: shownSources.value.since,
      url: newSource.value.url,
    }),
  }).then(r => r.json()).then(r => {
    newSource.value = { sid: 0, url: '', };
    shownSources.value.sources.push({ sid: r.source.sid, url: r.source.url });
  });
}

const alterRelationTimespan = () => {
  editedSource.value = true;

}

const updateRelationSource = (s: RelationSource) => {
  if (!shownSources.value || !('from' in shownSources.value)) return;
  editedSource.value = true;
  fetch(`http://localhost:8888/api/person/${shownSources.value.from.id}/relation/sources/${s.sid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: s.url,
    }),
  }).then(r => r.json()).then(r => {
  })
}

const removeRelationSource = (s: RelationSource) => {
  if (!shownSources.value || !('from' in shownSources.value)) return;
  editedSource.value = true;
  fetch(`http://localhost:8888/api/person/${shownSources.value.from.id}/relation/sources/${s.sid}`, {
    method: 'DELETE',
  }).then(r => r.json()).then(r => {
  })
}

const finishViewingSources = () => {
  if (editedSource.value) {
    refreshNetwork();
    editedSource.value = false;
  }
  shownSources.value = {};
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
          :xlink:href="`http://localhost:8888/api/person/${nodeId}/pic`"
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
        <div class="relation-time">
          <span>
            Since
            <input type="date" ref="relSince" />
          </span>
          <span>
            Until
            <input type="date" ref="relTil" />
          </span>
        </div>
      <input type="text" ref="relationSource" placeholder="Source ... " />
      <input type="submit" value="Add" @click="createRelation()" />
    </div>
  </FullScreenModal>
  <FullScreenModal :show="'from' in shownSources" @close="finishViewingSources">
    <div class="relation-modal" v-if="'sources' in shownSources">
      <h1>
        {{ shownSources.from.firstname }} {{ shownSources.from.lastname }}
        &amp; 
        <RouterLink :to="`/p/${shownSources.to.id}`">
          {{ shownSources.to.firstname }} {{ shownSources.to.lastname }}
        </RouterLink>
        <span v-if="!editPerson">
          ({{ shownSources.since.getFullYear() }} - {{ shownSources.until ? shownSources.until.getFullYear() : 'present' }})
        </span>
      </h1>
      <ol class="edge-sources">
        <li v-for="s in shownSources.sources" :key="s.sid">
          <a v-if="!editPerson" :href="s.url" target="_blank">{{ s.url }}</a>
          <input 
            v-if="editPerson" 
            type="text" 
            v-model="s.url" 
            @keyup="e => e.key === 'Enter' ? updateRelationSource(s) : null" 
          />
          <button v-if="editPerson" @click="() => updateRelationSource(s)">
            <font-awesome-icon :icon="['fa-solid', 'fa-save',]" />
          </button>
          <button v-if="editPerson" @click="() => removeRelationSource(s)">
            <font-awesome-icon :icon="['fa-solid', 'fa-trash',]" />
          </button>
        </li>
        <li v-if="editPerson">
          <input 
            type="text" 
            id="edit-source-input" 
            ref="editRelationSource" 
            v-model="newSource.url" 
            @keyup="e => e.key === 'Enter' ? addRelationSource() : null"
          />
          <button @click="addRelationSource">
            <font-awesome-icon :icon="['fa-solid', 'fa-plus',]" />
          </button>
        </li>
      </ol>
      <div v-if="editPerson">
        <div class="relation-time">
          <span>
            Since
            <input type="date" ref="editRelSince" v-model="editSourceSince" />
          </span>
          <span>
            Until
            <input type="date" ref="editRelTil" v-model="editSourceTil" />
          </span>
        </div>
        <button class="save-button" @click="alterRelationTimespan">
          <font-awesome-icon :icon="['fa-solid', 'fa-save',]" /> Save Timespan
        </button>
      </div>
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

.relation-modal input[type="submit"],
.relation-modal button {
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-size: 1em;
  transition: .2s ease;
}

.relation-modal input[type="submit"]:hover,
.relation-modal button:hover {
  background-color: var(--color-border);
  color: var(--color-bg);
  cursor: pointer;
}

.relation-modal button {
  padding: .5em .6em;
  box-sizing: border-box;
  margin: .2em;
}

.relation-modal .save-button {
  width: 100%;
  margin-top: 1em;
}

.relation-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5em;
}

.face-circle,
.face-picture {
  transition: all 0.1s linear;
}

.face-picture {
  pointer-events: none;
}

a {
  color: var(--color-text);
}

.edge-sources {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1em 1.5em;
  margin: .6em 0;
  max-height: 40vh;
  overflow-y: auto;
}

.edge-sources::-webkit-scrollbar {
  width: 0.5rem;
}

.edge-sources::-webkit-scrollbar-track {
  background-color: var(--color-background-soft);
}

.edge-sources::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 0.5rem;
}

.edge-sources::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-hover);
}

.edge-sources::-webkit-scrollbar-corner {
  background-color: var(--color-background-soft);
}

.edge-sources::-webkit-scrollbar-button {
  display: none;
}
</style>