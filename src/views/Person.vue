<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import PersonDescription from '../components/PersonDescription.vue'
import PersonNetwork from '../components/PersonNetwork.vue'
</script>

<template>
    <article>
        <NavBar :qry="this.$route.params.id" />
        <div class="person-container">
            <div class="part-headings">
                <div>
                    <span>
                        <font-awesome-icon icon="fa-solid fa-eye-slash" />
                        Description
                    </span>
                </div>
                <div>
                    <span>
                        <font-awesome-icon icon="fa-solid fa-eye-slash" />
                        Network
                    </span>
                </div>
            </div>
            <div class="details">
                <div class="person-desc">
                    <PersonDescription />
                </div>
                <div class="person-netw">
                    <PersonNetwork />
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
article {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
}

.person-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch
}

.part-headings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 1fr;
    border-bottom: 2px solid var(--color-border);
    user-select: none;
}

.part-headings div span {
    display: inline-block;
    cursor: pointer;
    padding: .2em;
    font-weight: bold;
}

.details {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.person-desc {
    padding: 2em;
}

.person-netw {
    overflow: hidden;
    border-left: 2px solid var(--color-border);
}
</style>