<script setup lang="ts">
import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

import { API } from '@/api';
import { uploadBioPic, type OrganSocials, type OrganSource } from '@/api/organ';
import Person from '../models/Person';
import Relation from '@/models/Relation';
import RelationType from '@/models/RelationTypes';
import Membership from '@/models/Membership';
import Role from '@/models/Role';
import SocialsPlatform, { icons } from '@/models/SocialsPlatform';
import type Organization from '@/models/Organization';
import * as lib from '@/lib/socials';

import PersonBanner from './PersonBanner.vue';
import MembershipInfo from './MembershipInfo.vue';
import SelectSearchNew from './SelectSearchNew.vue';
import RelationInfo from './RelationInfo.vue';

const props = defineProps<{
  /**
   * The person to display in the details.
   */
  person: Person|null;
  /**
   * Whether to allow editing the person.
   */
  edit?: boolean;
  /**
   * Whether to hide relations.
   */
  hideRelations?: boolean;
  /**
   * Whether to hide memberships.
   */
  hideMemberships?: boolean;
  /**
   * If you want to receive updated sources.
   */
  updatedSources?: OrganSource[];
}>();

const bio: Ref<string|undefined> = ref(undefined);
const bioEditorState = shallowRef(null);
const bioEditorView = shallowRef(null);
const sources: Ref<OrganSource[]> = ref([]);
const socials: Ref<OrganSocials[]> = ref([]);
const parents: Ref<Relation[]> = ref([]);
const romantic: Ref<Relation[]> = ref([]);
const children: Ref<Relation[]> = ref([]);
const friends: Ref<Relation[]> = ref([]);
const memberships: Ref<Membership[]> = ref([]);
const newSource: Ref<string> = ref('');
const newSocial: Ref<OrganSocials> = ref({ id: -1, platform: SocialsPlatform.OTHER, url: '', });
const newParent: Ref<Relation|null> = ref(null);
const newRomantic: Ref<Relation|null> = ref(null);
const newChild: Ref<Relation|null> = ref(null);
const newFriend: Ref<Relation|null> = ref(null);
const newMembership: Ref<Membership|null> = ref(null);

const addSource = async () => {
  if (!newSource.value.trim()) return;
  if (!props.updatedSources) {
    const source = await props.person?.sources.add(newSource.value);
    if (source) {
      sources.value.push(source);
      newSource.value = '';
    }
  } else {
    props.updatedSources.push({ sid: -props.updatedSources.length, url: newSource.value, });
    newSource.value = '';
  }
};

const updateSource = async (source: OrganSource) => {
  if (!source.url.trim()) return;
  if (!props.updatedSources) {
    await props.person?.sources.update(source.sid, source.url);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources[index].url = source.url;
    }
  }
};

const removeSource = async (source: OrganSource) => {
  if (!props.updatedSources) {
    await props.person?.sources.remove(source.sid);
    sources.value = sources.value.filter(s => s.sid !== source.sid);
  } else {
    const index = props.updatedSources.findIndex(s => s.sid === source.sid);
    if (index !== -1) {
      props.updatedSources.splice(index, 1);
    }
  }
};

const addSocial = async () => {
  if (!newSocial.value.url.trim()) return;
  const res = await props.person?.socials.add(+newSocial.value.platform, newSocial.value.url);
  if (!res) return;
  socials.value.push(res);
  newSocial.value = { id: -1, platform: SocialsPlatform.OTHER, url: '', };
};

const updateSocial = async (social: OrganSocials) => {
  if (!social.url.trim()) return;
  social.platform = +social.platform;
  await props.person?.socials.update(social.id, social.platform, social.url);
};

const removeSocial = async (social: OrganSocials) => {
  await props.person?.socials.remove(social.id);
  socials.value = socials.value.filter(s => s.id !== social.id);
};

const addMembership = async () => {
  if (!props.person || !newMembership.value || newMembership.value.role.id < 0 || isNaN(newMembership.value.since.getTime())) return;
  await newMembership.value.create([ 'none', ]);
  memberships.value.push(newMembership.value);
  newMembership.value = null;
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeMembership = async (membership: Membership) => {
  await membership.remove();
  const index = memberships.value.findIndex(m => 
    m.organ.id === membership.organ.id &&
    m.organization.id === membership.organization.id &&
    m.role.id === membership.role.id &&
    m.since === membership.since);
  memberships.value.splice(index, 1);
  props.person._vref = Math.floor(Math.random() * 1000);
};

const addParent = async () => {
  if (!props.person || !newParent.value || isNaN(newParent.value.since.getTime())) return;
  console.log(newParent.value);
  await props.person.relations.add(newParent.value, [ 'none', ]);
  parents.value.push(newParent.value);
  newParent.value = null;
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeParent = async (parent: Relation) => {
  if (!props.person) return;
  await props.person.relations.remove(parent);
  parents.value = parents.value.filter(p => 
    p.other.id !== parent.other.id ||
    p.since !== parent.since);
  props.person._vref = Math.floor(Math.random() * 1000);
};

const addRomantic = async () => {
  if (!props.person || !newRomantic.value || isNaN(newRomantic.value.since.getTime())) return;
  await props.person.relations.add(newRomantic.value, [ 'none', ]);
  romantic.value.push(newRomantic.value);
  newRomantic.value = null;
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeRomantic = async (romantic: Relation) => {
  if (!props.person) return;
  await props.person.relations.remove(romantic);
  romantic.value = romantic.value.filter(r => 
    r.other.id !== romantic.other.id ||
    r.since !== romantic.since);
  props.person._vref = Math.floor(Math.random() * 1000);
};

const addChild = async () => {
  if (!props.person || !newChild.value || isNaN(newChild.value.since.getTime())) return;
  await props.person.relations.add(newChild.value, [ 'none', ]);
  children.value.push(newChild.value);
  newChild.value = null;
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeChild = async (child: Relation) => {
  if (!props.person) return;
  await props.person.relations.remove(child);
  children.value = children.value.filter(c => 
    c.other.id !== child.other.id ||
    c.since !== child.since);
  props.person._vref = Math.floor(Math.random() * 1000);
};

const addFriend = async () => {
  if (!props.person || !newFriend.value || isNaN(newFriend.value.since.getTime())) return;
  await props.person.relations.add(newFriend.value, [ 'none', ]);
  friends.value.push(newFriend.value);
  newFriend.value = null;
  props.person._vref = Math.floor(Math.random() * 1000);
};

const removeFriend = async (friend: Relation) => {
  if (!props.person) return;
  await props.person.relations.remove(friend);
  friends.value = friends.value.filter(f => 
    f.other.id !== friend.other.id ||
    f.since !== friend.since);
  props.person._vref = Math.floor(Math.random() * 1000);
};

const bioKeyDown = (e: KeyboardEvent) => {
  if (e.key === 's' && e.ctrlKey) {
    console.log(e.key, e.ctrlKey, e.metaKey, e.shiftKey, e.altKey);
    e.preventDefault();
    (async () => props.person && await props.person.update())();
    return false;
  }
  else if (e.key === 'v' && e.ctrlKey) {
    console.log('pasting');
    (async () => {
      if (!props.person) return;
      const raw: ClipboardItem[] = await navigator.clipboard.read();
      const img: ClipboardItem|null = raw.find(item => item.types.some(t => t.includes('image/'))) || null;
      if (!bioEditorView.value || !img) return;
      const type: string = img.types.find(t => t.includes('image/')) || '';
      const blob: Blob = await img.getType(type as 'image/png').catch(() => new Blob());
      if (!blob.size) return;
      const res = await uploadBioPic(props.person.id, blob);
      if (!res.success) return;
      bioEditorView.value.dispatch({
        changes: { from: bioEditorView.value.state.selection.ranges[0].anchor, insert: `![](${API}${res.url})`, }
      })
    })();
  }
};

const editorReady = (payload: any) => {
  bioEditorState.value = payload.state;
  bioEditorView.value = payload.view;
};

watch(() => props.person, async (newPerson: Person|null) => {
  if (!newPerson) return;
  bio.value = await newPerson.bioHTML();
  sources.value = await newPerson.sources.get();
  socials.value = await newPerson.socials.get();
  if (!props.hideRelations) {
    parents.value = await newPerson.parents.get();
    children.value = await newPerson.children.get();
    romantic.value = await newPerson.romantic.get();
    friends.value = await newPerson.friends.get();
  }
  if (!props.hideMemberships) {
    memberships.value = await Membership.get(newPerson);
  }
  props.updatedSources?.splice(0, props.updatedSources.length, ...sources.value);
}, { immediate: true });

watch(() => props.person?.bio, async () => {
  if (!props.person) return;
  bio.value = await props.person.bioHTML();
});
</script>

<template>
  <section v-if="person" :class="[edit ? 'edit' : '',]">
    <div class="bio">
      <h2>Biography</h2>
      <div
        v-if="!edit"
        class="md-bio"
        v-dompurify-html="bio"
      ></div>
      <div
        v-else
        class="md-bio"
      >
        <codemirror 
          ref="bioEditor"
          v-model="person.bio"
          :extensions="[markdown(), oneDark,]"
          @keydown="bioKeyDown"
          @blur="async () => person && await person.update()"
          @ready="editorReady"
        />
      </div>
    </div>
    <div class="memberships" v-if="!hideMemberships">
      <h2>Memberships</h2>
      <div>
        <template v-if="memberships && memberships.length">
          <template v-if="!edit">
            <RouterLink
              class="connection-wrapper"
              v-for="membership in memberships"
              :key="membership.organization.id"
              :to="`/o/${membership.organization.id}`"
            >
              <MembershipInfo
                :membership="membership"
                organ-membership
              />
            </RouterLink>
          </template>
          <template v-else>
            <div
              v-for="membership in memberships"
              :key="membership.organization.id"
            >
              <MembershipInfo
                :membership="membership"
                organ-membership
                edit
                @change="async () => await membership.update()"
              />
              <div class="button-wrapper">
                <button @click="() => removeMembership(membership)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known memberships.</i>
        </template>
        <template v-if="edit">
          <h3>New Membership</h3>
          <template v-if="!newMembership">
            <SelectSearchNew
              type="organization"
              @select="org => {
                if (person)
                  newMembership = new Membership(person, org as Organization, new Role(-1, ''), new Date());
              }"
            />
          </template>
          <template v-else>
            <MembershipInfo
              :membership="newMembership"
              organ-membership
              edit
              create
            />
            <div class="button-wrapper">
              <button @click="newMembership = null">
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button @click="addMembership">
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="connections" v-if="!hideRelations">
      <h2>Relations</h2>
      <div>
        <h3>Parents</h3>
        <template v-if="parents && parents.length">
          <template v-if="!edit">
            <RouterLink
              class="connection-wrapper"
              v-for="parent in parents"
              :key="parent.other.id"
              :to="`/p/${parent.other.id}`"
            >
              <RelationInfo
                :relation="parent"
                show-type
              />
            </RouterLink>
          </template>
          <template v-else>
            <div
              v-for="parent in parents"
              :key="parent.other.id"
            >
              <RelationInfo
                :relation="parent"
                edit
                @change="async () => person && await person.relations.update(parent)"
              />
              <div class="button-wrapper">
                <button @click="() => removeParent(parent)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known parents.</i>
        </template>
        <template v-if="edit">
          <h4>New Parent</h4>
          <template v-if="!newParent">
            <SelectSearchNew
              type="person"
              @select="organ => {
                if (organ)
                  newParent = new Relation(RelationType.PARENT, organ as Person, new Date());
              }"
            />
          </template>
          <template v-else>
            <RelationInfo
              :relation="newParent"
              edit
              create
            />
            <div class="button-wrapper">
              <button @click="newParent = null">
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button @click="addParent">
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
        <h3>Romantic</h3>
        <template v-if="romantic && romantic.length">
          <template v-if="!edit">
            <RouterLink
              class="connection-wrapper"
              v-for="partner in romantic"
              :key="partner.other.id"
              :to="`/p/${partner.other.id}`"
            >
              <RelationInfo
                :relation="partner"
                show-type
              />
            </RouterLink>
          </template>
          <template v-else>
            <div
              v-for="partner in romantic"
              :key="partner.other.id"
            >
              <RelationInfo
                :relation="partner"
                edit
                @change="async () => person && await person.relations.update(partner)"
              />
              <div class="button-wrapper">
                <button @click="() => removeRomantic(partner)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known partners.</i>
        </template>
        <template v-if="edit">
          <h4>New Partner</h4>
          <template v-if="!newRomantic">
            <SelectSearchNew
              type="person"
              @select="organ => {
                if (organ)
                  newRomantic = new Relation(RelationType.ROMANTIC, organ as Person, new Date());
              }"
            />
          </template>
          <template v-else>
            <RelationInfo
              :relation="newRomantic"
              edit
              create
            />
            <div class="button-wrapper">
              <button @click="newRomantic = null">
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button @click="addRomantic">
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
        <h3>Children</h3>
        <template v-if="children && children.length">
          <template v-if="!edit">
            <RouterLink
              class="connection-wrapper"
              v-for="child in children"
              :key="child.other.id"
              :to="`/p/${child.other.id}`"
            >
              <RelationInfo
                :relation="child"
                show-type
              />
            </RouterLink>
          </template>
          <template v-else>
            <div
              v-for="child in children"
              :key="child.other.id"
            >
              <RelationInfo
                :relation="child"
                edit
                @change="async () => person && await person.relations.update(child)"
              />
              <div class="button-wrapper">
                <button @click="() => removeChild(child)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known children.</i>
        </template>
        <template v-if="edit">
          <h4>New Child</h4>
          <template v-if="!newChild">
            <SelectSearchNew
              type="person"
              @select="organ => {
                if (organ)
                  newChild = new Relation(RelationType.CHILD, organ as Person, new Date());
              }"
            />
          </template>
          <template v-else>
            <RelationInfo
              :relation="newChild"
              edit
              create
            />
            <div class="button-wrapper">
              <button @click="newChild = null">
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button @click="addChild">
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
        <h3>Friends</h3>
        <template v-if="friends && friends.length">
          <template v-if="!edit">
            <RouterLink
              class="connection-wrapper"
              v-for="friend in friends"
              :key="friend.other.id"
              :to="`/p/${friend.other.id}`"
            >
              <RelationInfo
                :relation="friend"
                show-type
              />
            </RouterLink>
          </template>
          <template v-else>
            <div
              v-for="friend in friends"
              :key="friend.other.id"
            >
              <RelationInfo
                :relation="friend"
                edit
                @change="async () => person && await person.relations.update(friend)"
              />
              <div class="button-wrapper">
                <button @click="() => removeFriend(friend)">
                  <font-awesome-icon icon="trash" />
                  Remove
                </button>
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="!edit">
          <i>No known friends.</i>
        </template>
        <template v-if="edit">
          <h4>New Friend</h4>
          <template v-if="!newFriend">
            <SelectSearchNew
              type="person"
              @select="organ => {
                if (organ)
                  newFriend = new Relation(RelationType.FRIEND, organ as Person, new Date());
              }"
            />
          </template>
          <template v-else>
            <RelationInfo
              :relation="newFriend"
              edit
              create
            />
            <div class="button-wrapper">
              <button @click="newFriend = null">
                <font-awesome-icon icon="times" />
                Cancel
              </button>
              <button @click="addFriend">
                <font-awesome-icon icon="plus" />
                Add
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="sources">
      <h2>Sources</h2>
      <div>
        <ul>
          <li v-for="source in updatedSources||sources" :key="source.sid">
            <a 
              v-if="!edit"
              :href="source.url" 
              target="_blank"
            >{{ source.url }}</a>
            <div v-else>
              <input v-model="source.url" />
              <button @click="updateSource(source)">
                <font-awesome-icon icon="save" />
              </button>
              <button @click="removeSource(source)">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </li>
          <li v-if="edit">
            <div>
              <input 
                v-model="newSource"
                @keyup="e => e.key === 'Enter' && addSource()"
              />
              <button @click="addSource">
                <font-awesome-icon icon="plus" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="edit" class="socials">
      <h2>Socials</h2>
      <div>
        <ul>
          <li v-for="social in socials" :key="social.id">
            <div>
              <input v-model="social.url" />
              <button @click="updateSocial(social)">
                <font-awesome-icon icon="save" />
              </button>
              <button @click="removeSocial(social)">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </li>
          <li>
            <div>
              <select
                v-model="newSocial.platform"
              >
                <option 
                  v-for="icon in Object.keys(icons)" 
                  :value="icon"
                >
                  {{ icons[icon].title }}
                </option>
              </select>
              <input 
                v-model="newSocial.url" 
                @keyup="e => e.key === 'Enter' ? addSocial() : (newSocial.platform = lib.recognize_platform(newSocial.url))"
              />
              <button @click="addSocial">
                <font-awesome-icon icon="plus" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 1em;
}

h2 {
  background-color: var(--color-background-soft);
  padding: .5em;
  border: 2px solid var(--color-border);
  border-radius: 5px 5px 0 0;
}

h2 + div {
  padding: 1em;
  border: 2px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 5px 5px;
}

.connections h3 {
  margin: 1.5em 0 .5em;
  padding: .5em 0;
  border-top: 2px dashed var(--color-border);
  border-bottom: 2px dashed var(--color-border);
}

.connections h3:first-of-type {
  margin-top: 0;
}

.connection-wrapper {
  color: var(--color-text);
  text-decoration: none;
}

.sources ul,
.socials ul {
  padding: 0 1.2em;
}

.sources a,
.socials a {
  color: var(--color-text);
}

.edit li > div {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .3em;
}

.edit input,
.edit button,
.edit select {
  width: 100%;
  padding: .5em;
  margin-bottom: .5em;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.edit button {
  width: auto;
  cursor: pointer;
}

.edit select {
  width: auto;
}

.edit input:focus,
.edit button:focus,
.edit select:focus {
  outline: none;
}

.edit .connections .button-wrapper,
.edit .memberships .button-wrapper {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .4em;
  margin-top: .4em;
}

.edit .connections button,
.edit .memberships button {
  width: 100%;
}

.edit h4 {
  margin: .5em 0;
}
</style>

<style>
/* 
for markdown bio 
*/

.md-bio img {
  max-width: 100%;
  height: auto;
}

.md-bio table {
  border-collapse: collapse;
}

.md-bio table td, 
.md-bio table th {
  border: 2px solid var(--color-border);
  padding: .2em 1em;
}

.md-bio table th {
  background: var(--color-background-soft);
  font-weight: bold;
}

.md-bio a {
  color: var(--color-highlight);
}
</style>
