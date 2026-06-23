import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBattleSocket } from '../context/BattleSocketContext'
import { useAuth } from '../../../context/AuthContext'
import { getBattleHistory } from '../battleApi'
import QueueModal from '../components/QueueModal'
import RoomModal from '../components/RoomModal'
import MatchDetailModal from '../components/MatchDetailModal'
import '../battle.css'

const BattleLobbyPage = ({ onNavigate }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    gameStatus,
    roomCode,
    joinQueue,
    leaveQueue,
    createRoom,
    joinRoom,
    leaveRoom,
    rejoinMatch,
    error,
    setError
  } = useBattleSocket()

  const [selectedMode, setSelectedMode] = useState('mcq')
  const [inviteCode, setInviteCode] = useState('')
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  // States phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 5

  const getPageNumbers = () => {
    const pages = []
    const maxPageButtons = 5
    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      if (currentPage <= 3) {
        end = 4
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }
      if (start > 2) {
        pages.push('ellipsis-start')
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }
    return pages
  }

  // Tự động rejoin nếu còn trận đang hoạt động
  useEffect(() => {
    const savedMatchId = sessionStorage.getItem('currentMatchId')
    if (savedMatchId) {
      rejoinMatch(savedMatchId)
      onNavigate('/battle/play')
    }
    return () => {
      setError(null)
    }
  }, [])

  // Tải lịch sử đấu phân trang khi currentPage thay đổi
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true)
        const response = await getBattleHistory(currentPage, limit)
        if (response && response.data) {
          const items = response.data.items || []
          setHistory(items)
          
          const totalItems = response.data.total || 0
          setTotalPages(Math.ceil(totalItems / limit) || 1)
        }
      } catch (error) {
        console.error('Failed to load battle history', error)
      } finally {
        setLoadingHistory(false)
      }
    }

    if (user) {
      fetchHistory()
    }
  }, [user, currentPage])

  // Lắng nghe gameStatus thay đổi để điều hướng sang trang chơi game
  useEffect(() => {
    if (gameStatus === 'starting' || gameStatus === 'playing') {
      onNavigate('/battle/play')
    }
  }, [gameStatus])

  const handleQuickMatch = () => {
    joinQueue(selectedMode)
  }

  const handleCreateRoom = () => {
    createRoom(selectedMode)
  }

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault()
    if (!inviteCode.trim() || inviteCode.length !== 6) return
    joinRoom(inviteCode.toUpperCase())
  }

  const getOpponentName = (match) => {
    const myId = user?.id || user?._id
    const opponent = match.players.find(p => p.userId && p.userId._id !== myId)
    return opponent?.userId?.name || t('battle.anonymous')
  }

  const getMatchOutcome = (match) => {
    const myId = user?.id || user?._id
    if (!match.winnerId) return 'draw'
    const winnerId = match.winnerId._id || match.winnerId
    return winnerId === myId ? 'win' : 'lose'
  }

  const formatModeText = (modeVal) => {
    return modeVal === 'mcq' ? t('battle.modeMcq') : t('battle.modeTyping')
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="battle-lobby-container">
      {/* Cột trái: Khu vực chọn chế độ và hành động */}
      <div className="battle-lobby-main">
        <div className="battle-lobby-title-area">
          <h1 className="battle-lobby-title">{t('battle.lobbyTitle')}</h1>
          <p className="battle-lobby-subtitle">{t('battle.lobbySubtitle')}</p>
        </div>

        {error && (
          <div className="battle-error-banner">
            <span className="battle-error-message">{error}</span>
            <button className="battle-error-close-btn" onClick={() => setError(null)} aria-label="Close error">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        )}

        {/* Thẻ chọn chế độ chơi */}
        <div className="battle-modes-card">
          <h3 className="battle-panel-title">{t('battle.selectMode')}</h3>
          <div className="battle-mode-selection">
            <button
              className={`battle-mode-btn ${selectedMode === 'mcq' ? 'active' : ''}`}
              onClick={() => setSelectedMode('mcq')}
            >
              <span className="battle-mode-btn-title">{t('battle.modeMcq')}</span>
              <span className="battle-mode-btn-desc">{t('battle.modeMcqDesc')}</span>
            </button>
            <button
              className={`battle-mode-btn ${selectedMode === 'typing' ? 'active' : ''}`}
              onClick={() => setSelectedMode('typing')}
            >
              <span className="battle-mode-btn-title">{t('battle.modeTyping')}</span>
              <span className="battle-mode-btn-desc">{t('battle.modeTypingDesc')}</span>
            </button>
          </div>

          <div className="battle-action-buttons">
            <button className="btn-battle-primary" onClick={handleQuickMatch}>
              {t('battle.quickMatch')}
            </button>
            <button className="btn-battle-secondary" onClick={handleCreateRoom}>
              {t('battle.createRoom')}
            </button>
          </div>
        </div>

        {/* Lịch sử đấu */}
        <div className="battle-history-panel">
          <h3 className="battle-panel-title">{t('battle.historyTitle')}</h3>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div className="battle-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', margin: '0 auto' }}></div>
            </div>
          ) : history.length === 0 ? (
            <p className="battle-lobby-subtitle" style={{ textAlign: 'center', padding: '24px' }}>
              {t('battle.noHistory')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="battle-history-list">
                {history.map((match) => {
                  const outcome = getMatchOutcome(match)
                  const myId = user?.id || user?._id
                  const myRecord = match.players.find(p => p.userId && p.userId._id === myId) || { score: 0 }
                  const oppRecord = match.players.find(p => p.userId && p.userId._id !== myId) || { score: 0 }
                  return (
                    <div 
                      key={match._id} 
                      className="battle-history-item"
                      onClick={() => {
                        setSelectedMatchId(match._id)
                        setIsDetailOpen(true)
                      }}
                    >
                      <div className="battle-history-left">
                        <span className="battle-history-mode">
                          {formatModeText(match.mode)} ({match.matchType === 'queue' ? t('battle.typeQueue') : t('battle.typeInvite')})
                        </span>
                        <span className="battle-history-opp">
                          {t('battle.vs')}: {getOpponentName(match)}
                        </span>
                        <span className="battle-history-date">{formatDate(match.finishedAt)}</span>
                      </div>
                      <div className="battle-history-right">
                        <span className={`battle-history-badge battle-badge-${outcome}`}>
                          {outcome === 'win' ? t('battle.win') : outcome === 'lose' ? t('battle.lose') : t('battle.draw')}
                        </span>
                        <span className="battle-history-score">
                          {myRecord.score} - {oppRecord.score}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {totalPages > 1 && (
                <div className="battle-pagination-container">
                  <button 
                    className={`battle-pagination-btn battle-nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  {getPageNumbers().map((p, idx) => {
                    if (p === 'ellipsis-start' || p === 'ellipsis-end') {
                      return (
                        <span key={`ellipsis-${idx}`} className="battle-pagination-ellipsis">
                          ...
                        </span>
                      )
                    }
                    return (
                      <button
                        key={p}
                        className={`battle-pagination-btn battle-num-btn ${currentPage === p ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button 
                    className={`battle-pagination-btn battle-nav-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
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
          )}
        </div>
      </div>

      {/* Cột phải: Nhập mã phòng */}
      <div className="battle-lobby-sidebar">

        {/* Nhập mã phòng mời */}
        <div className="battle-user-stats-card">
          <h3 className="battle-panel-title" style={{ fontSize: '18px', marginBottom: '8px' }}>
            {t('battle.joinRoomTitle')}
          </h3>
          <form onSubmit={handleJoinRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              className="battle-invite-code-input"
              placeholder={t('battle.enterCodePlaceholder')}
              maxLength={6}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <button
              type="submit"
              className="btn-battle-primary"
              disabled={inviteCode.trim().length !== 6}
            >
              {t('battle.join')}
            </button>
          </form>
        </div>
      </div>

      {/* Modals ghép trận & tạo phòng */}
      <QueueModal
        isOpen={gameStatus === 'searching'}
        mode={selectedMode}
        onCancel={leaveQueue}
      />

      <RoomModal
        isOpen={gameStatus === 'room_waiting'}
        code={roomCode}
        onLeave={leaveRoom}
      />

      <MatchDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedMatchId(null)
        }}
        matchId={selectedMatchId}
      />
    </div>
  )
}

export default BattleLobbyPage
