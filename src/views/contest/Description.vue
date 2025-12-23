<template>
  <div class="contest-description">
    <div class="description-container">
      <div class="description-card">
        <h2 class="card-title">比赛描述</h2>
        <div class="description-content" v-html="contestDescription"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getContestDetail } from '@/api/contest'

const route = useRoute()
const contestDescription = ref('')

const fetchContestDescription = async () => {
  const contestId = route.params.id
  try {
    const res = await getContestDetail(contestId)
    const data = res.data || {}
    contestDescription.value = data.description || '<p>暂无比赛描述。</p>'
  } catch (e) {
    console.error('获取比赛描述失败:', e)
    contestDescription.value = '<p>获取比赛描述失败，请稍后重试。</p>'
  }
}

onMounted(() => {
  fetchContestDescription()
})
</script>

<style scoped>
.contest-description {
  padding: 30px 20px;
}

.description-container {
  max-width: 1100px;
  margin: 0 auto;
}

.description-card {
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

.description-content {
  font-size: 16px;
  line-height: 1.8;
  color: #666666;
}

.description-content :deep(p) {
  margin-bottom: 16px;
}

.description-content :deep(h1),
.description-content :deep(h2),
.description-content :deep(h3) {
  color: #333333;
  margin-top: 24px;
  margin-bottom: 16px;
}

.description-content :deep(ul),
.description-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 16px;
}

.description-content :deep(li) {
  margin-bottom: 8px;
}
</style>

