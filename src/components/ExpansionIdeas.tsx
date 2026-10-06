interface ExpansionIdeasProps {
  keyword?: string
  expansions: string[]
  isLoading: boolean
}

const ideaSets = [
  [0, 1, 4],
  [2, 5, 7],
  [3, 6, 8, 9],
]

export function ExpansionIdeas({ keyword, expansions, isLoading }: ExpansionIdeasProps) {
  const ideas = ideaSets.map((set) => set.map((index) => expansions[index]).filter(Boolean))

  return (
    <section className="idea-panel" id="idea-output" aria-label="확장 키워드 그림 아이디어">
      <div className="panel-header">
        <div>
          <p className="eyebrow">STEP 02 · EXPANSION IDEAS</p>
          <h2>그림 아이디어를 넓혀보세요</h2>
        </div>
        {keyword ? <span className="idea-count">10 CONNECTED WORDS</span> : null}
      </div>

      {keyword && isLoading ? (
        <div className="empty-idea">
          <div>⋯</div>
          <h3>확장 키워드를 불러오는 중이에요</h3>
          <p>선택한 소재에 연결된 그림 아이디어를 준비하고 있습니다.</p>
        </div>
      ) : keyword && expansions.length ? (
        <>
          <div className="idea-origin">
            <span>SELECTED KEYWORD</span>
            <b>{keyword}</b>
            <p>함께 그려볼 수 있는 연관 소재를 골라 아이디어를 확장해 보세요.</p>
          </div>

          <div className="expansion-list" aria-label={`${keyword}의 확장 키워드`}>
            {expansions.map((expansion, index) => (
              <span className="expansion-chip" key={expansion}>
                <i>{String(index + 1).padStart(2, '0')}</i>{expansion}
              </span>
            ))}
          </div>

          <div className="idea-combinations">
            <p className="eyebrow">DRAWING IDEA COMBINATIONS</p>
            {ideas.map((idea, index) => (
              <article className="idea-combination" key={index}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p><b>{keyword}</b>{idea.map((term) => <em key={term}> + {term}</em>)}</p>
              </article>
            ))}
          </div>
          <p className="idea-note">확장 키워드는 아이디어 탐색용입니다. 아래 요소 가이드라인 프롬프트는 선택 소재 하나만 유지합니다.</p>
        </>
      ) : keyword ? (
        <div className="empty-idea">
          <div>!</div>
          <h3>확장 키워드를 찾지 못했어요</h3>
          <p>다른 키워드를 선택하거나 페이지를 새로고침해 다시 시도해 주세요.</p>
        </div>
      ) : (
        <div className="empty-idea">
          <div>✦</div>
          <h3>확장 아이디어를 준비하세요</h3>
          <p>룰렛에서 소재 하나를 고르면 연결된 확장 키워드 10개와 그림 아이디어 조합이 나타납니다.</p>
        </div>
      )}
    </section>
  )
}
