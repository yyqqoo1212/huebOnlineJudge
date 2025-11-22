import http from '@/utils/request'
import axios from 'axios'
import { API_BASE_URL, API_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGE } from '@/utils/constants'
import { tokenStorage } from '@/utils/storage'

// 创建用于文件上传的 axios 实例（需要 multipart/form-data）
const getAuthHeader = () => {
  const { token, tokenType, expiresAt } = tokenStorage.load()
  if (!token) return ''
  if (expiresAt && Date.now() > expiresAt) {
    tokenStorage.clear()
    return ''
  }
  return `${tokenType || 'Bearer'} ${token}`
}

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
    return Promise.reject({
      code: 'network_error',
      message: '网络请求失败，请检查网络后重试。',
      status: 0
    })
  }
  return Promise.reject({
    code: 'unknown_error',
    message: error.message || DEFAULT_ERROR_MESSAGE,
    status: 0
  })
}

const uploadHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000 // 文件上传可能需要更长时间
  // 注意：不要手动设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
})

uploadHttp.interceptors.request.use(
  (config) => {
    const auth = getAuthHeader()
    if (auth) {
      config.headers.Authorization = auth
    }
    return config
  },
  (error) => Promise.reject(error)
)

uploadHttp.interceptors.response.use(
  (response) => response.data, // 提取 response.data，与其他 API 调用保持一致
  (error) => normalizeError(error)
)

/**
 * 上传临时文件到 Minio（无需认证，用于注册阶段）
 * @param {File} file - 要上传的文件
 * @param {string} objectKey - Minio 中的对象键，必须是 'avatars/temp/...' 格式
 * @returns {Promise} 返回上传结果
 */
export const uploadTempFile = (file, objectKey) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('object_key', objectKey)
  
  // 调试信息
  console.log('上传临时文件:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    objectKey: objectKey
  })
  
  // 创建不需要认证的 axios 实例
  const tempUploadHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000
  })
  
  tempUploadHttp.interceptors.response.use(
    (response) => response.data,
    (error) => normalizeError(error)
  )
  
  return tempUploadHttp.post('/files/upload-temp', formData)
}

/**
 * 上传文件到 Minio（需要认证）
 * @param {File} file - 要上传的文件
 * @param {string} objectKey - Minio 中的对象键，如 'avatars/1/avatar.jpg'
 * @returns {Promise} 返回上传结果
 */
export const uploadFile = (file, objectKey) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('object_key', objectKey)
  
  // 调试信息
  console.log('上传文件:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    objectKey: objectKey
  })
  
  return uploadHttp.post('/files/upload', formData)
}

/**
 * 获取文件 URL
 * @param {string} objectKey - Minio 中的对象键
 * @returns {Promise} 返回文件 URL
 */
export const getFileUrl = (objectKey) => {
  return http.get('/files/get', {
    params: { object_key: objectKey }
  })
}

