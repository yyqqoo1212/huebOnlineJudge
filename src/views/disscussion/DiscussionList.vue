<template>
  <div class="discussion-list">
    <div class="discussion-list-container">
      <div class="page-header">
        <button class="create-btn" @click="goToCreate">
          发布讨论
        </button>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">类型筛选：</span>
          <button 
            v-for="type in typeOptions" 
            :key="type.value"
            :class="['filter-btn', { active: selectedType === type.value }]"
            @click="toggleType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else class="discussion-table">
        <div class="table-header">
          <div class="col-title">标题</div>
          <div class="col-type">类型</div>
          <div class="col-author">发布者</div>
          <div class="col-comments">评论数</div>
          <div class="col-likes">点赞数</div>
          <div class="col-views">浏览量</div>
          <div class="col-time">发布时间</div>
        </div>

        <div v-if="filteredDiscussions.length > 0">
          <div 
            v-for="discussion in filteredDiscussions" 
            :key="discussion.id"
            class="table-row"
            @click="viewDiscussion(discussion.id)"
          >
            <div class="col-title">
              <span v-if="discussion.is_pinned" class="pinned-badge" title="置顶">📌</span>
              <span class="title-text">{{ discussion.title }}</span>
            </div>
            <div class="col-type">
              <span 
                :class="['type-badge', `type-${discussion.type}`, { clickable: true }]"
                @click.stop="toggleType(discussion.type)"
              >
                {{ getTypeText(discussion.type) }}
              </span>
            </div>
            <div class="col-author">{{ discussion.author }}</div>
            <div class="col-comments">
              <span class="icon">💬</span>
              <span class="count">{{ discussion.comments }}</span>
            </div>
            <div class="col-likes">
              <span class="icon">👍</span>
              <span class="count">{{ discussion.likes }}</span>
            </div>
            <div class="col-views">
              <span class="icon">👁</span>
              <span class="count">{{ discussion.views || 0 }}</span>
            </div>
            <div class="col-time">{{ formatDateTime(discussion.publishTime) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无符合条件的讨论</p>
          <p class="empty-hint">请尝试调整筛选条件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscussionList',
  data() {
    return {
      loading: false,
      selectedType: null,
      typeOptions: [
        { value: 'solution', label: '题解' },
        { value: 'chat', label: '闲聊' },
        { value: 'help', label: '求解' },
        { value: 'share', label: '分享' }
      ],
      discussions: []
    }
  },
  computed: {
    filteredDiscussions() {
      if (this.selectedType) {
        return this.discussions.filter(discussion => discussion.type === this.selectedType)
      }
      return this.discussions
    }
  },
  created() {
    console.log('DiscussionList created')
    this.fetchDiscussions()
  },
  mounted() {
    console.log('DiscussionList mounted')
  },
  beforeRouteEnter(to, from, next) {
    console.log('DiscussionList beforeRouteEnter', { to: to.name, from: from.name })
    next()
  },
  beforeRouteUpdate(to, from, next) {
    console.log('DiscussionList beforeRouteUpdate', { to: to.name, from: from.name })
    // 当路由更新时（比如从详情页返回），重新加载数据
    this.fetchDiscussions()
    next()
  },
  activated() {
    console.log('DiscussionList activated')
    // 如果使用了 keep-alive，组件激活时重新加载数据
    this.fetchDiscussions()
  },
  watch: {
    '$route': {
      handler(to, from) {
        console.log('DiscussionList route watch', { to: to.name, from: from?.name })
        // 监听路由变化，确保从其他页面返回时重新加载数据
        if (to.name === 'DiscussionList') {
          // 无论从哪里来，只要进入 DiscussionList 就重新加载数据
          this.fetchDiscussions()
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchDiscussions() {
      this.loading = true
      try {
        const { getDiscussionList } = await import('@/api/discussion')
        const response = await getDiscussionList()

        if (response.code === 'success' && response.data) {
          this.discussions = response.data.discussions || []
        } else {
          this.discussions = []
          this.$message?.error(response.message || '获取讨论列表失败')
        }
      } catch (error) {
        console.error('获取讨论列表失败:', error)
        this.discussions = []
        this.$message?.error(error.message || '获取讨论列表失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    toggleType(type) {
      // 如果点击的是已选中的类型，则取消筛选
      if (this.selectedType === type) {
        this.selectedType = null
      } else {
        this.selectedType = type
      }
    },
    viewDiscussion(id) {
      this.$router.push({ name: 'DiscussionDetail', params: { id } })
    },
    goToCreate() {
      // 使用 path 跳转，避免命名路由可能未更新导致的匹配问题
      this.$router.push('/discussions/new')
    },
    getTypeText(type) {
      const map = {
        'solution': '题解',
        'chat': '闲聊',
        'help': '求解',
        'share': '分享'
      }
      return map[type] || type
    },
    formatDateTime(dateString) {
      const date = new Date(dateString)
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
.discussion-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.discussion-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h1 {
  font-size: 32px;
  color: #333333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666666;
}

.create-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.4);
  transition: all 0.2s ease;
}

.create-btn:hover {
  background-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5);
  transform: translateY(-1px);
}

.create-btn:active {
  background-color: #096dd9;
  box-shadow: 0 2px 6px rgba(9, 109, 217, 0.5);
  transform: translateY(0);
}

.filter-bar {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.filter-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.filter-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.filter-btn.active:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.discussion-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 100px 100px 180px;
  gap: 20px;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 100px 100px 180px;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.col-title {
  display: flex;
  align-items: center;
}

.pinned-badge {
  display: inline-block;
  margin-right: 6px;
  font-size: 14px;
  vertical-align: middle;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.title-text {
  color: #333333;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.col-type {
  display: flex;
  align-items: center;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-badge.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-badge.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
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

.col-author {
  display: flex;
  align-items: center;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.col-comments,
.col-likes,
.col-views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666666;
  font-size: 14px;
}

.icon {
  font-size: 16px;
}

.count {
  font-weight: 500;
}

.col-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #666666;
  font-size: 16px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999999;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 90px 110px 90px 90px 160px;
    gap: 15px;
    padding: 16px 20px;
  }
}

@media (max-width: 768px) {
  .discussion-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1000px;
  }
}
</style>
