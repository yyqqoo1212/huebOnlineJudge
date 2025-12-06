<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <p class="page-subtitle">管理系统所有用户信息</p>
    </div>
    <div class="management-header">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="搜索用户名、邮箱、学号..."
        class="search-input"
        @input="handleSearch"
      />
      <div class="header-actions">
        <button 
          class="btn-batch-delete" 
          :class="{ 'active': batchDeleteMode }"
          @click="toggleBatchDeleteMode"
          :disabled="loading"
        >
          {{ batchDeleteMode ? '取消批量删除' : '批量删除' }}
        </button>
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
      <button class="btn-retry" @click="fetchUsers">重试</button>
    </div>
    
    <div v-else class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th v-if="batchDeleteMode" style="width: 50px; text-align: center;">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="checkbox-select-all"
              />
            </th>
            <th>用户ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>学号</th>
            <th>真实姓名</th>
            <th>状态</th>
            <th>权限</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td :colspan="batchDeleteMode ? 8 : 7" class="empty-text">暂无用户数据</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td v-if="batchDeleteMode" style="text-align: center;">
              <input 
                type="checkbox" 
                :value="user.id"
                v-model="selectedUsers"
                class="checkbox-item"
              />
            </td>
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.student_id || '-' }}</td>
            <td>{{ user.real_name || '-' }}</td>
            <td>
              <span :class="['status-badge', `status-${user.status}`]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>
              <span :class="['permission-badge', `permission-${user.permission}`]">
                {{ getPermissionText(user.permission) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 批量删除操作栏 -->
      <div v-if="batchDeleteMode && selectedUsers.length > 0" class="batch-actions-bar">
        <span class="batch-info">已选中 {{ selectedUsers.length }} 个用户</span>
        <button class="btn-batch-delete-confirm" @click="openBatchDeleteModal">
          删除选中用户
        </button>
      </div>

      <!-- 翻页器 -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 个用户</span>
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

    <!-- 批量删除确认弹窗 -->
    <transition name="fade">
      <div
        v-if="showBatchDeleteModal"
        class="modal-overlay"
        @click.self="closeBatchDeleteModal"
      >
        <div class="modal-card">
          <h3>确认批量删除用户？</h3>
          <p>删除后将移除选中用户的所有信息及相关数据，且无法恢复。</p>
          <p class="modal-problem-title">
            将删除 {{ selectedUsers.length }} 个用户：
          </p>
          <div class="batch-delete-list">
            <div 
              v-for="userId in selectedUsers" 
              :key="userId"
              class="batch-delete-item"
            >
              {{ getUserById(userId)?.id }} - {{ getUserById(userId)?.username }}
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeBatchDeleteModal"
              :disabled="batchDeleteLoading"
            >
              再想想
            </button>
            <button
              class="modal-confirm"
              @click="confirmBatchDelete"
              :disabled="batchDeleteLoading"
            >
              {{ batchDeleteLoading ? '正在删除...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getUserList, deleteUser } from '@/api/user'

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      searchQuery: '',
      searchTimer: null,
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      },
      batchDeleteMode: false,
      selectedUsers: [],
      showBatchDeleteModal: false,
      batchDeleteLoading: false
    }
  },
  computed: {
    isAllSelected() {
      return this.users.length > 0 && 
             this.selectedUsers.length === this.users.length &&
             this.users.every(u => this.selectedUsers.includes(u.id))
    }
  },
  mounted() {
    this.fetchUsers()
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
        this.fetchUsers()
      }, 500)
    },
    async fetchUsers(page = this.pagination.page) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          page_size: this.pagination.page_size
        }
        
        // 添加搜索参数
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }
        
        const response = await getUserList(params)
        if (response.code === 'success' && response.data) {
          this.users = response.data.users || []
          this.pagination = {
            ...this.pagination,
            ...(response.data.pagination || {})
          }
        } else {
          this.error = response.message || '获取用户列表失败'
          this.users = []
        }
      } catch (err) {
        console.error('获取用户列表失败:', err)
        this.error = err.message || '获取用户列表失败，请稍后重试'
        this.users = []
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.pagination.page = page
      this.fetchUsers(page)
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchUsers(1)
    },
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
    },
    toggleBatchDeleteMode() {
      this.batchDeleteMode = !this.batchDeleteMode
      if (!this.batchDeleteMode) {
        // 退出批量删除模式时清空选中
        this.selectedUsers = []
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        // 全选
        this.selectedUsers = this.users.map(u => u.id)
      } else {
        // 取消全选
        this.selectedUsers = []
      }
    },
    getUserById(userId) {
      return this.users.find(u => u.id === userId)
    },
    openBatchDeleteModal() {
      if (this.selectedUsers.length === 0) {
        if (this.$message?.warning) {
          this.$message.warning('请先选择要删除的用户')
        }
        return
      }
      this.showBatchDeleteModal = true
    },
    closeBatchDeleteModal() {
      if (this.batchDeleteLoading) return
      this.showBatchDeleteModal = false
    },
    async confirmBatchDelete() {
      if (this.selectedUsers.length === 0 || this.batchDeleteLoading) return
      
      this.batchDeleteLoading = true
      try {
        // 依次删除选中的用户
        const deletePromises = this.selectedUsers.map(userId => 
          deleteUser(userId).catch(err => {
            console.error(`删除用户 ${userId} 失败:`, err)
            return { error: true, userId, message: err.message }
          })
        )
        
        const results = await Promise.all(deletePromises)
        const errors = results.filter(r => r && r.error)
        const successCount = this.selectedUsers.length - errors.length
        
        if (successCount > 0) {
          if (this.$message?.success) {
            this.$message.success(`成功删除 ${successCount} 个用户`)
          }
        }
        
        if (errors.length > 0) {
          if (this.$message?.error) {
            this.$message.error(`删除失败 ${errors.length} 个用户`)
          }
        }
        
        // 清空选中并刷新列表
        this.selectedUsers = []
        this.batchDeleteMode = false
        this.showBatchDeleteModal = false
        
        // 刷新当前页，如果当前页没有数据了，跳转到上一页
        await this.fetchUsers(this.pagination.page)
        if (this.users.length === 0 && this.pagination.page > 1) {
          await this.fetchUsers(this.pagination.page - 1)
        }
      } catch (err) {
        console.error('批量删除失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '批量删除失败，请稍后重试')
        }
      } finally {
        this.batchDeleteLoading = false
      }
    },
    handleSearch() {
      // 搜索由 watch 监听处理
    },
    handleRefresh() {
      // 刷新当前页
      this.fetchUsers(this.pagination.page)
    },
    getStatusText(status) {
      const map = {
        'normal': '正常',
        'banned': '封禁'
      }
      return map[status] || status
    },
    getPermissionText(permission) {
      const perm = Number(permission) || 0
      const map = {
        0: '普通用户',
        1: '管理员',
        2: '超级管理员'
      }
      return map[perm] || `权限${perm}`
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
.user-management {
  min-height: 400px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  font-size: 24px;
  color: #333333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
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

.btn-refresh,
.btn-batch-delete {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  outline: none;
}

.btn-refresh {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh:not(:disabled):hover {
  background-color: #bae7ff;
}

.btn-batch-delete {
  border-color: #ff4d4f;
  background-color: #fff1f0;
  color: #ff4d4f;
}

.btn-batch-delete.active {
  background-color: #ff4d4f;
  color: #ffffff;
}

.btn-batch-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-batch-delete:not(:disabled):hover {
  background-color: #ff7875;
  border-color: #ff7875;
  color: #ffffff;
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

.user-table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.user-table thead {
  background-color: #fafafa;
}

.user-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.checkbox-select-all,
.checkbox-item {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1890ff;
}

.batch-actions-bar {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.batch-info {
  color: #d46b08;
  font-size: 14px;
  font-weight: 500;
}

.btn-batch-delete-confirm {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #ff4d4f;
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch-delete-confirm:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}

.user-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #666666;
  border-bottom: 1px solid #f0f0f0;
}

.user-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge,
.permission-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-banned {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.permission-0 {
  background-color: #f0f0f0;
  color: #666666;
}

.permission-1 {
  background-color: #e6f7ff;
  color: #1890ff;
}

.permission-2 {
  background-color: #fff7e6;
  color: #fa8c16;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}

.empty-text {
  text-align: center;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: min(420px, 90vw);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
}

.modal-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.modal-card p {
  margin: 4px 0 16px;
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
}

.modal-problem-title {
  font-weight: 600;
  color: #111827;
}

.batch-delete-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 12px 0;
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.batch-delete-item {
  padding: 6px 8px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.batch-delete-item:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel,
.modal-confirm {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.modal-confirm {
  background: #dc2626;
  color: #fff;
}

.modal-confirm:hover:not(:disabled) {
  background: #b91c1c;
}

.modal-confirm:disabled,
.modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
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
}
</style>


