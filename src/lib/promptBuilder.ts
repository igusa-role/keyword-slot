import type { Category, Difficulty, PromptOutput } from '../types'

interface PromptInput {
  primaryKeyword?: string
  primaryKeywordEnglish?: string
  selectedKeywords: string[]
  selectedKeywordsEnglish: string[]
  metaKeywords: string[]
  metaKeywordsEnglish: string[]
  category?: Category
  difficulty: Difficulty
}

export function buildPrompt({
  primaryKeyword,
  primaryKeywordEnglish,
  selectedKeywords,
  selectedKeywordsEnglish,
  metaKeywords,
  metaKeywordsEnglish,
  category,
  difficulty,
}: PromptInput): PromptOutput | null {
  if (!primaryKeyword || !primaryKeywordEnglish) return null

  const companions = selectedKeywords.filter((keyword) => keyword !== primaryKeyword)
  const companionEnglish = selectedKeywordsEnglish.filter((keyword) => keyword !== primaryKeywordEnglish)
  const details = metaKeywords.slice(0, 8)
  const detailsEnglish = metaKeywordsEnglish.slice(0, 8)
  const detailKorean = details.length ? details.join(', ') : '단순한 구도와 충분한 여백'
  const detailEnglish = detailsEnglish.length ? detailsEnglish.join(', ') : 'simple composition, generous negative space'
  const companionKorean = companions.length ? `, 함께 배치한 ${companions.join(', ')}` : ''
  const companionEnglishText = companionEnglish.length ? `, accompanied by ${companionEnglish.join(', ')}` : ''

  return {
    koreanDescription: `주제는 ${primaryKeyword}${companionKorean}입니다. ${category ?? '창작'} 카테고리의 소재를 중심으로 ${detailKorean}을 반영합니다. 따라 그리기 쉬운 ${difficulty} 난이도의 단순한 장면으로 구성합니다.`,
    englishPrompt: `A clean, easy-to-trace illustration of ${primaryKeywordEnglish}${companionEnglishText}. Include ${detailEnglish}. Simple centered composition, clear silhouette, minimal background. Clean 2D vector line art, transparent background, soft gray-blue low-contrast linework, approximately 50% opacity underdrawing appearance, thick smooth contour lines, simple geometric shapes, designed as a traceable sketch reference. No filled colors, no shadows, no text, no photorealism.`,
    negativePrompt: 'photorealistic, 3D render, painting, colored fills, heavy shading, high contrast, complex background, crowded composition, text, watermark, logo, realistic texture, thin messy lines, multiple scenes',
    settingSummary: `카테고리: ${category ?? '미분류'} · 난이도: ${difficulty} · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 투명 배경 / 2D 벡터 선화 / 저대비 밑그림 / 약 50% 불투명도 느낌`,
  }
}
