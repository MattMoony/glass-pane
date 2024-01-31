<script setup lang="ts">
import SelectSearch from '../components/SelectSearch.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  qry?: string,
  result?: {
    id: string,
    firstname: string,
    lastname: string,
    type: string,
  }
}>()

const router = useRouter()
</script>

<template>
  <SelectSearch :qry="props.qry" :result="props.result" @select="r => router.push(`/p/${r.id}`)" />
</template>

<style scoped>

</style>