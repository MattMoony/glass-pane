<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{
  person: {
    id: string
    firstname: string
    lastname: string
    birthdate?: Date
    deathdate?: Date
  },
  editPerson: boolean,
}>()
const emit = defineEmits(['save'])

const firstname = ref('')
const lastname = ref('')
const birthdate = ref('')
const deathdate = ref('')

const watchPerson = () => {
  const person = props.person;
  if (!person) return;
  firstname.value = person.firstname ?? '';
  lastname.value = person.lastname ?? '';
  birthdate.value = person.birthdate ? `${person.birthdate.getFullYear()}-${("0"+(person.birthdate.getMonth()+1)).slice(-2)}-${("0"+(person.birthdate.getDate())).slice(-2)}` : '';
  deathdate.value = person.deathdate ? `${person.deathdate.getFullYear()}-${("0"+(person.deathdate.getMonth()+1)).slice(-2)}-${("0"+(person.deathdate.getDate())).slice(-2)}` : '';
};

watch(() => props.person, watchPerson);
watch(() => props.editPerson, watchPerson);

const saveChanges = () => {
  console.log('save changes');
  emit('save', {
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

</script>

<template>
  <div>
    <button @click.stop="saveChanges()" v-if="editPerson" class="save-button">
      <font-awesome-icon icon="fa-solid fa-save" />
      Save
    </button>
    <div class="banner">
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
  </div>
</template>

<style scoped>
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
</style>
