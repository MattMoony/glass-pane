<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'
import NavBar from '../components/NavBar.vue'
import PersonDescription from '../components/PersonDescription.vue'
import PersonNetwork from '../components/PersonNetwork.vue'

const route = useRoute()
const uid = ref(route.params.uid)

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

onMounted(() => {
  window.addEventListener('resize', mobileControls)
})

onUnmounted(() => {
  window.removeEventListener('resize', mobileControls)
})

const descUrl = computed(() => `http://localhost:8888/api/person/${uid.value}`)
const { data } = useFetch(descUrl, { refetch: true, })
const person = computed(() => {
  const p = JSON.parse(data.value as string);
  if (!p) return null
  return {
    ...p,
    name: `${p.firstname} ${p.lastname}`,
  }
})
</script>

<template>
  <article>
    <NavBar :qry="person?.name" />
    <div class="person-container">
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
      <div class="details">
        <div class="person-desc">
          <PersonDescription :person="person" />
        </div>
        <div class="person-netw">
          <PersonNetwork :person="person" />
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

.part-headings {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  border-bottom: 2px solid var(--color-border);
  user-select: none;
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
  flex: 1;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.details .person-desc {
  flex: 1;
  padding: 2em;
}

.details .person-netw {
  flex: 1;
  overflow: hidden;
  border-left: 2px solid var(--color-border);
}
</style>
