<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/">
          <img src="@/assets/images/hbjmdx.png" alt="Logo" class="logo" />
        </router-link>
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/problems" class="nav-item">题库</router-link>
        <router-link to="/courses" class="nav-item">课程</router-link>
        <router-link to="/contests" class="nav-item">比赛</router-link>
        <router-link to="/submissions" class="nav-item">提交记录</router-link>
        <router-link to="/ranking" class="nav-item">排行榜</router-link>
        <router-link to="/discussions" class="nav-item">讨论区</router-link>
      </div>

      <div class="navbar-right">
        <template v-if="isLoggedIn">
          <router-link to="/settings" class="nav-item">
            {{ username }} 设置
          </router-link>
          <button class="logout-btn" @click="handleLogout">登出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composbles/useAuth'

const router = useRouter()
const { isLoggedIn, username, logout} = useAuth()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.register-btn {
  background-color: #1890ff;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-left: 12px;
}


.navbar-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logout-btn {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #d9d9d9;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.nav-item {
  color: #333333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}

.nav-item.router-link-active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.account-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.account-btn:active {
  transform: translateY(0);
}
</style>
