<template>
  <div class="contest-submissions">
    <div class="submissions-container">
      <div class="submissions-card">
        <h2 class="card-title">提交记录</h2>
        <div v-if="submissions.length > 0" class="submissions-list">
          <div 
            v-for="submission in submissions" 
            :key="submission.id"
            class="submission-item"
            @click="goToSubmission(submission.id)"
          >
            <div class="submission-id">#{{ submission.id }}</div>
            <div class="submission-problem">{{ submission.problemTitle }}</div>
            <div class="submission-status">
              <span :class="['status-badge', `status-${submission.status}`]">
                {{ getStatusText(submission.status) }}
              </span>
            </div>
            <div class="submission-time">{{ formatTime(submission.submitTime) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无提交记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submissions = ref([])

const goToSubmission = (submissionId) => {
  router.push(`/submissions/${submissionId}`)
}

const getStatusText = (status) => {
  const map = {
    'accepted': '通过',
    'wrong_answer': '答案错误',
    'time_limit_exceeded': '超时',
    'memory_limit_exceeded': '内存超限',
    'runtime_error': '运行错误',
    'compilation_error': '编译错误',
    'pending': '等待中'
  }
  return map[status] || status
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  // TODO: 从API获取提交记录
  // const contestId = route.params.id
  submissions.value = []
})
</script>

<style scoped>
.contest-submissions {
  padding: 30px 20px;
}

.submissions-container {
  max-width: 1100px;
  margin: 0 auto;
}

.submissions-card {
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

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submission-item {
  display: grid;
  grid-template-columns: 100px 1fr 120px 180px;
  gap: 20px;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submission-item:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.submission-id {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.submission-problem {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.submission-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-wrong_answer,
.status-time_limit_exceeded,
.status-memory_limit_exceeded,
.status-runtime_error,
.status-compilation_error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.submission-time {
  font-size: 14px;
  color: #666666;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

@media (max-width: 768px) {
  .submission-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>

