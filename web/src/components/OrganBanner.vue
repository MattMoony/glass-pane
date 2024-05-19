<script setup lang="ts">
import { type Ref, ref, watch } from 'vue';

import Organ from '../models/Organ';
import Person from '@/models/Person';
import Organization from '@/models/Organization';
import SocialsPlatform from '@/models/SocialsPlatform';

import PopDropDown from './PopDropDown.vue';

const props = defineProps<{
  /**
   * The organ to display in the banner.
   */
  organ: Organ|null;
  /**
   * The name to display in the banner.
   */
  name?: string;
  /**
   * The origin date of the organ.
   */
  from?: Date;
  /**
   * The end date of the organ.
   */
  to?: Date;
  /**
   * The age of the organ.
   */
  age?: number;
  /**
   * The social media links to display in the banner.
   */
  socials?: {[name: string]: string[]};
  /**
   * Whether to show social media links.
   */
  showSocials?: boolean;
  /**
   * Whether to show the banner in a small size.
   */
  small?: boolean;
  /**
   * Whether to show the banner in an extra small size.
   */
  extraSmall?: boolean;
  /**
   * Whether to allow editing the organ.
   */
  edit?: boolean;
  /**
   * Updates to export to the parent.
   */
  updated?: {
    /**
     * If the image shouldn't be updated automatically,
     * but exported to the parent component.
     */
    pic?: File;
  }
}>();
const emits = defineEmits<{
  /**
   * Emitted when the organ has been updated.
   */
  (e: 'change', organ: Organ): void;
}>();

const image: Ref<string|undefined> = ref(undefined);
const imageInput: Ref<HTMLInputElement|null> = ref(null);

const icons: {[name: string]: { icon: string, title: string, }} = {
  phone: { icon: 'fa-solid fa-phone', title: 'Phone', },
  email: { icon: 'fa-solid fa-envelope', title: 'Email', },
  facebook: { icon: 'fa-brands fa-facebook', title: 'Facebook', },
  instagram: { icon: 'fa-brands fa-instagram', title: 'Instagram', },
  twitter: { icon: 'fa-brands fa-twitter', title: 'Twitter', },
  telegram: { icon: 'fa-brands fa-telegram', title: 'Telegram', },
  linkedin: { icon: 'fa-brands fa-linkedin', title: 'LinkedIn', },
  xing: { icon: 'fa-brands fa-xing', title: 'Xing', },
  youtube: { icon: 'fa-brands fa-youtube', title: 'YouTube', },
  tiktok: { icon: 'fa-brands fa-tiktok', title: 'TikTok', },
  website: { icon: 'fa-solid fa-globe', title: 'Website', },
  other: { icon: 'fa-solid fa-hashtag', title: 'Other', },
};

const copyLink = (link: string) => {
  navigator.clipboard.writeText(link);
};

const socials: Ref<{[name: string]: string[]}> = ref({});	
const socialsShown: Ref<{[name: string]: boolean}> = ref({});

const updateImage = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      image.value = reader.result as string;
    };
    if (props.updated !== undefined) {

      props.updated.pic = input.files[0];
    } else if (props.organ) {
      props.organ.pic.set(input.files[0]);
    }
    reader.readAsDataURL(input.files[0]);
  }
};

const removeImage = () => {
  image.value = undefined;
  imageInput.value!.value = '';
  if (props.updated !== undefined)
    props.updated.pic = undefined;
  else if (props.organ)
    props.organ.pic.remove();
};

watch(
  () => [ props.organ, props.organ?._vref, ], 
  async () => {
    if (props.organ && props.organ.id > 0) {
      image.value = props.organ.pic.src();
      const rawSocials = await props.organ.socials.get();
      socials.value = {};
      for (const social of rawSocials) {
        const platform = SocialsPlatform[social.platform].toLowerCase();
        if (socials.value[platform])
          socials.value[platform].push(social.url);
        else
          socials.value[platform] = [social.url,];
      }
      for (const key in socials.value) {
        socialsShown.value[key] = false;
      }
    }
  }, 
  { immediate: true, }
);
</script>

<template>
  <div 
    :class="[
      'banner', 
      props.small||props.extraSmall ? 'small' : '',
      props.extraSmall ? 'extra-small' : '',
      props.edit ? 'edit' : '',
    ]"
  >
    <div 
      v-if="props.extraSmall"
      class="banner-image"
    >
      <img 
        :src="props.organ ? props.organ.pic.src() : '/john-doe.png'" 
        :alt="props.name ? props.name : 'Organ image'" 
      />
    </div>
    <div 
      class="banner-facts"
      v-if="props.organ"
    >
      <template v-if="!edit">
        <h1 v-if="!(props.small||props.extraSmall)">
          {{ props.name }}
        </h1>
        <h3 v-else>
          {{ props.name }}
        </h3>
      </template>
      <template v-else>
        <div
          v-if="organ instanceof Person" 
          class="name-edit"
        >
          <input 
            type="text" 
            v-model="organ.firstname" 
            placeholder="First name" 
            maxlength="128"
            required
            @change="() => organ && $emit('change', organ)"
          />
          <input 
            type="text" 
            v-model="organ.lastname" 
            placeholder="Last name" 
            maxlength="128"
            required
            @change="() => organ && $emit('change', organ)"
          />
        </div>
        <div
          v-else-if="organ instanceof Organization" 
          class="name-edit"
        >
          <input 
            type="text" 
            v-model="organ.name" 
            placeholder="Organization name" 
            maxlength="128"
            required
            @change="() => organ && $emit('change', organ)"
          />  
        </div>
      </template>
      <div class="banner-birth-death">
        <template v-if="!edit">
          <span v-if="props.from">
            <font-awesome-icon icon="fa-solid fa-baby" />
            {{ props.from.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
          </span>
          <span v-if="props.to">
            <font-awesome-icon icon="fa-solid fa-skull" />
            {{ props.to.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
          </span>
          <span v-if="props.age">
            (Age: {{ props.age }})
          </span>
        </template>
        <template v-else>
          <div 
            v-if="(organ instanceof Person)"
            class="birth-death-edit"
          >
            <div>
              <font-awesome-icon icon="fa-solid fa-baby" />
              <input 
                type="date" 
                placeholder="Birthdate" 
                :value="organ.birthdate ? organ.birthdate.toISOString().split('T')[0] : ''"
                @change="e => {
                  const d = new Date((e.target as HTMLInputElement).value);
                  if (!isNaN(d.getTime())) {
                    (organ as Person).birthdate = d;
                    organ && $emit('change', organ);
                  }
                }"
              />
            </div>
            <div>
              <font-awesome-icon icon="fa-solid fa-skull" />
              <input 
                type="date" 
                placeholder="Deathdate" 
                :value="organ.deathdate ? organ.deathdate.toISOString().split('T')[0] : ''"
                @change="e => {
                  const d = new Date((e.target as HTMLInputElement).value);
                  if (!isNaN(d.getTime())) {
                    (organ as Person).deathdate = d;
                    organ && $emit('change', organ);
                  }
                }"
              />
            </div>
          </div>
          <div
            v-if="(organ instanceof Organization)"
            class="birth-death-edit"
          >
            <div>
              <font-awesome-icon icon="fa-solid fa-baby" />
              <input 
                type="date" 
                placeholder="Foundation date" 
                :value="organ.established ? organ.established.toISOString().split('T')[0] : ''"
                @change="e => {
                  const d = new Date((e.target as HTMLInputElement).value);
                  if (!isNaN(d.getTime())) {
                    (organ as Organization).established = d;
                    organ && $emit('change', organ);
                  }
                }"
              />
            </div>
            <div>
              <font-awesome-icon icon="fa-solid fa-skull" />
              <input 
                type="date"  
                placeholder="Dissolution date" 
                :value="organ.dissolved ? organ.dissolved.toISOString().split('T')[0] : ''"
                @change="e => {
                  const d = new Date((e.target as HTMLInputElement).value);
                  if (!isNaN(d.getTime())) {
                    (organ as Organization).dissolved = d;
                    organ && $emit('change', organ);
                  }
                }"
              />
            </div>
          </div>
        </template>
      </div>
      <div v-if="!edit && props.showSocials && socials && Object.keys(socials).length" class="banner-socials">
        <template 
          v-for="name in Object.keys(icons).filter(key => socials[key])"
          :key="name"
        >
          <font-awesome-icon 
            :icon="icons[name].icon" 
            :title="icons[name].title"
            :style="{ color: socialsShown[name] ? 'var(--color-text-focus)' : 'var(--color-text)' }"
            @click="() => {
              Object.keys(socialsShown)
                    .filter(key => key !== name)
                    .forEach((key) => {
                socialsShown[key] = false;
              });
              socialsShown[name] = !socialsShown[name];
            }"
          />
          <PopDropDown 
            :shown="socialsShown[name]"
          >
            <div
              v-for="link in socials[name]"
              :key="link"
              class="banner-socials-link"
            >
              <font-awesome-icon 
                icon="fa-solid fa-copy" 
                title="Copy link to clipboard"
                @click="() => copyLink(link)"
              />
              <a 
                _target="blank"
                :href="link"
              >{{ link }}</a>
            </div>
          </PopDropDown>
        </template>
      </div>
    </div>
    <div
      class="banner-facts"
      v-else
    >
      <h1 v-if="!props.small">
        <i>Organ doesn't exist (anymore) ...</i>
      </h1>
      <h3 v-else>
        <i>Organ doesn't exist (anymore) ...</i>
      </h3>
    </div>
    <div 
      v-if="!props.extraSmall"
      class="banner-image"
    >
      <img 
        v-if="!edit"
        :src="props.organ ? props.organ.pic.src() : '/john-doe.png'" 
        :alt="props.name ? props.name : 'Organ image'" 
      />
      <div
        v-else
        class="banner-image-upload"
      >
        <img
          :src="image 
            ? image 
            : props.organ instanceof Person
            ? '/person.webp'
            : '/corp.webp'" 
          :alt="props.name ? props.name : 'Organ image'"
        />
        <input
          ref="imageInput"
          type="file" 
          accept="image/*"
          @change="updateImage"
        />
        <button @click="removeImage">
          <font-awesome-icon icon="fa-solid fa-trash" />
          Remove image
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  justify-content: stretch;
  align-items: center;
  flex-wrap: wrap;
  gap: 1em;
  border-bottom: 2px solid var(--color-border);
  padding: 1.5em;
  word-wrap: break-word;
}

.banner.small {
  padding: 1em;
}

.banner.extra-small {
  border: none;
}

.banner-facts {
  flex-grow: 1;
  flex-basis: 0;
}

.banner input,
.banner button {
  width: 100%;
  padding: .5em;
  margin: .2em 0;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  color: var(--color-text);
  background-color: var(--color-background-mute);
}

.banner input:focus,
.banner button:focus {
  outline: none;
}

.banner button {
  cursor: pointer;
}

.banner-image img {
  width: auto;
  height: 12em;
  border-radius: 5px;
}

.small .banner-image img {
  height: 4em;
}

.extra-small .banner-image img {
  height: 2em;
}

.edit img {
  height: 8em;
  margin: 1em;
}

.banner-image-upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: .5em;
  border: 1px dashed var(--color-border);
  border-radius: 5px;
}

.banner-facts h1 {
  font-size: 2em;
}

.banner-birth-death {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1em;
  margin-top: .2em;
  padding: 0 .5em;
}

.small .banner-birth-death {
  padding: 0;
  gap: .5em;
}

.extra-small .banner-birth-death {
  font-size: .8em;
}

.banner-birth-death span {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .5em;
}

.birth-death-edit {
  width: 100%;
}

.birth-death-edit > div {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: .5em;
}

.birth-death-edit svg {
  width: 2rem;
}

.birth-death-edit input {
  flex-grow: 1;
  display: inline-block;
}

.banner-socials {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .4em;
  font-size: 1.1em;
  flex-wrap: wrap;
  color: var(--color-text);
  padding: .5em;
  margin-top: .5em;
  background-color: var(--color-background-mute);
  user-select: none;
}

.banner-socials svg {
  cursor: pointer;
  transition: color .2s;
}

.banner-socials svg:hover {
  color: var(--color-text-focus);
}

.banner-socials-link {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .5em;
  padding: .1em;
}

.banner-socials a {
  font-size: .9em;
  color: var(--color-text);
  text-decoration: none;
}
</style>