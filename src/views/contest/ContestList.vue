<template>
  <div class="contest-list">
    <div class="contest-list-container">

      <div class="filter-bar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索比赛号或名称..." 
            class="search-input"
            @input="handleSearchInput"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-buttons">
          <div class="filter-group">
            <span class="filter-label">赛制筛选：</span>
            <button 
              v-for="format in formatOptions" 
              :key="format.value"
              :class="['filter-btn', { active: selectedFilter === 'format' && selectedFilterValue === format.value }]"
              @click="toggleFilter('format', format.value)"
            >
              {{ format.label }}
            </button>
          </div>
          <div class="filter-group">
            <span class="filter-label">赛种筛选：</span>
            <button 
              v-for="type in typeOptions" 
              :key="type.value"
              :class="['filter-btn', { active: selectedFilter === 'type' && selectedFilterValue === type.value }]"
              @click="toggleFilter('type', type.value)"
            >
              {{ type.label }}
            </button>
          </div>
          <div class="filter-group">
            <span class="filter-label">状态筛选：</span>
            <button 
              v-for="status in statusOptions" 
              :key="status.value"
              :class="['filter-btn', { active: selectedFilter === 'status' && selectedFilterValue === status.value }]"
              @click="toggleFilter('status', status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="contest-table">
        <div class="table-header">
          <div class="col-image">图片</div>
          <div class="col-id">比赛号</div>
          <div class="col-name">比赛名称</div>
          <div class="col-start-time">开始时间</div>
          <div class="col-duration">持续时间</div>
          <div class="col-format">赛制</div>
          <div class="col-type">赛种</div>
          <div class="col-participants">参赛人数</div>
          <div class="col-status">状态</div>
        </div>

        <div v-if="filteredContests.length > 0">
          <div 
            v-for="contest in filteredContests" 
            :key="contest.id"
            class="table-row"
            @click="goToContest(contest.id)"
          >
            <div class="col-image">
              <img :src="contest.image" :alt="contest.name" class="contest-image" />
            </div>
            <div class="col-id">{{ contest.id }}</div>
            <div class="col-name">
              <span class="name-text">{{ contest.name }}</span>
            </div>
            <div class="col-start-time">{{ formatDateTime(contest.startTime) }}</div>
            <div class="col-duration">{{ formatDuration(contest.duration) }}</div>
            <div class="col-format">
              <span 
                :class="['format-badge', `format-${contest.format}`, { clickable: true }]"
                @click.stop="toggleFilter('format', contest.format)"
              >
                {{ getFormatText(contest.format) }}
              </span>
            </div>
            <div class="col-type">
              <span 
                :class="['type-badge', `type-${contest.type}`, { clickable: true }]"
                @click.stop="toggleFilter('type', contest.type)"
              >
                {{ getTypeText(contest.type) }}
              </span>
            </div>
            <div class="col-participants">{{ contest.participants }}</div>
            <div class="col-status">
              <span 
                :class="['status-badge', `status-${contest.status}`, { clickable: true }]"
                @click.stop="toggleFilter('status', contest.status)"
              >
                {{ getStatusText(contest.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无符合条件的比赛</p>
          <p class="empty-hint">请尝试调整搜索条件</p>
        </div>
      </div>

      <!-- 翻页器（模仿题库页面） -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 场比赛</span>
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
import { getContestList } from '@/api/contest'

export default {
  name: 'ContestList',
  data() {
    return {
      searchQuery: '',
      selectedFilter: null, // 'format', 'type', 'status' 或 null
      selectedFilterValue: null,
      formatOptions: [
        { value: 'acm', label: 'ACM' },
        { value: 'ioi', label: 'IOI' },
        { value: 'io', label: 'IO' }
      ],
      typeOptions: [
        { value: 'public', label: '公开赛' },
        { value: 'private', label: '私有赛' }
      ],
      statusOptions: [
        { value: 'upcoming', label: '即将开始' },
        { value: 'active', label: '进行中' },
        { value: 'ended', label: '已结束' }
      ],
      contests: [],
      pagination: {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      },
      loading: false,
      error: '',
      searchTimer: null
    }
  },
  computed: {
    filteredContests() {
      // 目前筛选在后端完成，这里直接返回后端列表
      return this.contests
    }
  },
  methods: {
    goToContest(contestId) {
      this.$router.push(`/contests/${contestId}`)
    },
    toggleFilter(filterType, filterValue) {
      if (this.selectedFilter === filterType && this.selectedFilterValue === filterValue) {
        this.selectedFilter = null
        this.selectedFilterValue = null
      } else {
        this.selectedFilter = filterType
        this.selectedFilterValue = filterValue
      }
      this.pagination.page = 1
      this.fetchContests()
    },
    getStatusText(status) {
      const map = {
        'upcoming': '即将开始',
        'active': '进行中',
        'ended': '已结束'
      }
      return map[status] || status
    },
    getFormatText(format) {
      const map = {
        'acm': 'ACM',
        'ioi': 'IOI',
        'io': 'IO'
      }
      return map[format] || format
    },
    getTypeText(type) {
      const map = {
        'public': '公开赛',
        'private': '私有赛'
      }
      return map[type] || type
    },
    formatDateTime(dateString) {
      if (!dateString) return '--'
      try {
        const [datePart, timePartRaw] = dateString.split('T')
        if (!datePart || !timePartRaw) {
          return dateString
        }
        const timePart = timePartRaw.split(/[.+Z]/)[0] || timePartRaw
        const [hh, mm] = timePart.split(':')
        const hour = hh ?? '00'
        const minute = mm ?? '00'
        return `${datePart} ${hour}:${minute}`
      } catch (e) {
        return '--'
      }
    },
    formatDuration(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${mins}分钟`
    },
    getFilterParams() {
      const params = {}
      if (this.searchQuery.trim()) {
        params.search = this.searchQuery.trim()
      }
      if (this.selectedFilter && this.selectedFilterValue) {
        if (this.selectedFilter === 'format') {
          const map = { acm: 'ACM', ioi: 'IOI', io: 'OI' }
          params.format = map[this.selectedFilterValue] || this.selectedFilterValue
        } else if (this.selectedFilter === 'type') {
          const map = { public: '公开赛', private: '私有赛' }
          params.type = map[this.selectedFilterValue] || this.selectedFilterValue
        } else if (this.selectedFilter === 'status') {
          const map = { upcoming: '即将开始', active: '进行中', ended: '已结束' }
          params.status = map[this.selectedFilterValue] || this.selectedFilterValue
        }
      }
      return params
    },
    async fetchContests() {
      this.loading = true
      this.error = ''
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          ...this.getFilterParams()
        }
        const res = await getContestList(params)
        const list = res.data?.contests || []
        const pageInfo = res.data?.pagination || {}

        this.contests = list.map(item => {
          const formatMap = { 'ACM': 'acm', 'IOI': 'ioi', 'OI': 'io' }
          const typeMap = { '公开赛': 'public', '私有赛': 'private' }
          const statusMap = { '即将开始': 'upcoming', '进行中': 'active', '已结束': 'ended' }

          return {
            id: item.id,
            name: item.name,
            startTime: item.startTime,
            duration: item.duration,
            format: formatMap[item.format] || 'acm',
            type: typeMap[item.type] || 'public',
            participants: item.participants ?? 0,
            status: statusMap[item.status] || 'upcoming',
            image: require('@/assets/images/acm.png')
          }
        })

        this.pagination = {
          page: pageInfo.page || this.pagination.page,
          page_size: pageInfo.page_size || this.pagination.page_size,
          total: pageInfo.total || list.length,
          total_pages: pageInfo.total_pages || 1,
          has_next: pageInfo.has_next ?? false,
          has_previous: pageInfo.has_previous ?? false
        }
      } catch (e) {
        console.error('获取比赛列表失败:', e)
        this.error = e.message || '获取比赛列表失败，请稍后重试'
        this.contests = []
      } finally {
        this.loading = false
      }
    },
    handlePageChange(page) {
      if (page === this.pagination.page) return
      this.pagination.page = page
      this.fetchContests()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(size) {
      if (size === this.pagination.page_size) return
      this.pagination.page_size = size
      this.pagination.page = 1
      this.fetchContests()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    // 生成页码数组（与题库相同逻辑，含省略号）
    getPageNumbers() {
      const current = this.pagination.page
      const total = this.pagination.total_pages
      const pages = []
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 3; i <= total; i++) {
            pages.push(i)
          }
        } else {
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
    handleSearchInput() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1
        this.fetchContests()
      }, 400)
    }
  },
  mounted() {
    this.fetchContests()
  },
  beforeUnmount() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }
}
</script>

<style scoped>
.contest-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.contest-list-container {
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
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  min-width: 80px;
}

.filter-btn {
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

.filter-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.filter-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.filter-btn.active:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.search-box {
  position: relative;
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

.contest-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 100px 1fr 180px 120px 100px 100px 100px 100px;
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
  grid-template-columns: 100px 100px 1fr 180px 120px 100px 100px 100px 100px;
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

.col-image {
  display: flex;
  align-items: center;
}

.contest-image {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.col-id {
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.col-name {
  display: flex;
  align-items: center;
}

.name-text {
  color: #333333;
  font-size: 15px;
  font-weight: 500;
}

.col-start-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-duration {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-format {
  display: flex;
  align-items: center;
}

.col-type {
  display: flex;
  align-items: center;
}

.col-participants {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-status {
  display: flex;
  align-items: center;
}

.format-badge,
.type-badge,
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.format-badge.clickable,
.type-badge.clickable,
.status-badge.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-badge.clickable:hover,
.type-badge.clickable:hover,
.status-badge.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.format-acm {
  background-color: #e6f7ff;
  color: #1890ff;
}

.format-ioi {
  background-color: #fff7e6;
  color: #fa8c16;
}

.format-io {
  background-color: #f6ffed;
  color: #52c41a;
}

.type-public {
  background-color: #f0f0f0;
  color: #333333;
}

.type-private {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-upcoming {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-ended {
  background-color: #fff1f0;
  color: #ff4d4f;
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

@media (max-width: 1400px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 90px 1fr 160px 110px 90px 90px 90px 90px;
    gap: 15px;
    padding: 16px 20px;
  }
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 70px 80px 1fr 150px 100px 80px 80px 80px 80px;
    gap: 12px;
    padding: 14px 16px;
  }

  .contest-image {
    width: 60px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .contest-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1200px;
  }

  .search-box {
    max-width: 100%;
  }
}
</style>
