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
  const detailKorean = details.length ? details.join(', ') : '단순한 구성과 넓은 여백'
  const detailEnglish = detailsEnglish.length ? detailsEnglish.join(', ') : 'a simple composition and generous negative space'
  const companionKorean = companions.length ? `, 함께 배치한 ${companions.join(', ')}` : ''
  const companionEnglishText = companionEnglish.length ? `, accompanied by ${companionEnglish.join(', ')}` : ''

  return {
    koreanDescription: `주제는 ${primaryKeyword}${companionKorean}입니다. ${category ?? '창작'} 카테고리의 소재를 중심으로 ${detailKorean}을 반영합니다. 귀엽고 유쾌한 2D 플랫 벡터 스티커/클립아트 스타일로, 단순한 형태와 명확한 실루엣을 사용해 ${difficulty} 난이도의 단일 일러스트로 구성합니다.`,
    englishPrompt: `Create an isolated single illustration of ${primaryKeywordEnglish}${companionEnglishText}. Include only these explicitly requested supporting details: ${detailEnglish}. Cute and playful 2D flat vector illustration style with simple, recognizable silhouettes, soft rounded shapes, and slightly irregular hand-drawn curves. Use moderately thick, natural black outlines, leaving some areas intentionally without outlines and using opaque solid color shapes to define the forms. Build a minimalist design from simple geometric shapes with exaggerated cute proportions, slightly imperfect whimsical forms, and a charming playful appearance. Focus on distinctive silhouettes rather than realistic details; simplify or omit unnecessary small elements. Use a limited palette of bright vibrant accent colors with deep black and dark charcoal tones, clean opaque solid color fills, clearly separated color areas, and strong visual contrast. Keep a casual hand-drawn digital sticker and clipart aesthetic: avoid overly polished or mechanically perfect vector shapes, and allow subtle asymmetry, organic curves, and natural proportion variation. No gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, or 3D effects. Use a mostly front-facing composition with generous negative space so the illustration remains clear, recognizable, and visually appealing at small sizes. Pure white or transparent background. Style keywords: cute flat vector illustration, playful hand-drawn clipart, bold simple shapes, slightly irregular outlines, minimal details, solid color fills, whimsical proportions, clean 2D sticker aesthetic, high contrast, charming imperfect shapes, modern digital clipart. Important: apply only the visual art style described above. Do not introduce any specific objects, characters, seasonal themes, symbols, decorations, or additional elements unless explicitly requested in the subject description.`,
    negativePrompt: 'gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, 3D effects, photorealism, painterly rendering, mechanically perfect vector shapes, low-contrast muddy colors, cluttered background, unrequested text, watermark, logo, unrequested object, unrequested character, unrequested seasonal theme, unrequested symbol, unrequested decoration, unrelated extra elements',
    settingSummary: `카테고리: ${category ?? '미분류'} · 난이도: ${difficulty} · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 귀여운 2D 플랫 벡터 / 자연스러운 블랙 외곽선 / 불투명 단색 채움 / 제한된 고대비 팔레트 / 흰색·투명 배경`,
  }
}
