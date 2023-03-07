import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faMagnifyingGlass, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
})
const cache = new InMemoryCache()
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)

app.use(createPinia())
app.use(router)
app.use(VNetworkGraph)

library.add(faGithub, faMagnifyingGlass, faEyeSlash)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
