import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getBattleHistory } from './profileApi'
import { getLessons } from '../lessons/lessonsApi'
import MatchDetailModal from '../battle/components/MatchDetailModal'
import Pagination from '../../components/Pagination/Pagination'
import './HistoryModal.css'

function HistoryModal({ onClose, lessonsMap, user, onNavigate }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('lessons')

  // Lesson history
  const [allLessons, setAllLessons] = useState([])
  const [filteredLessons, setFilteredLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [lessonPage, setLessonPage] = useState(1)
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [lessonStatusFilter, setLessonStatusFilter] = useState('all')

  // Battle history
  const [allBattles, setAllBattles] = useState([])
  const [filteredBattles, setFilteredBattles] = useState([])
  const [battlePage, setBattlePage] = useState(1)
  const [battleLoading, setBattleLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [battleSearchQuery, setBattleSearchQuery] = useState('')
  const [battleResultFilter, setBattleResultFilter] = useState('all')

  const loadLessonProgress = useCallback(async () => {
    setLessonsLoading(true)
    try {
      const res = await getLessons({ limit: 100 })
      if (res.success) {
        const data = res.data?.lessons || []
        // Filter lessons that have any user progress
        const learnedLessons = data.filter((l) => l.userProgress && (l.userProgress.dictation?.status || l.userProgress.shadowing?.status))
        // Map lesson with userProgress data
        const lessonsWithData = learnedLessons.map((l) => ({
          ...l.lesson,
          userProgress: l.userProgress,
          lastStudiedAt: l.userProgress.updatedAt || l.userProgress.createdAt
        }))
        setAllLessons(lessonsWithData)
        setFilteredLessons(lessonsWithData)
        setLessonPage(1)
      }
    } catch (err) {
      console.error('Failed to load lessons:', err)
    } finally {
      setLessonsLoading(false)
    }
  }, [])


  const loadBattleHistory = useCallback(async () => {
    setBattleLoading(true)
    try {
      const res = await getBattleHistory(1, 100)
      if (res.success) {
        const items = res.data?.items || []
        setAllBattles(items)
        setFilteredBattles(items)
        setBattlePage(1)
      }
    } catch (err) {
      console.error('Failed to load battle history:', err)
    } finally {
      setBattleLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLessonProgress()
    loadBattleHistory()
  }, [])

  const handleLessonPageChange = (page) => {
    setLessonPage(page)
  }

  // Get paginated lessons
  const getPaginatedLessons = () => {
    const startIndex = (lessonPage - 1) * 7
    const endIndex = startIndex + 7
    return filteredLessons.slice(startIndex, endIndex)
  }

  // Filter lessons by search and status
  useEffect(() => {
    let filtered = allLessons
    if (lessonSearchQuery) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())
      )
    }
    if (lessonStatusFilter !== 'all') {
      filtered = filtered.filter(l => {
        const status = getOverallStatus(l)
        return status === lessonStatusFilter
      })
    }
    setFilteredLessons(filtered)
    setLessonPage(1)
  }, [allLessons, lessonSearchQuery, lessonStatusFilter])

  const handleBattlePageChange = (page) => {
    setBattlePage(page)
  }

  // Get paginated battles
  const getPaginatedBattles = () => {
    const startIndex = (battlePage - 1) * 10
    const endIndex = startIndex + 10
    return filteredBattles.slice(startIndex, endIndex)
  }

  // Filter battles by search and result
  useEffect(() => {
    let filtered = allBattles
    if (battleSearchQuery) {
      filtered = filtered.filter(m => 
        (m.mode === 'mcq' ? t('battle.modeMcq') : t('battle.modeTyping')).toLowerCase().includes(battleSearchQuery.toLowerCase()) ||
        (m.matchType === 'queue' ? t('battle.typeQueue') : t('battle.typeInvite')).toLowerCase().includes(battleSearchQuery.toLowerCase())
      )
    }
    if (battleResultFilter !== 'all') {
      filtered = filtered.filter(m => {
        const winnerId = typeof m.winnerId === 'object' ? m.winnerId?._id : m.winnerId
        const isWinner = winnerId === user?.id
        const isDraw = m.winnerId === null
        if (battleResultFilter === 'win') return isWinner && !isDraw
        if (battleResultFilter === 'lose') return !isWinner && !isDraw
        if (battleResultFilter === 'draw') return isDraw
        return true
      })
    }
    setFilteredBattles(filtered)
    setBattlePage(1)
  }, [battleSearchQuery, battleResultFilter, user, t])

  const handleViewBattleDetail = (matchId) => {
    setSelectedMatchId(matchId)
    setIsDetailOpen(true)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  }

  const getOverallStatus = (lesson) => {
    const dictationStatus = lesson.userProgress?.dictation?.status
    const shadowingStatus = lesson.userProgress?.shadowing?.status

    if (dictationStatus === 'completed' && shadowingStatus === 'completed') {
      return 'completed'
    } else if (dictationStatus === 'in_progress' || shadowingStatus === 'in_progress') {
      return 'in_progress'
    } else {
      return 'not_started'
    }
  }

  return (
    <div className="hm-overlay" onClick={onClose}>
      <div className="hm-container" onClick={(e) => e.stopPropagation()}>
        <div className="hm-header">
          <h3 className="hm-title">{t('profile.historyModalTitle')}</h3>
          <button className="hm-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="hm-tabs">
          <button
            className={`hm-tab ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            {t('profile.historyLessons')}
          </button>
          <button
            className={`hm-tab ${activeTab === 'battle' ? 'active' : ''}`}
            onClick={() => setActiveTab('battle')}
          >
            {t('profile.historyBattle')}
          </button>
        </div>

        <div className="hm-search-filter">
          <input
            type="text"
            className="hm-search-input"
            placeholder={activeTab === 'lessons' ? t('profile.searchLessonPlaceholder') : t('profile.searchBattlePlaceholder')}
            value={activeTab === 'lessons' ? lessonSearchQuery : battleSearchQuery}
            onChange={(e) => activeTab === 'lessons' ? setLessonSearchQuery(e.target.value) : setBattleSearchQuery(e.target.value)}
          />
          <select
            className="hm-filter-select"
            value={activeTab === 'lessons' ? lessonStatusFilter : battleResultFilter}
            onChange={(e) => activeTab === 'lessons' ? setLessonStatusFilter(e.target.value) : setBattleResultFilter(e.target.value)}
          >
            {activeTab === 'lessons' ? (
              <>
                <option value="all">{t('profile.filterAll')}</option>
                <option value="completed">{t('profile.completed')}</option>
                <option value="in_progress">{t('profile.learning')}</option>
              </>
            ) : (
              <>
                <option value="all">{t('profile.filterAll')}</option>
                <option value="win">{t('profile.win')}</option>
                <option value="lose">{t('profile.lose')}</option>
                <option value="draw">{t('profile.draw')}</option>
              </>
            )}
          </select>
        </div>

        <div className="hm-body">
          {/* Tab 1: Lesson History */}
          {activeTab === 'lessons' && (
            lessonsLoading ? (
              <div className="hm-loading-state">{t('profile.loading')}</div>
            ) : filteredLessons.length > 0 ? (
              <>
                <table className="hm-table">
                  <thead>
                    <tr>
                      <th>{t('profile.tableLessonName')}</th>
                      <th>{t('profile.tableDictation')}</th>
                      <th>{t('profile.tableShadowing')}</th>
                      <th>{t('profile.tableStatus')}</th>
                      <th>{t('profile.tableDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedLessons().map((lesson) => {
                      const dictationPct = lesson.userProgress?.dictation?.progressPct || 0
                      const shadowingPct = lesson.userProgress?.shadowing?.progressPct || 0
                      const status = getOverallStatus(lesson)
                      return (
                        <tr key={lesson._id}>
                          <td style={{ fontWeight: 600 }}>{lesson.title}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-surface-container)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                <div style={{ width: `${dictationPct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '35px' }}>{dictationPct}%</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-surface-container)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                <div style={{ width: `${shadowingPct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '35px' }}>{shadowingPct}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`hm-status-pill ${status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : 'not_started'}`}>
                              {status === 'completed' ? t('profile.completed') : status === 'in_progress' ? t('profile.learning') : t('profile.notStarted')}
                            </span>
                          </td>
                          <td>{formatDate(lesson.lastStudiedAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    currentPage={lessonPage}
                    totalPages={Math.ceil(filteredLessons.length / 7)}
                    onPageChange={handleLessonPageChange}
                  />
                </div>
              </>
            ) : (
              <div className="hm-empty">{t('profile.noLessonHistory')}</div>
            )
          )}


          {/* Tab 3: Battle History */}
          {activeTab === 'battle' && (
            battleLoading ? (
              <div className="hm-loading-state">{t('profile.loading')}</div>
            ) : filteredBattles.length > 0 ? (
              <>
                <table className="hm-table">
                  <thead>
                    <tr>
                      <th>{t('profile.tableMode')}</th>
                      <th>{t('profile.tableType')}</th>
                      <th>{t('profile.tableResult')}</th>
                      <th>{t('profile.tableScore')}</th>
                      <th>{t('profile.tableCorrectCount')}</th>
                      <th>{t('profile.tableDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedBattles().map((match, idx) => {
                      const playerData = match.players?.find(p => p.userId?._id === user?.id)
                      const userScore = playerData?.score ?? 0
                      const userCorrectCount = playerData?.correctCount ?? 0
                      const winnerId = typeof match.winnerId === 'object' ? match.winnerId?._id : match.winnerId
                      const isWinner = winnerId === user?.id
                      const isDraw = match.winnerId === null
                      return (
                        <tr
                          key={match._id || idx}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewBattleDetail(match._id)}
                        >
                          <td style={{ fontWeight: 600 }}>
                            {match.mode === 'mcq' ? t('battle.modeMcq') : t('battle.modeTyping')}
                          </td>
                          <td>
                            {match.matchType === 'queue' ? t('battle.typeQueue') : t('battle.typeInvite')}
                          </td>
                          <td>
                            <span className={`hm-status-pill ${isDraw ? 'draw' : isWinner ? 'completed' : 'in_progress'}`}>
                              {isDraw ? t('profile.draw') : isWinner ? t('profile.win') : t('profile.lose')}
                            </span>
                          </td>
                          <td>{userScore}</td>
                          <td>{userCorrectCount}</td>
                          <td>{formatDate(match.finishedAt || match.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    currentPage={battlePage}
                    totalPages={Math.ceil(filteredBattles.length / 10)}
                    onPageChange={handleBattlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="hm-empty">{t('profile.noBattleHistory')}</div>
            )
          )}
        </div>
      </div>

      {/* Match Detail Modal */}
      {isDetailOpen && (
        <MatchDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedMatchId(null)
          }}
          matchId={selectedMatchId}
        />
      )}
    </div>
  )
}

export default HistoryModal