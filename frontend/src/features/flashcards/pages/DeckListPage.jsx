import { useState, useEffect } from 'react'
import { getSystemDecks, getUserDecks, getCefrLevels, getTags } from '../flashcardsApi'
import Filters from '../../../components/Filters/Filters'
import DeckCard from '../components/DeckCard'
import './DeckListPage.css'

function DeckListPage({ onNavigate }) {
  // Trạng thái tab: 'system' (Bộ từ hệ thống) hoặc 'user' (Bộ từ của bạn)
  const [activeTab, setActiveTab] = useState('system')

  // States dữ liệu từ API
  const [decks, setDecks] = useState([])
  const [cefrLevels, setCefrLevels] = useState([])
  const [tags, setTags] = useState([])

  // States lọc và tìm kiếm (chỉ dùng cho tab hệ thống)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCefrLevelId, setSelectedCefrLevelId] = useState(null)
  const [selectedTagId, setSelectedTagId] = useState(null)

  // States phân trang và trạng thái tải
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(8) // Hiển thị 8 bộ từ mỗi trang
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch CEFR Levels và Tags khi vào trang (chỉ cho bộ từ hệ thống)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cefrData, tagsData] = await Promise.all([
          getCefrLevels(),
          getTags()
        ])

        if (cefrData.success && Array.isArray(cefrData.data)) {
          setCefrLevels(cefrData.data)
        }

        if (tagsData.success && Array.isArray(tagsData.data)) {
          setTags(tagsData.data)
        }
      } catch (err) {
        console.error('Lỗi tải metadata bộ từ:', err)
      }
    }
    fetchMetadata()
  }, [])

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page về 1 khi đổi tab hoặc đổi bộ lọc
  useEffect(() => {
    setPage(1)
  }, [activeTab, debouncedSearchQuery, selectedCefrLevelId, selectedTagId])

  // Reset các bộ lọc và ô tìm kiếm khi chuyển tab
  useEffect(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setSelectedCefrLevelId(null)
    setSelectedTagId(null)
  }, [activeTab])

  // Fetch danh sách bộ từ
  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true)
      setError(null)
      try {
        let response
        const params = {
          page,
          limit,
        }

        if (activeTab === 'system') {
          // Tab bộ từ hệ thống hỗ trợ tìm kiếm và lọc trình độ/chủ đề
          if (debouncedSearchQuery) params.q = debouncedSearchQuery
          if (selectedCefrLevelId) params.cefrLevelId = selectedCefrLevelId
          if (selectedTagId) params.tagId = selectedTagId

          response = await getSystemDecks(params)
        } else {
          // Tab bộ từ cá nhân (Ẩn tìm kiếm và bộ lọc)
          response = await getUserDecks(params)
        }

        if (response.success && response.data) {
          setDecks(response.data.decks || [])
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1)
          }
        } else {
          setError(response.message || 'Không thể tải danh sách bộ từ')
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu bộ từ. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchDecks()
  }, [activeTab, page, limit, debouncedSearchQuery, selectedCefrLevelId, selectedTagId])

  const handleCefrClick = (levelId) => {
    setSelectedCefrLevelId(prev => (prev === levelId ? null : levelId))
  }

  const handleTagClick = (tagId) => {
    setSelectedTagId(tagId)
  }

  const handleDeckClick = (deckId) => {
    if (onNavigate) {
      if (activeTab === 'system') {
        onNavigate(`/decks/${deckId}`)
      } else {
        onNavigate(`/profile/decks/${deckId}`)
      }
    }
  }

  return (
    <div className="decks-container">
      {/* Tab chuyển đổi */}
      <div className="decks-tabs-wrapper">
        <button
          className={`deck-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          Bộ từ hệ thống
        </button>
        <button
          className={`deck-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          Bộ từ của bạn
        </button>
      </div>

      {/* Ô tìm kiếm và Bộ lọc (Chỉ hiển thị khi chọn tab Bộ từ hệ thống) */}
      {activeTab === 'system' && (
        <>
          {/* Ô tìm kiếm */}
          <div className="deck-search-section">
            <div className="deck-search-bar-wrapper">
              <svg className="deck-search-icon" viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                className="deck-search-input"
                placeholder="Tìm bộ từ theo tiêu đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bộ lọc */}
          <Filters
            cefrLevels={cefrLevels}
            tags={tags}
            selectedCefrLevelId={selectedCefrLevelId}
            selectedTagId={selectedTagId}
            onCefrChange={handleCefrClick}
            onTagChange={handleTagClick}
          />
        </>
      )}

      {/* Danh sách Bộ từ */}
      {loading ? (
        <div className="decks-loading">
          <div className="deck-spinner"></div>
          <p>Đang tải danh sách bộ từ...</p>
        </div>
      ) : error ? (
        <div className="decks-error">
          <p>{error}</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="decks-empty">
          <p>
            {activeTab === 'system'
              ? 'Không tìm thấy bộ từ nào phù hợp với bộ lọc hiện tại.'
              : 'Bạn chưa tạo bộ từ cá nhân nào.'}
          </p>
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map((deck) => (
            <DeckCard
              key={deck._id}
              deck={deck}
              cefrLevels={cefrLevels}
              tags={tags}
              onClick={handleDeckClick}
            />
          ))}
        </div>
      )}

      {/* Thanh Phân trang */}
      {!loading && !error && totalPages > 1 && (
        <div className="deck-pagination-container">
          {/* Nút lùi trang */}
          <button
            className={`deck-pagination-btn deck-nav-btn ${page === 1 ? 'disabled' : ''}`}
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Các số trang */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`deck-pagination-btn deck-num-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          {/* Nút tiến trang */}
          <button
            className={`deck-pagination-btn deck-nav-btn ${page === totalPages ? 'disabled' : ''}`}
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default DeckListPage
