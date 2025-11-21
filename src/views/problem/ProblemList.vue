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

        <div v-if="filteredProblems.length > 0">
          <div 
            v-for="problem in filteredProblems" 
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProblemList',
  data() {
    return {
      searchQuery: '',
      selectedDifficulty: null,
      difficultyOptions: [
        { value: 'easy', label: '简单' },
        { value: 'medium', label: '中等' },
        { value: 'hard', label: '困难' }
      ],
      problems: [
        {
          id: 1001,
          title: '两数之和',
          tags: ['数组', '哈希表'],
          difficulty: 'easy',
          submissions: 12580,
          passRate: 68.5
        },
        {
          id: 1002,
          title: '两数相加',
          tags: [],
          difficulty: 'medium',
          submissions: 8920,
          passRate: 45.2
        },
        {
          id: 1003,
          title: '无重复字符的最长子串',
          tags: ['字符串', '滑动窗口'],
          difficulty: 'medium',
          submissions: 15620,
          passRate: 52.8
        },
        {
          id: 1004,
          title: '寻找两个正序数组的中位数',
          tags: ['数组', '二分查找'],
          difficulty: 'hard',
          submissions: 5230,
          passRate: 32.1
        },
        {
          id: 1005,
          title: '最长回文子串',
          tags: ['字符串', '动态规划'],
          difficulty: 'medium',
          submissions: 11240,
          passRate: 38.7
        },
        {
          id: 1006,
          title: 'Z字形变换',
          tags: ['字符串'],
          difficulty: 'medium',
          submissions: 7890,
          passRate: 42.3
        },
        {
          id: 1007,
          title: '整数反转',
          tags: ['数学'],
          difficulty: 'easy',
          submissions: 18920,
          passRate: 71.2
        },
        {
          id: 1008,
          title: '字符串转换整数',
          tags: ['字符串', '状态机'],
          difficulty: 'medium',
          submissions: 6540,
          passRate: 18.9
        },
        {
          id: 1009,
          title: '回文数',
          tags: ['数学'],
          difficulty: 'easy',
          submissions: 22100,
          passRate: 75.6
        },
        {
          id: 1010,
          title: '正则表达式匹配',
          tags: ['字符串', '动态规划'],
          difficulty: 'hard',
          submissions: 4320,
          passRate: 28.4
        }
      ]
    }
  },
  computed: {
    filteredProblems() {
      let result = this.problems

      // 难度筛选
      if (this.selectedDifficulty) {
        result = result.filter(problem => problem.difficulty === this.selectedDifficulty)
      }

      // 搜索筛选（题号或标题）
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toLowerCase()
        result = result.filter(problem => {
          // 搜索题号
          if (problem.id.toString().includes(query)) {
            return true
          }
          // 搜索标题
          if (problem.title.toLowerCase().includes(query)) {
            return true
          }
          return false
        })
      }

      return result
    }
  },
  methods: {
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
      // 后续可以跳转到题目详情页
      console.log('跳转到题目:', id)
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
