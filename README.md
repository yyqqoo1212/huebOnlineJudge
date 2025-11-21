# huebOnlineJudge

### 初始化设置
```
npm install
```
### 安装router
```
npm install vue-router@4
```

### 启动项目
```
npm run serve
```

### 目录结构
```
huebOnlineJudge/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── auth.js              # 认证相关
│   │   ├── problem.js           # 题目相关
│   │   ├── submission.js        # 提交相关
│   │   ├── user.js              # 用户相关
│   │   └── rank.js              # 排行榜相关
│   ├── assets/                 # 静态资源（图片、样式）
│   │   ├── images/
│   │   └── styles/
│   │       ├── global.scss      # 全局样式
│   │       └── variables.scss   # 样式变量
│   ├── components/             # 公共组件
│   │   ├── CodeEditor/          # 代码编辑器组件
│   │   ├── MarkdownViewer/      # Markdown 渲染组件
│   │   ├── ProblemCard/         # 题目卡片组件
│   │   ├── SubmissionTable/     # 提交记录表格
│   │   └── DifficultyTag/       # 难度标签组件
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.js           # 认证逻辑
│   │   ├── useTheme.js          # 主题切换
│   │   └── useCountdown.js      # 倒计时
│   ├── layouts/                # 布局组件
│   │   ├── DefaultLayout.vue    # 默认布局
│   │   └── BlankLayout.vue      # 空白布局（登录页）
│   ├── router/                 # 路由配置
│   │   ├── index.js
│   │   └── guards.js            # 路由守卫
│   ├── stores/                 # Pinia 状态管理
│   │   ├── auth.js              # 用户认证状态
│   │   ├── problem.js           # 题目状态
│   │   └── submission.js        # 提交状态
│   ├── utils/                  # 工具函数
│   │   ├── request.js           # Axios 封装
│   │   ├── storage.js           # 本地存储封装
│   │   ├── validator.js         # 表单验证
│   │   └── constants.js         # 常量定义
│   ├── views/                  # 页面组件
│   │   ├── auth/
│   │   │   ├── Login.vue        # 登录页
│   │   │   └── Register.vue     # 注册页
│   │   ├── contest/
│   │   │   ├── ContestList.vue  # 比赛列表
│   │   │   └── Detail.vue       # 比赛详情
│   │   ├── course/
│   │   │   ├── CourseList.vue   # 课程列表
│   │   │   └── Detail.vue       # 课程详情
│   │   ├── discussion/
│   │   │   ├── ContestList.vue  # 讨论区列表
│   │   │   └── Detail.vue       # 讨论区详情
│   │   ├── problem/
│   │   │   ├── ProblemList.vue  # 题目列表
│   │   │   └── Detail.vue       # 题目详情
│   │   ├── submission/
│   │   │   ├── SubmissionList.vue  # 提交记录
│   │   │   └── Detail.vue          # 提交详情
│   │   ├── rank/
│   │   │   └── RankingList.vue  # 排行榜
│   │   ├── user/
│   │   │   ├── Profile.vue      # 个人中心
│   │   │   └── Settings.vue     # 个人设置
│   │   └── Home.vue             # 首页
│   ├── App.vue
│   └── main.js
├── .env.development             # 开发环境配置
├── .env.production              # 生产环境配置
├── vue.configjs
├── package-lock.json
├── jsconfig.json
├── babel.config.js
└── package.json
```
