<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
    qry?: string
}>()
const qry = ref(props.qry || '')

</script>

<template>
    <nav>
        <RouterLink to="/">
            <img class="myimg" src="/pane.png" alt="Glass Pane Logo" />
        </RouterLink>
        <form>
            <input v-model="qry" type="search" placeholder="..." />
            <button type="submit">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
            </button>
        </form>
        <div class="social">
            <a href="//github.com/MattMoony/glass-pane">
                <font-awesome-icon icon="fa-brands fa-github" />
            </a>
        </div>
    </nav>
</template>

<style scoped>
    nav {
        display: flex;
        justify-content: start;
        align-items: stretch;
        background-color: var(--color-background);
        border-bottom: 4px solid var(--color-border);
        padding: 1em;
    }

    img {
        height: 2em;
        margin-right: 1em;
    }

    form {
        flex: 1;
        display: flex;
        justify-content: start;
        align-items: center;
    }

    input {
        flex: 1;
        border: 2px solid var(--color-border);
        border-radius: .5em;
        padding: .5em;
        font-size: 1.1em;
        background-color: var(--color-background);
        color: var(--color-text);
        transition: .2s ease;
    }

    input:focus {
        outline: none;
        color: var(--color-text-focus);
    }

    button {
        background-color: var(--color-background);
        border: none;
        margin-left: .5em;
        color: var(--color-text);
        transition: .2s ease;
        font-size: 1.2em;
    }

    button:hover,
    button:focus {
        cursor: pointer;
        color: var(--color-highlight);
        transform: scale(1.1);
        outline: none;
    }

    a {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        color: var(--color-text);
        transition: .2s ease;
    }

    a:hover {
        color: var(--color-highlight);
    }

    .social {
        display: flex;
        justify-content: center;
        align-items: center;
        border-left: 2px solid var(--color-border);
        padding-left: 1em;
        margin-left: 1em;
    }
</style>