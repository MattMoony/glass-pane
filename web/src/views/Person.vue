<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'
import { reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PersonDescription from '../components/PersonDescription.vue'
import PersonNetwork from '../components/PersonNetwork.vue'

const route = useRoute()
const vars = reactive({
  uid: computed(() => route.params.uid)
})

const { result } = useQuery(gql`
  query getUserByUid ($uid: String!) {
    people (where: { uid: $uid }) {
      uid
      name
      birthdate
      familyInConnection {
        edges {
          type
          node {
            uid
            name
            birthdate
          }
        }
      }
      familyOutConnection {
        edges {
          type
          node {
            uid
            name
            birthdate
          }
        }
      }
      acquaintancesConnection {
        edges {
          type
          node {
            uid
            name
            birthdate
          }
        }
      }
    }
  }
`, vars)

const person = computed(() => result.value?.people[0] ?? undefined)
</script>

<template>
  <article>
    <NavBar :qry="person?.name" />
    <div class="person-container">
      <div class="part-headings">
        <div>
          <span>
            <font-awesome-icon icon="fa-solid fa-file" />
            Description
          </span>
        </div>
        <div>
          <span>
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  border-bottom: 2px solid var(--color-border);
  user-select: none;
}

.part-headings div span {
  display: inline-block;
  cursor: pointer;
  padding: .3em .4em;
  font-weight: bold;
}

.details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.person-desc {
  padding: 2em;
}

.person-netw {
  overflow: hidden;
  border-left: 2px solid var(--color-border);
}
</style>