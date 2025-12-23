import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProblemList from '../views/problem/ProblemList.vue'
import ProblemDetail from '../views/problem/Detail.vue'
import CourseList from '../views/course/CourseList.vue'
import ContestList from '../views/contest/ContestList.vue'
import ContestDetail from '../views/contest/Detail.vue'
import ContestDescription from '../views/contest/Description.vue'
import ContestProblems from '../views/contest/Problems.vue'
import ContestSubmissions from '../views/contest/Submissions.vue'
import ContestRanking from '../views/contest/Ranking.vue'
import ContestAnnouncements from '../views/contest/Announcements.vue'
import RankingList from '../views/rank/RankingList.vue'
import SubmissionList from '../views/submission/SubmissionList.vue'
import SubmissionDetail from '../views/submission/Detail.vue'
import ProblemSubmissionHistory from '../views/problem/SubmissionHistory.vue'
import DiscussionList from '../views/disscussion/DiscussionList.vue'
import DiscussionDetail from '../views/disscussion/Detail.vue'

import Register from '../views/auth/Register.vue'
import Login from '../views/auth/Login.vue'
import Settings from '../views/user/Settings.vue'
import Admin from '../views/Admin.vue'
import GeneralSettings from '../views/admin/GeneralSettings.vue'
import UserManagement from '../views/admin/general/UserManagement.vue'
import AnnouncementManagement from '../views/admin/general/AnnouncementManagement.vue'
import ProblemManagement from '../views/admin/ProblemManagement.vue'
import CourseManagement from '../views/admin/CourseManagement.vue'
import ContestManagement from '../views/admin/ContestManagement.vue'
import DiscussionManagement from '../views/admin/DiscussionManagement.vue'
import { setupRouterGuards } from './guards'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/problems',
    name: 'ProblemList',
    component: ProblemList
  },
  {
    path: '/problems/:id',
    name: 'ProblemDetail',
    component: ProblemDetail
  },
  {
    path: '/problems/:id/submissions',
    name: 'ProblemSubmissionHistory',
    component: ProblemSubmissionHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: CourseList
  },
  {
    path: '/contests',
    name: 'ContestList',
    component: ContestList
  },
  {
    path: '/contests/:id',
    name: 'ContestDetail',
    component: ContestDetail,
    redirect: { name: 'ContestDescription' },
    children: [
      {
        path: 'description',
        name: 'ContestDescription',
        component: ContestDescription
      },
      {
        path: 'problems',
        name: 'ContestProblems',
        component: ContestProblems
      },
      {
        path: 'submissions',
        name: 'ContestSubmissions',
        component: ContestSubmissions
      },
      {
        path: 'ranking',
        name: 'ContestRanking',
        component: ContestRanking
      },
      {
        path: 'announcements',
        name: 'ContestAnnouncements',
        component: ContestAnnouncements
      }
    ]
  },
  {
    path: '/ranking',
    name: 'RankingList',
    component: RankingList
  },
  {
    path: '/submissions',
    name: 'SubmissionList',
    component: SubmissionList
  },
  {
    path: '/submissions/:id',
    name: 'SubmissionDetail',
    component: SubmissionDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/discussions',
    name: 'DiscussionList',
    component: DiscussionList
  },
  {
    path: '/discussions/new',
    name: 'DiscussionCreate',
    component: () => import('../views/disscussion/Create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/discussions/:id',
    name: 'DiscussionDetail',
    component: DiscussionDetail
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/general',
    children: [
      {
        path: 'general',
        name: 'GeneralSettings',
        component: GeneralSettings,
        redirect: '/admin/general/users',
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: UserManagement
          },
          {
            path: 'announcements',
            name: 'AnnouncementManagement',
            component: AnnouncementManagement
          }
        ]
      },
      {
        path: 'problems',
        name: 'ProblemManagement',
        component: ProblemManagement,
        redirect: '/admin/problems/new',
        children: [
          {
            path: 'new',
            name: 'ProblemCreate',
            component: () => import('../views/admin/problems/ProblemCreate.vue')
          },
          {
            path: 'edit/:id',
            name: 'ProblemEdit',
            component: () => import('../views/admin/problems/ProblemEdit.vue')
          },
          {
            path: 'manage',
            name: 'ProblemManage',
            component: () => import('../views/admin/problems/ProblemManage.vue')
          },
          {
            path: 'package',
            name: 'ProblemPackage',
            component: () => import('../views/admin/problems/ProblemPackage.vue')
          }
        ]
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: CourseManagement
      },
      {
        path: 'contests',
        name: 'ContestManagement',
        component: ContestManagement,
        redirect: '/admin/contests/manage',
        children: [
          {
            path: 'manage',
            name: 'ContestManage',
            component: () => import('../views/admin/contests/ContestManage.vue')
          },
          {
            path: 'create',
            name: 'ContestCreate',
            component: () => import('../views/admin/contests/ContestCreate.vue')
          },
          {
            path: 'edit/:id',
            name: 'ContestEdit',
            component: () => import('../views/admin/contests/ContestCreate.vue')
          }
        ]
      },
      {
        path: 'discussions',
        name: 'DiscussionManagement',
        component: DiscussionManagement,
        redirect: '/admin/discussions/manage',
        children: [
          {
            path: 'manage',
            name: 'DiscussionManage',
            component: () => import('../views/admin/discussions/DiscussionManage.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router
