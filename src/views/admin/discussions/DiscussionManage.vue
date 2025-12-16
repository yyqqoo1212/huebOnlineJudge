<template>
  <div class="discussion-manage">
    <div class="page-header">
      <h1>讨论管理</h1>
      <p class="page-subtitle">管理系统所有讨论信息</p>
    </div>
    <div class="management-header">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="搜索讨论标题、作者..."
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
      <button class="btn-retry" @click="fetchDiscussions">重试</button>
    </div>
    
    <div v-else class="discussion-table-container">
      <table class="discussion-table">
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
            <th>讨论ID</th>
            <th>标题</th>
            <th>作者</th>
            <th>浏览量</th>
            <th style="text-align: center; width: 100px;">置顶</th>
            <th style="text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="discussions.length === 0">
            <td :colspan="batchDeleteMode ? 7 : 6" class="empty-text">暂无讨论数据</td>
          </tr>
          <tr v-for="discussion in discussions" :key="discussion.id">
            <td v-if="batchDeleteMode" style="text-align: center;">
              <input 
                type="checkbox" 
                :value="discussion.id"
                v-model="selectedDiscussions"
                class="checkbox-item"
              />
            </td>
            <td>{{ discussion.id }}</td>
            <td class="title-cell">{{ discussion.title }}</td>
            <td>{{ discussion.author }}</td>
            <td>{{ discussion.views || 0 }}</td>
            <td class="pinned-cell" style="text-align: center;">
              <label class="switch-label-inline">
                <input 
                  type="checkbox" 
                  :checked="discussion.is_pinned || false"
                  @change="togglePinned(discussion)"
                  :disabled="pinningLoading && pinningTarget && pinningTarget.id === discussion.id"
                  class="switch-input-inline"
                />
                <span class="switch-slider-inline"></span>
              </label>
            </td>
            <td class="actions-cell">
              <button 
                class="icon-btn icon-edit" 
                title="编辑讨论"
                @click="openEditModal(discussion)"
              >
                ✏️
              </button>
              <button
                class="icon-btn icon-delete"
                title="删除讨论"
                :disabled="deleteLoading && deleteTarget && deleteTarget.id === discussion.id"
                @click="openDeleteModal(discussion)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 批量删除操作栏 -->
      <div v-if="batchDeleteMode && selectedDiscussions.length > 0" class="batch-actions-bar">
        <span class="batch-info">已选中 {{ selectedDiscussions.length }} 个讨论</span>
        <button class="btn-batch-delete-confirm" @click="openBatchDeleteModal">
          删除选中讨论
        </button>
      </div>

      <!-- 翻页器 -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 个讨论</span>
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
    <ConfirmDialog
      :visible="showBatchDeleteModal"
      title="确认批量删除讨论？"
      message="删除后将移除选中讨论的所有信息及相关数据，且无法恢复。"
      :detail="`将删除 ${selectedDiscussions.length} 个讨论：`"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="batchDeleteLoading"
      loading-text="正在删除..."
      @confirm="confirmBatchDelete"
      @cancel="closeBatchDeleteModal"
      @update:visible="showBatchDeleteModal = $event"
    >
      <template #content>
        <div class="batch-delete-list">
          <div 
            v-for="discussionId in selectedDiscussions" 
            :key="discussionId"
            class="batch-delete-item"
          >
            {{ getDiscussionById(discussionId)?.id }} - {{ getDiscussionById(discussionId)?.title }}
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <!-- 单个删除确认弹窗 -->
    <ConfirmDialog
      :visible="showDeleteModal"
      title="确认删除讨论？"
      message="删除后将移除该讨论的所有信息及相关数据，且无法恢复。"
      :detail="deleteTarget ? `将删除：${deleteTarget.id} - ${deleteTarget.title}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="deleteLoading"
      loading-text="正在删除..."
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
      @update:visible="showDeleteModal = $event"
    />

    <!-- 编辑讨论弹窗 -->
    <transition name="fade">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-card edit-modal-card">
          <h3>编辑讨论信息</h3>
          <div class="edit-form">
            <div class="form-group">
              <label>讨论ID</label>
              <input type="text" :value="editForm.id" disabled class="form-input" />
            </div>
            <div class="form-group">
              <label>标题 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="editForm.title" 
                class="form-input"
                placeholder="请输入讨论标题"
                maxlength="200"
              />
            </div>
            <div class="form-group">
              <label>分类 <span class="required">*</span></label>
              <select v-model="editForm.type" class="form-input">
                <option value="solution">题解</option>
                <option value="chat">闲聊</option>
                <option value="help">求解</option>
                <option value="share">分享</option>
              </select>
            </div>
            <div class="form-group">
              <label>作者</label>
              <input type="text" :value="editForm.author" disabled class="form-input" />
            </div>
            <div class="form-group">
              <label>浏览量</label>
              <input type="text" :value="editForm.views || 0" disabled class="form-input" />
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeEditModal"
              :disabled="editLoading"
            >
              取消
            </button>
            <button
              class="modal-confirm"
              @click="confirmEdit"
              :disabled="editLoading"
            >
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getDiscussionList, deleteDiscussion, updateDiscussion, getDiscussionDetail } from '@/api/discussion'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'DiscussionManage',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      discussions: [],
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
      selectedDiscussions: [],
      showBatchDeleteModal: false,
      batchDeleteLoading: false,
      showDeleteModal: false,
      deleteTarget: null,
      deleteLoading: false,
      pinningLoading: false,
      pinningTarget: null,
      showEditModal: false,
      editForm: {
        id: null,
        title: '',
        type: 'chat',
        author: '',
        views: 0
      },
      editLoading: false
    }
  },
  computed: {
    isAllSelected() {
      return this.discussions.length > 0 && 
             this.selectedDiscussions.length === this.discussions.length &&
             this.discussions.every(d => this.selectedDiscussions.includes(d.id))
    }
  },
  mounted() {
    this.fetchDiscussions()
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
        this.fetchDiscussions()
      }, 500)
    },
    async fetchDiscussions(page = this.pagination.page) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          page_size: this.pagination.page_size
        }
        
        // 添加搜索参数（后端可能需要支持搜索，这里先预留）
        if (this.searchQuery.trim()) {
          // 如果后端支持搜索，可以添加 search 参数
          // params.search = this.searchQuery.trim()
        }
        
        const response = await getDiscussionList(params)
        if (response.code === 'success' && response.data) {
          this.discussions = response.data.discussions || []
          this.pagination = {
            ...this.pagination,
            ...(response.data.pagination || {})
          }
        } else {
          this.error = response.message || '获取讨论列表失败'
          this.discussions = []
        }
      } catch (err) {
        console.error('获取讨论列表失败:', err)
        this.error = err.message || '获取讨论列表失败，请稍后重试'
        this.discussions = []
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.pagination.page = page
      this.fetchDiscussions(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchDiscussions(1)
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
    toggleBatchDeleteMode() {
      this.batchDeleteMode = !this.batchDeleteMode
      if (!this.batchDeleteMode) {
        this.selectedDiscussions = []
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedDiscussions = this.discussions.map(d => d.id)
      } else {
        this.selectedDiscussions = []
      }
    },
    getDiscussionById(discussionId) {
      return this.discussions.find(d => d.id === discussionId)
    },
    openBatchDeleteModal() {
      if (this.selectedDiscussions.length === 0) {
        if (this.$message?.warning) {
          this.$message.warning('请先选择要删除的讨论')
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
      if (this.selectedDiscussions.length === 0 || this.batchDeleteLoading) return
      
      this.batchDeleteLoading = true
      try {
        const deletePromises = this.selectedDiscussions.map(discussionId => 
          deleteDiscussion(discussionId).catch(err => {
            console.error(`删除讨论 ${discussionId} 失败:`, err)
            return { error: true, discussionId, message: err.message }
          })
        )
        
        const results = await Promise.all(deletePromises)
        const errors = results.filter(r => r && r.error)
        const successCount = this.selectedDiscussions.length - errors.length
        
        if (successCount > 0) {
          if (this.$message?.success) {
            this.$message.success(`成功删除 ${successCount} 个讨论`)
          }
        }
        
        if (errors.length > 0) {
          if (this.$message?.error) {
            this.$message.error(`删除失败 ${errors.length} 个讨论`)
          }
        }
        
        this.selectedDiscussions = []
        this.batchDeleteMode = false
        this.showBatchDeleteModal = false
        
        await this.fetchDiscussions(this.pagination.page)
        if (this.discussions.length === 0 && this.pagination.page > 1) {
          await this.fetchDiscussions(this.pagination.page - 1)
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
      this.fetchDiscussions(this.pagination.page)
    },
    openDeleteModal(discussion) {
      if (this.loading || this.deleteLoading) return
      this.deleteTarget = discussion
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
        await deleteDiscussion(this.deleteTarget.id)
        if (this.$message?.success) {
          this.$message.success('删除讨论成功')
        }
        const nextPage =
          this.discussions.length === 1 && this.pagination.page > 1
            ? this.pagination.page - 1
            : this.pagination.page
        await this.fetchDiscussions(nextPage)
        this.showDeleteModal = false
        this.deleteTarget = null
      } catch (err) {
        console.error('删除讨论失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除讨论失败，请稍后重试')
        }
      } finally {
        this.deleteLoading = false
      }
    },
    async togglePinned(discussion) {
      if (this.pinningLoading) return
      
      const newPinnedState = !discussion.is_pinned
      this.pinningLoading = true
      this.pinningTarget = discussion
      
      try {
        await updateDiscussion(discussion.id, {
          is_pinned: newPinnedState
        })
        
        // 更新本地数据
        discussion.is_pinned = newPinnedState
        
        if (this.$message?.success) {
          this.$message.success(newPinnedState ? '已置顶' : '已取消置顶')
        }
        
        // 如果当前页有置顶状态变化，可能需要重新排序，刷新列表
        await this.fetchDiscussions(this.pagination.page)
      } catch (err) {
        console.error('切换置顶状态失败:', err)
        // 恢复原状态
        discussion.is_pinned = !newPinnedState
        if (this.$message?.error) {
          this.$message.error(err.message || '切换置顶状态失败，请稍后重试')
        }
      } finally {
        this.pinningLoading = false
        this.pinningTarget = null
      }
    },
    async openEditModal(discussion) {
      if (this.loading || this.editLoading) return
      
      // 如果需要编辑内容，需要先获取详情
      try {
        const response = await getDiscussionDetail(discussion.id)
        if (response.code === 'success' && response.data) {
          const detail = response.data
          this.editForm = {
            id: detail.id,
            title: detail.title || '',
            type: detail.type || 'chat',
            author: detail.author || '',
            views: detail.views || 0
          }
        } else {
          // 如果获取详情失败，使用列表中的数据
          this.editForm = {
            id: discussion.id,
            title: discussion.title || '',
            type: discussion.type || 'chat',
            author: discussion.author || '',
            views: discussion.views || 0
          }
        }
      } catch (err) {
        console.error('获取讨论详情失败:', err)
        // 使用列表中的数据
        this.editForm = {
          id: discussion.id,
          title: discussion.title || '',
          type: discussion.type || 'chat',
          author: discussion.author || '',
          views: discussion.views || 0
        }
      }
      
      this.showEditModal = true
    },
    closeEditModal() {
      if (this.editLoading) return
      this.showEditModal = false
      this.editForm = {
        id: null,
        title: '',
        type: 'chat',
        author: '',
        views: 0
      }
    },
    async confirmEdit() {
      if (!this.editForm.id || this.editLoading) return
      
      if (!this.editForm.title || !this.editForm.type) {
        if (this.$message?.warning) {
          this.$message.warning('标题和分类不能为空')
        }
        return
      }
      
      this.editLoading = true
      try {
        await updateDiscussion(this.editForm.id, {
          title: this.editForm.title,
          type: this.editForm.type
        })
        
        if (this.$message?.success) {
          this.$message.success('更新讨论信息成功')
        }
        
        await this.fetchDiscussions(this.pagination.page)
        
        setTimeout(() => {
          this.closeEditModal()
        }, 500)
      } catch (err) {
        console.error('更新讨论信息失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '更新讨论信息失败，请稍后重试')
        }
      } finally {
        this.editLoading = false
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
.discussion-manage {
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

.discussion-table-container {
  overflow-x: auto;
}

.discussion-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.discussion-table thead {
  background-color: #fafafa;
}

.discussion-table th {
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

.discussion-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #666666;
  border-bottom: 1px solid #f0f0f0;
}

.discussion-table tbody tr:hover {
  background-color: #f8f9fa;
}

.title-cell {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-text {
  text-align: center;
  color: #999999;
}

.actions-cell {
  width: 120px;
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

.edit-modal-card {
  width: min(600px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal-card h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.edit-form {
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333333;
  font-weight: 500;
}

.form-group .required {
  color: #ff4d4f;
}

.form-input {
  width: 100%;
  padding: 7px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  height: 32px;
}

.form-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.modal-cancel,
.modal-confirm {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  outline: none;
}

.modal-cancel {
  border-color: #d9d9d9;
  background-color: #ffffff;
  color: #333333;
}

.modal-cancel:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.modal-confirm {
  border-color: #1890ff;
  background-color: #1890ff;
  color: #ffffff;
}

.modal-confirm:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.modal-cancel:disabled,
.modal-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.switch-input {
  position: relative;
  width: 44px;
  height: 24px;
  appearance: none;
  background-color: #d9d9d9;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.switch-input:checked {
  background-color: #1890ff;
}

.switch-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.switch-input:checked + .switch-slider {
  transform: translateX(20px);
}

.switch-text {
  font-size: 14px;
  color: #333333;
  user-select: none;
}

.pinned-cell {
  vertical-align: middle;
}

.switch-label-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.switch-input-inline {
  position: relative;
  width: 44px;
  height: 24px;
  appearance: none;
  background-color: #d9d9d9;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0;
}

.switch-input-inline:checked {
  background-color: #1890ff;
}

.switch-input-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-slider-inline {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.switch-input-inline:checked + .switch-slider-inline {
  transform: translateY(-50%) translateX(20px);
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

  .edit-modal-card {
    width: min(95vw, 500px);
  }
}
</style>

