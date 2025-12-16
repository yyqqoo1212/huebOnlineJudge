<template>
  <div class="discussion-create">
    <div class="create-container">
      <div class="header">
        <h1>{{ isEditMode ? '编辑讨论' : '发布讨论' }}</h1>
      </div>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="form-item">
          <label class="label">标题</label>
          <input
            v-model="form.title"
            class="input"
            type="text"
            placeholder="请输入讨论标题"
            maxlength="200"
            required
          />
        </div>

        <div class="form-item">
          <label class="label">分类</label>
          <select v-model="form.type" class="select" required>
            <option value="solution">题解</option>
            <option value="chat">闲聊</option>
            <option value="help">求解</option>
            <option value="share">分享</option>
          </select>
        </div>

        <div class="form-item">
          <label class="label">内容（Markdown）</label>
          <div class="editor-shell">
            <Editor
              :value="form.content"
              :plugins="plugins"
              :locale="zhHans"
              :editor-config="editorConfig"
              mode="split"
              @change="handleContentChange"
            />
            <div v-if="!form.content" class="editor-shell__placeholder">
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn secondary" @click="goBack">
            取消
          </button>
          <button type="submit" class="btn primary" :disabled="submitting">
            {{ submitting ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新' : '保存') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import math from '@bytemd/plugin-math'
import breaks from '@bytemd/plugin-breaks'
import highlight from '@bytemd/plugin-highlight'
import zhHans from 'bytemd/lib/locales/zh_Hans'
import { lineNumbers } from '@codemirror/view'
import 'bytemd/dist/index.css'
import 'katex/dist/katex.css'
// 导入 highlight.js 主题样式（github 主题：浅色背景，适合白色代码块）
import 'highlight.js/styles/github.css'

export default {
  name: 'DiscussionCreate',
  components: {
    Editor
  },
  constants: {
  },
  data() {
    return {
      form: {
        title: '',
        type: 'chat',
        content: ''
      },
      submitting: false,
      loading: false,
      // 插件配置说明：
      // - gfm: GitHub Flavored Markdown（表格、任务列表等）
      // - math: LaTeX 数学公式支持
      // - breaks: 单换行转 <br>
      // - highlight: 代码语法高亮（使用 highlight.js）
      // 
      // 性能说明：
      // 1. ByteMD 插件是按需加载的，只在渲染时处理
      // 2. highlight.js 支持按需加载语言包，默认只加载常用语言
      // 3. 代码高亮在渲染时进行，不影响编辑性能
      // 4. 如果内容很长（>1000行），可以考虑虚拟滚动优化
      plugins: [
        gfm(),
        math(),
        breaks({
          softbreak: '<br />'
        }),
        highlight({
          // 可选：只加载常用语言以减小体积
          // init(hljs) {
          //   hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
          //   hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
          //   hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
          //   hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'))
          // }
        })
      ],
      zhHans,
      editorConfig: {
        extensions: [lineNumbers()]
      },
      draftKey: 'discussion_draft',
      draftTTL: 24 * 60 * 60 * 1000, // 24h
      discussionId: null,
      isEditMode: false
    }
  },
  async created() {
    // 检查是否是编辑模式
    const editId = this.$route.query.edit
    if (editId) {
      this.isEditMode = true
      this.discussionId = parseInt(editId)
      await this.loadDiscussion()
    } else {
      this.restoreDraft()
    }
  },
  watch: {
    'form.title'() {
      this.saveDraft()
    },
    'form.type'() {
      this.saveDraft()
    }
  },
  methods: {
    handleContentChange(value) {
      this.form.content = value
      this.saveDraft()
    },
    goBack() {
      this.$router.push({ name: 'DiscussionList' })
    },
    saveDraft() {
      // 编辑模式下不保存草稿
      if (this.isEditMode) return
      try {
        const payload = {
          title: this.form.title || '',
          type: this.form.type || 'chat',
          content: this.form.content || '',
          savedAt: Date.now()
        }
        localStorage.setItem(this.draftKey, JSON.stringify(payload))
        console.log('保存草稿:', payload)
      } catch (e) {
        console.warn('保存草稿失败', e)
      }
    },
    restoreDraft() {
      try {
        const raw = localStorage.getItem(this.draftKey)
        if (!raw) {
          console.log('没有找到草稿')
          return
        }
        const draft = JSON.parse(raw)
        if (!draft.savedAt || Date.now() - draft.savedAt > this.draftTTL) {
          console.log('草稿已过期，清除缓存')
          localStorage.removeItem(this.draftKey)
          return
        }
        console.log('恢复草稿:', draft)
        this.form.title = draft.title || ''
        this.form.type = draft.type || 'chat'
        this.form.content = draft.content || ''
      } catch (e) {
        console.warn('恢复草稿失败', e)
        localStorage.removeItem(this.draftKey)
      }
    },
    clearDraft() {
      localStorage.removeItem(this.draftKey)
    },
    async loadDiscussion() {
      if (!this.discussionId) return
      this.loading = true
      try {
        const { getDiscussionDetail } = await import('@/api/discussion')
        const response = await getDiscussionDetail(this.discussionId)
        if (response.code === 'success' && response.data) {
          this.form.title = response.data.title || ''
          this.form.type = response.data.type || 'chat'
          this.form.content = response.data.content || ''
        } else {
          this.$message?.error(response.message || '获取讨论详情失败')
          this.$router.push({ name: 'DiscussionList' })
        }
      } catch (error) {
        console.error('获取讨论详情失败:', error)
        this.$message?.error(error.message || '获取讨论详情失败，请稍后重试')
        this.$router.push({ name: 'DiscussionList' })
      } finally {
        this.loading = false
      }
    },
    async handleSubmit() {
      if (!this.form.title.trim()) {
        this.$message?.error('请输入标题')
        return
      }
      if (!this.form.content.trim()) {
        this.$message?.error('请输入内容')
        return
      }

      this.submitting = true
      try {
        const payload = {
          title: this.form.title.trim(),
          type: this.form.type,
          content: this.form.content
        }
        
        let response
        if (this.isEditMode) {
          // 编辑模式：更新讨论
          const { updateDiscussion } = await import('@/api/discussion')
          response = await updateDiscussion(this.discussionId, payload)
          if (response.code === 'success') {
            this.$message?.success(response.message || '更新成功')
            this.$router.push({
              name: 'DiscussionDetail',
              params: { id: this.discussionId }
            })
          } else {
            this.$message?.error(response.message || '更新失败')
          }
        } else {
          // 新建模式：创建讨论
          const { createDiscussion } = await import('@/api/discussion')
          response = await createDiscussion(payload)
          if (response.code === 'success') {
            this.$message?.success(response.message || '发布成功')
            this.clearDraft()
            this.$router.push({ name: 'DiscussionList' })
          } else {
            this.$message?.error(response.message || '发布失败')
          }
        }
      } catch (error) {
        console.error(this.isEditMode ? '更新讨论失败:' : '创建讨论失败:', error)
        this.$message?.error(error.message || (this.isEditMode ? '更新讨论失败，请稍后重试' : '创建讨论失败，请稍后重试'))
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.discussion-create {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 32px 20px;
}

.create-container {
  max-width: 1440px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 24px 28px 30px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.header {
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 26px;
  color: #333333;
}

.form {
  margin-top: 12px;
}

.form-item {
  margin-bottom: 22px;
}

.editor-hint {
  margin: 0 0 6px;
  font-size: 12px;
  color: #999999;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444444;
  font-weight: 500;
}

.input,
.select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus,
.select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
}

.editor-shell {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  position: relative;
  background-color: #ffffff;
}

.editor-shell :deep(.bytemd) {
  height: 640px;
}

.editor-shell :deep(.bytemd-editor),
.editor-shell :deep(.bytemd-preview) {
  font-size: 14px;
}

.editor-shell :deep(.bytemd-editor) {
  background-color: #ffffff;
  color: #333333;
  background-image: none !important;
  text-decoration: none !important;
}

.editor-shell :deep(.bytemd-placeholder),
.editor-shell :deep(.bytemd-placeholder::before),
.editor-shell :deep(.bytemd-placeholder::after) {
  display: none !important;
  content: none !important;
}

.editor-shell__placeholder {
  position: absolute;
  top: 50px;
  left: 16px;
  font-size: 13px;
  color: #999999;
  pointer-events: none;
}

.editor-shell :deep(.bytemd-editor .CodeMirror),
.editor-shell :deep(.cm-editor) {
  height: 100%;
}

.editor-shell :deep(.bytemd-preview) {
  padding: 16px 18px;
}

/* 预览区域的代码块样式（与详情页保持一致） */
.editor-shell :deep(.bytemd-preview pre) {
  background-color: #ffffff;
  color: #24292e;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Courier New",
    monospace;
  margin: 16px 0;
}

.editor-shell :deep(.bytemd-preview code) {
  background-color: rgba(15, 23, 42, 0.04);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Courier New",
    monospace;
  color: #e83e8c;
}

.editor-shell :deep(.bytemd-preview pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* highlight.js 语法高亮样式优化 */
.editor-shell :deep(.bytemd-preview pre code.hljs) {
  display: block;
  overflow-x: auto;
  padding: 0;
  background: transparent;
}

.editor-shell :deep(.bytemd-preview .hljs-keyword),
.editor-shell :deep(.bytemd-preview .hljs-selector-tag),
.editor-shell :deep(.bytemd-preview .hljs-literal),
.editor-shell :deep(.bytemd-preview .hljs-title),
.editor-shell :deep(.bytemd-preview .hljs-section),
.editor-shell :deep(.bytemd-preview .hljs-doctag),
.editor-shell :deep(.bytemd-preview .hljs-type),
.editor-shell :deep(.bytemd-preview .hljs-name),
.editor-shell :deep(.bytemd-preview .hljs-strong) {
  font-weight: 600;
}

.editor-shell :deep(.bytemd-preview table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.editor-shell :deep(.bytemd-preview th),
.editor-shell :deep(.bytemd-preview td) {
  border: 1px solid #d9d9d9;
  padding: 6px 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 14px;
}

.btn {
  min-width: 100px;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.btn.primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn.secondary {
  background-color: #ffffff;
  border-color: #d9d9d9;
  color: #333333;
}

.btn.secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-container {
    padding: 18px 14px 20px;
  }
}
</style>


