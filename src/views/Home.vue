<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到在线判题系统</h1>
        <p class="hero-subtitle">提升编程技能，挑战算法难题</p>
        <div class="hero-actions">
          <router-link to="/problems" class="btn-primary">开始答题</router-link>
          <template v-if="!isLoggedIn">
            <router-link to="/register" class="btn-secondary">注册账号</router-link>
          </template>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">功能特色</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>丰富题库</h3>
            <p>涵盖算法、数据结构、编程基础等多个领域的题目</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>实时判题</h3>
            <p>提交代码后立即获得判题结果，快速反馈学习效果</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>数据统计</h3>
            <p>查看个人提交记录、通过率等详细统计数据</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>排行榜</h3>
            <p>与其他用户竞争，提升自己的排名</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useAuth } from '@/composbles/useAuth'

const { isLoggedIn } = useAuth()

</script>

<style scoped lang="scss">
// 此处需要安装 npm install -D sass sass-loader
@import '@/assets/styles/variable.scss';

.home {
  min-height: calc(100vh - 60px);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: $text-color-inverse;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 500;
  text-decoration: none;
  transition: $transition-base;
  display: inline-block;
}

.btn-primary {
  background-color: $text-color-inverse;
  color: #667eea;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.btn-secondary {
  background-color: transparent;
  color: $text-color-inverse;
  border: 2px solid $text-color-inverse;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.features-section {
  padding: 80px 20px;
  background-color: $bg-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 48px;
  color: $text-color-primary;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  background: $bg-color-base;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: 32px;
  text-align: center;
  transition: $transition-base;

  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
    transform: translateY(-4px);
  }
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: 12px;
  color: $text-color-primary;
}

.feature-card p {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  line-height: $line-height-lg;
}

.quick-access-section {
  padding: 60px 20px;
  background-color: $bg-color-light;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 32px;
  background: $bg-color-base;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  text-decoration: none;
  color: $text-color-primary;
  transition: $transition-base;
  min-width: 120px;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    transform: translateY(-2px);
    box-shadow: $box-shadow-base;
  }
}

.link-icon {
  font-size: 32px;
}

.link-text {
  font-size: $font-size-base;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
