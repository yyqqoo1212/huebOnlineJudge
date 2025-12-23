<template>
  <div class="contest-manage">
    <div class="page-header">
      <h1>比赛管理</h1>
      <p class="page-subtitle">管理系统内的所有比赛</p>
    </div>

    <div class="management-header">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索比赛名称..."
        class="search-input"
        @input="handleSearch"
      />
      <div class="header-actions">
        <button class="btn-refresh" @click="handleRefresh" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchContests">重试</button>
    </div>

    <div v-else class="contest-table-container">
      <table class="contest-table">
        <thead>
          <tr>
            <th>比赛ID</th>
            <th>比赛名</th>
            <th>赛制</th>
            <th>赛种</th>
            <th>状态</th>
            <th>开始时间</th>
            <th style="text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="contests.length === 0">
            <td colspan="7" class="empty-text">暂无比赛数据</td>
          </tr>
          <tr v-for="contest in contests" :key="contest.id">
            <td>{{ contest.id }}</td>
            <td class="title-cell">{{ contest.name }}</td>
            <td>{{ contest.formatLabel }}</td>
            <td>{{ contest.typeLabel }}</td>
            <td>{{ contest.statusLabel }}</td>
            <td>
              <div class="time-range">
                <span>{{ contest.start_time }}</span>
              </div>
            </td>
            <td class="actions-cell">
              <button class="icon-btn icon-edit" title="编辑比赛" @click="handleEditContest(contest)">
                ✏️
              </button>
              <button class="icon-btn icon-edit" title="题目编辑" @click="handleEditProblems(contest)">
                🧩
              </button>
              <button class="icon-btn icon-view" title="公告" @click="handleViewAnnouncements(contest)">
                📢
              </button>
              <button
                class="icon-btn icon-delete"
                title="删除比赛"
                :disabled="deleteLoading && deleteTarget && deleteTarget.id === contest.id"
                @click="openDeleteModal(contest)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 个比赛</span>
          <span class="page-info">第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span>
        </div>
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="!pagination.has_previous || loading"
            @click="changePage(pagination.page - 1)"
          >
            上一页
          </button>

          <div class="pagination-pages">
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              :class="['pagination-page-btn', { active: page === pagination.page, ellipsis: page === '...' }]"
              :disabled="page === '...' || loading"
              @click="page !== '...' && changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-btn"
            :disabled="!pagination.has_next || loading"
            @click="changePage(pagination.page + 1)"
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

    <ConfirmDialog
      :visible="showDeleteModal"
      title="确认删除比赛？"
      message="删除后将移除该比赛及相关数据，且无法恢复。"
      :detail="deleteTarget ? `将删除：${deleteTarget.id} - ${deleteTarget.name}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="deleteLoading"
      loading-text="正在删除..."
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
      @update:visible="showDeleteModal = $event"
    />
  </div>
</template>

<script>
import { getContestList } from '@/api/contest'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'ContestManage',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      contests: [],
      loading: false,
      error: null,
      searchQuery: '',
      searchTimer: null,
      pagination: {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      },
      showDeleteModal: false,
      deleteTarget: null,
      deleteLoading: false
    }
  },
  mounted() {
    this.fetchContests()
  },
  watch: {
    searchQuery() {
      this.debounceSearch()
    }
  },
  methods: {
    debounceSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1
        this.fetchContests()
      }, 500)
    },
    async fetchContests(page = this.pagination.page) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          page_size: this.pagination.page_size
        }
        const response = await getContestList(params)
         if (response.code === 'success' && response.data) {
           const { contests = [], pagination = {} } = response.data
           this.contests = contests.map(item => ({
            id: item.id || item.contest_id || item.contestId,
            name: item.name || item.contest_name || item.title,
            formatLabel: item.format_label || item.contest_type || item.format || '未知',
            typeLabel: item.type_label || item.contest_mode || item.type || '未知',
            statusLabel: item.status_label || item.status || '未知',
            start_time: this.formatDateTime(item.start_time || item.startTime),
            end_time: this.formatDateTime(item.end_time || item.endTime)
           })).sort((a, b) => Number(b.id) - Number(a.id))
          this.pagination = {
            ...this.pagination,
            ...pagination
          }
        } else {
          this.error = response.message || '获取比赛列表失败'
          this.contests = []
        }
      } catch (err) {
        console.error('获取比赛列表失败:', err)
        this.error = err.message || '获取比赛列表失败，请稍后重试'
        this.contests = []
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.pagination.page = page
      this.fetchContests(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchContests(1)
    },
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
    handleSearch() {
      // 搜索由 watch 监听处理
    },
    handleRefresh() {
      this.fetchContests(this.pagination.page)
    },
    formatDateTime(value) {
      if (!value) return '暂无'
      try {
        const parts = value.toString().split('T')
        if (parts.length === 2) {
          const date = parts[0]
          const time = parts[1].split('.')[0]
          return `${date} ${time}`
        }
        return value
      } catch (e) {
        return value
      }
    },
    handleEditContest(contest) {
      this.$router.push(`/admin/contests/edit/${contest.id}`)
    },
    handleEditProblems(contest) {
      if (this.$message?.info) {
        this.$message.info(`题目编辑功能待接入：${contest.id}`)
      }
    },
    handleViewAnnouncements(contest) {
      if (this.$message?.info) {
        this.$message.info(`公告查看功能待接入：${contest.id}`)
      }
    },
    openDeleteModal(contest) {
      this.deleteTarget = contest
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deleteLoading) return
      this.showDeleteModal = false
      this.deleteTarget = null
    },
    async confirmDelete() {
      if (!this.deleteTarget || this.deleteLoading) return
      this.deleteLoading = true
      try {
        // TODO: 接入后端删除接口
        await new Promise(resolve => setTimeout(resolve, 400))
        if (this.$message?.success) {
          this.$message.success('删除比赛成功（前端占位）')
        }
        const nextPage =
          this.contests.length === 1 && this.pagination.page > 1
            ? this.pagination.page - 1
            : this.pagination.page
        await this.fetchContests(nextPage)
        this.showDeleteModal = false
        this.deleteTarget = null
      } catch (err) {
        console.error('删除比赛失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除比赛失败，请稍后重试')
        }
      } finally {
        this.deleteLoading = false
      }
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
.contest-manage {
  min-height: 400px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  font-size: 24px;
  color: #222222;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #444444;
  margin: 0;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn-refresh {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
  outline: none;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh:not(:disabled):hover {
  background-color: #bae7ff;
}

.btn-retry {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #666666;
}

.error-state {
  color: #ff4d4f;
}

.contest-table-container {
  overflow-x: auto;
}

.contest-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.contest-table thead {
  background-color: #fafafa;
}

.contest-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #222222;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.contest-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333333;
  border-bottom: 1px solid #f0f0f0;
}

.contest-table tbody tr:hover {
  background-color: #f8f9fa;
}

.title-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.time-sep {
  color: #999999;
}

.empty-text {
  text-align: center;
  color: #666666;
}

.actions-cell {
  width: 200px;
  text-align: right;
  white-space: nowrap;
}

.icon-btn {
  min-width: 28px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  margin-left: 6px;
  padding: 0 6px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
  opacity: 0.85;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.icon-btn.icon-edit {
  background-color: #f5f5f5;
}

.icon-btn.icon-view {
  background-color: #f0f5ff;
}

.icon-btn.icon-delete {
  background-color: #fff1f0;
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
  color: #444444;
}

.page-info {
  color: #1668c7;
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
</style>

