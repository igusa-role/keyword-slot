import { useState } from 'react'
import { META_KEYWORDS } from '../data/metaKeywords'
import type { KeywordItem } from '../types'

interface MetaKeywordPanelProps {
  activeKeyword?: KeywordItem
  selectedMeta: string[]
  onToggle: (keyword: string) => void
  onAdd: (keyword: string) => void
}

export function MetaKeywordPanel({ activeKeyword, selectedMeta, onToggle, onAdd }: MetaKeywordPanelProps) {
  const [customKeyword, setCustomKeyword] = useState('')
  const options = activeKeyword ? META_KEYWORDS[activeKeyword.category] : []

  const submitCustomKeyword = () => {
    const value = customKeyword.trim()
    if (!value) return
    onAdd(value)
    setCustomKeyword('')
  }

  return (
    <section className="work-panel meta-panel" id="meta-keywords">
      <div className="panel-header">
        <div>
          <p className="eyebrow">STEP 02 · META KEYWORDS</p>
          <h2>{activeKeyword ? `${activeKeyword.keyword}을(를) 구체화하세요` : '먼저 슬롯에서 소재를 고르세요'}</h2>
        </div>
        <span className="counter-badge">{selectedMeta.length} 선택</span>
      </div>
      {activeKeyword ? (
        <>
          <p className="panel-description">
            <b>{activeKeyword.category}</b> 소재를 위한 20개의 제안입니다. 장면에 필요한 요소만 조합하세요.
          </p>
          <div className="meta-grid">
            {options.map((keyword) => {
              const selected = selectedMeta.includes(keyword)
              return (
                <button
                  className={selected ? 'meta-chip checked' : 'meta-chip'}
                  key={keyword}
                  onClick={() => onToggle(keyword)}
                  aria-pressed={selected}
                >
                  <span>{selected ? '✓' : '+'}</span>{keyword}
                </button>
              )
            })}
          </div>
          <div className="custom-meta">
            <input
              value={customKeyword}
              onChange={(event) => setCustomKeyword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitCustomKeyword()}
              placeholder="직접 메타키워드 입력"
              aria-label="직접 메타키워드 입력"
            />
            <button onClick={submitCustomKeyword}>추가</button>
          </div>
        </>
      ) : (
        <div className="empty-panel">
          <span>01</span>
          <p>25개 슬롯 중 마음에 드는 소재를 선택하면 관련 메타키워드 20개가 열립니다.</p>
        </div>
      )}
    </section>
  )
}
