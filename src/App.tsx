import { useMemo, useState } from 'react'
import { FilterChips } from './components/FilterChips'
import { FlowerMascot } from './components/FlowerMascot'
import { ImageCropTool } from './components/ImageCropTool'
import { PromptResults } from './components/PromptResults'
import { SlotBoard } from './components/SlotBoard'
import keywordCatalog from './data/keywordCatalog.json'
import { buildPrompt } from './lib/promptBuilder'
import { drawSlots, filterKeywords } from './lib/slotMachine'
import { MONTH_OPTIONS, type KeywordItem, type SaleMonth } from './types'

const catalog = keywordCatalog as KeywordItem[]
const MAX_SELECTED = 1
const catalogStats = {
  keywords: catalog.length,
  months: new Set(catalog.flatMap((item) => item.salesMonths)).size,
  salesMentions: catalog.reduce((total, item) => total + item.salesCount, 0),
}

function formatSaleDate(value?: string): string {
  return value ? value.replaceAll('-', '.') : '날짜 미확인'
}

function App() {
  const [saleMonth, setSaleMonth] = useState<SaleMonth | '전체'>('전체')
  const [slots, setSlots] = useState<KeywordItem[]>(() => drawSlots(catalog))
  const [selected, setSelected] = useState<KeywordItem[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [notice, setNotice] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredCatalog = useMemo(() => filterKeywords(catalog, saleMonth), [saleMonth])
  const monthCounts = useMemo(
    () => MONTH_OPTIONS.reduce((result, month) => ({
      ...result,
      [month]: catalog.filter((item) => item.salesMonths.includes(month)).length,
    }), {} as Record<SaleMonth, number>),
    [],
  )
  const activeKeyword = selected.at(-1)
  const prompt = useMemo(
    () => buildPrompt({
      primaryKeyword: activeKeyword?.keyword,
      primaryKeywordEnglish: activeKeyword?.englishKeyword,
      selectedKeywords: selected.map((item) => item.keyword),
      salesDates: activeKeyword?.salesDates,
    }),
    [activeKeyword, selected],
  )

  const changeSaleMonth = (month: SaleMonth | '전체') => {
    if (isRolling) return
    const pool = filterKeywords(catalog, month)
    setSaleMonth(month)
    setSlots(drawSlots(pool))
    setSelected([])
    setNotice(month === '전체'
      ? '전체 판매 기간의 키워드를 표시합니다.'
      : `${month}에 실제 판매된 키워드만 표시합니다. 원하는 소재를 골라보세요.`)
  }

  const spin = () => {
    if (isRolling) return
    if (filteredCatalog.length === 0) {
      setNotice('선택한 월에 판매된 키워드가 없습니다. 다른 월을 선택해 주세요.')
      return
    }
    setIsRolling(true)
    setSelected([])
    setNotice('릴이 멈추면 마음에 드는 판매 키워드 하나를 골라 요소 가이드라인을 만들어 보세요.')

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
      setSelected([])
      setNotice('소재 선택을 해제했습니다.')
      return
    }
    setSelected([item])
    setNotice(`“${item.keyword}”을(를) 선택했습니다. 최근 판매일은 ${formatSaleDate(item.salesDates.at(-1))}입니다.`)
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
    <main className="app-shell">
      <aside className="studio-rail" aria-label="키워드 슬롯 도구">
        <a className="brand rail-brand" href="#top" aria-label="키워드 슬롯 홈">
          <span className="brand-mark"><i /> <i /> <i /></span>
          <span><b>키워드</b> 슬롯</span>
        </a>
        <div className="rail-copy">
          <p className="eyebrow">SALES KEYWORD TOOL</p>
          <h2>판매 월부터,<br />소재를 고르세요.</h2>
          <p>실제 판매 날짜를 확인하며 한 가지 소재용 요소 가이드라인을 만듭니다.</p>
        </div>
        <nav className="rail-nav" aria-label="제작 단계">
          <a className="active" href="#month-filter"><span>●</span> 판매 월 고르기</a>
          <a href="#slot-board"><span>✦</span> 키워드 돌리기</a>
          <a href="#prompt-output"><span>▦</span> 가이드라인 복사</a>
        </nav>
        <ImageCropTool />
        <div className="rail-tip">
          <span>☀</span>
          <div><b>작은 팁</b><p>판매 월을 고르면 해당 월의 키워드만 볼 수 있어요.</p></div>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <a className="brand mobile-brand" href="#top" aria-label="키워드 슬롯 홈">
            <span className="brand-mark"><i /> <i /> <i /></span>
            <span>키워드 슬롯</span>
          </a>
          <div className="breadcrumb">OFFLINE CREATIVE TOOL <b>›</b> <strong>월별 판매 키워드</strong></div>
          <div className="topbar-note">✦ 브라우저 안에서 바로 만들어요</div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow blue">SALES MONTH TO SKETCH</p>
            <h1>판매 월을 고르고<br /><em>그리고 싶은 소재</em>를<br />먼저 만나보세요.</h1>
            <p>실제 판매 날짜가 연결된 키워드를 월별로 돌리고, 마음에 드는 소재 하나를 요소 가이드라인으로 바로 완성합니다.</p>
            <div className="hero-stats">
              <span><b>{catalogStats.keywords.toLocaleString()}</b> 고유 키워드</span>
              <span><b>{catalogStats.months}</b> 판매 월</span>
              <span><b>{catalogStats.salesMentions.toLocaleString()}</b> 판매 언급</span>
            </div>
          </div>
          <aside className="hero-card" aria-label="플라워 마스코트 안내">
            <div className="hero-orbit orbit-one">▦ DATE</div>
            <div className="hero-orbit orbit-two">● MONTH</div>
            <div className="hero-orbit orbit-three">✎ GUIDE</div>
            <FlowerMascot className="hero-mascot" />
            <div className="hero-card-copy"><span>SALES KEYWORD NOTE</span><b>판매 이력과 함께<br />아이디어를 피워요.</b></div>
          </aside>
        </section>

        <section className="control-deck" id="month-filter" aria-label="판매 월 설정">
          <div className="control-title">
            <p className="eyebrow">01 · SALES MONTH</p>
            <h2>어느 달의<br />판매 키워드를<br />찾고 있나요?</h2>
            <p>1월부터 12월까지 버튼을 누르면 해당 월에 실제 판매된 소재만 추출합니다.</p>
          </div>
          <div className="filters">
            <FilterChips label="판매 월" options={MONTH_OPTIONS} value={saleMonth} onChange={changeSaleMonth} counts={monthCounts} />
            <div className="spin-row">
              <span>{saleMonth === '전체' ? '전체 판매 기간' : saleMonth} · {filteredCatalog.length.toLocaleString()}개 소재 준비됨</span>
              <button className="spin-button" onClick={spin} disabled={isRolling}>
                <span>{isRolling ? '키워드 조합 중…' : '키워드 25개 돌리기'}</span>
                <b>↻</b>
              </button>
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="workspace-main">
            <SlotBoard
              slots={slots}
              saleMonth={saleMonth}
              selectedKeywords={selected.map((item) => item.keyword)}
              isRolling={isRolling}
              onToggle={toggleKeyword}
            />
            {notice ? <p className="notice" role="status">✦ {notice}</p> : null}
          </div>
          <aside className="selection-dock">
            <FlowerMascot className="dock-mascot" label="선택 소재 안내 플라워 마스코트" />
            <p className="eyebrow">YOUR PICK · {selected.length}/{MAX_SELECTED}</p>
            {selected.length ? (
              <div className="selected-list">
                {selected.map((item) => (
                  <button key={item.keyword} onClick={() => toggleKeyword(item)} className="selected-chip" title="선택 해제">
                    <span>1</span>{item.keyword}<b>×</b>
                  </button>
                ))}
              </div>
            ) : <p className="selection-empty">아직 선택한 소재가 없어요.<br />아래 카드에서 마음에 드는<br />소재를 골라보세요.</p>}
            {activeKeyword ? <div className="selection-sales"><span>RECENT SALE</span><b>{formatSaleDate(activeKeyword.salesDates.at(-1))}</b><p>판매일 {activeKeyword.salesDates.length}일 · 언급 {activeKeyword.salesCount}회</p></div> : null}
            <div className="data-source">
              <span>DATA NOTE</span>
              <p>선택한 월에 실제로 판매된 키워드만 슬롯 후보에 포함합니다.</p>
            </div>
          </aside>
        </section>

        <section className="builder-section">
          <PromptResults output={prompt} copiedId={copiedId} onCopy={copyText} />
        </section>

        <footer>
          <span>KEYWORD SLOT / 월별 판매 키워드 기반 창작 보조 도구</span>
          <span>이미지는 생성하지 않으며, 요소 가이드라인 프롬프트만 제공합니다.</span>
        </footer>
      </div>
    </main>
  )
}

export default App
