<template>
  <router-view />
</template>

<script setup lang="ts">
import { useHostProxy } from './composables/useHostProxy'
useHostProxy()
</script>

<style scoped></style>
