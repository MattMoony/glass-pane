import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faMagnifyingGlass, faEyeSlash, faCircleNodes, faFile, faBaby, faSkull, faEdit, faClose, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'

import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VNetworkGraph)

library.add(faGithub, faMagnifyingGlass, faEyeSlash, faCircleNodes, faFile, faBaby, faSkull, faEdit, faClose, faTrash, faUser)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
