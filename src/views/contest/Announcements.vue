<template>
  <div class="contest-announcements">
    <div class="announcements-container">
      <div class="announcements-card">
        <div class="card-header">
          <h2 class="card-title">比赛公告</h2>
          <button 
            v-if="isAdminOrSuperAdmin" 
            class="btn-publish"
            @click="openPublishDialog"
          >
            发布公告
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>
        <div v-else-if="announcements.length > 0" class="announcements-list">
          <div 
            v-for="announcement in announcements" 
            :key="announcement.id"
            class="announcement-item"
            :class="{ 'important': announcement.is_important }"
            @click="viewAnnouncementDetail(announcement.id)"
          >
            <div class="announcement-header">
              <div class="announcement-title-row">
                <h3 class="announcement-title">
                  <span v-if="announcement.is_important" class="important-badge">置顶</span>
                  {{ announcement.title }}
                </h3>
                <span class="announcement-time">{{ formatTime(announcement.create_time) }}</span>
              </div>
            </div>
            <div class="announcement-preview">
              <div class="announcement-content-preview" v-html="getContentPreview(announcement.content)"></div>
              <div class="announcement-publisher">发布人：{{ announcement.publisher_name || '系统' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无公告</p>
        </div>
      </div>
    </div>

    <!-- 发布公告对话框 -->
    <transition name="fade">
      <div
        v-if="showPublishDialog"
        class="modal-overlay"
        @click.self="closePublishDialog"
      >
        <div class="modal-card publish-modal">
          <h3>发布公告</h3>
          <div class="form-content">
            <div class="form-item">
              <label>公告标题 *</label>
              <input
                v-model="publishForm.title"
                type="text"
                placeholder="请输入公告标题"
                class="form-input"
                :class="{ 'input-error': publishFormErrors.title }"
              />
            </div>
            <div class="form-item">
              <label>公告内容 *</label>
              <textarea
                v-model="publishForm.content"
                rows="8"
                placeholder="请输入公告内容"
                class="form-textarea"
                :class="{ 'input-error': publishFormErrors.content }"
              ></textarea>
            </div>
            <div class="form-item">
              <label class="switch-label">
                <input
                  type="checkbox"
                  v-model="publishForm.is_important"
                  class="switch-input"
                />
                <span class="switch-text">是否置顶</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closePublishDialog"
              :disabled="publishLoading"
            >
              取消
            </button>
            <button
              class="modal-confirm"
              @click="handlePublish"
              :disabled="publishLoading"
            >
              {{ publishLoading ? '发布中...' : '发布' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 公告详情对话框 -->
    <transition name="fade">
      <div
        v-if="showDetailDialog && selectedAnnouncement"
        class="modal-overlay"
        @click.self="closeDetailDialog"
      >
        <div class="modal-card detail-modal">
          <h3>
            <span v-if="selectedAnnouncement.is_important" class="important-badge">置顶</span>
            {{ selectedAnnouncement.title }}
          </h3>
          <div class="detail-meta">
            <span class="detail-time">发布时间：{{ formatTime(selectedAnnouncement.create_time) }}</span>
            <span class="detail-publisher">发布人：{{ selectedAnnouncement.publisher_name || '系统' }}</span>
          </div>
          <div class="detail-content" v-html="selectedAnnouncement.content"></div>
          <div class="modal-actions">
            <button
              v-if="isMyAnnouncement"
              class="modal-edit"
              @click="openEditDialog"
            >
              编辑
            </button>
            <button
              v-if="isMyAnnouncement"
              class="modal-delete"
              @click="openDeleteDialog"
            >
              删除
            </button>
            <button
              class="modal-confirm"
              @click="closeDetailDialog"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 编辑公告对话框 -->
    <transition name="fade">
      <div
        v-if="showEditDialog && selectedAnnouncement"
        class="modal-overlay"
        @click.self="closeEditDialog"
      >
        <div class="modal-card publish-modal">
          <h3>编辑公告</h3>
          <div class="form-content">
            <div class="form-item">
              <label>公告标题 *</label>
              <input
                v-model="editForm.title"
                type="text"
                placeholder="请输入公告标题"
                class="form-input"
                :class="{ 'input-error': editFormErrors.title }"
              />
            </div>
            <div class="form-item">
              <label>公告内容 *</label>
              <textarea
                v-model="editForm.content"
                rows="8"
                placeholder="请输入公告内容"
                class="form-textarea"
                :class="{ 'input-error': editFormErrors.content }"
              ></textarea>
            </div>
            <div class="form-item">
              <label class="switch-label">
                <input
                  type="checkbox"
                  v-model="editForm.is_important"
                  class="switch-input"
                />
                <span class="switch-text">是否置顶</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeEditDialog"
              :disabled="editLoading"
            >
              取消
            </button>
            <button
              class="modal-confirm"
              @click="handleEdit"
              :disabled="editLoading"
            >
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :visible="showDeleteDialog"
      title="确认删除公告？"
      message="删除后将移除该公告的所有信息，且无法恢复。"
      :detail="selectedAnnouncement ? `将删除：${selectedAnnouncement.title}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="deleteLoading"
      loading-text="正在删除..."
      @confirm="handleDelete"
      @cancel="closeDeleteDialog"
      @update:visible="showDeleteDialog = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composbles/useAuth'
import { getContestAnnouncements, createContestAnnouncement, getContestAnnouncementDetail, updateContestAnnouncement, deleteContestAnnouncement } from '@/api/contest'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const { user } = useAuth()

const contestId = computed(() => route.params.id)
const announcements = ref([])
const loading = ref(false)
const showPublishDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedAnnouncement = ref(null)
const publishLoading = ref(false)
const editLoading = ref(false)
const deleteLoading = ref(false)

const publishForm = ref({
  title: '',
  content: '',
  is_important: false
})

const publishFormErrors = ref({
  title: false,
  content: false
})

const editForm = ref({
  title: '',
  content: '',
  is_important: false
})

const editFormErrors = ref({
  title: false,
  content: false
})

// 检查是否是管理员或超级管理员（permission为1或2）
const isAdminOrSuperAdmin = computed(() => {
  const userValue = user.value
  if (!userValue) return false
  const permission = Number(userValue.permission) || 0
  return permission === 1 || permission === 2
})

// 检查是否是当前用户发布的公告
const isMyAnnouncement = computed(() => {
  if (!selectedAnnouncement.value || !user.value) return false
  const currentUserId = Number(user.value.id) || 0
  const publisherId = Number(selectedAnnouncement.value.publisher_id) || 0
  return currentUserId === publisherId
})

const formatTime = (timeString) => {
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
}

const getContentPreview = (content) => {
  if (!content) return ''
  // 移除HTML标签，只保留文本
  const text = content.replace(/<[^>]*>/g, '')
  // 如果超过100个字符，截取并添加省略号
  if (text.length > 100) {
    return text.substring(0, 100) + '...'
  }
  return text
}

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const response = await getContestAnnouncements(contestId.value)
    if (response.code === 'success' && response.data) {
      announcements.value = response.data.announcements || []
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openPublishDialog = () => {
  publishForm.value = {
    title: '',
    content: '',
    is_important: false
  }
  publishFormErrors.value = {
    title: false,
    content: false
  }
  showPublishDialog.value = true
}

const closePublishDialog = () => {
  if (publishLoading.value) return
  showPublishDialog.value = false
}

const handlePublish = async () => {
  // 验证表单
  publishFormErrors.value = {
    title: !publishForm.value.title.trim(),
    content: !publishForm.value.content.trim()
  }

  if (publishFormErrors.value.title || publishFormErrors.value.content) {
    return
  }

  publishLoading.value = true
  try {
    const response = await createContestAnnouncement(contestId.value, {
      title: publishForm.value.title.trim(),
      content: publishForm.value.content.trim(),
      is_important: publishForm.value.is_important
    })

    if (response.code === 'success') {
      showPublishDialog.value = false
      // 重新获取公告列表
      await fetchAnnouncements()
      // 显示成功提示
      if (window.$message?.success) {
        window.$message.success('发布公告成功')
      }
    } else {
      if (window.$message?.error) {
        window.$message.error(response.message || '发布公告失败')
      }
    }
  } catch (error) {
    console.error('发布公告失败:', error)
    if (window.$message?.error) {
      window.$message.error(error.message || '发布公告失败，请稍后重试')
    }
  } finally {
    publishLoading.value = false
  }
}

const viewAnnouncementDetail = async (announcementId) => {
  try {
    const response = await getContestAnnouncementDetail(contestId.value, announcementId)
    if (response.code === 'success' && response.data) {
      selectedAnnouncement.value = response.data
      showDetailDialog.value = true
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    if (window.$message?.error) {
      window.$message.error(error.message || '获取公告详情失败')
    }
  }
}

const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedAnnouncement.value = null
}

const openEditDialog = () => {
  if (!selectedAnnouncement.value) return
  
  editForm.value = {
    title: selectedAnnouncement.value.title || '',
    content: selectedAnnouncement.value.content || '',
    is_important: selectedAnnouncement.value.is_important || false
  }
  
  editFormErrors.value = {
    title: false,
    content: false
  }
  
  showEditDialog.value = true
  showDetailDialog.value = false // 关闭详情对话框
}

const closeEditDialog = () => {
  if (editLoading.value) return
  showEditDialog.value = false
}

const handleEdit = async () => {
  if (!selectedAnnouncement.value) return
  
  // 验证表单
  editFormErrors.value = {
    title: !editForm.value.title.trim(),
    content: !editForm.value.content.trim()
  }

  if (editFormErrors.value.title || editFormErrors.value.content) {
    return
  }

  editLoading.value = true
  try {
    const response = await updateContestAnnouncement(contestId.value, selectedAnnouncement.value.id, {
      title: editForm.value.title.trim(),
      content: editForm.value.content.trim(),
      is_important: editForm.value.is_important
    })

    if (response.code === 'success') {
      showEditDialog.value = false
      // 重新获取公告列表
      await fetchAnnouncements()
      // 更新选中的公告信息
      if (response.data) {
        selectedAnnouncement.value = response.data
        showDetailDialog.value = true
      }
      // 显示成功提示
      if (window.$message?.success) {
        window.$message.success('编辑公告成功')
      }
    } else {
      if (window.$message?.error) {
        window.$message.error(response.message || '编辑公告失败')
      }
    }
  } catch (error) {
    console.error('编辑公告失败:', error)
    if (window.$message?.error) {
      window.$message.error(error.message || '编辑公告失败，请稍后重试')
    }
  } finally {
    editLoading.value = false
  }
}

const openDeleteDialog = () => {
  if (!selectedAnnouncement.value) return
  showDeleteDialog.value = true
  showDetailDialog.value = false // 关闭详情对话框
}

const closeDeleteDialog = () => {
  if (deleteLoading.value) return
  showDeleteDialog.value = false
}

const handleDelete = async () => {
  if (!selectedAnnouncement.value) return

  deleteLoading.value = true
  try {
    const response = await deleteContestAnnouncement(contestId.value, selectedAnnouncement.value.id)

    if (response.code === 'success') {
      showDeleteDialog.value = false
      // 重新获取公告列表
      await fetchAnnouncements()
      // 清空选中的公告
      selectedAnnouncement.value = null
      // 显示成功提示
      if (window.$message?.success) {
        window.$message.success('删除公告成功')
      }
    } else {
      if (window.$message?.error) {
        window.$message.error(response.message || '删除公告失败')
      }
    }
  } catch (error) {
    console.error('删除公告失败:', error)
    if (window.$message?.error) {
      window.$message.error(error.message || '删除公告失败，请稍后重试')
    }
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.contest-announcements {
  padding: 30px 20px;
}

.announcements-container {
  max-width: 1100px;
  margin: 0 auto;
}

.announcements-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8e8e8;
}

.card-title {
  font-size: 24px;
  color: #333333;
  margin: 0;
}

.btn-publish {
  padding: 8px 20px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-publish:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.announcement-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
  transform: translateX(4px);
}

.announcement-item.important {
  border-left: 4px solid #ff4d4f;
  background-color: #fff7e6;
}

.announcement-header {
  margin-bottom: 12px;
}

.announcement-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.announcement-title {
  font-size: 18px;
  color: #333333;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.important-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.announcement-time {
  font-size: 14px;
  color: #999999;
  white-space: nowrap;
}

.announcement-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.announcement-content-preview {
  font-size: 15px;
  line-height: 1.6;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.announcement-publisher {
  font-size: 14px;
  color: #999999;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

/* 对话框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.publish-modal {
  width: min(600px, 90vw);
}

.detail-modal {
  width: min(800px, 90vw);
}

.modal-card h3 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-error {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

.switch-input {
  width: 44px;
  height: 22px;
  position: relative;
  appearance: none;
  background-color: #d9d9d9;
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.switch-input:checked {
  background-color: #1890ff;
}

.switch-input::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffffff;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-input:checked::after {
  transform: translateX(22px);
}

.switch-text {
  user-select: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel,
.modal-confirm {
  padding: 8px 18px;
  border-radius: 6px;
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
  background: #1890ff;
  color: #fff;
}

.modal-confirm:hover:not(:disabled) {
  background: #40a9ff;
}

.modal-confirm:disabled,
.modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-edit {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid #1890ff;
  background: #ffffff;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-edit:hover:not(:disabled) {
  background: #e6f7ff;
}

.modal-delete {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid #ff4d4f;
  background: #ffffff;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-delete:hover:not(:disabled) {
  background: #fff1f0;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  color: #666666;
}

.detail-content {
  font-size: 15px;
  line-height: 1.8;
  color: #666666;
  margin-bottom: 20px;
}

.detail-content :deep(p) {
  margin-bottom: 12px;
}

.detail-content :deep(ul),
.detail-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
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
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .announcement-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
