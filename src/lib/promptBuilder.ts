import type { Category, Difficulty, PromptOutput } from '../types'

interface PromptInput {
  primaryKeyword?: string
  primaryKeywordEnglish?: string
  selectedKeywords: string[]
  metaKeywords: string[]
  metaKeywordsEnglish: string[]
  category?: Category
  difficulty: Difficulty
}

export function buildPrompt({
  primaryKeyword,
  primaryKeywordEnglish,
  selectedKeywords,
  metaKeywords,
  metaKeywordsEnglish,
  category,
  difficulty,
}: PromptInput): PromptOutput | null {
  if (!primaryKeyword || !primaryKeywordEnglish) return null

  const details = metaKeywords.slice(0, 8)
  const detailsEnglish = metaKeywordsEnglish.slice(0, 8)
  const detailKorean = details.length ? details.join(', ') : '단순한 구성과 넓은 여백'
  const detailEnglish = detailsEnglish.length ? detailsEnglish.join(', ') : 'simple visual attributes and generous negative space'

  return {
    koreanDescription: `주제는 ${primaryKeyword} 하나입니다. ${category ?? '창작'} 카테고리의 이 소재에 직접 적용되는 ${detailKorean}만 반영합니다. 귀엽고 유쾌한 2D 플랫 벡터 스티커/클립아트 스타일로, 외곽선 없이 불투명 단색 색면만 사용해 ${difficulty} 난이도의 독립된 단일 일러스트로 구성합니다.`,
    englishPrompt: `Create exactly one isolated, independent illustration of ${primaryKeywordEnglish}. This is the only drawn subject: do not add a second object, companion, character, background scene, prop, symbol, or decoration. Apply these selected meta keywords only as visual attributes of the primary subject, and ignore any that would require an additional element: ${detailEnglish}. Cute and playful 2D flat vector illustration style with a simple, recognizable silhouette, soft rounded shapes, and slightly irregular hand-drawn curves. Build a minimalist design from simple geometric shapes with exaggerated cute proportions, slightly imperfect whimsical forms, and a charming playful appearance. Define the form entirely with clean, opaque, solid color shapes and clearly separated high-contrast color areas. Use absolutely no outer outlines, black outlines, contour lines, or interior linework; color blocks alone must define every form. Use a limited palette of bright vibrant accent colors with deep black and dark charcoal tones. Keep a casual hand-drawn digital sticker and clipart aesthetic: avoid overly polished or mechanically perfect vector shapes, and allow subtle asymmetry, organic curves, and natural proportion variation. No gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, or 3D effects. Use a mostly front-facing composition with generous negative space so the single subject remains clear, recognizable, and visually appealing at small sizes. Pure white or transparent background. Style keywords: cute flat vector illustration, playful hand-drawn clipart, bold simple color shapes, no outlines, minimal details, solid color fills, whimsical proportions, clean 2D sticker aesthetic, high contrast, charming imperfect shapes, modern digital clipart. Important: apply only the visual art style described above. Do not introduce any specific objects, characters, seasonal themes, symbols, decorations, or additional elements unless explicitly requested in the subject description.`,
    negativePrompt: 'outer outline, black outline, contour line, line art, interior linework, gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, 3D effects, photorealism, painterly rendering, mechanically perfect vector shapes, low-contrast muddy colors, cluttered background, second subject, companion, extra character, prop, background scene, unrequested text, watermark, logo, unrequested seasonal theme, unrequested symbol, unrequested decoration, unrelated extra elements',
    settingSummary: `카테고리: ${category ?? '미분류'} · 출력 주제: ${primaryKeyword} 1개 · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 외곽선 없는 2D 플랫 벡터 / 불투명 단색 색면 / 단일 독립 이미지 / 흰색·투명 배경`,
  }
}
