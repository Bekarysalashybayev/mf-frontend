<template>
<div>
  ABOUT Page  <button @click="goTo">Home</button>
</div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

const goTo = () => {
  router.push({
    path: '/bank',
    query: {
      a: 1
    }
  })
};

</script>

<style scoped>

</style>
