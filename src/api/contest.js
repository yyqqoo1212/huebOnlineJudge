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

/**
 * 删除比赛
 * @param {number} contestId - 比赛ID
 * @returns {Promise}
 */
export const deleteContest = (contestId) => {
  return http.delete(`/contests/delete/${contestId}`)
}

/**
 * 获取比赛公告列表
 * @param {number} contestId - 比赛ID
 * @returns {Promise}
 */
export const getContestAnnouncements = (contestId) => {
  return http.get(`/contests/${contestId}/announcements`)
}

/**
 * 创建比赛公告
 * @param {number} contestId - 比赛ID
 * @param {Object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {boolean} data.is_important - 是否置顶
 * @returns {Promise}
 */
export const createContestAnnouncement = (contestId, data) => {
  return http.post(`/contests/${contestId}/announcements/create`, data)
}

/**
 * 获取比赛公告详情
 * @param {number} contestId - 比赛ID
 * @param {number} announcementId - 公告ID
 * @returns {Promise}
 */
export const getContestAnnouncementDetail = (contestId, announcementId) => {
  return http.get(`/contests/${contestId}/announcements/${announcementId}`)
}

/**
 * 更新比赛公告
 * @param {number} contestId - 比赛ID
 * @param {number} announcementId - 公告ID
 * @param {Object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {boolean} data.is_important - 是否置顶
 * @returns {Promise}
 */
export const updateContestAnnouncement = (contestId, announcementId, data) => {
  return http.put(`/contests/${contestId}/announcements/${announcementId}/update`, data)
}

/**
 * 删除比赛公告
 * @param {number} contestId - 比赛ID
 * @param {number} announcementId - 公告ID
 * @returns {Promise}
 */
export const deleteContestAnnouncement = (contestId, announcementId) => {
  return http.delete(`/contests/${contestId}/announcements/${announcementId}/delete`)
}

