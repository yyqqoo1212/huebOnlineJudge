<template>
  <div class="discussion-detail" v-if="discussion">
    <div class="detail-container">
      <div class="detail-header">
        <div class="header-top">
          <button class="back-btn" @click="goBack">返回讨论列表</button>
          <div v-if="isAuthor" class="action-buttons">
            <button
              class="edit-btn"
              @click="goToEdit"
            >
              修改
            </button>
            <button
              class="delete-btn"
              @click="openDeleteModal"
            >
              删除
            </button>
          </div>
        </div>
        <h1 class="title">{{ discussion.title }}</h1>
        <div class="meta">
          <span class="type" :class="`type-${discussion.type}`">
            {{ getTypeText(discussion.type) }}
          </span>
          <span class="author">发布者：{{ discussion.author }}</span>
          <span class="time">发布时间：{{ formatDateTime(discussion.publishTime) }}</span>
          <span class="views">浏览量：{{ discussion.views || 0 }}</span>
        </div>
      </div>

      <Viewer
        class="detail-content"
        :value="discussion.content"
        :plugins="plugins"
        :locale="zhHans"
      />
    </div>
  </div>
  <div v-else class="discussion-detail loading-state">
    正在加载讨论详情...
  </div>

  <!-- 删除确认弹窗 -->
  <ConfirmDialog
    :visible="showDeleteModal"
    title="确认删除讨论？"
    message="删除后将移除该讨论的所有信息及相关数据，且无法恢复。"
    :detail="discussion ? `将删除：${discussion.id} - ${discussion.title}` : ''"
    confirm-text="确认删除"
    cancel-text="再想想"
    :loading="deleteLoading"
    loading-text="正在删除..."
    @confirm="confirmDelete"
    @cancel="closeDeleteModal"
    @update:visible="showDeleteModal = $event"
  />

</template>

<script>
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import math from '@bytemd/plugin-math'
import breaks from '@bytemd/plugin-breaks'
import highlight from '@bytemd/plugin-highlight'
import zhHans from 'bytemd/lib/locales/zh_Hans'
import { useAuth } from '@/composbles/useAuth'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import 'bytemd/dist/index.css'
import 'katex/dist/katex.css'
// 导入 highlight.js 主题样式（github 主题：浅色背景，适合白色代码块）
import 'highlight.js/styles/github.css'

export default {
  name: 'DiscussionDetail',
  components: {
    Viewer,
    ConfirmDialog
  },
  data() {
    return {
      discussion: null,
      loading: false,
      currentUserId: null,
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
      showDeleteModal: false,
      deleteLoading: false
    }
  },
  computed: {
    isAuthor() {
      if (!this.discussion || !this.currentUserId) return false
      // 确保类型一致（都转为数字或字符串）
      const authorId = Number(this.discussion.author_id)
      const userId = Number(this.currentUserId)
      return authorId === userId
    }
  },
  async created() {
    // 初始化用户ID
    const auth = useAuth()
    this.currentUserId = auth.userId?.value || auth.userId || null
    
    const id = this.$route.params.id
    if (!id) return
    this.loading = true
    try {
      const { getDiscussionDetail } = await import('@/api/discussion')
      const response = await getDiscussionDetail(id)
      if (response.code === 'success' && response.data) {
        this.discussion = response.data
        // 确保用户ID是最新的（可能在加载过程中用户状态变化了）
        const authUpdate = useAuth()
        this.currentUserId = authUpdate.userId?.value || authUpdate.userId || null
      } else {
        this.$message?.error(response.message || '获取讨论详情失败')
      }
    } catch (error) {
      console.error('获取讨论详情失败:', error)
      this.$message?.error(error.message || '获取讨论详情失败，请稍后重试')
    } finally {
      this.loading = false
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'DiscussionList' })
    },
    goToEdit() {
      if (!this.discussion) return
      this.$router.push({
        name: 'DiscussionCreate',
        query: { edit: this.discussion.id }
      })
    },
    openDeleteModal() {
      if (!this.discussion || this.deleteLoading) return
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deleteLoading) return
      this.showDeleteModal = false
    },
    async confirmDelete() {
      if (!this.discussion || this.deleteLoading) return
      
      this.deleteLoading = true
      try {
        const { deleteDiscussion } = await import('@/api/discussion')
        const response = await deleteDiscussion(this.discussion.id)
        if (response.code === 'success') {
          // 关闭删除确认弹窗
          this.showDeleteModal = false
          // 显示成功消息
          this.$message?.success(response.message || '删除成功')
          // 跳转到讨论列表
          this.$router.push({ name: 'DiscussionList' })
        } else {
          this.$message?.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除讨论失败:', error)
        this.$message?.error(error.message || '删除讨论失败，请稍后重试')
      } finally {
        this.deleteLoading = false
      }
    },
    getTypeText(type) {
      const map = {
        solution: '题解',
        chat: '闲聊',
        help: '求解',
        share: '分享'
      }
      return map[type] || type
    },
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return dateString
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.discussion-detail {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.detail-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #1890ff;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.delete-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #ff4d4f;
  background-color: #ffffff;
  color: #ff4d4f;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  color: #ffffff;
}

.back-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  color: #333333;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.title {
  font-size: 26px;
  margin: 0 0 10px;
  color: #333333;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #888888;
  align-items: center;
}

.type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-solution {
  background-color: #e6f7ff;
  color: #1890ff;
}

.type-chat {
  background-color: #fff7e6;
  color: #fa8c16;
}

.type-help {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.type-share {
  background-color: #f6ffed;
  color: #52c41a;
}

.detail-content {
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.75;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.detail-content :deep(h1),
.detail-content :deep(h2),
.detail-content :deep(h3),
.detail-content :deep(h4),
.detail-content :deep(h5) {
  margin: 1.2em 0 0.6em;
}

.detail-content :deep(p) {
  margin: 0.5em 0;
}

/* 代码块容器样式 */
.detail-content :deep(pre) {
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
  position: relative;
  margin: 16px 0;
}

/* 行内代码样式 */
.detail-content :deep(code) {
  background-color: rgba(15, 23, 42, 0.04);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Courier New",
    monospace;
  color: #e83e8c;
}

/* 代码块内部的 code 继承父级背景，仅用于字体和布局 */
.detail-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* highlight.js 语法高亮样式优化 */
.detail-content :deep(pre code.hljs) {
  display: block;
  overflow-x: auto;
  padding: 0;
  background: transparent;
}

/* 确保 highlight.js 的高亮颜色在白色背景下清晰可见 */
.detail-content :deep(.hljs-keyword),
.detail-content :deep(.hljs-selector-tag),
.detail-content :deep(.hljs-literal),
.detail-content :deep(.hljs-title),
.detail-content :deep(.hljs-section),
.detail-content :deep(.hljs-doctag),
.detail-content :deep(.hljs-type),
.detail-content :deep(.hljs-name),
.detail-content :deep(.hljs-strong) {
  font-weight: 600;
}

/* 代码块行号样式（如果插件支持行号） */
.detail-content :deep(pre code .line-numbers) {
  display: inline-block;
  padding-right: 12px;
  margin-right: 12px;
  border-right: 1px solid #e5e7eb;
  color: #6b7280;
  user-select: none;
  text-align: right;
  min-width: 3em;
}

.detail-content :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.detail-content :deep(a:hover) {
  text-decoration: underline;
}

.detail-content :deep(ul),
.detail-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.detail-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.detail-content :deep(th),
.detail-content :deep(td) {
  border: 1px solid #d9d9d9;
  padding: 6px 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666666;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 20px 16px;
  }

  .title {
    font-size: 22px;
  }
}
</style>


