<template>
  <div class="contest-ranking">
    <div class="ranking-container">
      <div class="ranking-card">
        <h2 class="card-title">排行榜</h2>
        <div v-if="rankings.length > 0" class="ranking-table">
          <div class="table-header">
            <div class="col-rank">排名</div>
            <div class="col-user">用户</div>
            <div class="col-solved">通过题数</div>
            <div class="col-penalty">罚时</div>
            <div class="col-problems">题目详情</div>
          </div>
          <div 
            v-for="(rank, index) in rankings" 
            :key="rank.userId"
            class="table-row"
            :class="{ 'current-user': rank.isCurrentUser }"
          >
            <div class="col-rank">
              <span class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="col-user">{{ rank.username }}</div>
            <div class="col-solved">{{ rank.solved }}</div>
            <div class="col-penalty">{{ formatPenalty(rank.penalty) }}</div>
            <div class="col-problems">
              <div class="problem-status-list">
                <span 
                  v-for="(status, problemId) in rank.problems" 
                  :key="problemId"
                  :class="['problem-status', `status-${status}`]"
                >
                  {{ problemId }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无排名数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rankings = ref([])

const formatPenalty = (penalty) => {
  if (!penalty) return '00:00:00'
  const hours = Math.floor(penalty / 3600)
  const minutes = Math.floor((penalty % 3600) / 60)
  const seconds = penalty % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

onMounted(() => {
  // TODO: 从API获取排行榜数据
  // const contestId = route.params.id
  rankings.value = []
})
</script>

<style scoped>
.contest-ranking {
  padding: 30px 20px;
}

.ranking-container {
  max-width: 1100px;
  margin: 0 auto;
}

.ranking-card {
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

.ranking-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 150px 100px 120px 1fr;
  gap: 20px;
  padding: 16px 20px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 150px 100px 120px 1fr;
  gap: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row.current-user {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.col-rank {
  display: flex;
  align-items: center;
}

.rank-number {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.col-user {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.col-solved {
  font-size: 16px;
  color: #1890ff;
  font-weight: 600;
}

.col-penalty {
  font-size: 14px;
  color: #666666;
  font-family: 'Courier New', monospace;
}

.col-problems {
  display: flex;
  align-items: center;
}

.problem-status-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.problem-status.status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
}

.problem-status.status-wrong {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.problem-status.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.problem-status.status-none {
  background-color: #f5f5f5;
  color: #999999;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 100px 80px 100px 1fr;
    gap: 12px;
    padding: 12px 16px;
  }
}
</style>

