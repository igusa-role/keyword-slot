import type { PromptOutput } from '../types'

interface PromptResultsProps {
  output: PromptOutput | null
  copiedId: string | null
  onCopy: (id: string, value: string) => void
}

const blocks: Array<{ key: keyof PromptOutput; label: string; description: string; code?: boolean }> = [
  { key: 'koreanDescription', label: '한글 요소 설명', description: '단일 요소 구성을 빠르게 점검하세요.' },
  { key: 'englishPrompt', label: '영어 요소 가이드라인', description: '외부 이미지 생성 도구에 붙여 넣으세요.', code: true },
  { key: 'negativePrompt', label: '네거티브 프롬프트', description: '라인아트와 충돌하는 표현을 제외합니다.', code: true },
  { key: 'settingSummary', label: '설정 요약', description: '현재 선택값과 요소 가이드라인입니다.' },
]

export function PromptResults({ output, copiedId, onCopy }: PromptResultsProps) {
  return (
    <section className="prompt-panel" id="prompt-output">
      <div className="panel-header">
        <div>
          <p className="eyebrow">STEP 03 · ELEMENT GUIDELINE</p>
          <h2>요소 가이드라인을 완성하세요</h2>
        </div>
        {output ? <span className="ready-badge">READY TO COPY</span> : null}
      </div>
      <div className="guideline-note"><span>○</span><b>검정 외곽선 · 단일 요소</b><small>색 채움 없이 필요한 내부선만 사용합니다.</small></div>
      {output ? (
        <div className="prompt-results">
          {blocks.map((block) => (
            <article className="prompt-card" key={block.key}>
              <div className="prompt-card-top">
                <div>
                  <h3>{block.label}</h3>
                  <p>{block.description}</p>
                </div>
                <button onClick={() => onCopy(block.key, output[block.key])} className="copy-button">
                  {copiedId === block.key ? '복사됨' : '복사'}
                </button>
              </div>
              <p className={block.code ? 'prompt-text code' : 'prompt-text'}>{output[block.key]}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-prompt">
          <div className="prompt-icon">○</div>
          <h3>요소 가이드라인을 준비하세요</h3>
          <p>슬롯에서 소재를 고르고 메타키워드를 더하면, 검정 외곽선 기반의 단일 요소 가이드라인이 자동으로 조립됩니다.</p>
        </div>
      )}
    </section>
  )
}
