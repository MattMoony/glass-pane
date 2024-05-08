<script setup lang="ts">
import { defineProps, ref } from 'vue';
import type { Ref } from 'vue';
import Person from '../models/Person';

import PopDropDown from './PopDropDown.vue';

const props = defineProps<{
  /**
   * The person to display in the banner.
   */
  person: Person|null;
  /**
   * Whether to show social media links.
   */
  socials?: boolean;
  /**
   * Whether to show the banner in a small size.
   */
  small?: boolean;
}>();

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

// mock for now
const socials: Ref<{[name: string]: string[]}> = ref({
  phone: [ '+1234567890', ],
  email: [ 'test@asdf.com', 'second@asdf.com', ],
  facebook: [ 'https://facebook.com/test', ],
  instagram: [ 'https://instagram.com/test', ],
  twitter: [ 'https://twitter.com/test', ],
  telegram: [ 'https://t.me/test', ],
  linkedin: [ 'https://linkedin.com/test', ],
  xing: [ 'https://xing.com/test', ],
  youtube: [ 'https://youtube.com/test', ],
  tiktok: [ 'https://tiktok.com/test', ],
  website: [ 'https://test.com', 'https://another.com', ],
  other: [ 'https://other.com', ],
});

const socialsShown: Ref<{[name: string]: boolean}> = ref({});
Object.keys(socials.value).forEach((name) => {
  socialsShown.value[name] = false;
});
</script>

<template>
  <div :class="['banner', props.small ? 'small' : '',]">
    <div 
      class="banner-facts"
      v-if="props.person"
    >
      <h1 v-if="!props.small">
        {{ props.person.firstname }} {{ props.person.lastname }}
      </h1>
      <h3 v-else>
        {{ props.person.firstname }} {{ props.person.lastname }}
      </h3>
      <div class="banner-birth-death">
        <span v-if="props.person.birthdate">
          <font-awesome-icon icon="fa-solid fa-baby" />
          {{ props.person.birthdate.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
        </span>
        <span v-if="props.person.deathdate">
          <font-awesome-icon icon="fa-solid fa-skull" />
          {{ props.person.deathdate.toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
        </span>
        <span v-if="props.person.age > -1">
          (Age: {{ props.person.age }})
        </span>
      </div>
      <div v-if="props.socials" class="banner-socials">
        <template 
          v-for="name in Object.keys(socials)"
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
                :href="link"
                _target="blank"
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
        <i>Person doesn't exist (anymore) ...</i>
      </h1>
      <h3 v-else>
        <i>Person doesn't exist (anymore) ...</i>
      </h3>
    </div>
    <div class="banner-image">
      <img 
        :src="props.person ? props.person.pic.src() : '/john-doe.png'" 
        alt="Person image" 
      />
    </div>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: 1em;
  border-bottom: 2px solid var(--color-border);
  padding: 1.5em;
}

.banner.small {
  padding: 1em;
}

.banner-facts {
  flex-grow: 1;
  flex-basis: 0;
}

.banner-image img {
  width: auto;
  height: 12em;
  border-radius: 5px;
}

.small .banner-image img {
  height: 4em;
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

.banner-birth-death span {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .5em;
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