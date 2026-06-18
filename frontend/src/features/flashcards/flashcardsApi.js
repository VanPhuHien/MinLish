import apiClient from '../../services/apiClient'

/**
 * Lấy danh sách bộ từ hệ thống (ownerType = system) đã công khai
 * @param {Object} params các tham số lọc: tagId, cefrLevelId, q, page, limit
 */
export const getSystemDecks = async (params = {}) => {
  const response = await apiClient.get('/decks', { params })
  return response.data
}

/**
 * Lấy danh sách bộ từ cá nhân của người dùng hiện tại (ownerType = user)
 * @param {Object} params các tham số lọc: q, page, limit
 */
export const getUserDecks = async (params = {}) => {
  const response = await apiClient.get('/users/me/decks', { params })
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
 * Lấy danh sách các tag dùng trong deck để lọc
 */
export const getTags = async () => {
  const response = await apiClient.get('/tags', { params: { usedBy: 'deck' } })
  return response.data
}
