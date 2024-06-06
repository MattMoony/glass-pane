import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import { basicSetup } from 'codemirror'
import VueCodeMirror from 'vue-codemirror'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

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
  faHome,
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
app.use(createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#181818',
          surface: '#181818',
          'surface-bright': '#222222',
          'surface-variant': '#282828',
          primary: '#1EABFF',
          secondary: '#2c3e50',
          error: 'rgb(189,65,61)',
          info: 'rgb(54,114,192)',
          success: 'rgb(35,134,54)',
          warning: 'rgb(186,136,33)',
        },
        variables: {
          'border-color': 'rgba(84, 84, 84, 0.48)',
          'border-color-hover': 'rgba(84, 84, 84, 0.65)',
        }
      }
    }
  }
}))

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
  faHome,
)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
