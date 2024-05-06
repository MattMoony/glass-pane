<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import { marked } from 'marked';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface OrganSource {
  sid: number;
  url: string;
}

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

const props = defineProps<{
  person: {
    id: string
    bio: string
    firstname: string
    lastname: string
    birthdate?: Date
    deathdate?: Date
  },
  editPerson: boolean,
  fullPage: boolean,
}>()
const emit = defineEmits(['save'])

const bio = ref('')
const firstname = ref('')
const lastname = ref('')
const birthdate = ref('')
const deathdate = ref('')

const sources = ref<OrganSource[]>([])
const newSource = ref('')

const parents = ref<Relation[]>([])
const children = ref<Relation[]>([])
const romantic = ref<Relation[]>([])
const friends = ref<Relation[]>([])

const watchPerson = async () => {
  const person = props.person;
  if (!person || !person.id) return;
  bio.value = person.bio ?? '';
  firstname.value = person.firstname ?? '';
  lastname.value = person.lastname ?? '';
  birthdate.value = person.birthdate ? `${person.birthdate.getFullYear()}-${("0"+(person.birthdate.getMonth()+1)).slice(-2)}-${("0"+(person.birthdate.getDate())).slice(-2)}` : '';
  deathdate.value = person.deathdate ? `${person.deathdate.getFullYear()}-${("0"+(person.deathdate.getMonth()+1)).slice(-2)}-${("0"+(person.deathdate.getDate())).slice(-2)}` : '';
  sources.value = (await fetch(`http://localhost:8888/api/organ/${person.id}/sources`).then(r => r.json())).sources ?? [];

  const _2dates = (rs: any[]) => rs.map(r => ({
    to: {
      ...r.to,
      birthdate: r.to.birthdate ? new Date(r.to.birthdate) : null,
      deathdate: r.to.deathdate ? new Date(r.to.deathdate) : null,
    },
    since: new Date(r.since),
    until: r.until ? new Date(r.until) : null,
  }));
  parents.value = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/parents`).then(r => r.json())).parents);
  children.value = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/children`).then(r => r.json())).children);
  romantic.value = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/romantic`).then(r => r.json())).romantic);
  friends.value = _2dates((await fetch(`http://localhost:8888/api/person/${props.person.id}/friends`).then(r => r.json())).friends);
};

watch(() => props.person, watchPerson);
watch(() => props.editPerson, watchPerson);

const saveChanges = () => {
  console.log('save changes');
  emit('save', {
    bio: bio.value,
    firstname: firstname.value,
    lastname: lastname.value,
    birthdate: birthdate.value,
    deathdate: deathdate.value,
  });
};

const picOut = ref(null);
const picUpload = ref(null);

const uploadImage = async () => {
  console.log('upload image');
  const file = picUpload.value.files[0];
  const formData = new FormData();
  formData.append('pic', file);
  console.log(file, formData);
  await fetch(`http://localhost:8888/api/person/${props.person.id}/pic`, {
    method: 'POST',
    body: formData,
  });
  picOut.value.src = `http://localhost:8888/api/person/${props.person.id}/pic`;
  picUpload.value.value = '';
};

const removeImage = async () => {
  console.log('remove image');
  await fetch(`http://localhost:8888/api/person/${props.person.id}/pic`, {
    method: 'DELETE',
  });
  picOut.value.src = `http://localhost:8888/api/person/${props.person.id}/pic`;
};

const updateSource = async (sid: number) => {
  const source = sources.value.find(s => s.sid === sid);
  if (!source || !source.url) return;
  await fetch(`http://localhost:8888/api/organ/${props.person.id}/sources/${sid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(source),
  });
};

const addSource = async () => {
  if (!newSource.value) return;
  const res = await fetch(`http://localhost:8888/api/organ/${props.person.id}/sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: newSource.value }),
  });
  if (res.ok) {
    sources.value = [...sources.value, { sid: (await res.json()).sid, url: newSource.value }];
    newSource.value = '';
  }
};

const removeSource = async (sid: number) => {
  await fetch(`http://localhost:8888/api/organ/${props.person.id}/sources/${sid}`, {
    method: 'DELETE',
  });
  sources.value = sources.value.filter(s => s.sid !== sid);
};

</script>

<template>
  <div :class="$props.fullPage ? 'full-container' : ''">
    <button @click.stop="saveChanges()" v-if="editPerson" class="save-button">
      <font-awesome-icon icon="fa-solid fa-save" />
      Save
    </button>
    <div :class="[ 'banner', $props.fullPage ? 'full-banner' : '', ]">
      <div class="facts">
        <h1>
          <span v-if="!editPerson">
            {{ $props.person?.firstname }} {{ $props.person?.lastname }}
          </span>
          <span v-else>
            <input type="text" v-model="firstname" />
            <input type="text" v-model="lastname" />
          </span>
        </h1>
        <div class="birth-death">
          <div v-if="!editPerson">
            <span v-if="$props.person?.birthdate">
              <font-awesome-icon icon="fa-solid fa-baby" />
              {{ new Date($props.person?.birthdate).toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
            </span>
            <span v-if="$props.person?.deathdate">
              <font-awesome-icon icon="fa-solid fa-skull" />
              {{ new Date($props.person?.deathdate).toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
            </span>
          </div>
          <div v-else>
            <span>
              <font-awesome-icon icon="fa-solid fa-baby" />
              <input type="date" v-model="birthdate" />
            </span>
            <span>
              <font-awesome-icon icon="fa-solid fa-skull" />
              <input type="date" v-model="deathdate" />
            </span>
          </div>
        </div>
      </div>
      <div class="image-upload">
        <img ref="picOut" :src="`http://localhost:8888/api/person/${$props.person?.id}/pic`" alt="Person's face." />
        <div v-if="editPerson">
          <input ref="picUpload" @change="uploadImage" type="file" accept=".jpg,.png,.gif" />
          <button @click="removeImage" tooltip="Remove Image">
            <font-awesome-icon icon="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    </div>
    <div :class="[ 'bio', $props.fullPage ? 'full-bio' : '', ]">
      <h2>Bio</h2>
      <div 
        class="subsection bio-content md-bio-content" 
        v-if="!editPerson" 
        v-dompurify-html="$props.person && marked($props.person.bio)"
      ></div>
      <div
        class="subsection bio-content"
        v-else>
        <codemirror 
          :style="{height: '30vh', width: '100%',}" 
          v-if="editPerson" 
          v-model="bio"
          :extensions="[markdown(), oneDark,]"
        />
      </div>
      <h2>Parents</h2>
      <div v-if="!editPerson" class="subsection">
        <RouterLink 
          class="associated-person" 
          v-if="parents.length" 
          v-for="parent in parents" 
          :key="parent.to.id+''+parent.since"
          :to="`/p/${parent.to.id}`"
        >
          <div>
            <img :src="`http://localhost:8888/api/person/${parent.to.id}/pic`" alt="Parent's face." />
          </div>
          <div>
            <div>{{ parent.to.firstname }} {{ parent.to.lastname }}</div>
            <span>
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              {{ parent.since.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              -
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              <span v-if="parent.until">
                {{ parent.until.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              </span>
              <span v-else>
                present
              </span>
            </span>            
          </div>
        </RouterLink>
        <i v-else>No parents yet ...</i>
      </div>
      <h2>Partners</h2>
      <div v-if="!editPerson" class="subsection">
        <RouterLink 
          class="associated-person" 
          v-if="romantic.length" 
          v-for="partner in romantic" 
          :key="partner.to.id+''+partner.since"
          :to="`/p/${partner.to.id}`"
        >
          <div>
            <img :src="`http://localhost:8888/api/person/${partner.to.id}/pic`" alt="Partner's face." />
          </div>
          <div>
            <div>{{ partner.to.firstname }} {{ partner.to.lastname }}</div>
            <span>
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              {{ partner.since.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              -
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              <span v-if="partner.until">
                {{ partner.until.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              </span>
              <span v-else>
                present
              </span>
            </span>            
          </div>
        </RouterLink>
      </div>
      <h2>Children</h2>
      <div v-if="!editPerson" class="subsection">
        <RouterLink 
          class="associated-person" 
          v-if="children.length" 
          v-for="child in children" 
          :key="child.to.id+''+child.since"
          :to="`/p/${child.to.id}`"
        >
          <div>
            <img :src="`http://localhost:8888/api/person/${child.to.id}/pic`" alt="Child's face." />
          </div>
          <div>
            <div>{{ child.to.firstname }} {{ child.to.lastname }}</div>
            <span>
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              {{ child.since.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              -
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              <span v-if="child.until">
                {{ child.until.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              </span>
              <span v-else>
                present
              </span>
            </span>            
          </div>
        </RouterLink>
        <i v-else>No children yet ...</i>
      </div>
      <h2>Friends</h2>
      <div v-if="!editPerson" class="subsection">
        <RouterLink 
          class="associated-person" 
          v-if="friends.length" 
          v-for="friend in friends" 
          :key="friend.to.id+''+friend.since"
          :to="`/p/${friend.to.id}`"
        >
          <div>
            <img :src="`http://localhost:8888/api/person/${friend.to.id}/pic`" alt="Friend's face." />
          </div>
          <div>
            <div>{{ friend.to.firstname }} {{ friend.to.lastname }}</div>
            <span>
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              {{ friend.since.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              -
              <font-awesome-icon icon="fa-solid fa-calendar-day" />
              <span v-if="friend.until">
                {{ friend.until.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
              </span>
              <span v-else>
                present
              </span>
            </span>            
          </div>
        </RouterLink>
        <i v-else>No friends yet ...</i>
      </div>
      <h2>Sources</h2>
      <div v-if="!editPerson" class="subsection sources">
        <ol v-if="sources.length">
          <li v-for="source in sources" :key="source.sid">
            <a :href="source.url" target="_blank">{{ source.url }}</a>
          </li>
        </ol>
        <i v-else>No sources yet ...</i>
      </div>
      <div class="subsection sources edit-sources" v-else>
        <ol>
          <li v-for="source in sources" :key="source.sid">
            <input type="text" v-model="source.url" @keyup="e => e.key === 'Enter' ? updateSource(source.sid) : null" />
            <button class="save-button" @click="() => updateSource(source.sid)">
              <font-awesome-icon icon="fa-solid fa-save" />
            </button>
            <button class="save-button" @click="() => removeSource(source.sid)">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </li>
          <li>
            <input type="text" v-model="newSource" @keyup="e => e.key === 'Enter' ? addSource() : null" />
            <button class="save-button" @click="addSource">
              <font-awesome-icon icon="fa-solid fa-plus" />
            </button>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.save-button {
  display: block;
  width: 100%;
  background: var(--color-border);
  border: none;
  border-radius: 5px;
  padding: .5em 1em;
  font-size: 1.2em;
  font-weight: bold;
  color: var(--color-text);
  transition: .2s ease;
}

.save-button:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.save-button:focus {
  outline: none;
}

.banner {
  display: flex;
  justify-content: stretch;
  align-items: center;
  border-bottom: 2px solid var(--color-border);
  padding: 1.5em;
}

.banner img {
  height: 12em;
}

.banner .facts {
  flex: 1;
}

h1 {
  font-size: 2em;
}

.birth-death {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: .2em;
}

.birth-death span {
  margin-right: 1em;
}

.birth-death span svg {
  margin-right: .5em;
}

img {
  margin-left: 1em;
}

input {
  font-size: 1em;
  font-weight: bold;
  border: none;
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0 .2em;
  box-sizing: border-box;
  text-align: center;
  border-bottom: 2px solid var(--color-border);
  transition: .2s ease;
  margin-right: .5em;
}

input:focus {
  outline: none;
  border-bottom: 2px solid var(--color-text);
}

.image-upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 1em;
  gap: 1em;
}

.image-upload > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .5em;
}

.image-upload button {
  background: var(--color-border);
  border: none;
  border-radius: 5px;
  padding: .5em 1em;
  box-sizing: border-box;
  font-size: 1em;
  font-weight: bold;
  color: var(--color-text);
  width: 100%;
  transition: .2s ease;
}

.image-upload button:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.image-upload input {
  width: 100%;
  box-sizing: border-box;
}

.bio {
  margin-top: 1.5em;
  padding: 1.5em;
}

.full-bio {
  flex-grow: 1;
  flex-basis: 0;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.bio::-webkit-scrollbar {
  width: 0.5rem;
}

.bio::-webkit-scrollbar-track {
  background-color: var(--color-background-soft);
}

.bio::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 0.5rem;
}

.bio::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-hover);
}

.bio::-webkit-scrollbar-corner {
  background-color: var(--color-background-soft);
}

.bio::-webkit-scrollbar-button {
  display: none;
}

.subsection {
  padding: 1em;
  border-left: 2px dashed var(--color-border);
  margin: 1em 0;
}

.subsection .associated-person {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1em;
  padding: .5em 0;
  border: 2px solid var(--color-border);
  margin: .5em 0;
  text-decoration: none;
  color: var(--color-text);
}

.subsection .associated-person:first-child {
  margin-top: 0;
}

.subsection .associated-person:last-child {
  margin-bottom: 0;
}

.subsection .associated-person img {
  width: 3em;
}

.sources ol {
  list-style-type: decimal;
  padding: 0 1em;
}

.sources li {
  margin: .5em 0;
}

.sources a {
  color: var(--color-text);
}

.sources input {
  text-align: left;
  padding: .5em;
  font-weight: normal;
}

.sources button {
  display: inline-block;
  width: auto;
  padding: .5em;
  font-size: 1em;
  margin-right: .2em;
}
</style>


<style>
/* 
for markdown bio 
*/

.md-bio-content img {
  max-width: 100%;
  height: auto;
}

.md-bio-content table {
  border-collapse: collapse;
}

.md-bio-content table td, .md-bio-content table th {
  border: 2px solid var(--color-border);
  padding: .2em 1em;
}

.md-bio-content table th {
  background: var(--color-background-soft);
  font-weight: bold;
}

.md-bio-content a {
  color: var(--color-highlight);
}
</style>
