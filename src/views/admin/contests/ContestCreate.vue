<template>
  <div class="contest-create">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p class="page-subtitle">{{ pageSubtitle }}</p>
    </div>

    <div class="form-container">
      <section class="form-section">
        <h2>基础信息</h2>
        <div class="form-grid">
          <div class="form-item full-width">
            <label>比赛名称 *</label>
            <input
              v-model="form.contest_name"
              type="text"
              placeholder="请输入比赛名称"
              ref="contestNameInput"
              :class="{ 'input-error': fieldErrors.contest_name }"
            />
          </div>
          <div class="form-item full-width">
            <label>比赛描述</label>
            <textarea
              v-model="form.description"
              rows="6"
              placeholder="请输入比赛描述"
            ></textarea>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>时间配置</h2>
        <div class="form-grid">
          <div class="form-item">
            <label>比赛开始时间 *</label>
            <input
              v-model="form.start_time"
              type="datetime-local"
              ref="startTimeInput"
              :class="{ 'input-error': fieldErrors.start_time }"
            />
          </div>
          <div class="form-item">
            <label>比赛持续时间（分钟） *</label>
            <input
              v-model.number="form.duration"
              type="number"
              placeholder="例如：180"
              min="1"
              ref="durationInput"
              :class="{ 'input-error': fieldErrors.duration }"
            />
          </div>
          <div class="form-item">
            <label>报名开始时间</label>
            <input
              v-model="form.register_start_time"
              type="datetime-local"
            />
          </div>
          <div class="form-item">
            <label>报名结束时间</label>
            <input
              v-model="form.register_end_time"
              type="datetime-local"
              :class="{ 'input-error': fieldErrors.register_end_time }"
            />
            <small v-if="fieldErrors.register_end_time" class="error-hint">
              报名结束时间不能早于报名开始时间
            </small>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>规则配置</h2>
        <div class="form-grid">
          <div class="form-item">
            <label>赛制 *</label>
            <select
              v-model="form.contest_type"
              ref="contestTypeSelect"
              :class="{ 'input-error': fieldErrors.contest_type }"
            >
              <option value="ACM">ACM</option>
              <option value="IOI">IOI</option>
              <option value="OI">OI</option>
            </select>
          </div>
          <div class="form-item">
            <label>赛种 *</label>
            <select
              v-model="form.contest_mode"
              ref="contestModeSelect"
              :class="{ 'input-error': fieldErrors.contest_mode }"
            >
              <option value="公开赛">公开赛</option>
              <option value="私有赛">私有赛</option>
            </select>
          </div>
          <div class="form-item" v-if="form.contest_mode === '私有赛'">
            <label>比赛密码 *</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入比赛密码"
              ref="passwordInput"
              :class="{ 'input-error': fieldErrors.password }"
            />
          </div>
          <div class="form-item" v-if="form.contest_type === 'ACM'">
            <label>罚时（分钟）</label>
            <input
              v-model.number="form.penalty_time"
              type="number"
              placeholder="例如：20"
              min="1"
            />
          </div>
          <div class="form-item full-width">
            <label>语言限制</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  value="cpp"
                  v-model="form.language_limit"
                />
                <span>C++</span>
              </label>
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  value="java"
                  v-model="form.language_limit"
                />
                <span>Java</span>
              </label>
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  value="python"
                  v-model="form.language_limit"
                />
                <span>Python</span>
              </label>
            </div>
          </div>
          <div class="form-item full-width">
            <label class="switch-label">
              <input
                type="checkbox"
                v-model="form.allow_submit_after_end"
                class="switch-input"
              />
              <span class="switch-text">结束后是否可提交</span>
            </label>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>权限配置</h2>
        <div class="form-grid">
          <div class="form-item full-width">
            <label class="switch-label">
              <input
                type="checkbox"
                v-model="form.visibility"
                class="switch-input"
              />
              <span class="switch-text">比赛是否可见</span>
            </label>
          </div>
          <div class="form-item full-width">
            <label class="switch-label">
              <input
                type="checkbox"
                v-model="form.show_rank"
                class="switch-input"
              />
              <span class="switch-text">是否显示排行榜</span>
            </label>
          </div>
          <div class="form-item full-width">
            <label class="switch-label">
              <input
                type="checkbox"
                v-model="form.show_others_code"
                class="switch-input"
              />
              <span class="switch-text">是否可查看他人代码</span>
            </label>
          </div>
          <div class="form-item full-width">
            <label class="switch-label">
              <input
                type="checkbox"
                v-model="form.show_testcase"
                class="switch-input"
              />
              <span class="switch-text">是否显示测试用例</span>
            </label>
          </div>
        </div>
      </section>

      <div class="form-actions">
        <button class="btn-primary" :disabled="saving" @click="submitForm">
          {{ submitText }}
        </button>
        <button class="btn-secondary" @click="resetForm">
          重置表单
        </button>
      </div>

      <transition name="fade">
        <div v-if="feedbackVisible" class="center-feedback" :class="`center-feedback-${feedbackType}`">
          {{ feedbackMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { createContest, getContestDetail, updateContest } from '@/api/contest'

export default {
  name: 'ContestCreate',
  data() {
    return {
      contestId: null,
      form: {
        contest_name: '',
        description: '',
        start_time: '',
        duration: 180,
        register_start_time: '',
        register_end_time: '',
        contest_type: 'IOI',
        contest_mode: '公开赛',
        password: '',
        penalty_time: 20,
        language_limit: ['cpp'],
        allow_submit_after_end: false,
        visibility: true,
        show_rank: true,
        show_others_code: false,
        show_testcase: true
      },
      fieldErrors: {
        contest_name: false,
        start_time: false,
        duration: false,
        register_end_time: false,
        contest_type: false,
        contest_mode: false,
        password: false
      },
      saving: false,
      feedbackVisible: false,
      feedbackMessage: '',
      feedbackType: 'success',
      detailLoading: false
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id
    },
    pageTitle() {
      return this.isEdit ? '编辑比赛' : '创建比赛'
    },
    pageSubtitle() {
      return this.isEdit ? '修改比赛信息，* 为必填项' : '请完整填写比赛信息，* 为必填项'
    },
    submitText() {
      if (this.saving) {
        return this.isEdit ? '更新中...' : '创建中...'
      }
      return this.isEdit ? '更新比赛' : '创建比赛'
    }
  },
  mounted() {
    this.contestId = this.$route.params.id || null
    if (this.isEdit && this.contestId) {
      this.loadContestDetail(this.contestId)
    }
  },
  methods: {
    focusField(field) {
      const refMap = {
        contest_name: 'contestNameInput',
        start_time: 'startTimeInput',
        duration: 'durationInput',
        register_end_time: 'registerEndTimeInput',
        contest_type: 'contestTypeSelect',
        contest_mode: 'contestModeSelect',
        password: 'passwordInput'
      }
      const refName = refMap[field]
      const el = refName ? this.$refs[refName] : null
      if (el && typeof el.focus === 'function') {
        el.focus()
      }
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    validateForm() {
      // 重置错误状态
      this.fieldErrors = {
        contest_name: false,
        start_time: false,
        duration: false,
        register_end_time: false,
        contest_type: false,
        contest_mode: false,
        password: false
      }

      // 验证比赛名称
      if (!this.form.contest_name.trim()) {
        this.fieldErrors.contest_name = true
        this.$nextTick(() => this.focusField('contest_name'))
        return '比赛名称不能为空'
      }

      // 验证开始时间
      if (!this.form.start_time) {
        this.fieldErrors.start_time = true
        this.$nextTick(() => this.focusField('start_time'))
        return '比赛开始时间不能为空'
      }

      // 验证持续时间
      if (!this.form.duration || this.form.duration <= 0) {
        this.fieldErrors.duration = true
        this.$nextTick(() => this.focusField('duration'))
        return '比赛持续时间必须是大于 0 的整数（分钟）'
      }

      // 验证报名时间
      if (this.form.register_start_time && this.form.register_end_time) {
        const registerStart = new Date(this.form.register_start_time)
        const registerEnd = new Date(this.form.register_end_time)
        if (registerEnd < registerStart) {
          this.fieldErrors.register_end_time = true
          this.$nextTick(() => this.focusField('register_end_time'))
          return '报名结束时间不能早于报名开始时间'
        }
      }

      // 验证私有赛密码
      if (this.form.contest_mode === '私有赛' && !this.form.password.trim()) {
        this.fieldErrors.password = true
        this.$nextTick(() => this.focusField('password'))
        return '私有赛必须设置比赛密码'
      }

      // 验证语言限制
      if (!this.form.language_limit || this.form.language_limit.length === 0) {
        return '至少需要选择一种编程语言'
      }

      return null
    },
    formatDateTimeForAPI(dateTimeLocal) {
      if (!dateTimeLocal) return null
      // 将 datetime-local 格式转换为 ISO 格式
      // datetime-local 格式: YYYY-MM-DDTHH:mm
      // ISO 格式: YYYY-MM-DDTHH:mm:ss
      // 如果已经是完整格式，直接返回；否则添加 :00
      if (dateTimeLocal.length === 16) {
        return dateTimeLocal + ':00'
      }
      return dateTimeLocal
    },
    isoToLocalInput(value) {
      if (!value) return ''
      try {
        const noZone = value.split('Z')[0].split('+')[0]
        const base = noZone.split('.')[0] || noZone
        return base.slice(0, 16)
      } catch (e) {
        return ''
      }
    },
    async loadContestDetail(contestId) {
      this.detailLoading = true
      try {
        const res = await getContestDetail(contestId)
        if (res.code === 'success' && res.data) {
          const data = res.data
          const time = data.time_config || {}
          const rule = data.rule_config || {}
          const perm = data.permission_config || {}
          this.form = {
            contest_name: data.name || '',
            description: data.description || '',
            start_time: this.isoToLocalInput(time.start_time),
            duration: time.duration || 180,
            register_start_time: this.isoToLocalInput(time.register_start_time),
            register_end_time: this.isoToLocalInput(time.register_end_time),
            contest_type: rule.contest_type || 'IOI',
            contest_mode: rule.contest_mode || '公开赛',
            password: rule.contest_mode === '私有赛' ? (rule.password || '') : '',
            penalty_time: rule.contest_type === 'ACM' ? (rule.penalty_time || 20) : 20,
            language_limit: Array.isArray(rule.language_limit)
              ? rule.language_limit
              : rule.language_limit
                ? [rule.language_limit]
                : ['cpp'],
            allow_submit_after_end: !!rule.allow_submit_after_end,
            visibility: perm.visibility !== false,
            show_rank: perm.show_rank !== false,
            show_others_code: !!perm.show_others_code,
            show_testcase: !!perm.show_testcase
          }
        } else {
          this.showFeedback('error', res.message || '获取比赛详情失败')
        }
      } catch (err) {
        console.error('加载比赛详情失败:', err)
        this.showFeedback('error', err.message || '加载比赛详情失败，请稍后重试')
      } finally {
        this.detailLoading = false
      }
    },
    async submitForm() {
      const errorMsg = this.validateForm()
      if (errorMsg) {
        this.showFeedback('error', errorMsg)
        return
      }

      this.saving = true

      try {
        // 计算结束时间
        // datetime-local 返回的是本地时间格式 YYYY-MM-DDTHH:mm
        // 需要转换为 ISO 格式 YYYY-MM-DDTHH:mm:ss
        const startTimeStr = this.formatDateTimeForAPI(this.form.start_time)
        // 创建 Date 对象（本地时间）
        const startTime = new Date(this.form.start_time)
        // 计算结束时间
        const endTime = new Date(startTime.getTime() + this.form.duration * 60 * 1000)
        
        // 格式化为 ISO 格式 (YYYY-MM-DDTHH:mm:ss)
        const formatToISO = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
        }
        
        const payload = {
          contest_name: this.form.contest_name.trim(),
          description: this.form.description.trim(),
          start_time: startTimeStr,
          end_time: formatToISO(endTime),
          duration: this.form.duration,
          register_start_time: this.form.register_start_time ? this.formatDateTimeForAPI(this.form.register_start_time) : null,
          register_end_time: this.form.register_end_time ? this.formatDateTimeForAPI(this.form.register_end_time) : null,
          contest_type: this.form.contest_type,
          contest_mode: this.form.contest_mode,
          password: this.form.contest_mode === '私有赛' ? this.form.password.trim() : null,
          penalty_time: this.form.contest_type === 'ACM' ? this.form.penalty_time : null,
          language_limit: this.form.language_limit,
          allow_submit_after_end: this.form.allow_submit_after_end,
          visibility: this.form.visibility,
          show_rank: this.form.show_rank,
          show_others_code: this.form.show_others_code,
          show_testcase: this.form.show_testcase
        }

        let response
        if (this.isEdit && this.contestId) {
          response = await updateContest(this.contestId, payload)
        } else {
          response = await createContest(payload)
        }

        if (response.code === 'success') {
          this.showFeedback('success', this.isEdit ? '更新比赛成功' : '创建比赛成功')
          setTimeout(() => {
            if (this.isEdit) {
              this.$router.push('/admin/contests/manage')
            } else {
              this.resetForm()
            }
          }, 1200)
        } else {
          this.showFeedback('error', response.message || (this.isEdit ? '更新比赛失败' : '创建比赛失败'))
        }
      } catch (error) {
        console.error(this.isEdit ? '更新比赛失败:' : '创建比赛失败:', error)
        this.showFeedback('error', error.message || (this.isEdit ? '更新比赛失败，请稍后重试' : '创建比赛失败，请稍后重试'))
      } finally {
        this.saving = false
      }
    },
    showFeedback(type, message) {
      this.feedbackType = type
      this.feedbackMessage = message
      this.feedbackVisible = true
      setTimeout(() => {
        this.feedbackVisible = false
      }, 2000)
    },
    resetForm() {
      this.form = {
        contest_name: '',
        description: '',
        start_time: '',
        duration: 180,
        register_start_time: '',
        register_end_time: '',
        contest_type: 'IOI',
        contest_mode: '公开赛',
        password: '',
        penalty_time: 20,
        language_limit: ['cpp'],
        allow_submit_after_end: false,
        visibility: true,
        show_rank: true,
        show_others_code: false,
        show_testcase: true
      }
      this.fieldErrors = {
        contest_name: false,
        start_time: false,
        duration: false,
        register_end_time: false,
        contest_type: false,
        contest_mode: false,
        password: false
      }
    }
  }
}
</script>

<style scoped>
.contest-create {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
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

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.form-section h2 {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #333333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-item label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

input,
select,
textarea {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-error {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.error-hint {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  accent-color: #1890ff;
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

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.center-feedback {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  padding: 12px 18px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 2000;
}

.center-feedback-success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.center-feedback-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
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
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

