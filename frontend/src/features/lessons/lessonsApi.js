import apiClient from '../../services/apiClient'

/**
 * Lấy danh sách bài học đã công khai kèm theo phân trang và lọc
 * @param {Object} params các tham số lọc: tagId, cefrLevelId, mode, q, page, limit
 */
export const getLessons = async (params = {}) => {
  const response = await apiClient.get('/lessons', { params })
  return response.data
}

/**
 * Lấy danh sách tất cả các cấp độ CEFR
 */
export const getCefrLevels = async () => {
  const response = await apiClient.get('/cefr-levels')
  return response.data
}

/**
 * Lấy danh sách các tag dùng trong lesson để lọc
 */
export const getTags = async () => {
  const response = await apiClient.get('/tags', { params: { usedBy: 'lesson' } })
  return response.data
}
