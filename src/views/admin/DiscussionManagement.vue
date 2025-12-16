<template>
  <div class="discussion-management">
    <router-view v-slot="{ Component, route }">
      <transition name="settings-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'DiscussionManagement'
}
</script>

<style scoped>
.discussion-management {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 100%;
  position: relative;
}

/* 设置内容区域过渡动画 */
.settings-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.settings-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.settings-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.settings-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

