import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import { basicSetup } from 'codemirror'
import VueCodeMirror from 'vue-codemirror'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faGithub,
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faReddit,
  faTelegram,
  faYoutube,
  faTiktok,
  faXing,
} from '@fortawesome/free-brands-svg-icons'
import { 
  faMagnifyingGlass, 
  faEyeSlash, 
  faCircleNodes, 
  faFile, 
  faBaby, 
  faSkull, 
  faEdit, 
  faClose, 
  faTrash, 
  faUser, 
  faPlus, 
  faFaceKiss, 
  faHandshake, 
  faSave, 
  faCalendarDay,
  faPhone,
  faEnvelope,
  faGlobe,
  faHashtag,
  faCopy,
  faSignInAlt,
  faEye,
  faBook,
  faDiagramProject,
  faRedo,
  faTimeline,
  faMapLocation,
  faMapMarkerAlt,
  faFlushed,
} from '@fortawesome/free-solid-svg-icons'

import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import './userWorker'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VNetworkGraph)
app.use(VueDOMPurifyHTML)
app.use(VueCodeMirror, {
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  lineWrapping: true,
})

library.add(
  faGithub, 
  faMagnifyingGlass, 
  faEyeSlash, 
  faCircleNodes, 
  faFile, 
  faBaby, 
  faSkull, 
  faEdit, 
  faClose, 
  faTrash, 
  faUser, 
  faPlus, 
  faFaceKiss, 
  faHandshake, 
  faSave, 
  faCalendarDay,
  faPhone,
  faEnvelope,
  faGlobe,
  faHashtag,
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faReddit,
  faTelegram,
  faYoutube,
  faTiktok,
  faXing,
  faCopy,
  faSignInAlt,
  faEye,
  faBook,
  faDiagramProject,
  faRedo,
  faTimeline,
  faMapLocation,
  faMapMarkerAlt,
  faFlushed,
)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
