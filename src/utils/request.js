import axios from 'axios'
import { API_BASE_URL, API_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGE } from './constants'
import { tokenStorage, userStorage } from './storage'

// 开发环境下输出 API 配置信息
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API 配置:', {
    baseURL: API_BASE_URL,
    env: process.env.VUE_APP_API_BASE_URL || '使用默认值'
  })
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const getAuthHeader = () => {
  const { token, tokenType, expiresAt } = tokenStorage.load()
  if (!token) return ''
  if (expiresAt && Date.now() > expiresAt) {
    tokenStorage.clear()
    userStorage.clear()
    return ''
  }
  return `${tokenType || 'Bearer'} ${token}`
}

http.interceptors.request.use(
  (config) => {
    const auth = getAuthHeader()
    if (auth) {
      config.headers.Authorization = auth
    }
    return config
  },
  (error) => Promise.reject(error)
)

const normalizeError = (error) => {
  if (error.response) {
    const { data, status } = error.response
    const code = data?.code || 'invalid_request'
    const message =
      data?.message || API_ERROR_MESSAGES[code] || DEFAULT_ERROR_MESSAGE
    return Promise.reject({
      code,
      message,
      status,
      details: data
    })
  }
  if (error.request) {
    // 请求已发出但没有收到响应
    console.error('网络请求失败:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
      timeout: error.config?.timeout,
      message: error.message
    })
    
    // 提供更详细的错误信息
    let errorMessage = '网络请求失败，请检查网络后重试。'
    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接或稍后重试。'
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = '无法连接到服务器，请检查：\n1. 后端服务是否运行\n2. API 地址是否正确\n3. 网络连接是否正常'
    } else if (error.message) {
      errorMessage = `网络错误: ${error.message}`
    }
    
    return Promise.reject({
      code: 'network_error',
      message: errorMessage,
      status: 0,
      details: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    })
  }
  return Promise.reject({
    code: 'unknown_error',
    message: error.message || DEFAULT_ERROR_MESSAGE,
    status: 0
  })
}

http.interceptors.response.use(
  (response) => response.data,
  (error) => normalizeError(error)
)

export default http
