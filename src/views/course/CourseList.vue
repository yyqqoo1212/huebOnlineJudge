<template>
  <div class="course-list">
    <div class="course-list-container">

      <div class="filter-bar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索课程号..." 
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <div class="course-grid">
        <div 
          v-for="course in filteredAndSortedCourses" 
          :key="course.id"
          class="course-card"
        >
          <div class="course-image">
            <img 
              :src="getCourseImageUrl(course.imageFileName)"
              :alt="course.name" 
            />
          </div>
          <div class="course-info">
            <div class="course-header">
              <span class="course-id">课程号: {{ course.id }}</span>
              <span :class="['course-status', `status-${course.status}`]">
                {{ getStatusText(course.status) }}
              </span>
            </div>
            <h3 class="course-name">{{ course.name }}</h3>
            <div class="course-meta">
              <div class="meta-item">
                <span class="meta-label">教师：</span>
                <span class="meta-value">{{ course.teacher }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建时间：</span>
                <span class="meta-value">{{ formatDate(course.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredAndSortedCourses.length === 0" class="empty-state">
        <p class="empty-text">暂无符合条件的课程</p>
        <p class="empty-hint">请尝试调整搜索条件</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseList',
  data() {
    return {
      searchQuery: '',
      // 读取环境变量
      minioBaseUrl: process.env.VUE_APP_MINIO_HOST,
      bucketName: process.env.VUE_APP_MINIO_BUCKET,

      courses: [
        {
          id: 'CS101',
          name: '数据结构与算法',
          teacher: '张教授',
          createTime: '2024-01-15T10:30:00',
          status: 'active',
          imageFileName: 'CS101.png'
        },
        {
          id: 'CS102',
          name: 'C++程序基础',
          teacher: '李教授',
          createTime: '2024-02-20T14:20:00',
          status: 'active',
          imageFileName: 'CS102.png',
        },
        {
          id: 'CS103',
          name: 'Python程序设计',
          teacher: '王教授',
          createTime: '2024-01-10T09:15:00',
          status: 'active',
          imageFileName: 'CS103.png',
        },
        {
          id: 'CS104',
          name: 'Java程序设计',
          teacher: '赵教授',
          createTime: '2024-03-05T16:45:00',
          status: 'active',
          imageFileName: 'CS104.png',
        },
        {
          id: 'CS105',
          name: '数据库系统',
          teacher: '刘教授',
          createTime: '2024-02-28T11:00:00',
          status: 'ended',
          imageFileName: 'CS105.png',
        }
      ]
    }
  },
  computed: {
    filteredAndSortedCourses() {
      let result = [...this.courses]

      // 搜索筛选（课程号）
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toUpperCase()
        result = result.filter(course => {
          return course.id.toUpperCase().includes(query)
        })
      }

      // 按创建时间排序，越晚创建的排在前面
      result.sort((a, b) => {
        const timeA = new Date(a.createTime).getTime()
        const timeB = new Date(b.createTime).getTime()
        return timeB - timeA // 降序排列
      })

      return result
    }
  },
  methods: {
    getCourseImageUrl(imageName) {
      if (!imageName) return ''
      return `${this.minioBaseUrl}/${this.bucketName}/coursedemo/${imageName}`
    },
    getStatusText(status) {
      const map = {
        'active': '进行中',
        'ended': '已结束',
        'upcoming': '即将开始'
      }
      return map[status] || status
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.course-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.course-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
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

.filter-bar {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999999;
  pointer-events: none;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.course-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.course-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-id {
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
}

.course-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-ended {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-upcoming {
  background-color: #e6f7ff;
  color: #1890ff;
}

.course-name {
  font-size: 20px;
  color: #333333;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.4;
}

.course-meta {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.meta-label {
  color: #666666;
  min-width: 70px;
}

.meta-value {
  color: #333333;
  font-weight: 500;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .search-box {
    max-width: 100%;
  }
}
</style>
