import type { KeywordItem } from '../types'

interface SlotBoardProps {
  slots: KeywordItem[]
  selectedKeywords: string[]
  isRolling: boolean
  onToggle: (keyword: KeywordItem) => void
}

const DIFFICULTY_MARK: Record<KeywordItem['difficulty'], string> = {
  쉬움: '●',
  보통: '●●',
  어려움: '●●●',
}

export function SlotBoard({ slots, selectedKeywords, isRolling, onToggle }: SlotBoardProps) {
  return (
    <section className="slot-stage" aria-label="키워드 슬롯머신 결과">
      <div className="slot-stage-header">
        <div>
          <p className="eyebrow">5 × 5 KEYWORD REELS</p>
          <h2>이번 회차의 그림 소재 25개</h2>
        </div>
        <span className={isRolling ? 'rolling-status live' : 'rolling-status'}>
          <i /> {isRolling ? '릴 회전 중' : '릴 정지'}
        </span>
      </div>
      <div className={isRolling ? 'slot-grid spinning' : 'slot-grid'}>
        {slots.map((slot, index) => {
          const isSelected = selectedKeywords.includes(slot.keyword)
          return (
            <button
              key={`${slot.keyword}-${index}`}
              className={isSelected ? 'slot-card selected' : 'slot-card'}
              style={{ '--slot-index': index } as React.CSSProperties}
              onClick={() => onToggle(slot)}
              disabled={isRolling}
              aria-pressed={isSelected}
            >
              <span className="slot-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{slot.keyword}</strong>
              <span className="slot-meta">
                <em>{slot.category}</em>
                <b title={`${slot.difficulty} 난이도`}>{DIFFICULTY_MARK[slot.difficulty]}</b>
              </span>
              <span className="slot-sales">판매 언급 {slot.salesCount}회</span>
            </button>
          )
        })}
      </div>
      <p className="slot-help">카드를 눌러 최대 3개의 소재를 선택하세요. 선택한 소재는 아래 프롬프트 작업대로 이어집니다.</p>
    </section>
  )
}
