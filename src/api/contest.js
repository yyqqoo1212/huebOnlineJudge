import http from '@/utils/request'

/**
 * 获取比赛列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @param {string} params.search - 搜索关键词（比赛号或名称）
 * @param {string} params.format - 赛制筛选（ACM/IOI/OI）
 * @param {string} params.type - 赛种筛选（公开赛/私有赛）
 * @param {string} params.status - 状态筛选（即将开始/进行中/已结束）
 * @returns {Promise}
 */
export const getContestList = (params = {}) => {
  return http.get('/contests/list', { params })
}

/**
 * 获取比赛详情
 * @param {number} contestId - 比赛ID
 * @returns {Promise}
 */
export const getContestDetail = (contestId) => {
  return http.get(`/contests/${contestId}`)
}

/**
 * 创建比赛
 * @param {Object} data - 比赛数据
 * @returns {Promise}
 */
export const createContest = (data) => {
  return http.post('/contests/create', data)
}

/**
 * 更新比赛
 * @param {number} contestId - 比赛ID
 * @param {Object} data - 比赛数据
 * @returns {Promise}
 */
export const updateContest = (contestId, data) => {
  return http.put(`/contests/update/${contestId}`, data)
}

