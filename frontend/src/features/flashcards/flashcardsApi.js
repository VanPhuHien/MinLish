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

/**
 * Cập nhật toàn bộ trạng thái học của thẻ từ (upsert card state)
 * @param {string} cardId ID của thẻ từ
 * @param {Object} data payload gồm deckId, topicId, srs, flags
 */
export const updateCardState = async (cardId, data) => {
  const response = await apiClient.put(`/users/me/card-states/${cardId}`, data)
  return response.data
}

/**
 * Cập nhật một phần trạng thái học của thẻ từ (patch card state)
 * @param {string} cardId ID của thẻ từ
 * @param {Object} data payload gồm srs hoặc flags
 */
export const patchCardState = async (cardId, data) => {
  const response = await apiClient.patch(`/users/me/card-states/${cardId}`, data)
  return response.data
}

/**
 * Lấy chi tiết deck hệ thống
 * @param {string} deckId ID của deck
 */
export const getDeckDetail = async (deckId) => {
  const response = await apiClient.get(`/decks/${deckId}`)
  return response.data
}

/**
 * Lấy chi tiết deck cá nhân
 * @param {string} deckId ID của deck
 */
export const getUserDeckDetail = async (deckId) => {
  const response = await apiClient.get(`/users/me/decks/${deckId}`)
  return response.data
}

/**
 * Lấy danh sách topic của deck hệ thống kèm tiến độ
 * @param {string} deckId ID của deck
 */
export const getDeckTopics = async (deckId) => {
  const response = await apiClient.get(`/decks/${deckId}/topics`)
  return response.data
}

/**
 * Lấy danh sách topic của deck cá nhân kèm tiến độ
 * @param {string} deckId ID của deck
 */
export const getUserDeckTopics = async (deckId) => {
  const response = await apiClient.get(`/users/me/decks/${deckId}/topics`)
  return response.data
}

/**
 * Lấy danh sách card thuộc topic trong deck
 * @param {string} deckId ID của deck
 * @param {string} topicId ID của topic
 */
export const getTopicCards = async (deckId, topicId) => {
  const response = await apiClient.get(`/decks/${deckId}/topics/${topicId}/cards`)
  return response.data
}


