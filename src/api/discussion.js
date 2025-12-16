import http from '@/utils/request'

/**
 * 获取讨论列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getDiscussionList = (params = {}) => {
  return http.get('/discussions/list', { params })
}

/**
 * 获取讨论详情
 * @param {number|string} id 讨论ID
 * @returns {Promise}
 */
export const getDiscussionDetail = (id) => {
  return http.get(`/discussions/${id}`)
}

/**
 * 创建讨论
 * @param {{title: string, type: string, content: string}} data
 * @returns {Promise}
 */
export const createDiscussion = (data) => {
  return http.post('/discussions/create', data)
}

/**
 * 更新讨论
 * @param {number|string} id 讨论ID
 * @param {{title?: string, type?: string, content?: string}} data
 * @returns {Promise}
 */
export const updateDiscussion = (id, data) => {
  return http.put(`/discussions/${id}/update`, data)
}

/**
 * 删除讨论
 * @param {number|string} id 讨论ID
 * @returns {Promise}
 */
export const deleteDiscussion = (id) => {
  return http.delete(`/discussions/${id}/delete`)
}


