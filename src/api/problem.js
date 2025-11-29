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
 * @returns {Promise}
 */
export const getProblemDetail = (problemId) => {
  return http.get(`/problems/${problemId}`)
}

