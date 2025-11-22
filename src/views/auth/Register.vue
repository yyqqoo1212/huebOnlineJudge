<template>
  <div class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <h2>创建账号</h2>
        <p>填写以下信息即可加入 hueb Online Judge</p>
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- 必填字段区域 -->
        <div class="form-row">
          <div class="form-group" :class="{ error: errors.username }">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model.trim="form.username"
              type="text"
              placeholder="3-50 个字符，支持字母/数字/下划线"
              maxlength="50"
              @blur="validateField('username')"
            />
            <small v-if="errors.username">{{ errors.username }}</small>
          </div>

          <div class="form-group" :class="{ error: errors.email }">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              placeholder="example@hust.edu.cn"
              @blur="validateField('email')"
            />
            <small v-if="errors.email">{{ errors.email }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" :class="{ error: errors.password }">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="至少 6 位，建议包含大小写与数字"
              minlength="6"
              @blur="validateField('password')"
            />
            <small v-if="errors.password">{{ errors.password }}</small>
          </div>

          <div class="form-group">
            <label for="gender">性别</label>
            <div class="gender-options">
              <label class="gender-option">
                <input
                  id="gender-male"
                  v-model="form.gender"
                  type="radio"
                  value="M"
                />
                <span>男</span>
              </label>
              <label class="gender-option">
                <input
                  id="gender-female"
                  v-model="form.gender"
                  type="radio"
                  value="F"
                />
                <span>女</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 可选字段区域 - 两列布局 -->
        <div class="form-row">
          <div class="form-group optional">
            <label for="studentId">学号（可选）</label>
            <input
              id="studentId"
              v-model.trim="form.studentId"
              type="text"
              placeholder="请输入学号"
              maxlength="50"
            />
          </div>

          <div class="form-group optional">
            <label for="className">班级（可选）</label>
            <input
              id="className"
              v-model.trim="form.className"
              type="text"
              placeholder="请输入班级"
              maxlength="100"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group optional">
            <label for="realName">真实姓名（可选）</label>
            <input
              id="realName"
              v-model.trim="form.realName"
              type="text"
              placeholder="请输入真实姓名"
              maxlength="50"
            />
          </div>

          <div class="form-group optional">
            <label for="motto">个性签名（可选）</label>
            <input
              id="motto"
              v-model.trim="form.motto"
              type="text"
              placeholder="写一句话介绍你自己"
              maxlength="80"
            />
          </div>
        </div>

        <!-- 头像上传 - 单独一行 -->
        <div class="form-group optional avatar-group">
          <label for="avatar">头像（可选）</label>
          <div class="avatar-upload-container">
            <div v-if="avatarPreview" class="avatar-preview">
              <img :src="avatarPreview" alt="头像预览" />
              <button
                type="button"
                class="remove-avatar-btn"
                @click="removeAvatar"
                title="移除头像"
              >
                ×
              </button>
            </div>
            <div v-else class="avatar-upload-placeholder">
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
              <span>点击上传头像</span>
            </div>
            <input
              id="avatar"
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
              {{ isUploadingAvatar ? '上传中...' : avatarPreview ? '更换头像' : '选择头像' }}
            </button>
            <small v-if="avatarError" class="avatar-error">{{ avatarError }}</small>
          </div>
        </div>

        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>

        <button class="submit-btn" type="submit" :disabled="!canSubmit">
          {{ isSubmitting ? '注册中...' : '立即注册' }}
        </button>

        <p class="switch-link">
          已有账号？
          <router-link to="/login">去登录</router-link>
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateRegisterForm, validateUsername, validatePassword, validateEmail } from '@/utils/validator'
import { uploadTempFile } from '@/api/files'

const router = useRouter()
const authStore = useAuthStore()

if (!authStore.user && !authStore.token) {
  authStore.initFromStorage()
}

const form = reactive({
  username: '',
  email: '',
  password: '',
  gender: 'M',
  motto: '',
  avatarUrl: '',
  studentId: '',
  className: '',
  realName: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  general: ''
})

const avatarInput = ref(null)
const avatarPreview = ref('')
const avatarFile = ref(null)
const avatarObjectKey = ref('')
const isUploadingAvatar = ref(false)
const avatarError = ref('')

watch(
  () => [form.username, form.email, form.password],
  () => {
    errors.general = ''
  }
)

const isSubmitting = computed(() => authStore.loading)
const canSubmit = computed(() => {
  return (
    form.username &&
    form.email &&
    form.password &&
    !isSubmitting.value &&
    !errors.username &&
    !errors.email &&
    !errors.password
  )
})

const validators = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword
}

const validateField = (field) => {
  if (!validators[field]) return
  errors[field] = validators[field](form[field])
  if (errors[field]) {
    errors.general = errors[field]
  } else if (errors.general === errors[field]) {
    errors.general = ''
  }
}

// 生成 UUID（简单版本）
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 处理头像文件选择
const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    avatarError.value = '请选择图片文件'
    return
  }

  // 验证文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024 // 5MB
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

  // 上传文件到 Minio 临时目录
  await uploadAvatar(file)
}

// 上传头像到 Minio 临时目录
const uploadAvatar = async (file) => {
  isUploadingAvatar.value = true
  avatarError.value = ''

  try {
    // 生成临时 object_key，使用 UUID 作为临时标识
    // 注册成功后，后端会将文件从临时目录移动到 avatars/{user_id}/{filename}
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const uuid = generateUUID()
    const objectKey = `avatars/temp/${uuid}/avatar.${fileExtension}`

    const response = await uploadTempFile(file, objectKey)
    
    // 保存 object_key，注册时传递给后端
    // 优先使用后端返回的 object_key，否则使用我们生成的
    if (response.object_key) {
      avatarObjectKey.value = response.object_key
    } else {
      avatarObjectKey.value = objectKey
    }
    
    // 如果后端返回了 URL，保存用于预览；注册时使用 object_key
    if (response.url) {
      form.avatarUrl = response.url
    } else {
      // 如果没有返回 URL，使用 object_key
      form.avatarUrl = avatarObjectKey.value
    }
  } catch (err) {
    // 显示详细的错误信息
    console.error('头像上传失败:', err)
    const errorMessage = err.message || err.details?.message || '头像上传失败，请稍后再试'
    avatarError.value = errorMessage
    avatarPreview.value = ''
    avatarFile.value = null
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } finally {
    isUploadingAvatar.value = false
  }
}

// 移除头像
const removeAvatar = () => {
  avatarPreview.value = ''
  avatarFile.value = null
  avatarObjectKey.value = ''
  form.avatarUrl = ''
  avatarError.value = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const handleSubmit = async () => {
  const { isValid, errors: fieldErrors, message } = validateRegisterForm(form)
  errors.username = fieldErrors.username
  errors.email = fieldErrors.email
  errors.password = fieldErrors.password
  errors.general = message

  if (!isValid) {
    return
  }

  try {
    // 如果有上传的头像，使用 object_key（后端会将文件从临时目录移动到用户目录）
    // 如果没有上传头像，form.avatarUrl 会是空字符串
    const finalAvatarUrl = avatarObjectKey.value || form.avatarUrl

    await authStore.handleRegister({
      ...form,
      avatarUrl: finalAvatarUrl
    })
    router.push('/')
  } catch (err) {
    errors.general = err.message || '注册失败，请稍后再试'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-header h2 {
  font-size: 26px;
  margin-bottom: 8px;
  color: #111827;
}

.auth-header p {
  color: #6b7280;
  font-size: 14px;
}

.auth-form {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.form-group input {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group.error input {
  border-color: #ef4444;
}

.form-group small {
  font-size: 13px;
  color: #ef4444;
}

.form-group.optional label::after {
  content: '（可选）';
  font-weight: 400;
  color: #9ca3af;
  margin-left: 4px;
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

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
}

.avatar-preview img {
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

.avatar-upload-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  background: #f9fafb;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.avatar-upload-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.avatar-upload-placeholder svg {
  width: 32px;
  height: 32px;
}

.avatar-upload-placeholder span {
  font-size: 13px;
}

.upload-btn {
  width: fit-content;
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

.form-error {
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.submit-btn {
  margin-top: 10px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.switch-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.avatar-group {
  grid-column: 1 / -1; /* 头像上传占据整行 */
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; /* 小屏幕下改为单列 */
  }
  
  .auth-card {
    max-width: 100%;
    padding: 28px 22px;
  }
}
</style>