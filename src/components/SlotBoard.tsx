import type { KeywordItem, SaleMonth } from '../types'

interface SlotBoardProps {
  slots: KeywordItem[]
  saleMonth: SaleMonth | '전체'
  selectedKeywords: string[]
  isRolling: boolean
  onToggle: (keyword: KeywordItem) => void
}

function formatSaleDate(value?: string): string {
  return value ? value.replaceAll('-', '.') : '날짜 미확인'
}

export function SlotBoard({ slots, saleMonth, selectedKeywords, isRolling, onToggle }: SlotBoardProps) {
  const heading = saleMonth === '전체' ? '전체 판매 키워드 25개' : `${saleMonth} 판매 키워드 25개`

  return (
    <section className="slot-stage" id="slot-board" aria-label="월별 판매 키워드 슬롯머신 결과">
      <div className="slot-stage-header">
        <div>
          <p className="eyebrow">5 × 5 SALES KEYWORD REELS</p>
          <h2>{heading}</h2>
        </div>
        <span className={isRolling ? 'rolling-status live' : 'rolling-status'}>
          <i /> {isRolling ? '릴 회전 중' : '릴 정지'}
        </span>
      </div>
      <div className={isRolling ? 'slot-grid spinning' : 'slot-grid'}>
        {slots.map((slot, index) => {
          const isSelected = selectedKeywords.includes(slot.keyword)
          const latestSaleDate = slot.salesDates.at(-1)
          return (
            <button
              key={`${slot.keyword}-${index}`}
              className={isSelected ? 'slot-card selected' : 'slot-card'}
              style={{ '--slot-index': index } as React.CSSProperties}
              onClick={() => onToggle(slot)}
              disabled={isRolling}
              aria-pressed={isSelected}
              data-sales-months={slot.salesMonths.join(',')}
              data-latest-sale={latestSaleDate}
              aria-label={`${slot.keyword}, 최근 판매 ${formatSaleDate(latestSaleDate)}, 판매일 ${slot.salesDates.length}일, 판매 언급 ${slot.salesCount}회${isSelected ? ', 선택됨' : ''}`}
            >
              <span className="slot-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{slot.keyword}</strong>
              <span className="slot-meta">
                <em>최근 {formatSaleDate(latestSaleDate)}</em>
                <b>판매일 {slot.salesDates.length}일</b>
              </span>
              <span className="slot-sales">판매 언급 {slot.salesCount}회</span>
            </button>
          )
        })}
      </div>
      <p className="slot-help">카드를 눌러 소재 하나를 선택하세요. 선택한 키워드의 실제 판매 날짜를 확인하고, 하나의 독립된 요소 가이드라인으로 만듭니다.</p>
    </section>
  )
}
