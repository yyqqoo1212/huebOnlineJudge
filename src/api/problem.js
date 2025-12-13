import http from '@/utils/request'

/**
 * 获取题目列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @param {string} params.search - 搜索关键词（题号或标题）
 * @param {number} params.level - 难度筛选（1=简单, 2=中等, 3=困难）
 * @param {number} params.auth - 权限筛选（1=公开, 2=私密, 3=比赛）
 * @returns {Promise}
 */
export const getProblemList = (params = {}) => {
  return http.get('/problems/list', { params })
}

/**
 * 获取题目详情
 * @param {number} problemId - 题目ID
 * @param {Object} params - 查询参数（可选，如 allow_all=true 用于管理员获取所有题目）
 * @returns {Promise}
 */
export const getProblemDetail = (problemId, params = {}) => {
  return http.get(`/problems/${problemId}`, { params })
}

/**
 * 创建题目
 * @param {Object} data - 题目数据
 * @returns {Promise}
 */
export const createProblem = (data) => {
  return http.post('/problems/create', data)
}

/**
 * 更新题目
 * @param {number} problemId - 题目ID
 * @param {Object} data - 题目数据
 * @returns {Promise}
 */
export const updateProblem = (problemId, data) => {
  return http.put(`/problems/${problemId}/update`, data)
}

/**
 * 上传压缩包并解压验证
 * @param {FormData} formData - 包含压缩包文件的 FormData
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise}
 */
export const uploadZipFile = (formData, onProgress) => {
  return http.post('/problems/upload-zip', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  })
}

/**
 * 上传手动输入的测试用例文件
 * @param {number} problemId - 题目ID
 * @param {Array} files - 文件数组，每个元素包含 {name, content}
 * @returns {Promise}
 */
export const uploadTestcaseFiles = (problemId, files) => {
  return http.post(`/problems/${problemId}/upload-testcases`, { files })
}

/**
 * 上传解压后的测试用例文件
 * @param {number} problemId - 题目ID
 * @param {string} token - 解压验证返回的 token
 * @returns {Promise}
 */
export const uploadExtractedTestcases = (problemId, token) => {
  return http.post(`/problems/${problemId}/upload-extracted-testcases`, { token })
}

/**
 * 清空题目测评数据
 * @param {number} problemId - 题目ID
 * @returns {Promise}
 */
export const clearProblemTestcases = (problemId) => {
  return http.delete(`/problems/${problemId}/testcases/clear`)
}

/**
 * 删除题目
 * @param {number} problemId - 题目ID
 * @returns {Promise}
 */
export const deleteProblem = (problemId) => {
  return http.delete(`/problems/${problemId}/delete`)
}

/**
 * 运行自测
 * @param {number} problemId - 题目ID
 * @param {Object} data - 运行数据
 * @param {string} data.code - 源代码
 * @param {string} data.language - 语言类型 ('cpp', 'java', 'python', 'javascript')
 * @param {string} data.test_input - 测试用例输入
 * @returns {Promise}
 */
export const runTest = (problemId, data) => {
  return http.post(`/problems/${problemId}/run-test`, {
    code: data.code,
    language: data.language,
    test_input: data.test_input
  })
}

/**
 * 提交代码进行判题
 * @param {number} problemId - 题目ID
 * @param {Object} data - 提交数据
 * @param {string} data.code - 源代码
 * @param {string} data.language - 语言类型 ('cpp', 'java', 'python', 'javascript')
 * @returns {Promise}
 */
export const submitCode = (problemId, data) => {
  return http.post(`/problems/${problemId}/submit`, {
    code: data.code,
    language: data.language
  })
}

/**
 * 获取提交列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @param {number} params.problem_id - 题目ID筛选（可选）
 * @param {number} params.submission_id - 测评ID筛选（可选）
 * @param {number} params.status - 状态筛选（可选）
 * @param {string} params.language - 语言筛选（可选）
 * @returns {Promise}
 */
export const getSubmissionList = (params = {}) => {
  return http.get('/problems/submissions/list', { params })
}

/**
 * 获取提交详情
 * @param {number} submissionId - 提交ID
 * @returns {Promise}
 */
export const getSubmissionDetail = (submissionId) => {
  return http.get(`/problems/submissions/${submissionId}`)
}

