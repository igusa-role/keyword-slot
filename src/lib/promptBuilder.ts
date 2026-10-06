import type { Category, Difficulty, IllustrationStyle, PromptOutput } from '../types'

interface PromptInput {
  primaryKeyword?: string
  primaryKeywordEnglish?: string
  selectedKeywords: string[]
  metaKeywords: string[]
  metaKeywordsEnglish: string[]
  category?: Category
  difficulty: Difficulty
  style: IllustrationStyle
}

function buildOutlinePrompt(subject: string, details: string): string {
  return `Create exactly one isolated, standalone black outline illustration of ${subject}. This is the only drawn subject: do not add a second object, companion, character, background scene, prop, symbol, or decoration. Apply these selected meta keywords only when they can be expressed as line-only attributes of the primary object and do not introduce extra elements, color, fills, or a background: ${details}. Use a minimalist, cute, and casual 2D line-art clipart style, matching simple hand-drawn everyday object icons. Line style: draw the entire object using clean, smooth, moderately thick, uniform black strokes. Use rounded stroke caps, rounded corners, and softly connected curves. Maintain a consistent line thickness across the entire illustration, including the outer contour and internal details. Lines should feel slightly organic and naturally hand-drawn, but remain neat, confident, and clearly defined. Avoid sketchy, scratchy, doubled, or uneven strokes. Shape and structure: simplify the object into a highly recognizable silhouette using basic geometric shapes, soft rounded edges, and gently irregular curves. Preserve the object's essential structural features while removing unnecessary details. Allow subtle asymmetry and charming, imperfect proportions. Avoid excessive geometric precision, realism, or complicated shapes. Internal details: use only the minimum number of black interior lines necessary to communicate the object's structure, overlapping parts, openings, folds, or distinctive features. Keep large interior areas completely empty and white. Do not add decorative lines, patterns, or unnecessary details. Perspective: use a simple front-facing, side-facing, or slightly tilted three-quarter view, whichever makes the object most recognizable. Keep the illustration visually flat and two-dimensional. Avoid strong perspective, foreshortening, depth, or complex spatial construction. Color and rendering: pure black outlines only. No color fills, no solid black filled areas, no grayscale, no gradients, no shading, no shadows, no highlights, no textures, no hatching, and no lighting effects. The interior of the object must remain pure white or transparent. Composition: draw exactly one complete object, centered on a pure white or transparent background, with generous empty space around it. Ensure the entire silhouette is clearly visible without cropping. No ground line, background elements, additional objects, decorations, text, or borders. Visual aesthetic: simple everyday object doodle, bold rounded outline icon, minimalist black-and-white line drawing, clean hand-drawn vector clipart, friendly sticker-like simplicity, consistent stroke weight, highly recognizable silhouette. Strict constraints: black strokes only. No colors. No filled shapes. No facial expressions or anthropomorphic features. No complex details. No photorealism. No 3D effects. No sketch texture. No background scene. No additional objects.`
}

function buildFillPrompt(subject: string, details: string): string {
  return `Create exactly one isolated, independent illustration of ${subject}. This is the only drawn subject: do not add a second object, companion, character, background scene, prop, symbol, or decoration. Apply these selected meta keywords only as visual attributes of the primary subject, and ignore any that would require an additional element: ${details}. Cute and playful 2D flat vector illustration style with a simple, recognizable silhouette, soft rounded shapes, and slightly irregular hand-drawn curves. Build a minimalist design from simple geometric shapes with exaggerated cute proportions, slightly imperfect whimsical forms, and a charming playful appearance. Define the form entirely with clean, opaque, solid color shapes and clearly separated high-contrast color areas. Use absolutely no outer outlines, black outlines, contour lines, or interior linework; color blocks alone must define every form. Use a limited palette of bright vibrant accent colors with deep black and dark charcoal tones. Keep a casual hand-drawn digital sticker and clipart aesthetic: avoid overly polished or mechanically perfect vector shapes, and allow subtle asymmetry, organic curves, and natural proportion variation. No gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, or 3D effects. Use a mostly front-facing composition with generous negative space so the single subject remains clear, recognizable, and visually appealing at small sizes. Pure white or transparent background. Style keywords: cute flat vector illustration, playful hand-drawn clipart, bold simple color shapes, no outlines, minimal details, solid color fills, whimsical proportions, clean 2D sticker aesthetic, high contrast, charming imperfect shapes, modern digital clipart. Important: apply only the visual art style described above. Do not introduce any specific objects, characters, seasonal themes, symbols, decorations, or additional elements unless explicitly requested in the subject description.`
}

export function buildPrompt({
  primaryKeyword,
  primaryKeywordEnglish,
  selectedKeywords,
  metaKeywords,
  metaKeywordsEnglish,
  category,
  difficulty,
  style,
}: PromptInput): PromptOutput | null {
  if (!primaryKeyword || !primaryKeywordEnglish) return null

  const details = metaKeywords.slice(0, 8)
  const detailsEnglish = metaKeywordsEnglish.slice(0, 8)
  const detailKorean = details.length ? details.join(', ') : '단순한 구성과 넓은 여백'
  const detailEnglish = detailsEnglish.length ? detailsEnglish.join(', ') : 'simple visual attributes and generous negative space'
  const isOutline = style === 'outline'

  return {
    koreanDescription: isOutline
      ? `주제는 ${primaryKeyword} 하나입니다. ${category ?? '창작'} 카테고리의 이 소재에 직접 적용되는 ${detailKorean}만 반영합니다. 귀엽고 단순한 2D 라인아트 클립아트 스타일로, 균일한 검정 외곽선과 꼭 필요한 최소 내부선만 사용해 ${difficulty} 난이도의 독립된 단일 일러스트로 구성합니다. 내부는 흰색 또는 투명으로 유지합니다.`
      : `주제는 ${primaryKeyword} 하나입니다. ${category ?? '창작'} 카테고리의 이 소재에 직접 적용되는 ${detailKorean}만 반영합니다. 귀엽고 유쾌한 2D 플랫 벡터 스티커/클립아트 스타일로, 외곽선 없이 불투명 단색 색면만 사용해 ${difficulty} 난이도의 독립된 단일 일러스트로 구성합니다.`,
    englishPrompt: isOutline
      ? buildOutlinePrompt(primaryKeywordEnglish, detailEnglish)
      : buildFillPrompt(primaryKeywordEnglish, detailEnglish),
    negativePrompt: isOutline
      ? 'color, color fill, solid black fill, grayscale, gradients, shading, shadow, highlight, texture, hatching, lighting effects, 3D effects, photorealism, painterly rendering, sketchy strokes, scratchy strokes, doubled lines, uneven stroke weight, thick filled areas, facial expression, anthropomorphic feature, background scene, second subject, companion, extra character, prop, decoration, text, watermark, logo, border'
      : 'outer outline, black outline, contour line, line art, interior linework, gradients, realistic textures, complex shading, dimensional depth, glossy surfaces, realistic lighting, 3D effects, photorealism, painterly rendering, mechanically perfect vector shapes, low-contrast muddy colors, cluttered background, second subject, companion, extra character, prop, background scene, unrequested text, watermark, logo, unrequested seasonal theme, unrequested symbol, unrequested decoration, unrelated extra elements',
    settingSummary: isOutline
      ? `카테고리: ${category ?? '미분류'} · 출력 주제: ${primaryKeyword} 1개 · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 검정 외곽선 2D 라인아트 / 최소 내부선 / 색 채움 없음 / 흰색·투명 배경`
      : `카테고리: ${category ?? '미분류'} · 출력 주제: ${primaryKeyword} 1개 · 선택 소재: ${selectedKeywords.length}개 · 메타키워드: ${metaKeywords.length}개 · 스타일: 외곽선 없는 2D 플랫 벡터 / 불투명 단색 색면 / 단일 독립 이미지 / 흰색·투명 배경`,
  }
}
