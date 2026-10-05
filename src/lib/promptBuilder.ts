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
    koreanDescription: `주제는 ${primaryKeyword}${companionKorean}입니다. ${category ?? '창작'} 카테고리의 소재를 중심으로 ${detailKorean}을 반영합니다. 핑크 플라워 마스코트의 친근한 분위기와 코발트 블루·그린·옐로·핑크 포인트를 더한 ${difficulty} 난이도의 단순한 장면으로 구성합니다.`,
    englishPrompt: `A clean, easy-to-trace illustration of ${primaryKeywordEnglish}${companionEnglishText}. Include ${detailEnglish}. Use a simple centered composition, clear silhouette, generous negative space, and a tiny friendly five-petal flower companion mascot only where it supports the subject. Clean 2D vector line art with rounded, slightly hand-drawn dark ink contours and simple geometric shapes. Use soft semi-transparent flat color accents at approximately 50% opacity: cobalt blue #1358D5, clover green #42B875, sunshine yellow #FFC928, blush pink #F4A5C7, and milk white #FFFDF8. Transparent background, low-contrast underdrawing appearance, designed as a traceable sketch reference. No shadows, no text, no photorealism.`,
    negativePrompt: 'photorealistic, 3D render, painting, glossy gradient, heavy shading, high contrast, complex background, crowded composition, text, watermark, logo, realistic texture, thin messy lines, multiple scenes, dark moody color palette',
    settingSummary: `카테고리: ${category ?? '미분류'} · 난이도: ${difficulty} · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 핑크 플라워 마스코트 / 코발트·그린·옐로·핑크 포인트 / 투명 배경 / 2D 벡터 선화 / 약 50% 불투명도 밑그림`,
  }
}
