import { useMemo, useState } from 'react'
import { FilterChips } from './components/FilterChips'
import { MetaKeywordPanel } from './components/MetaKeywordPanel'
import { PromptResults } from './components/PromptResults'
import { SlotBoard } from './components/SlotBoard'
import keywordCatalog from './data/keywordCatalog.json'
import { buildPrompt } from './lib/promptBuilder'
import { drawSlots, filterKeywords } from './lib/slotMachine'
import { CATEGORY_ORDER, DIFFICULTY_ORDER, type Category, type Difficulty, type KeywordItem } from './types'

const catalog = keywordCatalog as KeywordItem[]
const MAX_SELECTED = 3

function App() {
  const [category, setCategory] = useState<Category | '전체'>('전체')
  const [difficulty, setDifficulty] = useState<Difficulty | '전체'>('전체')
  const [slots, setSlots] = useState<KeywordItem[]>(() => drawSlots(catalog))
  const [selected, setSelected] = useState<KeywordItem[]>([])
  const [selectedMeta, setSelectedMeta] = useState<string[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [notice, setNotice] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredCatalog = useMemo(
    () => filterKeywords(catalog, category, difficulty),
    [category, difficulty],
  )
  const categoryCounts = useMemo(
    () => CATEGORY_ORDER.reduce((result, current) => ({ ...result, [current]: catalog.filter((item) => item.category === current).length }), {} as Record<Category, number>),
    [],
  )
  const activeKeyword = selected.at(-1)
  const prompt = useMemo(
    () => buildPrompt({
      primaryKeyword: activeKeyword?.keyword,
      selectedKeywords: selected.map((item) => item.keyword),
      metaKeywords: selectedMeta,
      category: activeKeyword?.category,
      difficulty,
    }),
    [activeKeyword, selected, selectedMeta, difficulty],
  )

  const spin = () => {
    if (isRolling) return
    if (filteredCatalog.length === 0) {
      setNotice('현재 조건에 맞는 키워드가 없습니다. 필터를 넓혀 다시 시도해 주세요.')
      return
    }
    setIsRolling(true)
    setSelected([])
    setSelectedMeta([])
    setNotice('슬롯이 멈춘 뒤 마음에 드는 소재를 최대 3개까지 골라보세요.')

    let tick = 0
    const interval = window.setInterval(() => {
      setSlots(drawSlots(filteredCatalog))
      tick += 1
      if (tick >= 6) window.clearInterval(interval)
    }, 85)

    window.setTimeout(() => {
      window.clearInterval(interval)
      setSlots(drawSlots(filteredCatalog))
      setIsRolling(false)
    }, 740)
  }

  const toggleKeyword = (item: KeywordItem) => {
    const existing = selected.find((candidate) => candidate.keyword === item.keyword)
    if (existing) {
      setSelected((current) => current.filter((candidate) => candidate.keyword !== item.keyword))
      setNotice('소재 선택을 해제했습니다.')
      return
    }
    if (selected.length >= MAX_SELECTED) {
      setNotice(`소재는 최대 ${MAX_SELECTED}개까지 선택할 수 있습니다. 하나를 해제한 뒤 선택해 주세요.`)
      return
    }
    setSelected((current) => [...current, item])
    setSelectedMeta([])
    setNotice(`“${item.keyword}”을(를) 선택했습니다. 아래에서 장면 요소를 더해보세요.`)
  }

  const toggleMetaKeyword = (keyword: string) => {
    setSelectedMeta((current) => current.includes(keyword)
      ? current.filter((item) => item !== keyword)
      : [...current, keyword])
  }

  const addMetaKeyword = (keyword: string) => {
    setSelectedMeta((current) => current.includes(keyword) ? current : [...current, keyword])
  }

  const copyText = (id: string, value: string) => {
    const fallbackCopy = () => {
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(value).catch(fallbackCopy)
    } else {
      fallbackCopy()
    }
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="키워드 슬롯 홈">
          <span className="brand-mark"><i /> <i /> <i /></span>
          <span>키워드 슬롯</span>
        </a>
        <div className="topbar-note">SALES-BASED IDEA GENERATOR <b>•</b> BETA 01</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow lime">판매 데이터에서 출발하는 그림 아이디어</p>
          <h1>오늘의 소재를<br /><em>돌려보세요.</em></h1>
          <p>실제로 판매된 키워드를 슬롯으로 뽑고, 나만의 메타키워드로 장면을 조립해 따라 그릴 밑그림 프롬프트를 만듭니다.</p>
          <div className="hero-stats">
            <span><b>3,010</b> 고유 키워드</span>
            <span><b>12</b> 소재 카테고리</span>
            <span><b>8,691</b> 판매 언급</span>
          </div>
        </div>
        <aside className="hero-card">
          <p className="eyebrow">HOW IT WORKS</p>
          <ol>
            <li><b>01</b><span>필터를 골라 25개 소재를 돌립니다.</span></li>
            <li><b>02</b><span>마음에 드는 소재와 장면 요소를 고릅니다.</span></li>
            <li><b>03</b><span>반투명 벡터 밑그림 프롬프트를 복사합니다.</span></li>
          </ol>
        </aside>
      </section>

      <section className="control-deck" aria-label="슬롯 조건 설정">
        <div className="control-title">
          <p className="eyebrow">STEP 01 · SET THE REEL</p>
          <h2>어떤 그림 소재를 찾고 있나요?</h2>
          <p>카테고리와 난이도를 좁힐수록 원하는 소재에 가까워집니다.</p>
        </div>
        <div className="filters">
          <FilterChips label="카테고리" options={CATEGORY_ORDER} value={category} onChange={setCategory} counts={categoryCounts} />
          <FilterChips label="드로잉 난이도" options={DIFFICULTY_ORDER} value={difficulty} onChange={setDifficulty} />
          <div className="spin-row">
            <span>{filteredCatalog.length.toLocaleString()}개 후보</span>
            <button className="spin-button" onClick={spin} disabled={isRolling}>
              <span>{isRolling ? 'REELING…' : 'SPIN 25'}</span>
              <b>↻</b>
            </button>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="workspace-main">
          <SlotBoard
            slots={slots}
            selectedKeywords={selected.map((item) => item.keyword)}
            isRolling={isRolling}
            onToggle={toggleKeyword}
          />
          {notice ? <p className="notice" role="status">{notice}</p> : null}
        </div>
        <aside className="selection-dock">
          <p className="eyebrow">YOUR PICKS · {selected.length}/{MAX_SELECTED}</p>
          {selected.length ? (
            <div className="selected-list">
              {selected.map((item, index) => (
                <button key={item.keyword} onClick={() => toggleKeyword(item)} className="selected-chip" title="선택 해제">
                  <span>{index + 1}</span>{item.keyword}<b>×</b>
                </button>
              ))}
            </div>
          ) : <p className="selection-empty">아직 선택한 소재가 없습니다.<br />슬롯 카드를 눌러 보세요.</p>}
          <div className="data-source">
            <span>DATA NOTE</span>
            <p>판매 언급 횟수가 많을수록 슬롯에서 나올 확률이 조금 더 높습니다.</p>
          </div>
        </aside>
      </section>

      <section className="builder-section">
        <MetaKeywordPanel
          activeKeyword={activeKeyword}
          selectedMeta={selectedMeta}
          onToggle={toggleMetaKeyword}
          onAdd={addMetaKeyword}
        />
        <PromptResults output={prompt} copiedId={copiedId} onCopy={copyText} />
      </section>

      <footer>
        <span>KEYWORD SLOT / 판매 키워드 기반 창작 보조 도구</span>
        <span>이미지는 생성하지 않으며, 프롬프트만 제공합니다.</span>
      </footer>
    </main>
  )
}

export default App
