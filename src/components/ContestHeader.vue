<template>
  <div class="contest-header">
    <div class="header-container">
      <div class="header-content">
        <div class="header-left">
          <h1 class="contest-title">{{ contestInfo.name || '比赛名称' }}</h1>
          <div class="contest-meta">
            <span class="meta-badge format-badge" :class="`format-${getFormatClass(contestInfo.format)}`">
              {{ contestInfo.format || 'ACM' }}
            </span>
            <span class="meta-badge type-badge" :class="`type-${getTypeClass(contestInfo.type)}`">
              {{ contestInfo.type || '公开赛' }}
            </span>
            <span class="meta-badge status-badge" :class="`status-${getStatusClass(contestInfo.status)}`">
              {{ getStatusText(contestInfo.status) }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <div class="time-info">
            <div class="time-item">
              <span class="time-label">开始时间</span>
              <span class="time-value">{{ formatDateTime(contestInfo.startTime) }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">结束时间</span>
              <span class="time-value">{{ formatDateTime(contestInfo.endTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const contestInfo = ref({
  name: '',
  format: '',
  type: '',
  status: '',
  startTime: '',
  endTime: ''
})

const getFormatClass = (format) => {
  const map = {
    'ACM': 'acm',
    'IOI': 'ioi',
    'OI': 'io'
  }
  return map[format] || 'acm'
}

const getTypeClass = (type) => {
  const map = {
    '公开赛': 'public',
    '私有赛': 'private'
  }
  return map[type] || 'public'
}

const getStatusClass = (status) => {
  const map = {
    '即将开始': 'upcoming',
    '进行中': 'active',
    '已结束': 'ended'
  }
  return map[status] || 'upcoming'
}

const getStatusText = (status) => {
  return status || '即将开始'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '--'
  try {
    // 后端返回 ISO 时间，如 2025-12-23T15:12:00+00:00
    // 为避免时区转换导致时间偏移，这里直接解析字符串，不使用 Date 时区转换
    const [datePart, timePartRaw] = dateString.split('T')
    if (!datePart || !timePartRaw) {
      return dateString
    }
    // 去掉时区部分，只保留时:分
    const timePart = timePartRaw.split(/[.+Z]/)[0] || timePartRaw
    const [hh, mm] = timePart.split(':')
    const hour = hh ?? '00'
    const minute = mm ?? '00'
    return `${datePart} ${hour}:${minute}`
  } catch (e) {
    return '--'
  }
}

const fetchContestInfo = async () => {
  const contestId = route.params.id
  try {
    const response = await request.get(`/contests/${contestId}`)
    if (response.code === 'success' && response.data) {
      const data = response.data
      contestInfo.value = {
        name: data.name || '',
        format: data.rule_config?.contest_type || 'ACM',
        type: data.rule_config?.contest_mode || '公开赛',
        status: data.time_config?.status || '即将开始',
        startTime: data.time_config?.start_time || '',
        endTime: data.time_config?.end_time || ''
      }
    }
  } catch (error) {
    console.error('获取比赛信息失败:', error)
    // 如果API调用失败，使用默认值
  }
}

onMounted(() => {
  fetchContestInfo()
})
</script>

<style scoped>
.contest-header {
  background-color: #ffffff;
  color: #333333;
  padding: 30px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
}

.header-container {
  max-width: 1100px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.header-left {
  flex: 1;
}

.contest-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333333;
}

.contest-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: #333333;
}

.format-badge.format-acm {
  background-color: #e6f7ff;
  border: 1px solid #1890ff;
  color: #1890ff;
}

.format-badge.format-ioi {
  background-color: #fff7e6;
  border: 1px solid #fa8c16;
  color: #fa8c16;
}

.format-badge.format-io {
  background-color: #f6ffed;
  border: 1px solid #52c41a;
  color: #52c41a;
}

.type-badge.type-public {
  background-color: #f0f0f0;
  border: 1px solid #d9d9d9;
  color: #333333;
}

.type-badge.type-private {
  background-color: #fff1f0;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.status-badge.status-upcoming {
  background-color: #e6f7ff;
  border: 1px solid #1890ff;
  color: #1890ff;
}

.status-badge.status-active {
  background-color: #f6ffed;
  border: 1px solid #52c41a;
  color: #52c41a;
}

.status-badge.status-ended {
  background-color: #fff1f0;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.header-right {
  flex-shrink: 0;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f5f5f5;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-width: 220px;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 12px;
  color: #666666;
  font-weight: 500;
}

.time-value {
  font-size: 16px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #333333;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .contest-title {
    font-size: 24px;
  }

  .time-info {
    width: 100%;
    min-width: auto;
  }

  .header-right {
    width: 100%;
  }
}
</style>

