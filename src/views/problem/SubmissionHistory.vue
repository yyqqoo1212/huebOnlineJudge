<template>
  <div class="submission-history">
    <div class="submission-history-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button class="btn-back" @click="goBack">
              ← 返回题目
            </button>
            <h1>我的提交记录</h1>
            <p class="subtitle">题目 #{{ problemId }}: {{ problemTitle }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button class="btn-retry" @click="loadSubmissions">重试</button>
      </div>

      <div v-else class="submission-table">
        <div class="table-header">
          <div class="col-id">测评ID</div>
          <div class="col-status">状态</div>
          <div class="col-time">运行时间</div>
          <div class="col-memory">运行内存</div>
          <div class="col-length">代码长度</div>
          <div class="col-language">语言</div>
          <div class="col-submit-time">提交时间</div>
        </div>

        <div v-if="submissions.length > 0">
          <div 
            v-for="submission in submissions" 
            :key="submission.submission_id"
            class="table-row"
            @click="viewSubmission(submission.submission_id)"
          >
            <div class="col-id">
              <span class="id-link">
                {{ submission.submission_id }}
              </span>
            </div>
            <div class="col-status">
              <span :class="['status-badge', getStatusClass(submission.status)]">
                {{ submission.status_text }}
              </span>
            </div>
            <div class="col-time">{{ submission.cpu_time }}ms</div>
            <div class="col-memory">{{ formatMemory(submission.memory) }}KB</div>
            <div class="col-length">{{ submission.code_length }}B</div>
            <div class="col-language">{{ getLanguageName(submission.language) }}</div>
            <div class="col-submit-time">{{ formatDateTime(submission.submit_time) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无提交记录</p>
        </div>

        <!-- 翻页器 -->
        <div v-if="!loading && pagination && pagination.total_pages > 0" class="pagination-container">
          <div class="pagination-info">
            <span>共 {{ pagination.total }} 条</span>
            <span class="page-info">第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span>
          </div>
          <div class="pagination">
            <button 
              class="pagination-btn"
              :disabled="!pagination.has_previous || loading"
              @click="handlePageChange(pagination.page - 1)"
            >
              上一页
            </button>
            
            <div class="pagination-pages">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                :class="['pagination-page-btn', { active: page === pagination.page, ellipsis: page === '...' }]"
                :disabled="page === '...' || loading"
                @click="page !== '...' && handlePageChange(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="!pagination.has_next || loading"
              @click="handlePageChange(pagination.page + 1)"
            >
              下一页
            </button>
          </div>
          <div class="page-size-selector">
            <span>每页显示：</span>
            <select 
              :value="pagination.page_size" 
              @change="handlePageSizeChange(Number($event.target.value))"
              :disabled="loading"
              class="page-size-select"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSubmissionList, getProblemDetail } from '@/api/problem'
import { useAuth } from '@/composbles/useAuth'

export default {
  name: 'ProblemSubmissionHistory',
  setup() {
    const { userId, isLoggedIn } = useAuth()
    return { userId, isLoggedIn }
  },
  data() {
    return {
      problemId: null,
      problemTitle: '',
      submissions: [],
      loading: true,
      error: null,
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    }
  },
  mounted() {
    this.problemId = parseInt(this.$route.params.id)
    if (!this.isLoggedIn) {
      this.$message?.warning('请先登录')
      this.$router.push('/login')
      return
    }
    this.loadProblemTitle()
    this.loadSubmissions()
  },
  watch: {
    '$route.params.id'() {
      this.problemId = parseInt(this.$route.params.id)
      this.loadProblemTitle()
      this.loadSubmissions()
    }
  },
  methods: {
    async loadProblemTitle() {
      try {
        const response = await getProblemDetail(this.problemId)
        if (response.code === 'success' && response.data) {
          this.problemTitle = response.data.title || `题目 ${this.problemId}`
        }
      } catch (error) {
        console.error('获取题目信息失败:', error)
        this.problemTitle = `题目 ${this.problemId}`
      }
    },
    async loadSubmissions() {
      if (!this.isLoggedIn || !this.userId) {
        this.error = '请先登录'
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await getSubmissionList({
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          problem_id: this.problemId,
          user_id: this.userId
        })

        if (response.code === 'success' && response.data) {
          this.submissions = response.data.submissions || []
          if (response.data.pagination) {
            this.pagination = {
              ...this.pagination,
              ...response.data.pagination
            }
          }
        } else {
          this.error = response.message || '获取提交记录失败'
        }
      } catch (error) {
        console.error('加载提交记录失败:', error)
        this.error = error.response?.data?.message || error.message || '加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    handlePageChange(page) {
      this.pagination.page = page
      this.loadSubmissions()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.loadSubmissions()
    },
    // 生成页码数组（带省略号）
    getPageNumbers() {
      const current = this.pagination.page
      const total = this.pagination.total_pages
      const pages = []
      
      if (total <= 7) {
        // 总页数少于等于7，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总页数大于7，显示部分页码和省略号
        if (current <= 4) {
          // 当前页在前4页
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          // 当前页在后4页
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          // 当前页在中间
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    },
    viewSubmission(submissionId) {
      // 跳转到提交详情页面
      this.$router.push({
        name: 'SubmissionDetail',
        params: { id: submissionId }
      })
    },
    goBack() {
      // 返回题目详情页面
      this.$router.push({
        name: 'ProblemDetail',
        params: { id: this.problemId }
      })
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
    getLanguageName(language) {
      const map = {
        'cpp': 'C++',
        'java': 'Java',
        'python': 'Python',
        'javascript': 'JavaScript'
      }
      return map[language] || language
    },
    formatMemory(memoryBytes) {
      if (!memoryBytes) return '0'
      return Math.round(memoryBytes / 1024)
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style scoped>
.submission-history {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px;
}

.submission-history-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-back {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-back:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
}

.page-header h1 {
  font-size: 24px;
  color: #333333;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  color: #666666;
  margin: 4px 0 0 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-text {
  color: #ff4d4f;
  font-size: 16px;
  margin-bottom: 16px;
}

.btn-retry {
  padding: 8px 20px;
  border: 1px solid #1890ff;
  border-radius: 6px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-retry:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.submission-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 120px 120px 120px 120px 100px 180px;
  gap: 20px;
  padding: 8px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 120px 120px 120px 120px 100px 180px;
  gap: 20px;
  padding: 8px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background-color: #fafafa;
}

.col-id {
  display: flex;
  align-items: center;
}

.id-link {
  color: #1890ff;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.id-link:hover {
  color: #40a9ff;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-wrong-answer {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-time-limit {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-memory-limit {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-runtime-error {
  background-color: #fff0f6;
  color: #eb2f96;
  border: 1px solid #ffadd2;
}

.status-compile-error {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.status-system-error {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.status-judging {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-unknown {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.col-time,
.col-memory,
.col-length,
.col-language,
.col-submit-time {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333333;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  color: #999999;
  font-size: 16px;
}

.pagination-container {
  margin-top: 24px;
  padding: 20px 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #666666;
}

.page-info {
  color: #1890ff;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-page-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.pagination-page-btn.ellipsis {
  border: none;
  cursor: default;
  background-color: transparent;
}

.pagination-page-btn:disabled {
  cursor: not-allowed;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666666;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-size-select:focus {
  border-color: #1890ff;
}

.page-size-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 100px 100px 100px 100px 80px 150px;
    gap: 12px;
    padding: 8px 16px;
  }
}

@media (max-width: 768px) {
  .submission-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1000px;
  }

  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-info {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }
}
</style>

