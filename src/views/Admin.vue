<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">后台管理</h2>
      </div>
      <nav class="sidebar-nav">
        <div 
          v-for="item in menuItems" 
          :key="item.path"
          class="nav-menu-group"
        >
          <div 
            v-if="item.children"
            class="nav-menu-item nav-menu-parent"
            :class="{ 
              active: isActiveRoute(item.path) || isChildActive(item),
              expanded: expandedMenus.includes(item.path)
            }"
            @click="toggleMenu(item.path)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
            <span 
              class="menu-arrow" 
              :class="{ expanded: expandedMenus.includes(item.path) }"
            >
              ▶
            </span>
          </div>
          <router-link 
            v-else
            :to="item.path"
            class="nav-menu-item"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
          </router-link>
          
          <!-- 子菜单 -->
          <div v-show="item.children && expandedMenus.includes(item.path)" class="submenu">
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              class="submenu-item"
              :class="{ active: isActiveRoute(child.path) }"
            >
              <span class="submenu-icon">{{ child.icon }}</span>
              <span class="submenu-text">{{ child.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>
    <div class="admin-main">
      <router-view v-slot="{ Component, route }">
        <transition name="admin-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data() {
    return {
      expandedMenus: [],
      menuItems: [
        { 
          path: '/admin/general', 
          label: '常规设置', 
          icon: '⚙️',
          children: [
            { path: '/admin/general/users', label: '用户管理', icon: '👥' },
            { path: '/admin/general/announcements', label: '公告管理', icon: '📢' }
          ]
        },
        { 
          path: '/admin/problems', 
          label: '题库管理', 
          icon: '📚',
          children: [
            { path: '/admin/problems/new', label: '新增题目', icon: '➕' },
            { path: '/admin/problems/manage', label: '题目管理', icon: '📋' },
            { path: '/admin/problems/package', label: '题目打包', icon: '📦' }
          ]
        },
        { path: '/admin/courses', label: '课程管理', icon: '📖' },
        { 
          path: '/admin/contests', 
          label: '比赛管理', 
          icon: '🏆',
          children: [
            { path: '/admin/contests/manage', label: '比赛管理', icon: '📋' },
            { path: '/admin/contests/create', label: '创建比赛', icon: '➕' }
          ]
        },
        { 
          path: '/admin/discussions', 
          label: '讨论管理', 
          icon: '💬',
          children: [
            { path: '/admin/discussions/manage', label: '讨论管理', icon: '📋' }
          ]
        }
      ]
    }
  },
  methods: {
    isActiveRoute(path) {
      return this.$route.path === path
    },
    isChildActive(item) {
      if (!item.children) return false
      return item.children.some(child => this.$route.path === child.path)
    },
    toggleMenu(path) {
      const index = this.expandedMenus.indexOf(path)
      if (index > -1) {
        this.expandedMenus.splice(index, 1)
      } else {
        this.expandedMenus.push(path)
      }
    },
    updateExpandedState() {
      // 如果当前路由是常规设置的子路由，确保展开状态保持
      if (this.$route.path.startsWith('/admin/general')) {
        if (!this.expandedMenus.includes('/admin/general')) {
          this.expandedMenus.push('/admin/general')
        }
      }
      // 如果当前路由是题库管理的子路由，确保展开状态保持
      if (this.$route.path.startsWith('/admin/problems')) {
        if (!this.expandedMenus.includes('/admin/problems')) {
          this.expandedMenus.push('/admin/problems')
        }
      }
      // 如果当前路由是讨论管理的子路由，确保展开状态保持
      if (this.$route.path.startsWith('/admin/discussions')) {
        if (!this.expandedMenus.includes('/admin/discussions')) {
          this.expandedMenus.push('/admin/discussions')
        }
      }
      // 如果当前路由是比赛管理的子路由，确保展开状态保持
      if (this.$route.path.startsWith('/admin/contests')) {
        if (!this.expandedMenus.includes('/admin/contests')) {
          this.expandedMenus.push('/admin/contests')
        }
      }
    }
  },
  mounted() {
    // 如果直接访问 /admin，重定向到常规设置
    if (this.$route.path === '/admin') {
      this.$router.replace('/admin/general/users')
    }
    // 初始化展开状态
    this.updateExpandedState()
  },
  watch: {
    '$route': {
      handler() {
        // 路由变化时更新展开状态
        this.updateExpandedState()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #666666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-menu-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.nav-menu-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
  font-weight: 500;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 15px;
  flex: 1;
}

.nav-menu-parent {
  cursor: pointer;
}

.menu-arrow {
  font-size: 12px;
  color: #999999;
  transition: transform 0.3s ease;
}

.menu-arrow.expanded {
  transform: rotate(90deg);
}

.submenu {
  background-color: #fafafa;
  padding: 4px 0;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 10px 56px;
  color: #666666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  font-size: 14px;
}

.submenu-item:hover {
  background-color: #f0f0f0;
  color: #1890ff;
}

.submenu-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
  font-weight: 500;
}

.submenu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.submenu-text {
  font-size: 14px;
}

/* 子菜单样式 */
.submenu {
  transition: all 0.3s ease;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 右侧内容区域过渡动画 */
.admin-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.admin-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.admin-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.admin-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
