<script setup lang="ts">
const props = defineProps<{
  person: {
    id: string
    firstname: string
    lastname: string
    birthdate?: Date
    deathdate?: Date
  }
}>()
</script>

<template>
  <div class="banner">
    <div class="facts">
      <h1>{{ $props.person?.firstname }} {{ $props.person?.lastname }}</h1>
      <div class="birth-death">
        <span v-if="$props.person?.birthdate">
          <font-awesome-icon icon="fa-solid fa-baby" />
          {{ new Date($props.person?.birthdate).toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
        </span>
        <span v-if="$props.person?.deathdate">
          <font-awesome-icon icon="fa-solid fa-skull" />
          {{ new Date($props.person?.deathdate).toLocaleDateString('en-us', { weekday:undefined, year:"numeric", month:"short", day:"numeric"}) }}
        </span>
      </div>
    </div>
    <img src="/john-doe.png" alt="Person's face." />
  </div>
</template>

<style scoped>
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
}

.birth-death span {
  margin-right: 1em;
}

img {
  margin-left: 1em;
}
</style>
