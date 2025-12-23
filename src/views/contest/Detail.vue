<template>
  <div class="contest-detail">
    <ContestHeader />
    <ContestSubNav />
    <div class="contest-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ContestHeader from '@/components/ContestHeader.vue'
import ContestSubNav from '@/components/ContestSubNav.vue'
</script>

<style scoped>
.contest-detail {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.contest-content {
  min-height: calc(100vh - 200px);
}
</style>

