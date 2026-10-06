import { useMemo, useState } from 'react'
import { FilterChips } from './components/FilterChips'
import { FlowerMascot } from './components/FlowerMascot'
import { ImageCropTool } from './components/ImageCropTool'
import { MetaKeywordPanel } from './components/MetaKeywordPanel'
import { PromptResults } from './components/PromptResults'
import { SlotBoard } from './components/SlotBoard'
import keywordCatalog from './data/keywordCatalog.json'
import { translateMetaKeyword } from './data/metaKeywords'
import { buildPrompt } from './lib/promptBuilder'
import { drawSlots, filterKeywords } from './lib/slotMachine'
import { CATEGORY_ORDER, DIFFICULTY_ORDER, type Category, type Difficulty, type IllustrationStyle, type KeywordItem } from './types'

const catalog = keywordCatalog as KeywordItem[]
const MAX_SELECTED = 1
const catalogStats = {
  keywords: catalog.length,
  categories: new Set(catalog.map((item) => item.category)).size,
  salesMentions: catalog.reduce((total, item) => total + item.salesCount, 0),
}

function App() {
  const [category, setCategory] = useState<Category | '전체'>('전체')
  const [difficulty, setDifficulty] = useState<Difficulty | '전체'>('전체')
  const [slots, setSlots] = useState<KeywordItem[]>(() => drawSlots(catalog))
  const [selected, setSelected] = useState<KeywordItem[]>([])
  const [metaByKeyword, setMetaByKeyword] = useState<Record<string, string[]>>({})
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>('fill')
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
  const activeMeta = activeKeyword ? metaByKeyword[activeKeyword.keyword] ?? [] : []
  const allMeta = useMemo(
    () => selected.flatMap((item) => metaByKeyword[item.keyword] ?? []),
    [selected, metaByKeyword],
  )
  const allMetaEnglish = useMemo(
    () => selected.flatMap((item) => (metaByKeyword[item.keyword] ?? [])
      .map((keyword) => translateMetaKeyword(item.category, keyword))),
    [selected, metaByKeyword],
  )
  const prompt = useMemo(
    () => buildPrompt({
      primaryKeyword: activeKeyword?.keyword,
      primaryKeywordEnglish: activeKeyword?.englishKeyword,
      selectedKeywords: selected.map((item) => item.keyword),
      metaKeywords: allMeta,
      metaKeywordsEnglish: allMetaEnglish,
      category: activeKeyword?.category,
      difficulty: activeKeyword?.difficulty ?? '보통',
      style: illustrationStyle,
    }),
    [activeKeyword, selected, allMeta, allMetaEnglish, illustrationStyle],
  )

  const spin = () => {
    if (isRolling) return
    if (filteredCatalog.length === 0) {
      setNotice('현재 조건에 맞는 키워드가 없습니다. 필터를 넓혀 다시 시도해 주세요.')
      return
    }
    setIsRolling(true)
    setSelected([])
    setMetaByKeyword({})
      setNotice('릴이 멈추면 마음에 드는 소재 하나를 골라 독립된 일러스트로 만들어 보세요.')

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
      setMetaByKeyword((current) => {
        const { [item.keyword]: _removed, ...remaining } = current
        return remaining
      })
      setNotice('소재 선택을 해제했습니다.')
      return
    }
    if (selected.length >= MAX_SELECTED) {
      setSelected([item])
      setMetaByKeyword({ [item.keyword]: [] })
      setNotice(`대표 소재를 “${item.keyword}”으로 변경했습니다. 이 소재 하나로 독립된 일러스트를 만듭니다.`)
      return
    }
    setSelected((current) => [...current, item])
    setMetaByKeyword((current) => ({ ...current, [item.keyword]: current[item.keyword] ?? [] }))
    setNotice(`“${item.keyword}”을(를) 선택했습니다. 아래에서 이 소재의 표현 요소를 더해보세요.`)
  }

  const toggleMetaKeyword = (keyword: string) => {
    if (!activeKeyword) return
    setMetaByKeyword((current) => {
      const currentMeta = current[activeKeyword.keyword] ?? []
      return {
        ...current,
        [activeKeyword.keyword]: currentMeta.includes(keyword)
          ? currentMeta.filter((item) => item !== keyword)
          : [...currentMeta, keyword],
      }
    })
  }

  const addMetaKeyword = (keyword: string) => {
    if (!activeKeyword) return
    setMetaByKeyword((current) => {
      const currentMeta = current[activeKeyword.keyword] ?? []
      return {
        ...current,
        [activeKeyword.keyword]: currentMeta.includes(keyword) ? currentMeta : [...currentMeta, keyword],
      }
    })
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

  const changeIllustrationStyle = (style: IllustrationStyle) => {
    setIllustrationStyle(style)
    setCopiedId(null)
    setNotice(style === 'outline'
      ? '선 있는 버전을 선택했습니다. 검정 라인아트 프롬프트로 바뀝니다.'
      : '선 없는 버전을 선택했습니다. 단색 색면 프롬프트로 바뀝니다.')
  }

  return (
    <main className="app-shell">
      <aside className="studio-rail" aria-label="키워드 슬롯 도구">
        <a className="brand rail-brand" href="#top" aria-label="키워드 슬롯 홈">
          <span className="brand-mark"><i /> <i /> <i /></span>
          <span><b>키워드</b> 슬롯</span>
        </a>
        <div className="rail-copy">
          <p className="eyebrow">CREATIVE TOOL</p>
          <h2>그림보다 먼저,<br />장면을 고르세요.</h2>
          <p>판매된 키워드에서 나만의 플랫 벡터 일러스트 프롬프트를 만듭니다.</p>
        </div>
        <nav className="rail-nav" aria-label="제작 단계">
          <a className="active" href="#slot-board"><span>✦</span> 키워드 돌리기</a>
          <a href="#meta-keywords"><span>✎</span> 장면 요소 더하기</a>
          <a href="#prompt-output"><span>▦</span> 프롬프트 복사</a>
        </nav>
        <ImageCropTool />
        <div className="rail-tip">
          <span>☀</span>
          <div><b>작은 팁</b><p>소재 하나만 고르면 이미지가 또렷해져요.</p></div>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <a className="brand mobile-brand" href="#top" aria-label="키워드 슬롯 홈">
            <span className="brand-mark"><i /> <i /> <i /></span>
            <span>키워드 슬롯</span>
          </a>
          <div className="breadcrumb">OFFLINE CREATIVE TOOL <b>›</b> <strong>키워드 프롬프트</strong></div>
          <div className="topbar-note">✦ 브라우저 안에서 바로 만들어요</div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow blue">KEYWORD TO SKETCH</p>
            <h1>키워드를 조합해<br /><em>그리고 싶은 장면</em>을<br />먼저 만나보세요.</h1>
            <p>판매 데이터에서 찾은 그림 소재를 돌리고, 장면 요소를 더해, 귀엽고 선명한 플랫 벡터 일러스트 프롬프트로 바로 완성합니다.</p>
            <div className="hero-stats">
              <span><b>{catalogStats.keywords.toLocaleString()}</b> 고유 키워드</span>
              <span><b>{catalogStats.categories}</b> 소재 카테고리</span>
              <span><b>{catalogStats.salesMentions.toLocaleString()}</b> 판매 언급</span>
            </div>
          </div>
          <aside className="hero-card" aria-label="플라워 마스코트 안내">
            <div className="hero-orbit orbit-one">▦ PLAN</div>
            <div className="hero-orbit orbit-two">● COLOR</div>
            <div className="hero-orbit orbit-three">✎ STICKER</div>
            <FlowerMascot className="hero-mascot" />
            <div className="hero-card-copy"><span>CREATOR POP PALETTE</span><b>꽃 친구와 함께<br />아이디어를 피워요.</b></div>
          </aside>
        </section>

        <section className="control-deck" aria-label="슬롯 조건 설정">
          <div className="control-title">
            <p className="eyebrow">01 · IDEA BRIEF</p>
            <h2>어떤 소재를<br />찾고 있나요?</h2>
            <p>카테고리와 난이도를 좁힐수록 원하는 그림 소재에 가까워집니다.</p>
          </div>
          <div className="filters">
            <FilterChips label="카테고리" options={CATEGORY_ORDER} value={category} onChange={setCategory} counts={categoryCounts} />
            <FilterChips label="드로잉 난이도" options={DIFFICULTY_ORDER} value={difficulty} onChange={setDifficulty} />
            <div className="spin-row">
              <span>{filteredCatalog.length.toLocaleString()}개 소재 준비됨</span>
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
              selectedKeywords={selected.map((item) => item.keyword)}
              isRolling={isRolling}
              onToggle={toggleKeyword}
            />
            {notice ? <p className="notice" role="status">✦ {notice}</p> : null}
          </div>
          <aside className="selection-dock">
            <FlowerMascot className="dock-mascot" label="선택 소재 안내 플라워 마스코트" />
            <p className="eyebrow">YOUR PICKS · {selected.length}/{MAX_SELECTED}</p>
            {selected.length ? (
              <div className="selected-list">
                {selected.map((item, index) => (
                  <button key={item.keyword} onClick={() => toggleKeyword(item)} className="selected-chip" title="선택 해제">
                    <span>{index + 1}</span>{item.keyword}<b>×</b>
                  </button>
                ))}
              </div>
            ) : <p className="selection-empty">아직 선택한 소재가 없어요.<br />아래 카드에서 마음에 드는<br />소재를 골라보세요.</p>}
            <div className="data-source">
              <span>DATA NOTE</span>
              <p>판매 언급 횟수가 많을수록 슬롯에서 나올 확률이 조금 더 높습니다.</p>
            </div>
          </aside>
        </section>

        <section className="builder-section">
          <MetaKeywordPanel
            activeKeyword={activeKeyword}
            selectedMeta={activeMeta}
            onToggle={toggleMetaKeyword}
            onAdd={addMetaKeyword}
          />
          <PromptResults
            output={prompt}
            style={illustrationStyle}
            copiedId={copiedId}
            onStyleChange={changeIllustrationStyle}
            onCopy={copyText}
          />
        </section>

        <footer>
          <span>KEYWORD SLOT / 판매 키워드 기반 창작 보조 도구</span>
          <span>이미지는 생성하지 않으며, 프롬프트만 제공합니다.</span>
        </footer>
      </div>
    </main>
  )
}

export default App
