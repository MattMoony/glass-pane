<script setup lang="ts">
import { useUserStore } from '@/stores/user';

import NavBar from '@/components/NavBar.vue';
import BigSearch from '@/components/BigSearch.vue';
import DataStats from '@/components/DataStats.vue';
import RandomPreview from '@/components/info/RandomPreview.vue';

const user = useUserStore();
</script>

<template>
  <main>
    <NavBar>
    </NavBar>
    <article class="gp-scroll">
      <div class="search-container">
        <BigSearch />
      </div>
      <div class="other-content">
        <DataStats 
          :stats="['people', 'organizations', 'relations', 'memberships',]"
        />
        <div 
          v-if="user.user"
          class="tools"
        >
          <router-link to="/p">
            <button>
              <font-awesome-icon :icon="['fas', 'plus']" />
              Person
            </button>
          </router-link>
          <router-link to="/o">
            <button>
              <font-awesome-icon :icon="['fas', 'plus']" />
              Organization
            </button>
          </router-link>
        </div>
        <div class="about">
          <h2>About</h2>
          <p>
            Welcome to Glass Pane, an initiative aimed at <span class="gp-highlight-text">mapping the intricate relationships 
            and memberships between politicians and key figures</span>. Our interactive platform strives 
            to provide <span class="gp-highlight-text">insights into the networks that shape political landscapes</span>, offering a 
            glimpse into connections, affiliations, and influences. Explore the links and connections 
            that matter with Glass Pane.
          </p>
          <p class="gp-callout">
            Credit where credit is due - this project has been heavily inspired by <a href="https://littlesis.org">littlesis.org</a>.
          </p>
        </div>
        <div class="goals">
          <h2>Our Goals</h2>
          <p>
            At Glass Pane, our goal is to <span class="gp-highlight-text">illuminate the complex web of relationships and 
            memberships</span> among politicians and influential figures. We aim to:
          </p>
          <ol>
            <li>Provide a <span class="gp-highlight-text">comprehensive overview</span> of the connections that shape political landscapes.</li>
            <li>Offer <span class="gp-highlight-text">insights into the networks</span> that influence decision-making processes.</li>
            <li>Enable users to <span class="gp-highlight-text">explore the relationships</span> that matter to them.</li>
            <li>Facilitate a <span class="gp-highlight-text">deeper understanding</span> of the connections that drive political agendas.</li>
          </ol>
          <p class="gp-callout">
            We believe that <span class="gp-highlight-text">transparency is key</span> - not only to understanding the political landscape,
            that's why you can find the source code for this project on <a href="https://github.com/MattMoony/glass-pane">GitHub</a>.
          </p>
        </div>
        <div class="preview">
          <h2>Random Entries</h2>
          <p>
            And now for a <span class="gp-highlight-text">random selection of entries</span> from our database - in case you don't yet know where to start.
          </p>
          <RandomPreview />
        </div>
      </div>
    </article>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  flex-direction: column;
}

article {
  flex-basis: 0;
  flex-grow: 1;
}

.search-container {
  padding: 6rem 2rem;
  background-color: var(--color-background-soft);
}

.other-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 2rem;
  padding: 2rem;
}

.other-content > div > h2 {
  margin-bottom: .5rem;
}

.other-content ol {
  padding: 1rem 2rem;
  list-style: decimal;
}

.other-content ol li:not(:last-child) {
  margin-bottom: .2rem;
}

.bar-container {
  width: 80vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tools {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  padding: 2rem 0;
  border-top: 2px solid var(--color-border);
  border-bottom: 2px solid var(--color-border);
}

.tools a {
  text-decoration: none;
  color: var(--color-text);
}

.tools button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  background-color: var(--color-background-mute);
  color: var(--color-text);
}
</style>