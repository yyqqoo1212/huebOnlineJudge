<template>
  <div class="problem-list">
    <div class="problem-list-container">

      <div class="filter-bar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索题号或标题..." 
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="difficulty-filter">
          <span class="filter-label">难度筛选：</span>
          <button 
            v-for="difficulty in difficultyOptions" 
            :key="difficulty.value"
            :class="['difficulty-filter-btn', { active: selectedDifficulty === difficulty.value }]"
            @click="toggleDifficulty(difficulty.value)"
          >
            {{ difficulty.label }}
          </button>
        </div>
      </div>

      <div class="problem-table">
        <div class="table-header">
          <div class="col-id">题号</div>
          <div class="col-title">题目标题</div>
          <div class="col-tags">考察知识点</div>
          <div class="col-difficulty">难度</div>
          <div class="col-submissions">提交数</div>
          <div class="col-pass-rate">通过率</div>
        </div>

        <div v-if="loading" class="loading-state">
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="problems.length > 0">
          <div 
            v-for="problem in problems" 
            :key="problem.id"
            class="table-row"
            @click="goToProblem(problem.id)"
          >
            <div class="col-id">{{ problem.id }}</div>
            <div class="col-title">
              <span class="title-text">{{ problem.title }}</span>
            </div>
            <div class="col-tags">
              <span 
                v-for="tag in problem.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="problem.tags.length === 0" class="no-tags">-</span>
            </div>
            <div class="col-difficulty">
              <span :class="['difficulty-badge', `difficulty-${problem.difficulty}`]">
                {{ getDifficultyText(problem.difficulty) }}
              </span>
            </div>
            <div class="col-submissions">{{ problem.submissions }}</div>
            <div class="col-pass-rate">
              <div class="pass-rate-container">
                <span class="pass-rate-text">{{ problem.passRate }}%</span>
                <div class="pass-rate-bar">
                  <div 
                    class="pass-rate-fill" 
                    :style="{ width: problem.passRate + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无符合条件的题目</p>
          <p class="empty-hint">请尝试调整搜索条件或难度筛选</p>
        </div>
      </div>

      <!-- 翻页器 -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 题</span>
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
</template>

<script>
import { getProblemList } from '@/api/problem'

export default {
  name: 'ProblemList',
  data() {
    return {
      searchQuery: '',
      selectedDifficulty: null,
      difficultyOptions: [
        { value: 'easy', label: '简单', level: 1 },
        { value: 'medium', label: '中等', level: 2 },
        { value: 'hard', label: '困难', level: 3 }
      ],
      problems: [],
      loading: false,
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
    this.fetchProblems()
  },
  watch: {
    // 监听搜索和筛选变化，延迟执行避免频繁请求
    searchQuery() {
      this.debounceSearch()
    },
    selectedDifficulty() {
      this.pagination.page = 1
      this.fetchProblems()
    }
  },
  methods: {
    // 防抖搜索
    debounceSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1
        this.fetchProblems()
      }, 500)
    },
    // 获取题目列表
    async fetchProblems() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size
        }
        
        // 添加搜索参数
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }
        
        // 添加难度筛选参数
        if (this.selectedDifficulty) {
          const difficultyOption = this.difficultyOptions.find(
            opt => opt.value === this.selectedDifficulty
          )
          if (difficultyOption) {
            params.level = difficultyOption.level
          }
        }
        
        const response = await getProblemList(params)
        
        if (response.code === 'success' && response.data) {
          this.problems = response.data.problems || []
          this.pagination = {
            ...this.pagination,
            ...response.data.pagination
          }
        } else {
          this.$message?.error(response.message || '获取题目列表失败')
          this.problems = []
        }
      } catch (error) {
        console.error('获取题目列表失败:', error)
        this.$message?.error(error.message || '获取题目列表失败，请稍后重试')
        this.problems = []
      } finally {
        this.loading = false
      }
    },
    getDifficultyText(difficulty) {
      const map = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      }
      return map[difficulty] || difficulty
    },
    toggleDifficulty(difficulty) {
      // 如果点击的是已选中的难度，则取消筛选
      if (this.selectedDifficulty === difficulty) {
        this.selectedDifficulty = null
      } else {
        this.selectedDifficulty = difficulty
      }
    },
    goToProblem(id) {
      this.$router.push(`/problems/${id}`)
    },
    // 翻页方法
    handlePageChange(page) {
      this.pagination.page = page
      this.fetchProblems()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchProblems()
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
        if (current <= 3) {
          // 当前页在前3页
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          // 当前页在后3页
          pages.push(1)
          pages.push('...')
          for (let i = total - 3; i <= total; i++) {
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
    }
  },
  beforeUnmount() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }
}
</script>

<style scoped>
.problem-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.problem-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666666;
}

.filter-bar {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999999;
  pointer-events: none;
}

.difficulty-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.difficulty-filter-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.difficulty-filter-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.difficulty-filter-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.difficulty-filter-btn.active:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.problem-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 200px 120px 120px 150px;
  gap: 20px;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 200px 120px 120px 150px;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.col-id {
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.col-title {
  display: flex;
  align-items: center;
}

.title-text {
  color: #333333;
  font-size: 15px;
  font-weight: 500;
}

.col-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.col-difficulty {
  display: flex;
  align-items: center;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.difficulty-easy {
  background-color: #f6ffed;
  color: #52c41a;
}

.difficulty-medium {
  background-color: #fff7e6;
  color: #fa8c16;
}

.difficulty-hard {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.col-submissions {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-pass-rate {
  display: flex;
  align-items: center;
}

.pass-rate-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pass-rate-text {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  min-width: 45px;
}

.pass-rate-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.pass-rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 180px 100px 100px 130px;
    gap: 15px;
    padding: 16px 20px;
  }
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999999;
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
}

.loading-text {
  font-size: 16px;
  color: #666666;
}

.no-tags {
  color: #999999;
  font-size: 12px;
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

@media (max-width: 768px) {
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

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .difficulty-filter {
    justify-content: flex-start;
  }

  .problem-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 800px;
  }
}
</style>
