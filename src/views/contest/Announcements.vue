<template>
  <div class="contest-announcements">
    <div class="announcements-container">
      <div class="announcements-card">
        <h2 class="card-title">比赛公告</h2>
        <div v-if="announcements.length > 0" class="announcements-list">
          <div 
            v-for="announcement in announcements" 
            :key="announcement.id"
            class="announcement-item"
          >
            <div class="announcement-header">
              <h3 class="announcement-title">{{ announcement.title }}</h3>
              <span class="announcement-time">{{ formatTime(announcement.createTime) }}</span>
            </div>
            <div class="announcement-content" v-html="announcement.content"></div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无公告</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const announcements = ref([])

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  // TODO: 从API获取公告列表
  // const contestId = route.params.id
  announcements.value = []
})
</script>

<style scoped>
.contest-announcements {
  padding: 30px 20px;
}

.announcements-container {
  max-width: 1100px;
  margin: 0 auto;
}

.announcements-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 24px;
  color: #333333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8e8e8;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-item {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.announcement-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-title {
  font-size: 18px;
  color: #333333;
  font-weight: 600;
  margin: 0;
}

.announcement-time {
  font-size: 14px;
  color: #999999;
  white-space: nowrap;
}

.announcement-content {
  font-size: 15px;
  line-height: 1.8;
  color: #666666;
}

.announcement-content :deep(p) {
  margin-bottom: 12px;
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

@media (max-width: 768px) {
  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

