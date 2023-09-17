<script setup lang="ts">
import AppButton from "primevue/button";
import { RouterLink } from "vue-router";
</script>

<template>
  <main>
    <div id="center">
      <RouterLink to="dashboard">
        <AppButton>Go to dashboard</AppButton>
      </RouterLink>
    </div>
  </main>
</template>

<style>
#center {
  width: 100%;
  height: 100vh; 
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>