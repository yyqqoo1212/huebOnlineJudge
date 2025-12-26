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
            <td>
              <span 
                :class="['format-badge', `format-${contest.format}`]"
              >
                {{ getFormatText(contest.format) }}
              </span>
            </td>
            <td>
              <span 
                :class="['type-badge', `type-${contest.type}`]"
              >
                {{ getTypeText(contest.type) }}
              </span>
            </td>
            <td>
              <span 
                :class="['status-badge', `status-${contest.status}`]"
              >
                {{ getStatusText(contest.status) }}
              </span>
            </td>
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

    <!-- 公告管理对话框 -->
    <transition name="fade">
      <div
        v-if="showAnnouncementsModal"
        class="modal-overlay"
        @click.self="closeAnnouncementsModal"
      >
        <div class="modal-card announcements-modal">
          <div class="modal-header">
            <h3>比赛公告管理</h3>
            <button class="modal-close-btn" @click="closeAnnouncementsModal">×</button>
          </div>
          <div class="modal-body">
            <div v-if="announcementsLoading" class="loading-state">
              <p>加载中...</p>
            </div>
            <div v-else-if="announcementsError" class="error-state">
              <p>{{ announcementsError }}</p>
            </div>
            <div v-else-if="announcements.length === 0" class="empty-state">
              <p>暂无公告</p>
            </div>
            <div v-else class="announcements-list">
              <div
                v-for="announcement in announcements"
                :key="announcement.id"
                class="announcement-item"
                :class="{ 'is-important': announcement.is_important }"
              >
                <div class="announcement-header">
                  <div class="announcement-title-row">
                    <span v-if="announcement.is_important" class="important-badge">置顶</span>
                    <h4 class="announcement-title">{{ announcement.title }}</h4>
                  </div>
                  <button
                    class="btn-delete-announcement"
                    :disabled="announcementDeleteLoading && announcementDeleteTarget === announcement.id"
                    @click="openDeleteAnnouncementModal(announcement)"
                  >
                    {{ announcementDeleteLoading && announcementDeleteTarget === announcement.id ? '删除中...' : '删除' }}
                  </button>
                </div>
                <div class="announcement-content-preview">{{ getContentPreview(announcement.content) }}</div>
                <div class="announcement-meta">
                  <span class="announcement-publisher">发布人：{{ announcement.publisher_name || '系统' }}</span>
                  <span class="announcement-time">发布时间：{{ formatTime(announcement.create_time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 删除公告确认对话框 -->
    <ConfirmDialog
      :visible="showDeleteAnnouncementModal"
      title="确认删除公告？"
      message="删除后将移除该公告的所有信息，且无法恢复。"
      :detail="deleteAnnouncementTarget ? `将删除：${deleteAnnouncementTarget.title}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="announcementDeleteLoading"
      loading-text="正在删除..."
      @confirm="confirmDeleteAnnouncement"
      @cancel="closeDeleteAnnouncementModal"
      @update:visible="showDeleteAnnouncementModal = $event"
    />
  </div>
</template>

<script>
import { getContestList, deleteContest, getContestAnnouncements, deleteContestAnnouncement } from '@/api/contest'
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
      deleteLoading: false,
      showAnnouncementsModal: false,
      currentContestId: null,
      announcements: [],
      announcementsLoading: false,
      announcementsError: null,
      showDeleteAnnouncementModal: false,
      deleteAnnouncementTarget: null,
      announcementDeleteLoading: false,
      announcementDeleteTarget: null
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
           // 映射后端格式到前端格式
           const formatMap = { 'ACM': 'acm', 'IOI': 'ioi', 'OI': 'io' }
           const typeMap = { '公开赛': 'public', '私有赛': 'private' }
           const statusMap = { '即将开始': 'upcoming', '进行中': 'active', '已结束': 'ended' }
           
           this.contests = contests.map(item => {
             const rawFormat = item.format_label || item.contest_type || item.format || 'ACM'
             const rawType = item.type_label || item.contest_mode || item.type || '公开赛'
             const rawStatus = item.status_label || item.status || '即将开始'
             
             return {
              id: item.id || item.contest_id || item.contestId,
              name: item.name || item.contest_name || item.title,
              format: formatMap[rawFormat] || 'acm',
              type: typeMap[rawType] || 'public',
              status: statusMap[rawStatus] || 'upcoming',
              start_time: this.formatDateTime(item.start_time || item.startTime),
              end_time: this.formatDateTime(item.end_time || item.endTime)
             }
           }).sort((a, b) => Number(b.id) - Number(a.id))
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
          // 处理时区信息：移除 +00:00, -05:00, Z, .123 等后缀
          // 先移除 Z，然后按 + 或 - 分割，再按 . 分割
          let timePart = parts[1].split('Z')[0]
          timePart = timePart.split(/[+-]/)[0]
          const time = timePart.split('.')[0]
          return `${date} ${time}`
        }
        return value
      } catch (e) {
        return value
      }
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
    getStatusText(status) {
      const map = {
        'upcoming': '即将开始',
        'active': '进行中',
        'ended': '已结束'
      }
      return map[status] || status
    },
    handleEditContest(contest) {
      this.$router.push(`/admin/contests/edit/${contest.id}`)
    },
    handleEditProblems(contest) {
      if (this.$message?.info) {
        this.$message.info(`题目编辑功能待接入：${contest.id}`)
      }
    },
    async handleViewAnnouncements(contest) {
      this.currentContestId = contest.id
      this.showAnnouncementsModal = true
      await this.fetchAnnouncements(contest.id)
    },
    async fetchAnnouncements(contestId) {
      this.announcementsLoading = true
      this.announcementsError = null
      try {
        const response = await getContestAnnouncements(contestId)
        if (response.code === 'success' && response.data) {
          this.announcements = response.data.announcements || []
        } else {
          this.announcementsError = response.message || '获取公告列表失败'
          this.announcements = []
        }
      } catch (err) {
        console.error('获取公告列表失败:', err)
        this.announcementsError = err.message || '获取公告列表失败，请稍后重试'
        this.announcements = []
      } finally {
        this.announcementsLoading = false
      }
    },
    closeAnnouncementsModal() {
      this.showAnnouncementsModal = false
      this.currentContestId = null
      this.announcements = []
      this.announcementsError = null
    },
    formatTime(timeString) {
      if (!timeString) return ''
      try {
        const date = new Date(timeString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return timeString
      }
    },
    getContentPreview(content) {
      if (!content) return ''
      // 移除HTML标签，只保留文本
      const text = content.replace(/<[^>]*>/g, '')
      // 如果超过100个字符，截取并添加省略号
      if (text.length > 100) {
        return text.substring(0, 100) + '...'
      }
      return text
    },
    openDeleteAnnouncementModal(announcement) {
      this.deleteAnnouncementTarget = announcement
      this.showDeleteAnnouncementModal = true
    },
    closeDeleteAnnouncementModal() {
      if (this.announcementDeleteLoading) return
      this.showDeleteAnnouncementModal = false
      this.deleteAnnouncementTarget = null
      this.announcementDeleteTarget = null
    },
    async confirmDeleteAnnouncement() {
      if (!this.deleteAnnouncementTarget || !this.currentContestId || this.announcementDeleteLoading) return
      
      this.announcementDeleteLoading = true
      this.announcementDeleteTarget = this.deleteAnnouncementTarget.id
      try {
        const response = await deleteContestAnnouncement(this.currentContestId, this.deleteAnnouncementTarget.id)
        if (response.code === 'success') {
          if (this.$message?.success) {
            this.$message.success('删除公告成功')
          }
          // 重新获取公告列表
          await this.fetchAnnouncements(this.currentContestId)
          this.showDeleteAnnouncementModal = false
          this.deleteAnnouncementTarget = null
          this.announcementDeleteTarget = null
        } else {
          if (this.$message?.error) {
            this.$message.error(response.message || '删除公告失败')
          }
        }
      } catch (err) {
        console.error('删除公告失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除公告失败，请稍后重试')
        }
      } finally {
        this.announcementDeleteLoading = false
        this.announcementDeleteTarget = null
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
        const response = await deleteContest(this.deleteTarget.id)
        if (response.code === 'success') {
          if (this.$message?.success) {
            this.$message.success('删除比赛成功')
          }
          const nextPage =
            this.contests.length === 1 && this.pagination.page > 1
              ? this.pagination.page - 1
              : this.pagination.page
          await this.fetchContests(nextPage)
          this.showDeleteModal = false
          this.deleteTarget = null
        } else {
          if (this.$message?.error) {
            this.$message.error(response.message || '删除比赛失败')
          }
        }
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

/* 公告管理对话框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.announcements-modal {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.announcement-item.is-important {
  border-color: #1890ff;
  background-color: #f0f5ff;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.announcement-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.important-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
}

.announcement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  flex: 1;
}

.btn-delete-announcement {
  padding: 6px 16px;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  background-color: #ffffff;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-delete-announcement:hover:not(:disabled) {
  background-color: #fff1f0;
}

.btn-delete-announcement:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.announcement-content-preview {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 3;
}

.announcement-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.announcement-publisher,
.announcement-time {
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

  .announcements-modal {
    width: 95%;
    max-height: 85vh;
  }

  .announcement-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-delete-announcement {
    align-self: flex-end;
  }

  .announcement-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

