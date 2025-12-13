<template>
  <div class="submission-detail">
    <div class="submission-detail-container">
      <div v-if="loading" class="loading-container">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button class="btn-back" @click="goBack">返回</button>
      </div>
      
      <div v-else-if="submission" class="submission-content">
        <!-- 提交信息板块 -->
        <div class="submission-info-section">
          <h2 class="section-title">提交信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">提交ID：</span>
              <span class="info-value">{{ submission.submission_id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交时间：</span>
              <span class="info-value">{{ formatDateTime(submission.submit_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">题目ID：</span>
              <span class="info-value">
                <router-link :to="`/problems/${submission.problem_id}`" class="problem-link">
                  {{ submission.problem_id }}
                </router-link>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">状态：</span>
              <span :class="['status-badge', getStatusClass(submission.status)]">
                {{ submission.status_text }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">运行时间：</span>
              <span class="info-value">{{ submission.cpu_time }}ms</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行内存：</span>
              <span class="info-value">{{ formatMemory(submission.memory) }}KB</span>
            </div>
            <div class="info-item">
              <span class="info-label">代码长度：</span>
              <span class="info-value">{{ submission.code_length }}B</span>
            </div>
            <div class="info-item">
              <span class="info-label">语言：</span>
              <span class="info-value">{{ getLanguageName(submission.language) }}</span>
            </div>
          </div>
        </div>

        <!-- 测试点详情板块 -->
        <div class="test-results-section" v-if="submission.result && submission.result.test_results">
          <h2 class="section-title">测试点详情</h2>
          <div class="test-results-grid">
            <div 
              v-for="(test, index) in submission.result.test_results" 
              :key="index"
              class="test-case-card"
            >
              <div class="test-case-header">
                <span class="test-case-number">Test {{ index + 1 }}</span>
                <span :class="['test-case-status', getTestStatusClass(test.result)]">
                  {{ getTestStatusText(test.result) }}
                </span>
              </div>
              <div class="test-case-details">
                <div class="test-detail-item">
                  <span class="test-detail-label">运行时间：</span>
                  <span class="test-detail-value">{{ test.cpu_time }}ms</span>
                </div>
                <div class="test-detail-item">
                  <span class="test-detail-label">内存使用：</span>
                  <span class="test-detail-value">{{ formatMemory(test.memory) }}KB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提交代码板块 -->
        <div class="code-section">
          <h2 class="section-title">提交代码</h2>
          <div class="code-container">
            <pre class="code-content">{{ submission.code }}</pre>
          </div>
        </div>

        <!-- 返回按钮 -->
        <div class="action-buttons">
          <button class="btn-back" @click="goBack">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSubmissionDetail } from '@/api/problem'

export default {
  name: 'SubmissionDetail',
  data() {
    return {
      submission: null,
      loading: true,
      error: null
    }
  },
  mounted() {
    this.loadSubmissionDetail()
  },
  methods: {
    async loadSubmissionDetail() {
      const submissionId = this.$route.params.id
      if (!submissionId) {
        this.error = '提交ID不存在'
        this.loading = false
        return
      }

      try {
        const response = await getSubmissionDetail(submissionId)
        if (response.code === 'success' && response.data) {
          this.submission = response.data
        } else {
          this.error = response.message || '获取提交详情失败'
        }
      } catch (error) {
        console.error('加载提交详情失败:', error)
        this.error = error.response?.data?.message || error.message || '加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    formatMemory(memoryBytes) {
      if (!memoryBytes) return '0'
      return Math.round(memoryBytes / 1024)
    },
    getLanguageName(lang) {
      const map = {
        'cpp': 'C++',
        'java': 'Java',
        'python': 'Python',
        'javascript': 'JavaScript'
      }
      return map[lang] || lang
    },
    getStatusClass(status) {
      const statusMap = {
        0: 'status-accepted',
        '-1': 'status-wrong-answer',
        1: 'status-time-limit',
        2: 'status-time-limit',
        3: 'status-memory-limit',
        4: 'status-runtime-error',
        5: 'status-compile-error',
        6: 'status-system-error',
        7: 'status-judging'
      }
      return statusMap[status] || 'status-unknown'
    },
    getTestStatusText(result) {
      const statusMap = {
        0: 'Accepted',
        '-1': 'Wrong Answer',
        1: 'Time Limit Exceeded',
        2: 'Time Limit Exceeded',
        3: 'Memory Limit Exceeded',
        4: 'Runtime Error',
        5: 'Compile Error',
        6: 'System Error'
      }
      return statusMap[result] || 'Unknown'
    },
    getTestStatusClass(result) {
      const statusMap = {
        0: 'test-status-accepted',
        '-1': 'test-status-wrong-answer',
        1: 'test-status-time-limit',
        2: 'test-status-time-limit',
        3: 'test-status-memory-limit',
        4: 'test-status-runtime-error',
        5: 'test-status-compile-error',
        6: 'test-status-system-error'
      }
      return statusMap[result] || 'test-status-unknown'
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.submission-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.submission-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 40px;
}

.error-text {
  color: #ff4d4f;
  font-size: 16px;
  margin-bottom: 20px;
}

.submission-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* 提交信息板块 */
.submission-info-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #333333;
}

.problem-link {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.problem-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.status-accepted {
  background-color: #52c41a;
  color: #ffffff;
}

.status-wrong-answer {
  background-color: #ff4d4f;
  color: #ffffff;
}

.status-time-limit {
  background-color: #faad14;
  color: #ffffff;
}

.status-memory-limit {
  background-color: #fa8c16;
  color: #ffffff;
}

.status-runtime-error {
  background-color: #eb2f96;
  color: #ffffff;
}

.status-compile-error {
  background-color: #722ed1;
  color: #ffffff;
}

.status-system-error {
  background-color: #8c8c8c;
  color: #ffffff;
}

.status-judging {
  background-color: #1890ff;
  color: #ffffff;
}

/* 测试点详情板块 */
.test-results-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 6px;
}

.test-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.test-case-card {
  background-color: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.3s ease;
}

.test-case-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.test-case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.test-case-number {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.test-case-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.test-status-accepted {
  background-color: #52c41a;
  color: #ffffff;
}

.test-status-wrong-answer {
  background-color: #ff4d4f;
  color: #ffffff;
}

.test-status-time-limit {
  background-color: #faad14;
  color: #ffffff;
}

.test-status-memory-limit {
  background-color: #fa8c16;
  color: #ffffff;
}

.test-status-runtime-error {
  background-color: #eb2f96;
  color: #ffffff;
}

.test-status-compile-error {
  background-color: #722ed1;
  color: #ffffff;
}

.test-status-system-error {
  background-color: #8c8c8c;
  color: #ffffff;
}

.test-case-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.test-detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.test-detail-label {
  color: #666666;
}

.test-detail-value {
  color: #333333;
  font-weight: 500;
}

/* 代码板块 */
.code-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 6px;
}

.code-container {
  background-color: #282c34;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
}

.code-content {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #abb2bf;
  white-space: pre;
  word-wrap: normal;
}

/* 按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-back {
  padding: 8px 24px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .submission-detail {
    padding: 12px;
  }

  .submission-detail-container {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .test-results-grid {
    grid-template-columns: 1fr;
  }
}
</style>

