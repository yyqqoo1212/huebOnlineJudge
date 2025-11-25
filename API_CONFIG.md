# 前端 API 配置说明

## API 地址配置位置

前端访问后端的 API 地址配置在以下位置：

### 1. 环境变量文件（推荐）

- **开发环境**: `.env.development`
- **生产环境**: `.env.production`

这些文件中的 `VUE_APP_API_BASE_URL` 变量会被 Vue CLI 自动加载。

### 2. 代码默认值

如果环境变量未设置，会使用 `src/utils/constants.js` 中的默认值。

## 当前配置

**API 地址**: `http://101.42.172.229/api`

- 云服务器 IP: `101.42.172.229`
- 端口: `80` (HTTP 默认端口，无需在 URL 中指定)
- API 路径: `/api`

## 如何修改 API 地址

### 方法 1: 修改环境变量文件（推荐）

编辑 `.env.development` 或 `.env.production` 文件：

```env
VUE_APP_API_BASE_URL=http://你的服务器IP/api
```

### 方法 2: 修改代码默认值

编辑 `src/utils/constants.js`：

```javascript
export const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || 'http://你的服务器IP/api'
```

## 注意事项

1. **环境变量优先级**: 环境变量文件中的值会覆盖代码中的默认值
2. **重启开发服务器**: 修改环境变量后需要重启 `npm run serve`
3. **生产构建**: 构建生产版本时会使用 `.env.production` 中的配置
4. **CORS 配置**: 确保后端已正确配置 CORS，允许前端域名访问

## 本地开发切换

如果需要临时使用本地后端进行开发，可以：

1. 修改 `.env.development` 为 `http://localhost:8000/api`
2. 或者创建 `.env.local` 文件（优先级最高）：
   ```env
   VUE_APP_API_BASE_URL=http://localhost:8000/api
   ```

## 验证配置

启动开发服务器后，可以在浏览器控制台查看实际使用的 API 地址：

```javascript
// 在浏览器控制台执行
console.log(process.env.VUE_APP_API_BASE_URL)
```

或者查看网络请求，确认请求的 URL 是否正确。

