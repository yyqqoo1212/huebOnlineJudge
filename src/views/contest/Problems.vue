<template>
  <div class="contest-problems">
    <div class="problems-container">
      <div class="problems-card">
        <h2 class="card-title">题目列表</h2>
        <div v-if="problems.length > 0" class="problems-list">
          <div 
            v-for="problem in problems" 
            :key="problem.id"
            class="problem-item"
            @click="goToProblem(problem.id)"
          >
            <div class="problem-id">{{ problem.id }}</div>
            <div class="problem-title">{{ problem.title }}</div>
            <div class="problem-stats">
              <span class="stat-item">通过: {{ problem.accepted }}</span>
              <span class="stat-item">提交: {{ problem.submitted }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无题目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const problems = ref([])

const goToProblem = (problemId) => {
  const contestId = route.params.id
  router.push(`/contests/${contestId}/problems/${problemId}`)
}

onMounted(() => {
  // TODO: 从API获取题目列表
  // const contestId = route.params.id
  problems.value = []
})
</script>

<style scoped>
.contest-problems {
  padding: 30px 20px;
}

.problems-container {
  max-width: 1100px;
  margin: 0 auto;
}

.problems-card {
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

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.problem-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 20px;
}

.problem-item:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.problem-id {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  min-width: 60px;
}

.problem-title {
  flex: 1;
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.problem-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666666;
}

.stat-item {
  white-space: nowrap;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}
</style>

