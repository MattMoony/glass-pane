<script setup lang="ts">
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { onMounted } from 'vue';

const props = defineProps<{
  center?: [number, number];
}>();

const emits = defineEmits<{
  (e: 'change', bounds: GeoJSON.BBox): void;
}>();

var map: L.Map|undefined = undefined;

onMounted(() => {
  map = L.map('map').setView([48.210033, 16.363449,], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  map.on('click', e => console.log(e.latlng));
  map.on('dragend', e => emits('change', map!.getBounds().toBBoxString().split(',').map(parseFloat) as GeoJSON.BBox));
  map.on('zoomend', e => emits('change', map!.getBounds().toBBoxString().split(',').map(parseFloat) as GeoJSON.BBox));
});
</script>

<template>
  <div id="map">
  </div>
</template>

<style scoped>
#map {
  flex: 1;
  flex-basis: 0;
  width: 100%;
  height: 100%;
}
</style>
