<template>
  <div class="settings-page">
    <div class="settings-container">
      <header class="settings-header">
        <h1>账户设置</h1>
        <p>查看和管理您的账户信息</p>
      </header>

      <div v-if="loading" class="loading-container">
        <p>加载中...</p>
      </div>

      <div v-else-if="user" class="settings-content">
        <!-- 编辑模式切换按钮 -->
        <div class="edit-header">
          <button
            v-if="!isEditing"
            class="edit-btn"
            @click="startEdit"
          >
            编辑资料
          </button>
          <div v-else class="edit-actions">
            <button class="cancel-btn" @click="cancelEdit">取消</button>
            <button class="save-btn" @click="handleSave" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>

        <!-- 头像编辑 -->
        <section class="avatar-section">
          <h2>头像</h2>
          <div class="avatar-container">
            <div v-if="avatarPreview || user.avatar_url" class="avatar-preview">
              <img
                :src="avatarPreview || user.avatar_url"
                :alt="user.username"
                class="avatar-image"
              />
              <button
                v-if="isEditing"
                type="button"
                class="remove-avatar-btn"
                @click="removeAvatar"
                title="移除头像"
              >
                ×
              </button>
            </div>
            <div v-else class="avatar-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                ></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>暂无头像</span>
            </div>
            <div v-if="isEditing" class="avatar-upload-controls">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <button
                type="button"
                class="upload-btn"
                :disabled="isUploadingAvatar"
                @click="$refs.avatarInput?.click()"
              >
                {{ isUploadingAvatar ? '上传中...' : avatarPreview || user.avatar_url ? '更换头像' : '上传头像' }}
              </button>
              <small v-if="avatarError" class="avatar-error">{{ avatarError }}</small>
            </div>
          </div>
        </section>

        <!-- 基本信息编辑 -->
        <section class="info-section">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>用户ID</label>
              <div class="info-value">{{ user.id || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>用户名</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.username"
                type="text"
                class="edit-input"
                placeholder="请输入用户名"
              />
              <div v-else class="info-value">{{ user.username || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>邮箱</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.email"
                type="email"
                class="edit-input"
                placeholder="请输入邮箱"
              />
              <div v-else class="info-value">{{ user.email || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>性别</label>
              <div v-if="isEditing" class="gender-options">
                <label class="gender-option">
                  <input
                    v-model="editForm.gender"
                    type="radio"
                    value="M"
                  />
                  <span>男</span>
                </label>
                <label class="gender-option">
                  <input
                    v-model="editForm.gender"
                    type="radio"
                    value="F"
                  />
                  <span>女</span>
                </label>
              </div>
              <div v-else class="info-value">
                {{ getGenderText(user.gender) }}
              </div>
            </div>

            <div class="info-item">
              <label>个性签名</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.motto"
                type="text"
                class="edit-input"
                placeholder="写一句话介绍你自己"
                maxlength="80"
              />
              <div v-else class="info-value">{{ user.motto || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>学号</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.studentId"
                type="text"
                class="edit-input"
                placeholder="请输入学号"
                maxlength="50"
              />
              <div v-else class="info-value">{{ user.student_id || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>班级</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.className"
                type="text"
                class="edit-input"
                placeholder="请输入班级"
                maxlength="100"
              />
              <div v-else class="info-value">{{ user.class_name || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>真实姓名</label>
              <input
                v-if="isEditing"
                v-model.trim="editForm.realName"
                type="text"
                class="edit-input"
                placeholder="请输入真实姓名"
                maxlength="50"
              />
              <div v-else class="info-value">{{ user.real_name || '未设置' }}</div>
            </div>

            <div class="info-item" v-if="user.created_at">
              <label>注册时间</label>
              <div class="info-value">{{ formatDate(user.created_at) }}</div>
            </div>

            <div class="info-item" v-if="user.last_login_time">
              <label>最后登录时间</label>
              <div class="info-value">{{ formatDate(user.last_login_time) }}</div>
            </div>
          </div>
        </section>

        <!-- 修改密码 -->
        <section class="password-section">
          <h2>修改密码</h2>
          <div class="password-form">
            <div class="form-item">
              <label>旧密码</label>
              <input
                v-model.trim="passwordForm.oldPassword"
                type="password"
                class="edit-input"
                placeholder="请输入旧密码"
              />
            </div>
            <div class="form-item">
              <label>新密码</label>
              <input
                v-model.trim="passwordForm.newPassword"
                type="password"
                class="edit-input"
                placeholder="请输入新密码（至少6位）"
              />
            </div>
            <div class="form-item">
              <label>确认新密码</label>
              <input
                v-model.trim="passwordForm.confirmPassword"
                type="password"
                class="edit-input"
                placeholder="请再次输入新密码"
              />
            </div>
            <button
              class="change-password-btn"
              @click="handleChangePassword"
              :disabled="isChangingPassword"
            >
              {{ isChangingPassword ? '修改中...' : '修改密码' }}
            </button>
            <div v-if="passwordError" class="password-error">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="password-success">{{ passwordSuccess }}</div>
          </div>
        </section>

        <!-- 统计信息 -->
        <section class="stats-section">
          <h2>统计信息</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ user.total_submissions || 0 }}</div>
              <div class="stat-label">总提交数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ user.accepted_submissions || 0 }}</div>
              <div class="stat-label">通过数</div>
            </div>
          </div>
        </section>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>

      <div v-else class="error-container">
        <p>无法加载用户信息，请重新登录</p>
        <router-link to="/login" class="login-link">前往登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchProfile, updateProfile, changePassword } from '@/api/auth'
import { uploadFile } from '@/api/files'
import { userStorage } from '@/utils/storage'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isUploadingAvatar = ref(false)
const isChangingPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const avatarInput = ref(null)
const avatarPreview = ref('')
const avatarFile = ref(null)
const avatarObjectKey = ref('')
const avatarError = ref('')

const user = computed(() => authStore.user)

const editForm = reactive({
  username: '',
  email: '',
  gender: '',
  motto: '',
  avatarUrl: '',
  studentId: '',
  className: '',
  realName: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const getGenderText = (gender) => {
  const genderMap = {
    'M': '男',
    'F': '女',
  }
  return genderMap[gender] || '未设置'
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const loadUserProfile = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetchProfile()
    const userData = response?.data || response
    
    if (userData) {
      authStore.user = userData
      userStorage.save(userData)
      
      // 初始化编辑表单
      editForm.username = userData.username || ''
      editForm.email = userData.email || ''
      editForm.gender = userData.gender || ''
      editForm.motto = userData.motto || ''
      editForm.avatarUrl = userData.avatar_url || ''
      editForm.studentId = userData.student_id || ''
      editForm.className = userData.class_name || ''
      editForm.realName = userData.real_name || ''
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    if (err.status === 401) {
      authStore.logout()
      router.push('/login')
    } else {
      errorMessage.value = err.message || '获取用户信息失败'
    }
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  if (!user.value) return
  
  // 初始化编辑表单
  editForm.username = user.value.username || ''
  editForm.email = user.value.email || ''
  editForm.gender = user.value.gender || ''
  editForm.motto = user.value.motto || ''
  editForm.avatarUrl = user.value.avatar_url || ''
  editForm.studentId = user.value.student_id || ''
  editForm.className = user.value.class_name || ''
  editForm.realName = user.value.real_name || ''
  
  avatarPreview.value = ''
  avatarFile.value = null
  avatarObjectKey.value = ''
  avatarError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  avatarPreview.value = ''
  avatarFile.value = null
  avatarObjectKey.value = ''
  avatarError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  
  // 恢复原始值
  if (user.value) {
    editForm.username = user.value.username || ''
    editForm.email = user.value.email || ''
    editForm.gender = user.value.gender || ''
    editForm.motto = user.value.motto || ''
    editForm.avatarUrl = user.value.avatar_url || ''
    editForm.studentId = user.value.student_id || ''
    editForm.className = user.value.class_name || ''
    editForm.realName = user.value.real_name || ''
  }
}

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    avatarError.value = '请选择图片文件'
    return
  }

  // 验证文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    avatarError.value = '图片大小不能超过 5MB'
    return
  }

  avatarError.value = ''
  avatarFile.value = file

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  // 上传文件到 Minio
  await uploadAvatarToMinio(file)
}

const uploadAvatarToMinio = async (file) => {
  isUploadingAvatar.value = true
  avatarError.value = ''

  try {
    // 生成 object_key，使用用户ID
    const userId = user.value?.id
    if (!userId) {
      throw new Error('无法获取用户ID')
    }
    
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const objectKey = `avatars/${userId}/avatar_${timestamp}.${fileExtension}`

    const response = await uploadFile(file, objectKey)
    
    // 保存 object_key
    if (response.object_key) {
      avatarObjectKey.value = response.object_key
    } else {
      avatarObjectKey.value = objectKey
    }
    
    // 如果后端返回了 URL，使用它
    if (response.url) {
      editForm.avatarUrl = response.url
    } else {
      editForm.avatarUrl = avatarObjectKey.value
    }
  } catch (err) {
    console.error('头像上传失败:', err)
    avatarError.value = err.message || '头像上传失败，请稍后再试'
    avatarPreview.value = ''
    avatarFile.value = null
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } finally {
    isUploadingAvatar.value = false
  }
}

const removeAvatar = () => {
  avatarPreview.value = ''
  avatarFile.value = null
  avatarObjectKey.value = ''
  editForm.avatarUrl = ''
  avatarError.value = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const handleSave = async () => {
  if (!user.value) return

  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    // 准备更新数据
    const updateData = {
      username: editForm.username,
      email: editForm.email,
      gender: editForm.gender,
      motto: editForm.motto,
      avatarUrl: avatarObjectKey.value || editForm.avatarUrl,
      studentId: editForm.studentId,
      className: editForm.className,
      realName: editForm.realName
    }

    const response = await updateProfile(updateData)
    const updatedUser = response?.data || response

    if (updatedUser) {
      // 更新 store 和本地存储
      authStore.user = updatedUser
      userStorage.save(updatedUser)
      
      successMessage.value = '资料更新成功！'
      isEditing.value = false
      
      // 清除临时数据
      avatarPreview.value = ''
      avatarFile.value = null
      avatarObjectKey.value = ''
      
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (err) {
    console.error('更新用户信息失败:', err)
    errorMessage.value = err.message || '更新失败，请稍后再试'
  } finally {
    isSaving.value = false
  }
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  
  // 验证输入
  if (!passwordForm.oldPassword) {
    passwordError.value = '请输入旧密码'
    return
  }
  
  if (!passwordForm.newPassword) {
    passwordError.value = '请输入新密码'
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = '新密码长度至少6位'
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }
  
  isChangingPassword.value = true
  
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    
    passwordSuccess.value = '密码修改成功！'
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    // 3秒后清除成功消息
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
  } catch (err) {
    console.error('修改密码失败:', err)
    passwordError.value = err.message || '修改密码失败，请稍后再试'
  } finally {
    isChangingPassword.value = false
  }
}

onMounted(() => {
  if (!authStore.user && !authStore.token) {
    authStore.initFromStorage()
  }
  loadUserProfile()
})
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 40px 20px;
}

.settings-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-header {
  padding: 32px 40px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.settings-header p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.loading-container,
.error-container {
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
}

.error-container .login-link {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.error-container .login-link:hover {
  background: #1d4ed8;
}

.settings-content {
  padding: 40px;
}

.edit-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.edit-btn,
.save-btn,
.cancel-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-btn {
  background: #2563eb;
  color: #fff;
}

.edit-btn:hover {
  background: #1d4ed8;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.save-btn {
  background: #10b981;
  color: #fff;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #ef4444;
  color: #fff;
}

.cancel-btn:hover {
  background: #dc2626;
}

section {
  margin-bottom: 40px;
}

section:last-child {
  margin-bottom: 0;
}

section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #111827;
  font-weight: 500;
}

.edit-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.edit-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.gender-options {
  display: flex;
  gap: 20px;
  margin-top: 4px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #1f2937;
  user-select: none;
}

.gender-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.gender-option span {
  transition: color 0.2s ease;
}

.gender-option:hover span {
  color: #3b82f6;
}

.avatar-section {
  margin-top: 32px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-avatar-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-avatar-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  background: #f9fafb;
}

.avatar-placeholder svg {
  width: 32px;
  height: 32px;
}

.avatar-placeholder span {
  font-size: 13px;
}

.avatar-upload-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-error {
  font-size: 13px;
  color: #ef4444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.error-message {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 14px;
}

.success-message {
  margin-top: 20px;
  padding: 12px 16px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-size: 14px;
}

.password-section {
  margin-top: 32px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-password-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #2563eb;
  color: #fff;
  align-self: flex-start;
}

.change-password-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.change-password-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-error {
  font-size: 13px;
  color: #ef4444;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
}

.password-success {
  font-size: 13px;
  color: #065f46;
  padding: 8px 12px;
  background: #d1fae5;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .settings-header {
    padding: 24px 20px;
  }

  .settings-content {
    padding: 24px 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .edit-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
