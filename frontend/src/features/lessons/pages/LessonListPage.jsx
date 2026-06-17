import { useState, useEffect } from 'react'
import { getLessons, getCefrLevels, getTags } from '../lessonsApi'
import Filters from '../../../components/Filters/Filters'
import LessonCard from '../components/LessonCard'
import './LessonListPage.css'

function LessonListPage({ onNavigate }) {
  // States cho dữ liệu từ API
  const [lessons, setLessons] = useState([])
  const [cefrLevels, setCefrLevels] = useState([])
  const [tags, setTags] = useState([])

  // States cho bộ lọc và tìm kiếm
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCefrLevelId, setSelectedCefrLevelId] = useState(null)
  const [selectedTagId, setSelectedTagId] = useState(null)

  // States cho phân trang và trạng thái tải
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(8) // Hiển thị 8 bài học trên mỗi trang
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch CEFR Levels và Tags
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
        console.error('Lỗi khi tải metadata:', err)
      }
    };
    fetchMetadata()
  }, [])

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page về 1 khi các bộ lọc thay đổi
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery, selectedCefrLevelId, selectedTagId])

  // Fetch danh sách bài học khi các điều kiện lọc hoặc trang thay đổi
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          limit,
          q: debouncedSearchQuery || undefined,
          cefrLevelId: selectedCefrLevelId || undefined,
          tagId: selectedTagId || undefined
        }

        const response = await getLessons(params)
        if (response.success && response.data) {
          setLessons(response.data.lessons || [])
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1)
          }
        } else {
          setError(response.message || 'Không thể lấy danh sách bài học')
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [page, limit, debouncedSearchQuery, selectedCefrLevelId, selectedTagId])

  // Xử lý click chọn trình độ CEFR
  const handleCefrClick = (levelId) => {
    if (selectedCefrLevelId === levelId) {
      setSelectedCefrLevelId(null)
    } else {
      setSelectedCefrLevelId(levelId)
    }
  }

  // Xử lý click chọn chủ đề (tag)
  const handleTagClick = (tagId) => {
    setSelectedTagId(tagId)
  }

  // Chuyển hướng đến bài học chi tiết
  const handleLessonClick = (lessonId) => {
    if (onNavigate) {
      onNavigate(`/lessons/${lessonId}`)
    }
  }

  return (
    <div className="lessons-container">
      {/* Ô tìm kiếm */}
      <div className="search-section">
        <div className="search-bar-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm lesson theo tiêu đề..."
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

      {/* Danh sách bài học */}
      {loading ? (
        <div className="lessons-loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách bài học...</p>
        </div>
      ) : error ? (
        <div className="lessons-error">
          <p>{error}</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="lessons-empty">
          <p>Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((item) => (
            <LessonCard
              key={item.lesson._id}
              lesson={item.lesson}
              onClick={handleLessonClick}
            />
          ))}
        </div>
      )}

      {/* Thanh Phân trang */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination-container">
          {/* Nút lùi trang */}
          <button
            className={`pagination-btn nav-btn ${page === 1 ? 'disabled' : ''}`}
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
              className={`pagination-btn num-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          {/* Nút tiến trang */}
          <button
            className={`pagination-btn nav-btn ${page === totalPages ? 'disabled' : ''}`}
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

export default LessonListPage
