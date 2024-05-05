<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from '@vueuse/core'
import NavBar from '../components/NavBar.vue'
import PersonDescription from '../components/PersonDescription.vue'
import PersonNetwork from '../components/PersonNetwork.vue'

const router = useRouter()
const route = useRoute()
const uid = computed(() => route.params.uid)
const editPerson = computed(() => Object.keys(route.query).includes('edit'))

const MOBILE_WIDTH = 600
const details = { 'person-desc': true, 'person-netw': true, }
const mobileControls = () => {
  if (window.innerWidth <= MOBILE_WIDTH) {
    let shown = false;
    Object.keys(details).forEach(k => {
      if (shown && details[k]) doHide(k);
      shown = true;
    })
  }
}

const hideAll = () => {
  Object.keys(details).forEach(c => {
    document.querySelector(`div.${c}`).style.display = 'none';
    document.querySelector(`.${c}.control`).parentElement.classList.add('inactive');
  })
}

const hide = c => {
  if (details[c]) {
    if (Object.values(details).filter(s=>s).length === 1) return;
    document.querySelector(`div.${c}`).style.display = 'none';
    document.querySelector(`.${c}.control`).parentElement.classList.add('inactive');
  } else {
    if (window.innerWidth <= MOBILE_WIDTH) hideAll();
    document.querySelector(`div.${c}`).style.display = 'block';
    document.querySelector(`.${c}.control`).parentElement.classList.remove('inactive');
  }
  details[c] = !details[c];
}

const remove = async () => {
  const res = await fetch(`http://localhost:8888/api/person/${uid.value}`, {
    method: 'DELETE',
  })
  if (res.ok) {
    router.push('/')
  }
}

onMounted(() => {
  window.addEventListener('resize', mobileControls)
})

onUnmounted(() => {
  window.removeEventListener('resize', mobileControls)
})

const descUrl = computed(() => `http://localhost:8888/api/person/${uid.value}`)
const { data } = useFetch(descUrl, { refetch: true, })
const person = ref(null);
watch(data, () => {
  const d = JSON.parse(data.value as string);
  if (!d || !d.success) return null
  person.value = {
    id: d.person.id,
    bio: d.person.bio,
    firstname: d.person.firstname,
    lastname: d.person.lastname,
    ...(d.person.birthdate ? { birthdate: new Date(d.person.birthdate) } : {}),
    ...(d.person.deathdate ? { deathdate: new Date(d.person.deathdate) } : {}),
    name: `${d.person.firstname} ${d.person.lastname}`,
    type: 'person',
  };
})

const updatePerson = async (p) => {
  const res = await fetch(`http://localhost:8888/api/person/${uid.value}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(p),
  })
  if (res.ok) {
    person.value = {
      ...(person ? person.value : {}),
      bio: p.bio,
      firstname: p.firstname,
      lastname: p.lastname,
      ...(p.birthdate ? { birthdate: new Date(p.birthdate) } : {}),
      ...(p.deathdate ? { deathdate: new Date(p.deathdate) } : {}),
      name: `${p.firstname} ${p.lastname}`,
    }
  }
}

const updateRelation = async (r) => {
  const res = await fetch(`http://localhost:8888/api/person/${r.from.id}/relation`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personId: r.to.id,
      type: r.type,
      since: r.since,
      until: r.until,
      source: r.source,
    }),
  })
  if (res.ok) {
  }
}

</script>

<template>
  <article>
    <NavBar :result="person" />
    <div class="person-container">
      <div class="heading-wrapper">
        <div class="part-headings">
          <div>
            <span class="person-desc control" @click.stop="hide('person-desc')">
              <font-awesome-icon icon="fa-solid fa-file" />
              Description
            </span>
          </div>
          <div>
            <span class="person-netw control" @click.stop="hide('person-netw')">
              <font-awesome-icon icon="fa-solid fa-circle-nodes" />
              Network
            </span>
          </div>
        </div>
        <div class="edit-tools">
          <span v-if="editPerson" @click.stop="remove()">
            <font-awesome-icon icon="fa-solid fa-trash" />
            Delete
          </span>
          <router-link v-if="!editPerson" :to="`/p/${uid}/?edit`">
            <span>
              <font-awesome-icon icon="fa-solid fa-edit" />
              Edit
            </span>
          </router-link>
          <router-link v-if="editPerson" :to="`/p/${uid}`">
            <span>
              <font-awesome-icon icon="fa-solid fa-close" />
              View
            </span>
          </router-link>
        </div>
      </div>
      <div class="details">
        <div class="person-desc">
          <PersonDescription 
            :person="person"
            :edit-person="editPerson"
            full-page
            @save="updatePerson"
          />
        </div>
        <div class="person-netw">
          <PersonNetwork 
            :person="person"
            :edit-person="editPerson"
            @save-relation="updateRelation"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
article {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.person-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch
}

.heading-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--color-border);
  user-select: none;
}

.edit-tools span {
  display: inline-block;
  margin: .4em 0;
  padding: 0 .6em;
  font-weight: bold;
  transition: .2s ease;
  color: var(--color-text);
}

.edit-tools span:hover {
  cursor: pointer;
  opacity: .6;
}

.part-headings {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
}

.part-headings div span {
  display: inline-block;
  margin: .4em 0;
  padding: 0 .6em;
  font-weight: bold;
  transition: .2s ease;
}

.part-headings div:not(:first-child) span {
  border-left: 2px solid var(--color-border);
}

.part-headings div:not(.inactive) span:hover,
.part-headings .inactive span {
  cursor: pointer;
  opacity: .6;
}

.part-headings .inactive span:hover {
  opacity: 1;
}

.details {
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.details .person-desc {
  flex-grow: 1;
  flex-basis: 0;
  padding: 2em;
  height: 100%;
  max-width: 60vw;
}

.details .person-netw {
  flex-grow: 1;
  flex-basis: 0;
  overflow: hidden;
  border-left: 2px solid var(--color-border);
  display: flex;
  justify-content: stretch;
  align-items: stretch
}
</style>
