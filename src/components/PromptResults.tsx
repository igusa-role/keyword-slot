import type { IllustrationStyle, PromptOutput } from '../types'

interface PromptResultsProps {
  output: PromptOutput | null
  style: IllustrationStyle
  copiedId: string | null
  onStyleChange: (style: IllustrationStyle) => void
  onCopy: (id: string, value: string) => void
}

const blocks: Array<{ key: keyof PromptOutput; label: string; description: string; code?: boolean }> = [
  { key: 'koreanDescription', label: '한글 장면 설명', description: '장면 구성을 빠르게 점검하세요.' },
  { key: 'englishPrompt', label: '영어 이미지 생성 프롬프트', description: '외부 이미지 생성 도구에 붙여 넣으세요.', code: true },
  { key: 'negativePrompt', label: '네거티브 프롬프트', description: '선택한 그림체와 충돌하는 표현을 제외합니다.', code: true },
  { key: 'settingSummary', label: '설정 요약', description: '현재 선택값과 일러스트 스타일입니다.' },
]

export function PromptResults({ output, style, copiedId, onStyleChange, onCopy }: PromptResultsProps) {
  return (
    <section className="prompt-panel" id="prompt-output">
      <div className="panel-header">
        <div>
          <p className="eyebrow">STEP 03 · ILLUSTRATION PROMPT</p>
          <h2>그림체를 고르고 프롬프트를 완성하세요</h2>
        </div>
        {output ? <span className="ready-badge">READY TO COPY</span> : null}
      </div>
      <div className="style-selector" role="group" aria-label="일러스트 그림체 선택">
        <button
          type="button"
          className={style === 'outline' ? 'style-option active outline-style' : 'style-option outline-style'}
          aria-pressed={style === 'outline'}
          onClick={() => onStyleChange('outline')}
        >
          <span className="style-icon line-icon" aria-hidden="true">○</span>
          <span><b>선 있는 버전</b><small>검정 라인아트 · 색 채움 없음</small></span>
        </button>
        <button
          type="button"
          className={style === 'fill' ? 'style-option active fill-style' : 'style-option fill-style'}
          aria-pressed={style === 'fill'}
          onClick={() => onStyleChange('fill')}
        >
          <span className="style-icon fill-icon" aria-hidden="true">●</span>
          <span><b>선 없는 버전</b><small>단색 색면 · 외곽선 없음</small></span>
        </button>
      </div>
      {output ? (
        <div className="prompt-results">
          {blocks.map((block) => (
            <article className="prompt-card" key={block.key}>
              <div className="prompt-card-top">
                <div>
                  <h3>{block.label}</h3>
                  <p>{block.description}</p>
                </div>
                <button onClick={() => onCopy(`${style}-${block.key}`, output[block.key])} className="copy-button">
                  {copiedId === `${style}-${block.key}` ? '복사됨' : '복사'}
                </button>
              </div>
              <p className={block.code ? 'prompt-text code' : 'prompt-text'}>{output[block.key]}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-prompt">
          <div className="prompt-icon">✦</div>
          <h3>선 있는·없는 그림체를 골라보세요</h3>
          <p>위 버튼으로 그림체를 선택한 뒤 슬롯에서 소재를 고르면, 선택한 버전의 프롬프트가 자동으로 조립됩니다.</p>
        </div>
      )}
    </section>
  )
}
